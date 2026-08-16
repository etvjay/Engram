# EXP-007 Findings

## Evidence run

GitHub Actions Engram CI run `31935273665`.

Result: **PASS**.

The full repository check completed successfully, including `tests/scenarios/coding-memory.test.ts`.

## Findings

1. Without applicable memory, the coding application selects `PATCH_FIRST`.
2. For implicit behavior in the deterministic simulator, patch-first produces `BEHAVIORAL_REGRESSION`, patch reversion, and a `COMPENSATED` outcome.
3. Applicable prior regression memory changes the application strategy to `REGRESSION_TEST_THEN_PATCH`.
4. The changed decision records the exact memory ID and `PATCH_FIRST` memory-free counterfactual.
5. Treatment succeeds with a regression test added.
6. A very high-scoring prior regression from another subsystem does not change action.
7. A prior implicit-behavior failure does not automatically constrain a current explicit/well-tested behavior modification.

## Interpretation

The coding scenario shows that execution memory can alter an agent's work methodology rather than merely choosing a different endpoint or route. It also reinforces that retrieval score is not authority: applicability depends on the operational conditions that made the prior experience meaningful.

## Boundary

The coding executor is deterministic and SIMULATED. This result does not prove a live repository-writing coding agent integration.
