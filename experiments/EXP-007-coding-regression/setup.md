# EXP-007 Setup

## Automated proof

`tests/scenarios/coding-memory.test.ts`

## Scenario implementation

`packages/scenarios/coding/src/index.ts`

## Current task

An autonomous coding agent must modify implicit parser behavior.

### Memory-free baseline

`PATCH_FIRST`

The deterministic simulator models patch-first modification of implicit behavior as producing `BEHAVIORAL_REGRESSION`, followed by `REVERT_PATCH` and a `COMPENSATED` outcome.

### Memory-constrained strategy

`REGRESSION_TEST_THEN_PATCH`

A prior Operational Memory is applicable only when it records:

- workflow `autonomous_coding`;
- failure `BEHAVIORAL_REGRESSION`;
- the same subsystem;
- implicit prior behavior;
- sufficient confidence and retrieval score.

## Assertions

1. Control without memory chooses `PATCH_FIRST` and is compensated after regression.
2. Treatment with applicable memory chooses `REGRESSION_TEST_THEN_PATCH` and succeeds.
3. Treatment records the exact memory ID and `PATCH_FIRST` counterfactual.
4. A high-score memory from another subsystem does not change action.
5. A prior implicit-behavior failure does not automatically constrain a current explicit/well-tested behavior change.

## Evidence classification

- coding task execution: SIMULATED;
- behavioral difference: pending CI acceptance;
- live coding-agent integration: UNVERIFIED / outside EXP-007.
