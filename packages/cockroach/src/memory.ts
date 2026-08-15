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

function toVectorLiteral(values: number[]): string {
  if (values.length === 0) throw new Error("queryEmbedding must not be empty");
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("queryEmbedding contains a non-finite value");
  }
  return `[${values.join(",")}]`;
}

/**
 * Candidate generation happens in CockroachDB using the C-SPANN-backed VECTOR
 * column plus deterministic relational filters. Higher-level outcome/context
 * weighting is applied by memory-core so ranking policy remains versionable.
 */
export async function searchMemoryCandidates(
  pool: Pool,
  input: HybridSearchInput,
): Promise<HybridMemoryRow[]> {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);
  const vector = toVectorLiteral(input.queryEmbedding);

  const result = await pool.query<HybridMemoryRow>(
    `
      SELECT
        m.id,
        m.summary,
        m.structured_context,
        m.confidence,
        1 - (m.embedding <=> $1::VECTOR) AS semantic_score
      FROM memories AS m
      JOIN agents AS a ON a.id = m.agent_id
      WHERE a.external_id = $2
        AND m.embedding IS NOT NULL
        AND (m.valid_from IS NULL OR m.valid_from <= now())
        AND (m.valid_until IS NULL OR m.valid_until > now())
        AND ($3::STRING IS NULL OR m.structured_context->>'workflowType' = $3)
        AND ($4::STRING IS NULL OR m.environment_version = $4)
      ORDER BY m.embedding <=> $1::VECTOR
      LIMIT $5
    `,
    [vector, input.agentExternalId, input.workflowType ?? null, input.environmentVersion ?? null, limit],
  );

  return result.rows;
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
