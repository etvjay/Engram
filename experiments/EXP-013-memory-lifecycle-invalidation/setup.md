# EXP-013 — Setup

Date: 2026-08-16

## Automated proof

Primary test:
- `tests/e2e/memory-lifecycle-invalidation.test.ts`

## Memory set

The same `release-agent` has three durable memories:

1. `environmentOld`
   - `environmentVersion = prod-v1`
   - `toolVersion = 1.9.0`
   - historically valid release guidance.
2. `supersededOld`
   - compatible with current `prod-v2` / tool major 2;
   - explicit `SUPERSEDES` relationship points from the newer memory to it.
3. `current`
   - current `prod-v2` / tool major 2 guidance;
   - recommends progressive canary behavior.

The later execution uses `prod-v2`, tool `2.4.0`.

## Control

Run `EngramRuntime` without relationship-aware eligibility.

Expected:
- `environmentOld` is rejected by core expiry/invalidation policy;
- `supersededOld` remains recall-visible because core policy alone has no relationship evidence;
- `current` remains visible.

## Treatment

Run `EngramRuntime` with `RelationshipMemoryEligibilityAdvisor` configured to apply explicit supersession at `RECALL` and `INFLUENCE`.

Expected:
- `environmentOld` rejected with environment/tool invalidation reasons;
- `supersededOld` rejected with `MEMORY_SUPERSEDED`;
- only `current` is exposed;
- a `CHANGED_ACTION` decision may reference `current` with the control execution as counterfactual evidence;
- all three memories remain inspectable afterward.

## Boundary

The release workload is deterministic/SIMULATED. This experiment proves runtime lifecycle semantics, not a live deployment system.