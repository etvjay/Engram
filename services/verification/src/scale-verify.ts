import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import type pg from "pg";
import { createCockroachPool } from "../../../packages/cockroach/src/client.js";
import { applyEngramMigrations } from "../../../packages/cockroach/src/migrations.js";
import { ENGRAM_COSINE_VECTOR_INDEX, explainEngramMemorySearch } from "../../../packages/cockroach/src/vector-plan.js";
import { createConfiguredEmbeddingProvider } from "../../../packages/embeddings/src/provider.js";

const OUTPUT = "evidence/live/scale-latest.json";
const WORKFLOW_TYPE = "multi_venue_execution";
const ENVIRONMENT_VERSION = "scale-v1";
const FIXTURE_MARKER = "engram-cspann-scale-v1";
const STATUS_FILTER = ["COMPENSATED", "FAILURE", "PARTIAL"];
const DIMENSIONS = 1024;

type QueryRow = { id: string; distance: number };
type PlanEvidence = { plan: string[]; usesVectorSearch: boolean; usesCosineIndex: boolean; limitedScan: boolean };

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function sizes(): number[] {
  const raw = process.env.ENGRAM_SCALE_SIZES ?? "10000,25000,50000";
  const parsed = raw.split(",").map((v) => Number(v.trim())).filter((v) => Number.isInteger(v) && v > 0);
  if (!parsed.length) throw new Error("ENGRAM_SCALE_SIZES must contain positive integers");
  return [...new Set(parsed)].sort((a, b) => a - b);
}

function fixtureUuid(namespace: string, ordinal: number): string {
  const hex = createHash("sha256").update(`${namespace}:${ordinal}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function deterministicScaleVector(seed: number): number[] {
  const vector = Array<number>(DIMENSIONS).fill(0);
  let state = (seed ^ 0x9e3779b9) >>> 0;
  for (let i = 0; i < 12; i += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const position = state % DIMENSIONS;
    const sign = (state & 1) === 0 ? 1 : -1;
    vector[position] += sign * (0.25 + ((state >>> 8) % 1000) / 1000);
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

function vectorLiteral(vector: number[]): string {
  if (vector.length !== DIMENSIONS || vector.some((value) => !Number.isFinite(value))) {
    throw new Error("Invalid deterministic scale vector");
  }
  return `[${vector.join(",")}]`;
}

function percentile(values: number[], p: number): number {
  const ordered = [...values].sort((a, b) => a - b);
  const index = Math.min(ordered.length - 1, Math.max(0, Math.ceil(ordered.length * p) - 1));
  return Number((ordered[index] ?? 0).toFixed(3));
}

function parsePlan(rows: Array<Record<string, unknown>>): PlanEvidence {
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
  const result = await pool.query<{ id: string }>(
    `INSERT INTO agents (external_id,name,agent_version,runtime)
     VALUES ($1,$2,'scale-v1','fixture')
     ON CONFLICT (external_id) DO UPDATE SET name=excluded.name
     RETURNING id`,
    [externalId, `Engram scale fixture ${externalId}`],
  );
  const id = result.rows[0]?.id;
  if (!id) throw new Error("Agent upsert returned no row");
  return id;
}

async function ensureSourceExecution(pool: pg.Pool, agentId: string, externalId: string): Promise<string> {
  const intent = `${FIXTURE_MARKER}:${externalId}`;
  const existing = await pool.query<{ id: string }>(
    `SELECT id FROM executions WHERE agent_id=$1 AND intent=$2 ORDER BY created_at LIMIT 1`,
    [agentId, intent],
  );
  if (existing.rows[0]?.id) return existing.rows[0].id;

  const executionId = randomUUID();
  await pool.query(
    `INSERT INTO executions
      (id,agent_id,workflow_type,intent,context,constraints,environment_version,policy_version,status,completed_at)
     VALUES ($1,$2,$3,$4,$5::JSONB,'{}'::JSONB,$6,'scale-fixture-v1','COMPENSATED',now())`,
    [executionId, agentId, WORKFLOW_TYPE, intent, JSON.stringify({ fixture: FIXTURE_MARKER }), ENVIRONMENT_VERSION],
  );
  await pool.query(
    `INSERT INTO outcomes (id,execution_id,status,failure_type,summary,result,evidence_state)
     VALUES ($1,$2,'COMPENSATED','FIXTURE','Synthetic scale fixture outcome','{}'::JSONB,'SIMULATED')`,
    [randomUUID(), executionId],
  );
  return executionId;
}

async function countFixtures(pool: pg.Pool, agentId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT count(*)::STRING AS count FROM memories
      WHERE agent_id=$1 AND structured_context->>'fixture'=$2`,
    [agentId, FIXTURE_MARKER],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function seedFixtures(pool: pg.Pool, input: {
  agentId: string;
  externalId: string;
  executionId: string;
  targetCount: number;
  seedOffset: number;
}): Promise<{ inserted: number; elapsedMs: number }> {
  const current = await countFixtures(pool, input.agentId);
  if (current >= input.targetCount) return { inserted: 0, elapsedMs: 0 };
  const batchSize = Math.min(Math.max(Number(process.env.ENGRAM_SCALE_INSERT_BATCH ?? "25"), 1), 50);
  const started = performance.now();
  let inserted = 0;

  for (let start = current; start < input.targetCount; start += batchSize) {
    const count = Math.min(batchSize, input.targetCount - start);
    const memoryParams: unknown[] = [];
    const memoryValues: string[] = [];
    const sourceParams: unknown[] = [];
    const sourceValues: string[] = [];

    for (let j = 0; j < count; j += 1) {
      const ordinal = start + j;
      const id = fixtureUuid(input.externalId, ordinal);
      const m = memoryParams.length;
      memoryParams.push(
        id,
        input.agentId,
        `Synthetic scale memory ${input.externalId} #${ordinal}`,
        JSON.stringify({ fixture: FIXTURE_MARKER, workflowType: WORKFLOW_TYPE, ordinal }),
        vectorLiteral(deterministicScaleVector(input.seedOffset + ordinal)),
        ENVIRONMENT_VERSION,
      );
      memoryValues.push(`($${m + 1},$${m + 2},'OPERATIONAL',$${m + 3},$${m + 4}::JSONB,0.8,'SIMULATED',$${m + 5}::VECTOR,now(),$${m + 6},'scale-fixture-v1')`);

      const s = sourceParams.length;
      sourceParams.push(id, input.executionId);
      sourceValues.push(`($${s + 1},$${s + 2})`);
    }

    await pool.query(
      `INSERT INTO memories
        (id,agent_id,memory_type,summary,structured_context,confidence,evidence_state,embedding,valid_from,environment_version,policy_version)
       VALUES ${memoryValues.join(",")}
       ON CONFLICT (id) DO NOTHING`,
      memoryParams,
    );
    await pool.query(
      `INSERT INTO memory_sources (memory_id,execution_id)
       VALUES ${sourceValues.join(",")}
       ON CONFLICT DO NOTHING`,
      sourceParams,
    );

    inserted += count;
    if ((current + inserted) % 1000 === 0 || current + inserted === input.targetCount) {
      console.log(JSON.stringify({ stage: "seed", agent: input.externalId, rows: current + inserted, target: input.targetCount }));
    }
  }

  return { inserted, elapsedMs: Number((performance.now() - started).toFixed(3)) };
}

async function vectorOnlyPlan(pool: pg.Pool, agentId: string, queryVector: string, limit: number): Promise<PlanEvidence> {
  const result = await pool.query<Record<string, unknown>>(
    `EXPLAIN SELECT id, embedding <=> $1::VECTOR AS distance
       FROM memories
      WHERE agent_id=$2 AND embedding IS NOT NULL
      ORDER BY embedding <=> $1::VECTOR
      LIMIT $3`,
    [queryVector, agentId, limit],
  );
  return parsePlan(result.rows);
}

async function timedQuery(pool: pg.Pool, sql: string, params: unknown[], iterations: number): Promise<{ rows: QueryRow[]; samplesMs: number[] }> {
  let rows: QueryRow[] = [];
  const samplesMs: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const started = performance.now();
    const result = await pool.query<QueryRow>(sql, params);
    samplesMs.push(Number((performance.now() - started).toFixed(3)));
    rows = result.rows.map((row) => ({ id: row.id, distance: Number(row.distance) }));
  }
  return { rows, samplesMs };
}

function recallAt8(expected: QueryRow[], actual: QueryRow[]): number {
  const expectedIds = new Set(expected.slice(0, 8).map((row) => row.id));
  const hits = actual.slice(0, 8).filter((row) => expectedIds.has(row.id)).length;
  return Number((hits / Math.max(1, expectedIds.size)).toFixed(4));
}

async function main() {
  required("DATABASE_URL");
  const checkpoints = sizes();
  const iterations = Math.min(Math.max(Number(process.env.ENGRAM_SCALE_QUERY_ITERATIONS ?? "7"), 3), 30);
  const pool = createCockroachPool();
  const startedAt = new Date().toISOString();

  try {
    await applyEngramMigrations(pool);
    const provider = createConfiguredEmbeddingProvider();
    const providerSmoke = await provider.embed("Engram C-SPANN scale verification smoke test");
    if (providerSmoke.length !== DIMENSIONS) throw new Error(`Embedding provider emitted ${providerSmoke.length} dimensions`);

    const suffix = createHash("sha256").update(`${process.env.GITHUB_SHA ?? "local"}:${FIXTURE_MARKER}`).digest("hex").slice(0, 10);
    const externalA = `engram-scale-a-${suffix}`;
    const externalB = `engram-scale-b-${suffix}`;
    const agentA = await ensureAgent(pool, externalA);
    const agentB = await ensureAgent(pool, externalB);
    const sourceA = await ensureSourceExecution(pool, agentA, externalA);
    const sourceB = await ensureSourceExecution(pool, agentB, externalB);
    const results: Array<Record<string, unknown>> = [];

    for (const size of checkpoints) {
      const seedA = await seedFixtures(pool, { agentId: agentA, externalId: externalA, executionId: sourceA, targetCount: size, seedOffset: 0 });
      const seedB = await seedFixtures(pool, { agentId: agentB, externalId: externalB, executionId: sourceB, targetCount: size, seedOffset: 1_000_000 });

      await pool.query("ANALYZE memories");
      await pool.query("ANALYZE memory_sources");
      await pool.query("ANALYZE outcomes");

      const targetOrdinal = Math.max(0, size - 17);
      const targetId = fixtureUuid(externalA, targetOrdinal);
      const queryEmbedding = deterministicScaleVector(targetOrdinal);
      const queryVector = vectorLiteral(queryEmbedding);
      const limit = 8;

      const canonicalPlan = await explainEngramMemorySearch(pool, {
        agentExternalId: externalA,
        queryEmbedding,
        workflowType: WORKFLOW_TYPE,
        environmentVersion: ENVIRONMENT_VERSION,
        status: STATUS_FILTER,
        limit,
      });
      const diagnosticPlan = await vectorOnlyPlan(pool, agentA, queryVector, limit);

      const naturalSql = `SELECT m.id, (m.embedding <=> $1::VECTOR)::FLOAT8 AS distance
          FROM memories m
         WHERE m.agent_id=$2 AND m.embedding IS NOT NULL
         ORDER BY m.embedding <=> $1::VECTOR
         LIMIT $3`;
      const exhaustiveSql = `SELECT m.id, (m.embedding <=> $1::VECTOR)::FLOAT8 AS distance
          FROM memories m
         WHERE m.agent_id=$2 AND m.embedding IS NOT NULL
         ORDER BY ((m.embedding <=> $1::VECTOR) + 0.0)
         LIMIT $3`;
      const canonicalSql = `SELECT m.id, (m.embedding <=> $1::VECTOR)::FLOAT8 AS distance
          FROM memories m
          LEFT JOIN memory_sources ms ON ms.memory_id=m.id
          LEFT JOIN outcomes o ON o.execution_id=ms.execution_id
         WHERE m.agent_id=$2
           AND m.embedding IS NOT NULL
           AND (m.valid_from IS NULL OR m.valid_from <= now())
           AND (m.valid_until IS NULL OR m.valid_until > now())
           AND m.structured_context->>'workflowType'=$4
           AND m.environment_version=$5
           AND o.status = ANY($6::STRING[])
         ORDER BY m.embedding <=> $1::VECTOR
         LIMIT $3`;

      const exhaustive = await timedQuery(pool, exhaustiveSql, [queryVector, agentA, limit], 1);
      const vectorOnly = await timedQuery(pool, naturalSql, [queryVector, agentA, limit], iterations);
      const canonical = await timedQuery(pool, canonicalSql, [queryVector, agentA, limit, WORKFLOW_TYPE, ENVIRONMENT_VERSION, STATUS_FILTER], iterations);
      const returnedIds = canonical.rows.map((row) => row.id);
      const foreign = returnedIds.length
        ? await pool.query<{ count: string }>(
            `SELECT count(*)::STRING AS count FROM memories WHERE id = ANY($1::UUID[]) AND agent_id <> $2`,
            [returnedIds, agentA],
          )
        : { rows: [{ count: "0" }] };
      const crossAgentResults = Number(foreign.rows[0]?.count ?? 0);

      results.push({
        sizePerAgent: size,
        totalFixtureMemories: size * 2,
        seed: { agentA: seedA, agentB: seedB },
        query: { targetOrdinal, targetMemoryId: targetId, iterations, limit },
        plans: { exactCanonicalShape: canonicalPlan, vectorOnlyDiagnostic: diagnosticPlan },
        correctness: {
          vectorOnlyRecallAt8VsExhaustive: recallAt8(exhaustive.rows, vectorOnly.rows),
          exactShapeRecallAt8VsExhaustive: recallAt8(exhaustive.rows, canonical.rows),
          targetVectorOnlyRank: vectorOnly.rows.findIndex((row) => row.id === targetId) + 1,
          targetCanonicalRank: canonical.rows.findIndex((row) => row.id === targetId) + 1,
          crossAgentResults,
          agentIsolationPassed: crossAgentResults === 0,
        },
        latencyMs: {
          vectorOnly: { p50: percentile(vectorOnly.samplesMs, 0.5), p95: percentile(vectorOnly.samplesMs, 0.95), samples: vectorOnly.samplesMs },
          exactCanonicalShape: { p50: percentile(canonical.samplesMs, 0.5), p95: percentile(canonical.samplesMs, 0.95), samples: canonical.samplesMs },
        },
      });
    }

    const final = results.at(-1) as any;
    const canonicalUsesCspann = Boolean(final?.plans?.exactCanonicalShape?.usesVectorSearch && final?.plans?.exactCanonicalShape?.usesCosineIndex);
    const vectorOnlyUsesCspann = Boolean(final?.plans?.vectorOnlyDiagnostic?.usesVectorSearch && final?.plans?.vectorOnlyDiagnostic?.usesCosineIndex);
    const diagnosis = canonicalUsesCspann
      ? "CANONICAL_QUERY_SELECTS_CSPANN"
      : vectorOnlyUsesCspann
        ? "JOINS_OR_FILTERS_SUPPRESS_CSPANN"
        : "VECTOR_ONLY_QUERY_DID_NOT_SELECT_CSPANN";

    const evidence = {
      schemaVersion: "engram-cspann-scale-proof-v1",
      evidenceClass: "TESTED",
      verificationKind: "LIVE_SCALE_AND_QUERY_PLAN",
      startedAt,
      completedAt: new Date().toISOString(),
      commitSha: process.env.GITHUB_SHA ?? null,
      embeddingProviderSmoke: { provider: provider.provider, modelId: provider.modelId, dimensions: provider.dimensions, evidenceState: "VERIFIED" },
      benchmarkBoundary: {
        fixtureExecutionEvidence: "SIMULATED",
        fixtureVectors: "DETERMINISTIC_SYNTHETIC_1024D",
        cockroachPersistence: "REAL",
        queryExecution: "REAL",
        explainPlans: "REAL",
      },
      diagnosis,
      cspannCosineIndexUsage: canonicalUsesCspann ? "VERIFIED" : "UNVERIFIED",
      vectorOnlyCspannUsage: vectorOnlyUsesCspann ? "VERIFIED" : "UNVERIFIED",
      checkpoints: results,
    };

    await mkdir("evidence/live", { recursive: true });
    await writeFile(OUTPUT, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ok: true, output: OUTPUT, diagnosis, cspannCosineIndexUsage: evidence.cspannCosineIndexUsage, vectorOnlyCspannUsage: evidence.vectorOnlyCspannUsage }));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
