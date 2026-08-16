# EXP-008 Decision

## Decision

**ACCEPTED.**

The incident-response scenario is accepted as evidence that Execution Memory must cover the consequences of recovery actions as well as the consequences of initial task actions.

## Accepted invariant

A prior recovery action may constrain a later recovery sequence only when the causal operating conditions that made the prior recovery harmful are present again.

For this scenario:

- memory-free recovery: `RESTART_ALL`;
- prior comparable consequence: `THUNDERING_HERD` → prolonged recovery → `PARTIAL`;
- memory-constrained recovery: `ISOLATE_DRAIN_STAGED_RESTART`;
- treatment outcome: `SUCCESS` in the deterministic simulator.

## Negative-control rule

Fleet scale and failure mode are part of operational applicability. A high-scoring recovery memory is not authority when those causal conditions differ.

## Architectural consequence

Recovery-sequence semantics remain in `packages/scenarios/incident-response`. Engram runtime records and validates memory influence but does not become an incident-response planner.

## Evidence

Accepted from Engram CI run `31935273665`.

## Boundary

Incident orchestration is **SIMULATED**. Live infrastructure recovery remains separately unverified.
