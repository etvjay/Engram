# EXP-006 Findings

## Evidence run

GitHub Actions Engram CI run `31935094682`.

Result: **PASS**.

The full repository check completed successfully, including `tests/scenarios/deployment-memory.test.ts`.

## Findings

1. With no relevant execution memory, the application selects the baseline `PARALLEL_MIGRATE_AND_DEPLOY` strategy.
2. Under the simulated hot-table context, that baseline produces `MIGRATION_LOCK_CONTENTION`, elevated errors, rollback, and a `COMPENSATED` outcome.
3. With a comparable prior Operational Memory, the application selects `MIGRATE_THEN_DEPLOY`.
4. The treatment explicitly records the prior memory ID and the memory-free counterfactual strategy.
5. The memory-constrained strategy succeeds with no simulated customer impact.
6. A high-scoring memory that describes lock contention in a non-hot-table migration does not change the action.

## Interpretation

This scenario extends Engram's causal proposition beyond the original multi-venue demo. Retrieval score alone is insufficient: the retained execution experience must also be operationally applicable to the current context before it changes behavior.

The causal comparison is:

`same current task + no applicable memory → unsafe baseline`

versus

`same current task + applicable prior execution memory → changed strategy → different outcome`.

## Boundary

The deployment executor is deterministic and SIMULATED. This is scenario-generalization evidence for the execution-memory model, not proof of a live CI/CD or production deployment integration.
