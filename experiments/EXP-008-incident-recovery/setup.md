# EXP-008 Setup

## Automated proof

`tests/scenarios/incident-memory.test.ts`

## Scenario implementation

`packages/scenarios/incident-response/src/index.ts`

## Current incident

A large service fleet is unhealthy while a dependency is saturated.

### Memory-free recovery

`RESTART_ALL`

The simulator models a full-fleet restart into dependency saturation as causing `THUNDERING_HERD`, prolonged customer impact, 24-minute recovery, and a `PARTIAL` outcome.

### Memory-constrained recovery

`ISOLATE_DRAIN_STAGED_RESTART`

The prior Operational Memory is applicable only when it records the same saturated-dependency failure mode and a restart-all recovery that produced a thundering herd under relevant large-fleet conditions.

## Assertions

1. Control without memory chooses restart-all and produces a secondary failure.
2. Treatment with applicable memory chooses staged recovery and succeeds.
3. Treatment records the exact memory ID and restart-all counterfactual.
4. The large-fleet lesson does not automatically constrain a small fleet.
5. A different incident failure mode does not inherit the recovery constraint.

## Evidence classification

- incident/recovery execution: SIMULATED;
- memory-caused recovery change: pending CI acceptance;
- live orchestration integration: UNVERIFIED / outside EXP-008.
