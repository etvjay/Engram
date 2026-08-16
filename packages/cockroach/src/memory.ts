import type { Pool } from "pg";

export type HybridSearchInput = {
  agentExternalId: string;
  queryEmbedding: number[];
  workflowType?: string;
  environmentVersion?: string;
  limit?: number;
};

export type HybridMemoryRow = {
  id: string;
  summary: string;
  structured_context: Record<string, unknown>;
  confidence: number;
  semantic_score: number;
};

export type VectorPlanEvidence = {
  agentId: string;
  indexName: "memories_agent_embedding_cosine_idx";
  planLines: string[];
  planText: string;
  usesVectorSearch: boolean;
  usesExpectedIndex: boolean;
  fullScan: boolean;
  cspannSelected: boolean;
};

const EXPECTED_VECTOR_INDEX = "memories_agent_embedding_cosine_idx" as const;

function toVectorLiteral(values: number[]): string {
  if (values.length === 0) throw new Error("queryEmbedding must not be empty");
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("queryEmbedding contains a non-finite value");
  }
  return `[${values.join(",")}]`;
}

async function resolveAgentId(pool: Pool, externalId: string): Promise<string | null> {
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM agents WHERE external_id = $1`,
    [externalId],
  );
  return result.rows[0]?.id ?? null;
}

function candidateSql(prefix = ""): string {
  return `${prefix}
      SELECT
        m.id,
        m.summary,
        m.structured_context,
        m.confidence,
        1 - (m.embedding <=> $1::VECTOR) AS semantic_score
      FROM memories AS m
      WHERE m.agent_id = $2::UUID
        AND m.embedding IS NOT NULL
        AND (m.valid_from IS NULL OR m.valid_from <= now())
        AND (m.valid_until IS NULL OR m.valid_until > now())
        AND ($3::STRING IS NULL OR m.structured_context->>'workflowType' = $3)
        AND ($4::STRING IS NULL OR m.environment_version = $4)
      ORDER BY m.embedding <=> $1::VECTOR
      LIMIT $5`;
}

/**
 * Candidate generation happens in CockroachDB using the agent-scoped cosine
 * C-SPANN vector index plus deterministic relational filters. Higher-level
 * outcome/context weighting is applied by memory-core so ranking policy remains
 * versionable.
 */
export async function searchMemoryCandidates(
  pool: Pool,
  input: HybridSearchInput,
): Promise<HybridMemoryRow[]> {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);
  const vector = toVectorLiteral(input.queryEmbedding);
  const agentId = await resolveAgentId(pool, input.agentExternalId);
  if (!agentId) return [];

  const result = await pool.query<HybridMemoryRow>(
    candidateSql(),
    [vector, agentId, input.workflowType ?? null, input.environmentVersion ?? null, limit],
  );

  return result.rows;
}

/**
 * Explain the candidate-generation query shape used by the reusable Cockroach
 * memory helper. This is evidence, not a forced index hint: the returned plan
 * records whether the live optimizer selected the scoped cosine vector index.
 */
export async function explainMemoryCandidatePlan(
  pool: Pool,
  input: HybridSearchInput,
): Promise<VectorPlanEvidence> {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);
  const vector = toVectorLiteral(input.queryEmbedding);
  const agentId = await resolveAgentId(pool, input.agentExternalId);
  if (!agentId) throw new Error(`Agent ${input.agentExternalId} does not exist`);

  const result = await pool.query<{ info: string }>(
    candidateSql("EXPLAIN"),
    [vector, agentId, input.workflowType ?? null, input.environmentVersion ?? null, limit],
  );
  const planLines = result.rows.map((row) => String(row.info));
  const planText = planLines.join("\n");
  const usesVectorSearch = /\bvector search\b/i.test(planText);
  const usesExpectedIndex = new RegExp(`memories@${EXPECTED_VECTOR_INDEX}\\b`, "i").test(planText);
  const fullScan = /\bFULL SCAN\b/i.test(planText);

  return {
    agentId,
    indexName: EXPECTED_VECTOR_INDEX,
    planLines,
    planText,
    usesVectorSearch,
    usesExpectedIndex,
    fullScan,
    cspannSelected: usesVectorSearch && usesExpectedIndex && !fullScan,
  };
}

export async function getMemoryProvenance(pool: Pool, memoryId: string) {
  const result = await pool.query(
    `
      SELECT
        m.id AS memory_id,
        m.summary AS memory_summary,
        e.id AS execution_id,
        e.intent,
        o.status AS outcome_status,
        o.failure_type,
        o.summary AS outcome_summary
      FROM memories AS m
      JOIN memory_sources AS ms ON ms.memory_id = m.id
      JOIN executions AS e ON e.id = ms.execution_id
      LEFT JOIN outcomes AS o ON o.execution_id = e.id
      WHERE m.id = $1
      ORDER BY e.started_at ASC
    `,
    [memoryId],
  );

  return result.rows;
}
