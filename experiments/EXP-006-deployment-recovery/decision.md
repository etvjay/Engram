# EXP-006 Decision

## Decision

**ACCEPTED.**

The software-deployment recovery scenario is accepted as a second domain-level proof of Engram's execution-memory proposition.

A later action may change because of prior execution memory only when the retained experience is operationally applicable to the current task. Semantic similarity or a high retrieval score alone is not enough.

## Accepted invariant

`applicable prior execution → recalled operational memory → explicit memory reference + counterfactual → changed deployment strategy → different observed outcome`

For this scenario:

- memory-free baseline: `PARALLEL_MIGRATE_AND_DEPLOY`;
- prior comparable outcome: migration lock contention → rollback → `COMPENSATED`;
- memory-constrained treatment: `MIGRATE_THEN_DEPLOY`;
- treatment outcome: `SUCCESS` in the deterministic simulator.

## Negative-control rule

A high-scoring memory that is not operationally applicable to the current hot-table deployment must not change the action.

## Architectural consequence

Deployment-specific strategy semantics remain in `packages/scenarios/deployment`, not in Engram runtime or memory-core. The runtime remains domain-neutral and the application remains the decision authority.

## Evidence

Accepted from Engram CI run `31935094682`, which passed the full repository check including `tests/scenarios/deployment-memory.test.ts`.

## Boundary

The scenario executor is **SIMULATED**. This establishes deterministic scenario generalization, not a live CI/CD integration or production deployment guarantee.
