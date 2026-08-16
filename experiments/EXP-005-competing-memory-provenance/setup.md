# EXP-005 Setup

## Automated proof

`tests/runtime/competing-memory-provenance.test.ts`

## Execution

One running execution uses two semantically distinct recall queries:

1. `alpha dependency failure` → memory A
2. `beta rollback failure` → memory B

Both memories are current, OBSERVED, high-confidence, and otherwise eligible under the default runtime policy.

## Case A — correct linkage

1. Recall memory A and retain retrieval A.
2. Recall memory B and retain retrieval B.
3. Record decision A with memory A + retrieval A.
4. Record decision B with memory B + retrieval B.

Assertions:

- retrieval A and B are distinct;
- each recall exposes the expected memory;
- both decisions are accepted;
- each influence preserves its exact retrieval ID.

## Case B — provenance mismatch

1. Perform the same two recalls.
2. Attempt to record a decision using memory A but retrieval B.

Assertions:

- runtime rejects with `RETRIEVAL_MISMATCH`;
- no decision is persisted by the adversarial store;
- `INFLUENCE_REJECTED` is recorded.

## Evidence boundary

This experiment proves deterministic runtime validation. CockroachDB integration separately contains a credential-gated multi-recall trace test; live database reconstruction remains subject to external verification.
