# EXP-006 Setup

## Automated proof

`tests/scenarios/deployment-memory.test.ts`

## Scenario implementation

`packages/scenarios/deployment/src/index.ts`

## Context

A production deployment includes a schema migration touching a hot table.

### Baseline strategy

`PARALLEL_MIGRATE_AND_DEPLOY`

The deployment simulator models this as causing `MIGRATION_LOCK_CONTENTION`, elevated errors, and rollback when the migration touches a hot table.

### Memory-constrained strategy

`MIGRATE_THEN_DEPLOY`

A prior Operational Memory is eligible only when it describes:

- workflow type `software_deployment`;
- failure type `MIGRATION_LOCK_CONTENTION`;
- a hot-table migration;
- sufficient confidence and retrieval score.

## Assertions

1. Control without memory repeats the parallel strategy and ends `COMPENSATED`.
2. Treatment with applicable memory changes to `MIGRATE_THEN_DEPLOY` and succeeds.
3. Treatment records the exact memory ID.
4. Treatment records `PARALLEL_MIGRATE_AND_DEPLOY` as the memory-free counterfactual.
5. A high-scoring but non-hot-table memory does not change the action.

## Evidence classification

- scenario execution: SIMULATED;
- deterministic behavioral difference: pending CI acceptance;
- live deployment integration: UNVERIFIED / out of scope for this experiment.
