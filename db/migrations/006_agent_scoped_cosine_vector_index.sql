-- Engram retrieval is always scoped to canonical agent identity.
-- CockroachDB vector prefix columns allow the ANN search space to be narrowed
-- by equality-constrained ownership fields before cosine search.

CREATE VECTOR INDEX IF NOT EXISTS memories_agent_embedding_cosine_idx
  ON memories (agent_id, embedding vector_cosine_ops);
