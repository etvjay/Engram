# EXP-005 Decision

## Decision

**ACCEPTED.**

Engram will treat the retrieval that exposed a memory as first-class provenance on every claimed memory influence.

A memory influence is valid only when the referenced retrieval actually exposed that memory for the same execution. A correct memory ID paired with an unrelated retrieval ID must fail closed rather than being repaired or accepted because the memory appeared in another recall.

## Runtime invariant

`memory influence → exact retrieval → exact exposed memory`

Execution-level recall membership is not sufficient.

## Failure behavior

A provenance mismatch must:

- reject the influence with `RETRIEVAL_MISMATCH`;
- prevent persistence of the invalid decision;
- retain an `INFLUENCE_REJECTED` evaluation event where the runtime store supports it;
- never silently substitute a different retrieval.

## Evidence

Accepted from Engram CI run `31923329226`, which passed the full repository check including `tests/runtime/competing-memory-provenance.test.ts`.

## Boundary

This decision establishes the runtime/protocol invariant. Credentialed CockroachDB trace reconstruction remains separately live-verification-gated.
