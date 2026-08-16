# EXP-008 Findings

## Evidence run

GitHub Actions Engram CI run `31935273665`.

Result: **PASS**.

The full repository check completed successfully, including `tests/scenarios/incident-memory.test.ts`.

## Findings

1. Without applicable memory, the incident application selects `RESTART_ALL`.
2. For a large fleet under dependency saturation, the deterministic simulator produces a `THUNDERING_HERD`, prolonged customer impact, and a `PARTIAL` recovery.
3. Applicable prior recovery memory changes the application strategy to `ISOLATE_DRAIN_STAGED_RESTART`.
4. The changed recovery decision records the exact memory ID and restart-all counterfactual.
5. Treatment succeeds with contained impact and lower simulated time-to-recovery.
6. The large-fleet lesson does not automatically constrain a small fleet.
7. A different incident failure mode does not inherit the recovery constraint even with a very high memory score.

## Interpretation

EXP-008 demonstrates that Engram can preserve consequences of recovery actions, not merely initial task failures. Prior recovery experience can constrain how a later system recovers when the same causal operating conditions recur.

## Boundary

Incident/recovery execution is deterministic and SIMULATED. This is not proof of live infrastructure orchestration or incident-management integration.
