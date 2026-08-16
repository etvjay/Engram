# EXP-007 Decision

## Decision

**ACCEPTED.**

The autonomous-coding scenario is accepted as evidence that Engram's execution-memory model can change an application's work methodology, not only its destination or route choice.

## Accepted invariant

Applicable prior execution experience may constrain a later coding strategy only when the causal operating conditions match closely enough to justify reuse.

For this scenario:

- memory-free baseline: `PATCH_FIRST`;
- prior comparable outcome: behavioral regression → revert → `COMPENSATED`;
- memory-constrained treatment: `REGRESSION_TEST_THEN_PATCH`;
- treatment outcome: `SUCCESS` in the deterministic simulator.

## Negative-control rule

High retrieval score is insufficient when subsystem or behavior class differs. Engram must preserve the distinction between semantic similarity and operational applicability.

## Architectural consequence

Coding-specific strategy remains application/scenario logic under `packages/scenarios/coding`. Engram runtime remains the evidence, recall, provenance, policy, and influence substrate; it does not prescribe test-first development.

## Evidence

Accepted from Engram CI run `31935273665`.

## Boundary

The coding task is **SIMULATED**. Live coding-agent integration remains separately unverified.
