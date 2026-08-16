# EXP-006 — Setup

## Workload

A large-fleet `checkout-worker` incident under `SATURATED_DEPENDENCY` in `prod-v9`.

Baseline mitigation: `RESTART_ALL`.

Alternative mitigation: `ISOLATE_DRAIN_STAGED_RESTART`.

## Deterministic scenario behavior

`RESTART_ALL` restores the primary fleet but produces a secondary `THUNDERING_HERD`, taking 24 minutes and prolonging customer impact. The final outcome is `PARTIAL`.

`ISOLATE_DRAIN_STAGED_RESTART` restores the service without the secondary failure, taking 9 minutes with contained customer impact. The final outcome is `SUCCESS`.

The point is not merely whether the primary service recovered. EXP-006 preserves recovery quality and downstream consequence as part of reusable execution experience.

## Conditions

### Source

No prior relevant memory. Restart-all is selected. Primary recovery and the secondary thundering herd are both observed. Engram admits a recovery memory containing the side effect, time-to-recovery/customer-impact evidence, and the safer comparable strategy.

### Control

Same incident/context with recall excluded. Restart-all is selected again and the partial/degraded recovery repeats.

### Treatment

Same incident/context with recall enabled. The source memory is exposed. The application changes to isolate/drain/staged restart and records `CHANGED_ACTION` with the concrete control execution as counterfactual evidence.

## Automated evidence

- `packages/scenarios/incident-response/src/index.ts`
- `tests/e2e/incident-recovery-memory.test.ts`

## Acceptance discipline

Do not write findings or decision until an aggregate Engram CI run containing this canonicalized test succeeds.
