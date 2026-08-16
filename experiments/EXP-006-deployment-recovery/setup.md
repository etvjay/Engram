# EXP-006 Setup

## Automated proof

Scenario applicability proof:

- `tests/scenarios/deployment-memory.test.ts`
- `packages/scenarios/deployment/src/index.ts`

Full EngramRuntime causal proof:

- `tests/e2e/deployment-recovery-memory.test.ts`

## Scenario-level context

A production deployment includes a schema migration touching a hot table.

Baseline strategy: `PARALLEL_MIGRATE_AND_DEPLOY`.

The scenario simulator models this as causing `MIGRATION_LOCK_CONTENTION`, elevated errors, and rollback when the migration touches a hot table.

Memory-constrained strategy: `MIGRATE_THEN_DEPLOY`.

A prior Operational Memory is eligible only when it describes the comparable deployment failure conditions with sufficient confidence and retrieval score. The scenario test also proves that a high-scoring but operationally inapplicable non-hot-table memory does not change the action.

## Runtime-level context

A second deployment fixture exercises the complete runtime lifecycle around a high-write schema change:

1. source execution starts without relevant memory;
2. direct migration encounters `MIGRATION_LOCK_TIMEOUT` and rollback is observed;
3. Engram admits the recovery lesson;
4. a separate same-context control execution deliberately omits recall and reproduces the compensated failure;
5. treatment recall exposes the admitted memory;
6. the application selects `EXPAND_CONTRACT` instead of the control's direct migration;
7. Engram records `CHANGED_ACTION` through the exact retrieval;
8. the counterfactual references the actual control execution ID with `CONTROL_RUN` evidence;
9. the treatment outcome is `SUCCESS`.

## Evidence runs

- scenario applicability: Engram CI `31935094682`
- full runtime/control proof: Engram CI `31935125047`

## Evidence classification

- deployment execution: SIMULATED;
- scenario applicability and negative control: TESTED;
- runtime recall/influence/control-run provenance: TESTED;
- live CI/CD or production deployment integration: UNVERIFIED / outside this experiment.
