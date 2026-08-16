# EXP-013 — Findings

Date: 2026-08-16
Evidence run: GitHub Actions Engram CI `31940184852`
Result: **PASS**

## Findings

1. A memory from `prod-v1` / tool major 1 remained stored but was rejected for the later `prod-v2` / tool major 2 execution.
2. Rejection reasons preserved both `INVALIDATED_ENVIRONMENT_CHANGE` and `INVALIDATED_TOOL_MAJOR_VERSION_CHANGE`.
3. In the control runtime without relationship-aware eligibility, a still-context-compatible older lesson remained recall-visible even though explicit evaluation data said a newer lesson superseded it.
4. In the treatment runtime, `RelationshipMemoryEligibilityAdvisor` used that explicit `SUPERSEDES` relationship to reject the older compatible lesson with `MEMORY_SUPERSEDED`.
5. The current memory remained exposed and was accepted as a `CHANGED_ACTION` influence with the control execution referenced as counterfactual evidence.
6. The runtime emitted `RECALL_FILTERED` and `INFLUENCE_ACCEPTED` evaluation events.
7. Environment-invalid, superseded, and current memories all remained inspectable after the treatment.

## Interpretation

Engram can distinguish durable history from current action authority. Persistence does not imply perpetual eligibility.

Two independent lifecycle mechanisms compose safely:

- context/version invalidation from the runtime policy layer;
- explicit supersession from the evaluation/relationship layer.

Neither mechanism deletes or rewrites the prior memory.

## Boundary

Supersession in EXP-013 is explicit experiment evidence. Engram does not infer it from recency, vector similarity, or the mere existence of a newer memory. The release workload is deterministic/SIMULATED.