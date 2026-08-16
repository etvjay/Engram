DROP INDEX IF EXISTS memories_embedding_idx;

CREATE VECTOR INDEX IF NOT EXISTS memories_agent_embedding_idx
  ON memories (agent_id, embedding);
