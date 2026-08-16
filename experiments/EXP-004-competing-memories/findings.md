# EXP-004 — Competing Memories Findings

Date: 2026-08-16
Evidence run: GitHub Actions Engram CI `31923329226`
Result: PASS

## Findings

### 1. Exact retrieval provenance is preserved

A single execution can perform multiple recalls that expose different memories. A later decision may reference an influential memory only through the retrieval that actually exposed that memory.

The runtime accepted:

- Memory A + Recall A
- Memory B + Recall B

and preserved the two retrieval IDs independently on their corresponding decision-memory influences.

The runtime rejected:

- Memory A + Recall B

with `RETRIEVAL_MISMATCH` and emitted an `INFLUENCE_REJECTED` evaluation event without persisting the invalid decision.

This establishes the invariant:

`valid memory identity != valid influence provenance`

A memory ID alone is insufficient evidence that the memory was available to the agent for a particular decision.

### 2. Competing memories remain recall-visible

Two high-confidence operational memories carrying opposing guidance can both survive history and remain visible during recall. Engram does not resolve the disagreement by overwriting one memory, selecting the latest memory, or treating vector rank as adjudication.

### 3. Contradiction can be an opt-in influence constraint

With no `MemoryEligibilityAdvisor`, the runtime can expose both memories and allow the application to reference either memory subject to the normal influence policy.

With `RelationshipMemoryEligibilityAdvisor` configured for unresolved contradiction at the `INFLUENCE` stage:

- both memories remain recall-visible;
- an explicitly assessed unresolved `CONTRADICTS` relationship causes influence to fail closed with `UNRESOLVED_MEMORY_CONTRADICTION`;
- no decision is persisted for the rejected influence attempt;
- the rejection is recorded as an evaluation event.

### 4. Explicit relationship evidence can resolve the influence block

When explicit `SUPERSEDES` evidence is added, the advisor no longer treats the relevant contradiction as unresolved for the superseding memory, allowing the later decision to reference that memory.

This does not make supersession a universal protocol rule. It demonstrates that workload-specific eligibility can consume explicit evaluation evidence without modifying historical memory records.

## Evidence boundaries

- PASS is deterministic runtime/conformance evidence from repository CI.
- No live CockroachDB Cloud behavior is inferred from this experiment.
- Engram does not infer contradiction from semantic similarity.
- Engram does not choose the application's action.
- The contradiction advisor is optional composition, not a default protocol guarantee.
