# EXP-006 — Incident Recovery Memory

## Hypothesis

Engram can preserve not only that an incident mitigation restored a primary service, but also the secondary consequence and recovery quality of that mitigation. Under a later comparable incident, recalling that experience can change the application's recovery strategy and avoid repeating the secondary failure.

Acceptance requires:

1. source incident begins without relevant memory;
2. baseline `FLEET_RESTART` restores the primary worker service but causes `RETRY_STORM`, producing `PARTIAL` / degraded recovery;
3. Engram admits operational memory containing both primary recovery and secondary failure;
4. a same-context control without recall repeats `FLEET_RESTART` and degraded recovery;
5. treatment recalls the source memory;
6. the application changes to `DRAIN_AND_CANARY_RESTART`;
7. the treatment records `CHANGED_ACTION` through the exact recall and references the actual control execution as counterfactual evidence;
8. treatment reaches clean `SUCCESS` without the retry storm.

## Non-claims

Engram does not decide incident mitigations and does not infer that a mitigation is globally unsafe. The scenario executor is deterministic experiment logic, not a live incident-management system.
