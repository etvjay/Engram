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
const STATUS = ["COMPENSATED", "FAILURE", "PARTIAL"];
const DEFAULT_SIZES = [10_000, 25_000, 50_000];
const VECTOR_DIMENSIONS = 1024;
const FIXTURE_MARKER = "engram-cspann-scale-v1";

type QueryRow = { id: string; distance: number };
type PlanEvidence = {
  plan: string[];
  usesVectorSearch: boolean;
  usesCosineIndex: boolean;
  limitedScan: boolean;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function parseSizes(): number[] {
  const raw = process.env.ENGRAM_SCALE_SIZES?.trim();
  const sizes = raw
    ? raw.split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0)
    : DEFAULT_SIZES;
  if (!sizes.length) throw new Error("ENGRAM_SCALE_SIZES must contain at least one positive integer");
  return [...new Set(sizes)].sort((a, b) => a - b);
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return Number((sorted[index] ?? 0).toFixed(3));
}

function deterministicVector(seed: number): number[] {
  // Sparse but valid deterministic 1024d fixtures keep wire/storage cost bounded.
  // They are benchmark fixtures, not claimed as model-generated embeddings.
  const vector = Array<number>(VECTOR_DIMENSIONS).fill(0);
  let state = (seed ^ 0x9e3779b9) >>> 0;
  for (let i = 0; i < 12; i += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const position = state % VECTOR_DIMENSIONS;
    const sign = (state & 1) === 0 ? 1 : -1;
    vector[position] += sign * (0.25 + ((state >>> 8) % 1000) / 1000);
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

function toVectorLiteral(values: number[]): string {
  if (values.length !== VECTOR_DIMENSIONS) throw new Error(`Expected ${VECTOR_DIMENSIONS} dimensions`);
  return `[${values.join(",")}]`;
}

function planEvidence(rows: Array<Record<string, unknown>>): PlanEvidence {
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
    `INSERT INTO agents (external_id, name, agent_version, runtime)
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
  const existing = await pool.query<{ id: string }>(
    `SELECT id FROM executions
      WHERE agent_id=$1 AND workflow_type=$2 AND intent=$3
      ORDER BY created_at LIMIT 1`,
    [agentId, WORKFLOW_TYPE, `${FIXTURE_MARKER}:${externalId}`],
  );
  if (existing.rows[0]?.id) return existing.rows[0].id;

  const executionId = randomUUID();
  await pool.query(
    `INSERT INTO executions
      (id,agent_id,workflow_type,intent,context,constraints,environment_version,policy_version,status,completed_at)
     VALUES ($1,$2,$3,$4,$5::JSONB,'{}'::JSONB,$6,'scale-fixture-v1','COMPENSATED',now())`,
    [executionId, agentId, WORKFLOW_TYPE, `${FIXTURE_MARKER}:${externalId}`, JSON.stringify({ fixture: FIXTURE_MARKER }), ENVIRONMENT_VERSION],
  );
  await pool.query(
    `INSERT INTO outcomes (id,execution_id,status,failure_type,summary,result,evidence_state)
     VALUES ($1,$2,'COMPENSATED','FIXTURE','Synthetic scale fixture outcome','{}'::JSONB,'SIMULATED')`,
    [randomUUID(), executionId],
  );
  return executionId;
}

async function fixtureCount(pool: pg.Pool, agentId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT count(*)::STRING AS count
       FROM memories
      WHERE agent_id=$1 AND structured_context->>'fixture'=$2`,
    [agentId, FIXTURE_MARKER],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function seedTo(pool: pg.Pool, input: {
  agentId: string;
  executionId: string;
  externalId: string;
  targetCount: number;
  seedOffset: number;
}): Promise<{ inserted: number; elapsedMs: number }> {
  const current = await fixtureCount(pool, input.agentId);
  if (current >= input.targetCount) return { inserted: 0, elapsedMs: 0 };
  const started = performance.now();
  const batchSize = Math.min(Math.max(Number(process.env.ENGRAM_SCALE_INSERT_BATCH ?? "20"), 1), 100);
  let inserted = 0;

  for (let start = current; start < input.targetCount; start += batchSize) {
    const count = Math.min(batchSize, input.targetCount - start);
    const params: unknown[] = [];
    const values: string[] = [];
    for (let j = 0; j < count; j += 1) {
      const ordinal = start + j;
      const memoryId = randomUUID();
      const vector = deterministicVector(input.seedOffset + ordinal);
      const base = params.length;
      params.push(
        memoryId,
        input.agentId,
        `Synthetic scale memory ${input.externalId} #${ordinal}`,
        JSON.stringify({ fixture: FIXTURE_MARKER, workflowType: WORKFLOW_TYPE, ordinal }),
        toVectorLiteral(vector),
        input.executionId,
      );
      values.push(`($${base + 1},$${base + 2},'OPERATIONAL',$${base + 3},$${base + 4}::JSONB,0.8,'SIMULATED',$${base + 5}::VECTOR,now(),NULL,$${base + 2}::STRING,NULL,'scale-fixture-v1',now(),$${base + 6})`);
    }

    // CTE keeps the memory + source relation in one statement per small batch.
    // Small batches are intentional because Cockroach recommends avoiding large VECTOR batch inserts.
    await pool.query(
      `WITH fixture(id,agent_id,summary,structured_context,embedding,source_execution_id) AS (
         VALUES ${values.map((value) => value.replace(/,\$\d+::STRING,NULL,'scale-fixture-v1',now\(\),\$\d+\)$/, ")")).join(",")}
       ), inserted AS (
         INSERT INTO memories
           (id,agent_id,memory_type,summary,structured_context,confidence,evidence_state,embedding,valid_from,valid_until,environment_version,tool_version,policy_version,created_at)
         SELECT id,agent_id,'OPERATIONAL',summary,structured_context,0.8,'SIMULATED',embedding,now(),NULL,$1,NULL,'scale-fixture-v1',now()
           FROM fixture
         RETURNING id
       )
       INSERT INTO memory_sources (memory_id,execution_id)
       SELECT inserted.id,$2 FROM inserted`,
      [ENVIRONMENT_VERSION, input.executionId, ...params],
    );
    inserted += count;
    if (inserted % 1000 === 0 || start + count === input.targetCount) {
      console.log(JSON.stringify({ stage: "seed", agent: input.externalId, target: input.targetCount, inserted, current: current + inserted }));
    }
  }

  return { inserted, elapsedMs: Number((performance.now() - started).toFixed(3)) };
}

async function seedToSafe(pool: pg.Pool, input: {
  agentId: string;
  executionId: string;
  externalId: string;
  targetCount: number;
  seedOffset: number;
}): Promise<{ inserted: number; elapsedMs: number }> {
  const current = await fixtureCount(pool, input.agentId);
  if (current >= input.targetCount) return { inserted: 0, elapsedMs: 0 };
  const started = performance.now();
  const batchSize = Math.min(Math.max(Number(process.env.ENGRAM_SCALE_INSERT_BATCH ?? "20"), 1), 50);
  let inserted = 0;

  for (let start = current; start < input.targetCount; start += batchSize) {
    const count = Math.min(batchSize, input.targetCount - start);
    await pool.query("BEGIN");
    try {
      for (let j = 0; j < count; j += 1) {
        const ordinal = start + j;
        const memoryId = randomUUID();
        const vector = toVectorLiteral(deterministicVector(input.seedOffset + ordinal));
        await pool.query(
          `INSERT INTO memories
            (id,agent_id,memory_type,summary,structured_context,confidence,evidence_state,embedding,valid_from,environment_version,policy_version)
           VALUES ($1,$2,'OPERATIONAL',$3,$4::JSONB,0.8,'SIMULATED',$5::VECTOR,now(),$6,'scale-fixture-v1')`,
          [memoryId, input.agentId, `Synthetic scale memory ${input.externalId} #${ordinal}`, JSON.stringify({ fixture: FIXTURE_MARKER, workflowType: WORKFLOW_TYPE, ordinal }), vector, ENVIRONMENT_VERSION],
        );
        await pool.query(`INSERT INTO memory_sources (memory_id,execution_id) VALUES ($1,$2)`, [memoryId, input.executionId]);
      }
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK").catch(() => undefined);
      throw error;
    }
    inserted += count;
    if (inserted % 1000 === 0 || start + count === input.targetCount) {
      console.log(JSON.stringify({ stage: "seed", agent: input.externalId, target: input.targetCount, inserted, current: current + inserted }));
    }
  }
  return { inserted, elapsedMs: Number((performance.now() - started).toFixed(3)) };
}

async function naturalVectorOnlyPlan(pool: pg.Pool, agentId: string, vector: string, limit: number): Promise<PlanEvidence> {
  const result = await pool.query<Record<string, unknown>>(
    `EXPLAIN SELECT id, embedding <=> $1::VECTOR AS distance
       FROM memories
      WHERE agent_id=$2 AND embedding IS NOT NULL
      ORDER BY embedding <=> $1::VECTOR
      LIMIT $3`,
    [vector, agentId, limit],
  );
  return planEvidence(result.rows);
}

async function runQuery(pool: pg.Pool, sql: string, params: unknown[], iterations: number): Promise<{ rows: QueryRow[]; latenciesMs: number[] }> {
  const latenciesMs: number[] = [];
  let rows: QueryRow[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const started = performance.now();
    const result = await pool.query<QueryRow>(sql, params);
    latenciesMs.push(Number((performance.now() - started).toFixed(3)));
    rows = result.rows.map((row) => ({ id: row.id, distance: Number(row.distance) }));
  }
  return { rows, latenciesMs };
}

function recallAt(expected: QueryRow[], actual: QueryRow[], k: number): number {
  const expectedIds = new Set(expected.slice(0, k).map((row) => row.id));
  const hits = actual.slice(0, k).filter((row) => expectedIds.has(row.id)).length;
  return Number((hits / Math.max(1, Math.min(k, expectedIds.size))).toFixed(4));
}

async function main() {
  requireEnv("DATABASE_URL");
  const sizes = parseSizes();
  const maxSize = sizes[sizes.length - 1] ?? 10_000;
  const iterations = Math.min(Math.max(Number(process.env.ENGRAM_SCALE_QUERY_ITERATIONS ?? "7"), 3), 30);
  const limit = 8;
  const pool = createCockroachPool();
  const startedAt = new Date().toISOString();

  try {
    await applyEngramMigrations(pool);
    const provider = createConfiguredEmbeddingProvider();
    const smoke = await provider.embed("Engram C-SPANN scale proof provider smoke test");
    if (smoke.length !== VECTOR_DIMENSIONS) throw new Error(`Embedding provider returned ${smoke.length} dimensions`);

    const suffix = createHash("sha256").update(`${process.env.GITHUB_SHA ?? "local"}:${FIXTURE_MARKER}`).digest("hex").slice(0, 10);
    const agentAExternal = `engram-scale-a-${suffix}`;
    const agentBExternal = `engram-scale-b-${suffix}`;
    const agentA = await ensureAgent(pool, agentAExternal);
    const agentB = await ensureAgent(pool, agentBExternal);
    const sourceA = await ensureSourceExecution(pool, agentA, agentAExternal);
    const sourceB = await ensureSourceExecution(pool, agentB, agentBExternal);

    const checkpoints: unknown[] = [];
    for (const size of sizes) {
      const seedA = await seedToSafe(pool, { agentId: agentA, executionId: sourceA, externalId: agentAExternal, targetCount: size, seedOffset: 0 });
      const seedB = await seedToSafe(pool, { agentId: agentB, executionId: sourceB, externalId: agentBExternal, targetCount: size, seedOffset: 1_000_000 });
      await pool.query(`CREATE STATISTICS IF NOT EXISTS engram_scale_memories_stats ON agent_id, environment_version FROM memories`);
      await pool.query(`CREATE STATISTICS IF NOT EXISTS engram_scale_sources_stats ON memory_id, execution_id FROM memory_sources`);

      const targetOrdinal = Math.max(0, size - 17);
      const queryVector = toVectorLiteral(deterministicVector(targetOrdinal));
      const targetResult = await pool.query<{ id: string }>(
        `SELECT id FROM memories
          WHERE agent_id=$1 AND structured_context->>'fixture'=$2 AND (structured_context->>'ordinal')::INT=$3
          LIMIT 1`,
        [agentA, FIXTURE_MARKER, targetOrdinal],
      );
      const targetId = targetResult.rows[0]?.id;
      if (!targetId) throw new Error(`Target memory not found for size ${size}`);

      const exactPlan = await explainEngramMemorySearch(pool, {
        agentExternalId: agentAExternal,
        queryEmbedding: deterministicVector(targetOrdinal),
        workflowType: WORKFLOW_TYPE,
        environmentVersion: ENVIRONMENT_VERSION,
        status: STATUS,
        limit,
      });
      const vectorOnlyPlan = await naturalVectorOnlyPlan(pool, agentA, queryVector, limit);

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
      const exactSql = `SELECT m.id, (m.embedding <=> $1::VECTOR)::FLOAT8 AS distance
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

      const exhaustive = await runQuery(pool, exhaustiveSql, [queryVector, agentA, limit], 1);
      const natural = await runQuery(pool, naturalSql, [queryVector, agentA, limit], iterations);
      const exact = await runQuery(pool, exactSql, [queryVector, agentA, limit, WORKFLOW_TYPE, ENVIRONMENT_VERSION, STATUS], iterations);
      const foreign = await pool.query<{ count: string }>(
        `SELECT count(*)::STRING AS count
           FROM memories m
          WHERE m.id = ANY($1::UUID[]) AND m.agent_id <> $2`,
        [exact.rows.map((row) => row.id), agentA],
      );
      const targetNaturalRank = natural.rows.findIndex((row) => row.id === targetId) + 1;
      const targetExactRank = exact.rows.findIndex((row) => row.id === targetId) + 1;

      checkpoints.push({
        sizePerAgent: size,
        totalFixtureMemories: size * 2,
        fixtureEvidenceState: "SIMULATED",
        fixtureVectorClass: "DETERMINISTIC_SYNTHETIC_1024D",
        seed: { agentA: seedA, agentB: seedB },
        query: {
          targetOrdinal,
          targetMemoryId: targetId,
          iterations,
          limit,
        },
        plans: {
          exactCanonicalShape: exactPlan,
          vectorOnlyDiagnostic: vectorOnlyPlan,
        },
        correctness: {
          vectorOnlyRecallAt8VsExhaustive: recallAt(exhaustive.rows, natural.rows, limit),
          exactShapeRecallAt8VsExhaustive: recallAt(exhaustive.rows, exact.rows, limit),
          targetNaturalRank,
          targetExactRank,
          crossAgentResults: Number(foreign.rows[0]?.count ?? 0),
          agentIsolationPassed: Number(foreign.rows[0]?.count ?? 0) === 0,
        },
        latencyMs: {
          vectorOnly: { p50: percentile(natural.latenciesMs, 0.5), p95: percentile(natural.latenciesMs, 0.95), samples: natural.latenciesMs },
          exactCanonicalShape: { p50: percentile(exact.latenciesMs, 0.5), p95: percentile(exact.latenciesMs, 0.95), samples: exact.latenciesMs },
        },
      });
    }

    const finalCheckpoint = checkpoints[checkpoints.length - 1] as Record<string, any> | undefined;
    const exactPlan = finalCheckpoint?.plans?.exactCanonicalShape;
    const vectorOnlyPlan = finalCheckpoint?.plans?.vectorOnlyDiagnostic;
    const diagnosis = exactPlan?.usesVectorSearch && exactPlan?.usesCosineIndex
      ? "CANONICAL_QUERY_SELECTS_CSPANN"
      : vectorOnlyPlan?.usesVectorSearch && vectorOnlyPlan?.usesCosineIndex
        ? "JOINS_OR_FILTERS_SUPPRESS_CSPANN"
        : "VECTOR_ONLY_QUERY_DID_NOT_SELECT_CSPANN";

    const evidence = {
      schemaVersion: "engram-cspann-scale-proof-v1",
      evidenceClass: "TESTED",
      verificationKind: "LIVE_SCALE_AND_QUERY_PLAN",
      startedAt,
      completedAt: new Date().toISOString(),
      commitSha: process.env.GITHUB_SHA ?? null,
      embeddingProviderSmoke: {
        provider: provider.provider,
        modelId: provider.modelId,
        dimensions: provider.dimensions,
        evidenceState: "VERIFIED",
      },
      benchmarkBoundary: {
        fixtureExecutionEvidence: "SIMULATED",
        fixtureVectors: "DETERMINISTIC_SYNTHETIC_1024D",
        cockroachPersistence: "REAL",
        queryExecution: "REAL",
        explainPlans: "REAL",
      },
      targetScalePerAgent: maxSize,
      diagnosis,
      cspannCosineIndexUsage: exactPlan?.usesVectorSearch && exactPlan?.usesCosineIndex ? "VERIFIED" : "UNVERIFIED",
      vectorOnlyCspannUsage: vectorOnlyPlan?.usesVectorSearch && vectorOnlyPlan?.usesCosineIndex ? "VERIFIED" : "UNVERIFIED",
      checkpoints,
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
