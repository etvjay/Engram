# EXP-003 Decision

## Decision

ACCEPT explicit assessed memory relationships as the only source of contradiction/supersession semantics in Engram v1.

## Consequences

1. Embedding similarity may retrieve memories but cannot label them contradictory.
2. `CONTRADICTS` does not automatically establish precedence.
3. `SUPERSEDES` is directional and must be explicitly assessed.
4. Supersession preserves both historical memories and their provenance.
5. An unresolved contradiction should be surfaced to policy/evaluation layers instead of silently resolved by rank or recency.
6. Automatic retrieval suppression based on supersession remains a separate policy decision and is not implied by this experiment.

## Follow-up

Test workload policy behavior when two contradictory memories are both eligible for recall, including whether unresolved conflicts should block influence, lower confidence, or require an evaluator/human intervention.

## Product rule

**Similarity retrieves. Evidence relates. Policy decides eligibility.**
