# EXP-005 — Deployment Recovery Memory

## Hypothesis

A prior production deployment failure and successful recovery, when persisted as operational memory, can materially change the strategy selected for a later comparable deployment and improve the observed outcome.

The causal claim is accepted only if all of the following hold:

1. Run A has no relevant prior memory and selects `DIRECT_MIGRATION`.
2. Run A encounters `MIGRATION_LOCK_TIMEOUT`, successfully rolls back, and admits a recovery memory.
3. A same-context control execution with recall disabled selects `DIRECT_MIGRATION` and reproduces the compensated failure.
4. A same-context treatment execution recalls the persisted Run A recovery memory.
5. The treatment application selects `EXPAND_CONTRACT`.
6. The treatment decision records the Run A memory as `CHANGED_ACTION` through the exact retrieval that exposed it.
7. The counterfactual references the actual control execution rather than an inferred baseline.
8. The treatment succeeds under the same write-pause constraint.
9. The trace preserves enough provenance to reconstruct memory -> recall -> changed decision -> observed outcome.

## Non-claims

This experiment does not claim that Engram itself chooses a deployment strategy, that expand/contract is universally superior, or that a later successful outcome proves the memory was intrinsically beneficial outside this controlled scenario.
