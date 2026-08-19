# Engram × HydraDB — Hack Hydra 2026

## Submission thesis

**Databases remember records. Engram remembers consequences.**

Engram is a portable execution-memory layer that turns consequential execution history into durable operational experience and records when that experience changes a later decision.

For HydraDB, the new question is not merely whether memory survives. It is:

> Can an agent explain why it changed its behavior as its experience — and reality itself — changed over time?

## What stays invariant

The HydraDB port must preserve the existing Engram causal contract:

`Execution A -> Outcome -> Operational Memory -> runtime destruction -> Recall B -> Decision B -> explicit Influence -> changed Action -> Outcome B`

Recall is not influence.

CockroachDB remains a historical/reference backend and evidence set. It must not be deleted or relabeled as HydraDB evidence.

## HydraDB-native representation

Expected entities:

- Agent
- Execution
- Event
- Outcome
- OperationalMemory
- Retrieval
- Decision

Expected relationships:

- EXECUTED
- PRODUCED
- DERIVED_FROM
- RECALLED_IN
- INFLUENCED
- SELECTED
- RESULTED_IN
- SUPERSEDES

The implementation should use HydraDB's memory/context graph meaningfully rather than reproducing a flat vector-store wrapper.

## Evidence gates

### Gate 1 — Portability

The existing Engram causal scenario passes through a HydraDB-backed `MemoryRepository` implementation without changing the meaning of the proof.

Artifact: `evidence/hydra/causal-latest.json`

### Gate 2 — Layman proof

Demonstrate:

1. **Experience survives runtime death.**
2. **Recall is not influence.** A recalled memory can be merely `CONSIDERED`.
3. **Agent isolation holds.** One agent cannot inherit another agent's experience as action authority.
4. **Why did you change your mind?** Older experience remains inspectable after later evidence changes the current decision.

Artifact: `evidence/hydra/layman-latest.json`

### Gate 3 — Backend conformance

Run the same Engram semantic invariants against the HydraDB repository:

- execution persistence
- ordered events
- outcome lineage
- source-execution provenance
- memory persistence
- retrieval persistence
- agent isolation
- validity/applicability
- recall != influence
- decision-memory linkage
- counterfactual preservation for `CHANGED_ACTION`
- causal trace reconstruction
- runtime restart continuity
- historical-state preservation

Artifact: `evidence/hydra/conformance-latest.json`

### Gate 4 — HydraDB-native temporal repair

Scenario:

- T1: Venue C fails under thin liquidity -> experience advises avoiding C.
- T2: Venue C later changes and succeeds under comparable conditions.
- T3: A fresh runtime may select C again.

Required explanation:

> Why did the agent avoid C before but choose C now?

The answer must be reconstructable from persisted execution/experience relationships rather than fabricated narrative.

Artifact: `evidence/hydra/temporal-repair-latest.json`

### Gate 5 — Measurement

Measure deterministic correctness before large-scale throughput work:

- applicable-memory accuracy
- cross-agent contamination
- stale/superseded-memory error rate
- temporal/causal answer accuracy
- causal trace completeness
- persist latency p50/p95
- retrieve latency p50/p95
- trace latency p50/p95

Artifact: `evidence/hydra/benchmark-latest.json`

## Causal Trace Completeness

For every claimed influence, resolve the required chain:

- source execution
- source outcome
- operational memory
- retrieval
- later decision
- influence record
- counterfactual action when applicable
- later outcome

`traceCompleteness = resolvedRequiredLinks / requiredLinks`

Target for canonical proof: `1.0`.

## Scope rule

Do not spend the submission window on:

- deleting CockroachDB support
- universal database abstractions beyond the existing `MemoryRepository` seam
- reproducing C-SPANN benchmarks
- 50k/100k scale before semantic correctness
- frontend redesign
- unsupported claims

Build the HydraDB adapter, prove the canonical invariant, add the temporal-repair experiment, then measure it.
