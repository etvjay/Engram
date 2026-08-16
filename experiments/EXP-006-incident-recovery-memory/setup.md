# EXP-006 — Setup

## Workload

A retry-sensitive `checkout-worker` incident with saturated workers in `prod-v9`.

Baseline mitigation: `FLEET_RESTART`.

Alternative mitigation: `DRAIN_AND_CANARY_RESTART`.

## Deterministic scenario behavior

`FLEET_RESTART` restores the saturated workers but synchronizes retries and causes `RETRY_STORM`, producing a `PARTIAL` outcome with degraded recovery quality.

`DRAIN_AND_CANARY_RESTART` restores the service without the secondary retry storm, producing `SUCCESS` with clean recovery quality.

## Conditions

### Source

No prior relevant memory. Fleet restart is selected. Primary recovery and the secondary retry storm are both observed. Engram admits a recovery memory containing the side effect and safer comparable strategy.

### Control

Same incident/context with recall excluded. Fleet restart is selected again and degraded recovery repeats.

### Treatment

Same incident/context with recall enabled. The source memory is exposed. The application changes to drain-and-canary restart and records `CHANGED_ACTION` with the concrete control execution as counterfactual evidence.

## Automated evidence

- `packages/scenarios/incident/src/index.ts`
- `tests/e2e/incident-recovery-memory.test.ts`

## Acceptance discipline

Do not write findings or decision until an aggregate Engram CI run containing this test succeeds.
