# EXP-003 Findings

## Result

SUPPORTED in the deterministic evaluation layer.

The automated relationship tests demonstrate that Engram distinguishes explicit contradiction from explicit supersession without inferring either from retrieval metadata.

### Unresolved contradiction

Given only `A CONTRADICTS B`:

- B is reported as a contradiction for A;
- B remains in `unresolvedContradictions`;
- `UNRESOLVED_CONTRADICTION` is emitted;
- no winner is selected.

### Explicit supersession

Given `A CONTRADICTS B` and `B SUPERSEDES A`:

- B remains recorded as contradictory history;
- B is reported in A's `supersededBy` set;
- the A/B contradiction is no longer unresolved;
- `MEMORY_SUPERSEDED` is emitted.

### No invented conflict

Given only a qualifying relationship for the target plus a contradiction between unrelated memories:

- qualification is preserved;
- target contradiction sets remain empty;
- no contradiction warning is emitted.

## Falsification check

None of the experiment's falsification conditions occur in the automated cases. The assessor has no embedding or retrieval-score input, so it cannot promote similarity into conflict or truth adjudication.

## What this supports

Engram can maintain explicit relationship state between Operational Memories while preserving the historical objects themselves. Contradiction remains unresolved until additional assessed evidence records a superseding relationship.

## What this does not support

This experiment does not determine:

- how a human/evaluator should decide that memories contradict;
- whether a newer memory is actually more correct;
- whether supersession should automatically block retrieval in every workload;
- whether a contradiction can be safely resolved without human or domain-specific evidence.

Those are policy/evaluator responsibilities, not consequences of vector proximity.
