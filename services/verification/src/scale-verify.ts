import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import type pg from "pg";
import { createCockroachPool } from "../../../packages/cockroach/src/client.js";
import { applyEngramMigrations } from "../../../packages/cockroach/src/migrations.js";
import { ENGRAM_COSINE_VECTOR_INDEX, explainEngramMemorySearch } from "../../../packages/cockroach/src/vector-plan.js";
import { createConfiguredEmbeddingProvider } from "../../../packages/embeddings/src/provider.js";

const OUTPUT = "evidence/live/scale-latest.json";
const WORKFLOW = "multi_venue_execution";
const ENV = "scale-v1";
const MARKER = "engram-cspann-scale-v1";
const STATUS = ["COMPENSATED", "FAILURE", "PARTIAL"];
const DIMS = 1024;

type Row = { id: string; distance: number };
type Plan = { plan: string[]; usesVectorSearch: boolean; usesCosineIndex: boolean; limitedScan: boolean };

function need(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function checkpointSizes(): number[] {
  const parsed = (process.env.ENGRAM_SCALE_SIZES ?? "10000,25000,50000")
    .split(",").map((v) => Number(v.trim())).filter((v) => Number.isInteger(v) && v > 0);
  if (!parsed.length) throw new Error("ENGRAM_SCALE_SIZES must contain positive integers");
  return [...new Set(parsed)].sort((a, b) => a - b);
}

function fixtureId(namespace: string, ordinal: number): string {
  const hex = createHash("sha256").update(`${namespace}:${ordinal}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function deterministicScaleVector(seed: number): number[] {
  const vector = Array<number>(DIMS).fill(0);
  let state = (seed ^ 0x9e3779b9) >>> 0;
  for (let i = 0; i < 12; i += 1) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5; state >>>= 0;
    const position = state % DIMS;
    const sign = (state & 1) === 0 ? 1 : -1;
    vector[position] = (vector[position] ?? 0) + sign * (0.25 + ((state >>> 8) % 1000) / 1000);
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => Number((v / norm).toFixed(6)));
}

function literal(vector: number[]): string {
  if (vector.length !== DIMS || vector.some((v) => !Number.isFinite(v))) throw new Error("Invalid scale vector");
  return `[${vector.join(",")}]`;
}

function pctl(samples: number[], p: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
  return Number((sorted[idx] ?? 0).toFixed(3));
}

function parsePlan(rows: Array<Record<string, unknown>>): Plan {
  const plan = rows.map((row) => String(row.info ?? row[Object.keys(row)[0] ?? ""] ?? ""));
  const joined = plan.join("\n").toLowerCase();
  return {
    plan,
    usesVectorSearch: joined.includes("vector search"),
    usesCosineIndex: joined.includes(ENGRAM_COSINE_VECTOR_INDEX.toLowerCase()),
    limitedScan: joined.includes("limited scan"),
  };
}

async function ensureAgent(pool: pg.Pool, externalId: string): Promise<string> {
  const r = await pool.query<{ id: string }>(
    `INSERT INTO agents (external_id,name,agent_version,runtime)
     VALUES ($1,$2,'scale-v1','fixture')
     ON CONFLICT (external_id) DO UPDATE SET name=excluded.name RETURNING id`,
    [externalId, `Engram scale fixture ${externalId}`],
  );
  const id = r.rows[0]?.id;
  if (!id) throw new Error("Agent upsert returned no row");
  return id;
}

async function ensureSource(pool: pg.Pool, agentId: string, externalId: string): Promise<string> {
  const intent = `${MARKER}:${externalId}`;
  const existing = await pool.query<{ id: string }>(`SELECT id FROM executions WHERE agent_id=$1 AND intent=$2 LIMIT 1`, [agentId, intent]);
  if (existing.rows[0]?.id) return existing.rows[0].id;
  const id = randomUUID();
  await pool.query(
    `INSERT INTO executions (id,agent_id,workflow_type,intent,context,constraints,environment_version,policy_version,status,completed_at)
     VALUES ($1,$2,$3,$4,$5::JSONB,'{}'::JSONB,$6,'scale-fixture-v1','COMPENSATED',now())`,
    [id, agentId, WORKFLOW, intent, JSON.stringify({ fixture: MARKER }), ENV],
  );
  await pool.query(
    `INSERT INTO outcomes (id,execution_id,status,failure_type,summary,result,evidence_state)
     VALUES ($1,$2,'COMPENSATED','FIXTURE','Synthetic scale fixture outcome','{}'::JSONB,'SIMULATED')`,
    [randomUUID(), id],
  );
  return id;
}

async function countFixtures(pool: pg.Pool, agentId: string): Promise<number> {
  const r = await pool.query<{ count: string }>(
    `SELECT count(*)::STRING AS count FROM memories WHERE agent_id=$1 AND structured_context->>'fixture'=$2`,
    [agentId, MARKER],
  );
  return Number(r.rows[0]?.count ?? 0);
}

async function seed(pool: pg.Pool, input: { agentId: string; externalId: string; sourceId: string; target: number; offset: number }) {
  const current = await countFixtures(pool, input.agentId);
  if (current >= input.target) return { inserted: 0, elapsedMs: 0 };
  const batch = Math.min(Math.max(Number(process.env.ENGRAM_SCALE_INSERT_BATCH ?? "25"), 1), 50);
  const started = performance.now();
  let inserted = 0;

  for (let start = current; start < input.target; start += batch) {
    const n = Math.min(batch, input.target - start);
    const mp: unknown[] = []; const mv: string[] = [];
    const sp: unknown[] = []; const sv: string[] = [];
    for (let j = 0; j < n; j += 1) {
      const ordinal = start + j;
      const id = fixtureId(input.externalId, ordinal);
      const m = mp.length;
      mp.push(id, input.agentId, `Synthetic scale memory ${input.externalId} #${ordinal}`, JSON.stringify({ fixture: MARKER, workflowType: WORKFLOW, ordinal }), literal(deterministicScaleVector(input.offset + ordinal)), ENV);
      mv.push(`($${m + 1},$${m + 2},'OPERATIONAL',$${m + 3},$${m + 4}::JSONB,0.8,'SIMULATED',$${m + 5}::VECTOR,now(),$${m + 6},'scale-fixture-v1')`);
      const s = sp.length; sp.push(id, input.sourceId); sv.push(`($${s + 1},$${s + 2})`);
    }
    await pool.query(`INSERT INTO memories (id,agent_id,memory_type,summary,structured_context,confidence,evidence_state,embedding,valid_from,environment_version,policy_version) VALUES ${mv.join(",")} ON CONFLICT (id) DO NOTHING`, mp);
    await pool.query(`INSERT INTO memory_sources (memory_id,execution_id) VALUES ${sv.join(",")} ON CONFLICT DO NOTHING`, sp);
    inserted += n;
    if ((current + inserted) % 1000 === 0 || current + inserted === input.target) console.log(JSON.stringify({ stage: "seed", agent: input.externalId, rows: current + inserted, target: input.target }));
  }
  return { inserted, elapsedMs: Number((performance.now() - started).toFixed(3)) };
}

async function vectorPlan(pool: pg.Pool, agentId: string, query: string): Promise<Plan> {
  const r = await pool.query<Record<string, unknown>>(
    `EXPLAIN SELECT id, embedding <=> $1::VECTOR AS distance FROM memories WHERE agent_id=$2 AND embedding IS NOT NULL ORDER BY embedding <=> $1::VECTOR LIMIT 8`,
    [query, agentId],
  );
  return parsePlan(r.rows);
}

async function timed(pool: pg.Pool, sql: string, params: unknown[], iterations: number) {
  let rows: Row[] = []; const samples: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const started = performance.now();
    const r = await pool.query<Row>(sql, params);
    samples.push(Number((performance.now() - started).toFixed(3)));
    rows = r.rows.map((row) => ({ id: row.id, distance: Number(row.distance) }));
  }
  return { rows, samples };
}

function recall8(expected: Row[], actual: Row[]): number {
  const ids = new Set(expected.slice(0, 8).map((r) => r.id));
  const hits = actual.slice(0, 8).filter((r) => ids.has(r.id)).length;
  return Number((hits / Math.max(1, ids.size)).toFixed(4));
}

async function main() {
  need("DATABASE_URL");
  const sizes = checkpointSizes();
  const iterations = Math.min(Math.max(Number(process.env.ENGRAM_SCALE_QUERY_ITERATIONS ?? "7"), 3), 30);
  const pool = createCockroachPool();
  const startedAt = new Date().toISOString();

  try {
    await applyEngramMigrations(pool);
    const provider = createConfiguredEmbeddingProvider();
    if ((await provider.embed("Engram C-SPANN scale verification smoke test")).length !== DIMS) throw new Error("Configured embedding provider is not 1024d");

    const suffix = createHash("sha256").update(`${process.env.GITHUB_SHA ?? "local"}:${MARKER}`).digest("hex").slice(0, 10);
    const externalA = `engram-scale-a-${suffix}`; const externalB = `engram-scale-b-${suffix}`;
    const agentA = await ensureAgent(pool, externalA); const agentB = await ensureAgent(pool, externalB);
    const sourceA = await ensureSource(pool, agentA, externalA); const sourceB = await ensureSource(pool, agentB, externalB);
    const checkpoints: Array<Record<string, unknown>> = [];

    for (const size of sizes) {
      const seedA = await seed(pool, { agentId: agentA, externalId: externalA, sourceId: sourceA, target: size, offset: 0 });
      const seedB = await seed(pool, { agentId: agentB, externalId: externalB, sourceId: sourceB, target: size, offset: 1_000_000 });
      await pool.query("ANALYZE memories"); await pool.query("ANALYZE memory_sources"); await pool.query("ANALYZE outcomes");

      const ordinal = Math.max(0, size - 17); const target = fixtureId(externalA, ordinal);
      const embedding = deterministicScaleVector(ordinal); const query = literal(embedding);
      const canonicalPlan = await explainEngramMemorySearch(pool, { agentExternalId: externalA, queryEmbedding: embedding, workflowType: WORKFLOW, environmentVersion: ENV, status: STATUS, limit: 8 });
      const diagnosticPlan = await vectorPlan(pool, agentA, query);

      const vectorSql = `SELECT id,(embedding <=> $1::VECTOR)::FLOAT8 AS distance FROM memories WHERE agent_id=$2 AND embedding IS NOT NULL ORDER BY embedding <=> $1::VECTOR LIMIT 8`;
      const exhaustiveSql = `SELECT id,(embedding <=> $1::VECTOR)::FLOAT8 AS distance FROM memories WHERE agent_id=$2 AND embedding IS NOT NULL ORDER BY ((embedding <=> $1::VECTOR)+0.0) LIMIT 8`;
      const canonicalSql = `SELECT m.id,(m.embedding <=> $1::VECTOR)::FLOAT8 AS distance FROM memories m LEFT JOIN memory_sources ms ON ms.memory_id=m.id LEFT JOIN outcomes o ON o.execution_id=ms.execution_id WHERE m.agent_id=$2 AND m.embedding IS NOT NULL AND (m.valid_from IS NULL OR m.valid_from<=now()) AND (m.valid_until IS NULL OR m.valid_until>now()) AND m.structured_context->>'workflowType'=$3 AND m.environment_version=$4 AND o.status=ANY($5::STRING[]) ORDER BY m.embedding <=> $1::VECTOR LIMIT 8`;
      const exhaustive = await timed(pool, exhaustiveSql, [query, agentA], 1);
      const vectorOnly = await timed(pool, vectorSql, [query, agentA], iterations);
      const canonical = await timed(pool, canonicalSql, [query, agentA, WORKFLOW, ENV, STATUS], iterations);
      const foreign = canonical.rows.length ? await pool.query<{ count: string }>(`SELECT count(*)::STRING AS count FROM memories WHERE id=ANY($1::UUID[]) AND agent_id<>$2`, [canonical.rows.map((r) => r.id), agentA]) : { rows: [{ count: "0" }] };
      const crossAgent = Number(foreign.rows[0]?.count ?? 0);

      checkpoints.push({
        sizePerAgent: size, totalFixtureMemories: size * 2, seed: { agentA: seedA, agentB: seedB },
        plans: { exactCanonicalShape: canonicalPlan, vectorOnlyDiagnostic: diagnosticPlan },
        correctness: { vectorOnlyRecallAt8VsExhaustive: recall8(exhaustive.rows, vectorOnly.rows), exactShapeRecallAt8VsExhaustive: recall8(exhaustive.rows, canonical.rows), targetVectorOnlyRank: vectorOnly.rows.findIndex((r) => r.id === target) + 1, targetCanonicalRank: canonical.rows.findIndex((r) => r.id === target) + 1, crossAgentResults: crossAgent, agentIsolationPassed: crossAgent === 0 },
        latencyMs: { vectorOnly: { p50: pctl(vectorOnly.samples, 0.5), p95: pctl(vectorOnly.samples, 0.95), samples: vectorOnly.samples }, exactCanonicalShape: { p50: pctl(canonical.samples, 0.5), p95: pctl(canonical.samples, 0.95), samples: canonical.samples } },
      });
    }

    const final = checkpoints.at(-1) as any;
    const canonicalCspann = Boolean(final?.plans?.exactCanonicalShape?.usesVectorSearch && final?.plans?.exactCanonicalShape?.usesCosineIndex);
    const vectorCspann = Boolean(final?.plans?.vectorOnlyDiagnostic?.usesVectorSearch && final?.plans?.vectorOnlyDiagnostic?.usesCosineIndex);
    const diagnosis = canonicalCspann ? "CANONICAL_QUERY_SELECTS_CSPANN" : vectorCspann ? "JOINS_OR_FILTERS_SUPPRESS_CSPANN" : "VECTOR_ONLY_QUERY_DID_NOT_SELECT_CSPANN";
    const evidence = { schemaVersion: "engram-cspann-scale-proof-v1", evidenceClass: "TESTED", verificationKind: "LIVE_SCALE_AND_QUERY_PLAN", startedAt, completedAt: new Date().toISOString(), commitSha: process.env.GITHUB_SHA ?? null, embeddingProviderSmoke: { provider: provider.provider, modelId: provider.modelId, dimensions: provider.dimensions, evidenceState: "VERIFIED" }, benchmarkBoundary: { fixtureExecutionEvidence: "SIMULATED", fixtureVectors: "DETERMINISTIC_SYNTHETIC_1024D", cockroachPersistence: "REAL", queryExecution: "REAL", explainPlans: "REAL" }, diagnosis, cspannCosineIndexUsage: canonicalCspann ? "VERIFIED" : "UNVERIFIED", vectorOnlyCspannUsage: vectorCspann ? "VERIFIED" : "UNVERIFIED", checkpoints };
    await mkdir("evidence/live", { recursive: true }); await writeFile(OUTPUT, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ok: true, output: OUTPUT, diagnosis, cspannCosineIndexUsage: evidence.cspannCosineIndexUsage, vectorOnlyCspannUsage: evidence.vectorOnlyCspannUsage }));
  } finally { await pool.end(); }
}

main().catch((error) => { console.error(error instanceof Error ? error.stack ?? error.message : String(error)); process.exitCode = 1; });
