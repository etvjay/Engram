import type pg from "pg";

export const ENGRAM_COSINE_VECTOR_INDEX = "memories_agent_embedding_cosine_idx" as const;

function toVectorLiteral(values: number[]): string {
  if (values.length !== 1024) throw new Error(`Expected 1024-dimensional embedding, received ${values.length}`);
  if (values.some((value) => !Number.isFinite(value))) throw new Error("Embedding contains a non-finite value");
  return `[${values.join(",")}]`;
}

export type VectorPlanInput = {
  agentExternalId: string;
  queryEmbedding: number[];
  workflowType?: string;
  environmentVersion?: string;
  status?: string[];
  limit?: number;
};

export type VectorPlanEvidence = {
  plan: string[];
  usesVectorSearch: boolean;
  usesCosineIndex: boolean;
  limitedScan: boolean;
};

/**
 * Explain the same candidate-generation shape used by CockroachMemoryRepository.
 * This intentionally does not force an index hint: evidence should show whether
 * CockroachDB's optimizer naturally selects the agent-scoped cosine C-SPANN index.
 */
export async function explainEngramMemorySearch(
  pool: pg.Pool,
  input: VectorPlanInput,
): Promise<VectorPlanEvidence> {
  const agentResult = await pool.query<{ id: string }>(
    `SELECT id FROM agents WHERE external_id=$1`,
    [input.agentExternalId],
  );
  const agent = agentResult.rows[0];
  if (!agent) throw new Error(`Agent ${input.agentExternalId} does not exist`);

  const vector = toVectorLiteral(input.queryEmbedding);
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 50);
  const result = await pool.query<Record<string, unknown>>(
    `EXPLAIN SELECT m.id, m.memory_type, m.summary, m.structured_context, m.confidence, m.evidence_state,
                    m.valid_from, m.valid_until, m.environment_version, m.tool_version, m.policy_version, m.created_at,
                    greatest(0, least(1, 1 - (m.embedding <=> $1::VECTOR))) AS semantic_score,
                    o.status AS source_status
       FROM memories m
       LEFT JOIN memory_sources ms ON ms.memory_id=m.id
       LEFT JOIN outcomes o ON o.execution_id=ms.execution_id
      WHERE m.agent_id=$2
        AND m.embedding IS NOT NULL
        AND (m.valid_from IS NULL OR m.valid_from <= now())
        AND (m.valid_until IS NULL OR m.valid_until > now())
        AND ($3::STRING IS NULL OR m.structured_context->>'workflowType'=$3)
        AND ($4::STRING IS NULL OR m.environment_version=$4)
        AND ($5::STRING[] IS NULL OR o.status = ANY($5::STRING[]))
      ORDER BY m.embedding <=> $1::VECTOR
      LIMIT $6`,
    [
      vector,
      agent.id,
      input.workflowType ?? null,
      input.environmentVersion ?? null,
      input.status?.length ? input.status : null,
      limit,
    ],
  );

  const plan = result.rows.map((row) => {
    const value = row.info ?? row[Object.keys(row)[0] ?? ""];
    return String(value ?? "");
  });
  const joined = plan.join("\n").toLowerCase();
  return {
    plan,
    usesVectorSearch: joined.includes("vector search"),
    usesCosineIndex: joined.includes(ENGRAM_COSINE_VECTOR_INDEX.toLowerCase()),
    limitedScan: joined.includes("limited scan"),
  };
}
