# EXP-008 — Incident Recovery Memory

## Hypothesis

A prior recovery action that produced a secondary failure should constrain a later comparable incident response when the causal operating conditions are present again.

A previous large-fleet `RESTART_ALL` during dependency saturation that caused a `THUNDERING_HERD` should make a later comparable incident choose `ISOLATE_DRAIN_STAGED_RESTART`.

## Control

Same incident, no applicable memory:

- choose `RESTART_ALL`;
- large fleet restarts into a saturated dependency;
- a thundering herd prolongs recovery;
- outcome is `PARTIAL`.

## Treatment

Same incident, applicable prior recovery memory:

- recall the prior recovery failure;
- choose isolate → drain → staged restart;
- record the prior memory and restart-all counterfactual;
- simulated recovery succeeds with lower time-to-recovery and contained impact.

## Negative controls

The prior memory must not constrain recovery when:

1. the current fleet is small; or
2. the current incident has a different failure mode.

## Principle under test

Execution Memory can preserve the consequences of a recovery action, not only the consequences of an initial task action.

## Boundary

Incident execution is deterministic and SIMULATED. EXP-008 does not claim integration with a real incident-management or orchestration system.
