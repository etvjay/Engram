# C-SPANN search beam policy

Live CockroachDB 26.2.5 recall diagnostics at 10k memories per agent showed that the default vector search beam of 32 missed one exhaustive canonical top-8 neighbor even with a 400-result candidate envelope. The same query recovered full top-8 recall at beam 128 and retained it at beam 256.

Engram therefore configures Stage 1 candidate generation with a transaction-local `vector_search_beam_size` of 128 by default. This is intentionally separate from `ENGRAM_VECTOR_CANDIDATE_LIMIT`: candidate limit controls how many results are returned; beam size controls how much of the C-SPANN graph is explored.

Configuration:

- `ENGRAM_VECTOR_BEAM_SIZE=128` by default.
- Allowed range: 1..512.
- The value is applied with `SET LOCAL vector_search_beam_size = <value>` inside the retrieval transaction so pooled SQL sessions do not retain Engram-specific search tuning after the transaction ends.

Evidence boundary:

- 128 is the smallest tested beam that restored recall@8 = 1.0 for the current deterministic 10k fixture.
- It is not a universal optimal value for all corpora or scales.
- The 25k/50k scale runs must re-measure recall and latency before broader scale claims are promoted.
