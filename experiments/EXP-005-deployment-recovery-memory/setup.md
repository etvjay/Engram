# EXP-005 — Setup

## Workload

A production schema deployment for `billing-api` against a high-write ledger database.

Comparable execution context:

- workflow: `production_schema_deployment`
- environment: `prod-v4`
- tool: `deployctl-3.2.1`
- write-pause budget: 5 seconds
- rollback required: true

## Strategies

- `DIRECT_MIGRATION` — deterministic scenario behavior: exceeds the lock budget, producing `MIGRATION_LOCK_TIMEOUT`, followed by `ROLLBACK_SCHEMA_CHANGE`; final status `COMPENSATED`.
- `EXPAND_CONTRACT` — deterministic scenario behavior: completes inside the write-pause budget; final status `SUCCESS`.

The deployment executor is a deterministic experiment simulator. It is not a live production deployment system.

## Conditions

### Source Run A

Execution memory enabled, but no prior relevant memory exists. The application selects `DIRECT_MIGRATION`, observes failure/recovery, then Engram admits the recovery lesson.

### Control

Same future task/context/constraints with recall deliberately excluded. The application again selects `DIRECT_MIGRATION`, reproducing the compensated failure.

### Treatment

Same future task/context/constraints with recall enabled. Engram retrieves the Run A recovery memory. The application selects `EXPAND_CONTRACT` and records the recalled memory as `CHANGED_ACTION` with the control execution as the explicit counterfactual source.

## Automated evidence

`tests/e2e/deployment-recovery-memory.test.ts`

## Acceptance

Do not write `findings.md` or `decision.md` until an aggregate Engram CI run containing this scenario passes.
