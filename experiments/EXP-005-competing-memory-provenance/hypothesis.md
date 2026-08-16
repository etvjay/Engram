# EXP-005 — Competing Memory Provenance

## Hypothesis

When one execution performs multiple memory recalls, Engram must preserve the exact recall that exposed each memory used by a later decision. A valid memory ID paired with the wrong retrieval ID must be rejected rather than accepted because the memory happened to be recalled elsewhere in the same execution.

## Attack condition

The execution recalls two independently relevant Operational Memories:

- recall A exposes memory A;
- recall B exposes memory B.

The application then records decisions that cite those memories.

## Expected behavior

### Correct provenance

- memory A + retrieval A is accepted;
- memory B + retrieval B is accepted;
- the persisted influence edges retain distinct retrieval IDs.

### Deliberate provenance mix-up

- memory A + retrieval B is rejected with `RETRIEVAL_MISMATCH`;
- the invalid decision is not persisted;
- an `INFLUENCE_REJECTED` runtime evaluation remains as evidence of the failed claim.

## Falsification conditions

The hypothesis fails if Engram:

- validates only that a memory was recalled somewhere in the execution;
- allows the wrong retrieval ID to be attached to an influence;
- silently rewrites the retrieval reference to a matching one;
- persists a decision after provenance validation fails;
- loses the fact that a rejected influence was attempted.

## Principle under test

Memory-to-action provenance is exact, not approximate.
