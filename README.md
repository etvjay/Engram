# Engram

**Execution memory for autonomous agents.**

> Databases remember records. Engram remembers consequences.

Engram turns consequential execution history into durable operational experience, retrieves that experience under eligible future conditions, and records when it actually changes a later decision.

The application or agent remains the decision authority. Engram does not choose the business action.

## Governing invariant

Engram is complete only when a prior consequential execution survives its originating runtime, returns under an eligible future context, demonstrably influences a later decision, changes observable behavior from the memory-free baseline, and leaves enough provenance to reconstruct that causal relationship.

```text
source execution
      ↓
source outcome
      ↓
operational memory
      ↓
originating runtime ends
      ↓
fresh runtime recalls memory
      ↓
decision explicitly references memory
      ↓
action differs from baseline/control
      ↓
later outcome
```

**Recall is not influence.** Retrieval alone is not causal proof. Prompt inclusion alone is not causal proof.

## HydraDB submission

This branch explores Engram as a temporal experience graph on HydraDB.

The core question is:

> Can an agent explain why it changed its behavior as its experience — and reality itself — changed over time?

HydraDB is used as the active experience substrate for this submission. Engram maps executions, outcomes, operational memories, retrievals, decisions, influences, and superseding experience into reconstructable temporal relationships.

### Experience graph

```text
Agent
 │
 EXECUTED
 ▼
Execution A
 │
 PRODUCED
 ▼
Outcome A
 │
 DERIVED EXPERIENCE
 ▼
Operational Memory
 │
 RECALLED IN
 ▼
Execution B
 │
 INFLUENCED
 ▼
Decision B
 │
 SELECTED
 ▼
Action B
 │
 RESULTED IN
 ▼
Outcome B
```

The graph is evidence, not decoration: Engram should be able to reconstruct why a later decision changed and which prior consequence caused that change.

## What Engram includes

- versioned execution episodes;
- stateless execution lifecycle and memory semantics;
- policy-controlled admission, retrieval, influence, expiry and invalidation;
- explicit recall → influence → counterfactual provenance;
- backend-neutral `MemoryRepository` contract;
- HydraDB-backed temporal experience graph for this submission;
- TypeScript SDK and Python HTTP SDK;
- HTTP API;
- semantic Engram MCP surface;
- framework adapters;
- deterministic verification and evidence artifacts.

## Canonical proof

The first proof is deliberately small and causal:

1. Run A has no relevant prior experience.
2. The application selects Route C.
3. Route C encounters `LIQUIDITY_UNAVAILABLE`.
4. Recovery is observed and Engram admits an operational lesson.
5. The originating runtime ends.
6. A fresh Run B recalls the lesson under comparable conditions.
7. The application selects Route D instead and records the memory as `CHANGED_ACTION`.
8. Run B succeeds.
9. Engram reconstructs the full memory-to-action lineage.

The external multi-venue workload is **SIMULATED**. Persistence, retrieval, influence recording, lineage, and backend behavior must be promoted only from observed evidence.

## Hydra-native proof: temporal repair

The distinctive experiment asks a harder question:

> **Why did the agent avoid C before but choose C now?**

```text
T1
Venue C fails under thin liquidity
→ experience: avoid C under this context

T2
Venue C later changes and succeeds
→ new experience does not erase the old one

T3
fresh runtime faces comparable decision
→ current evidence may support C again
```

The required result is not merely a new answer. Engram must reconstruct the temporal relationship between the old consequence, the newer evidence, and the later decision.

## Evidence gates

The Hydra work proceeds in five gates:

1. **Portability** — the canonical causal proof passes through the HydraDB-backed repository.
2. **Layman proof** — runtime death, recall ≠ influence, agent isolation, and change-of-mind scenarios are directly demonstrable.
3. **Conformance** — HydraDB passes the Engram execution-memory semantic contract.
4. **Temporal repair** — superseding experience changes current behavior without rewriting history.
5. **Measurement** — deterministic correctness, causal trace completeness, and p50/p95 latency are recorded.

Artifacts live under:

```text
evidence/hydra/
  causal-latest.json
  layman-latest.json
  conformance-latest.json
  temporal-repair-latest.json
  benchmark-latest.json
```

## Causal Trace Completeness

For every claimed influence, Engram should resolve:

```text
source execution
source outcome
operational memory
retrieval
later decision
influence record
counterfactual action when applicable
later outcome
```

```text
traceCompleteness = resolvedRequiredLinks / requiredLinks
```

Target for the canonical proof: `1.0`.

## Architecture

```text
Integration Surfaces
TypeScript SDK · Python SDK · HTTP · MCP · framework adapters
                         │
                         ▼
                   Engram Runtime
       recall · admission · eligibility · influence
                         │
                         ▼
                  Execution Memory
 executions · outcomes · memories · decisions · provenance
                         │
                         ▼
               HydraDB Experience Graph
       temporal relationships · context · trace lineage
                         │
                         ▼
                    Applications
           agents remain action authority
```

Canonical lifecycle:

```text
context → recall → application decides → authorize → execute → observe → recover → remember
```

## Quick start

Requirements:

- Node.js 22
- npm

```bash
git clone https://github.com/etvjay/Engram.git
cd Engram
git checkout hydra/experience-graph
npm install
npm run check
```

HydraDB-specific setup and verification commands will be documented as the adapter lands. Do not treat missing credentials or skipped external integration bodies as live verification.

## Backend contract

Engram core depends on a behavioral repository contract rather than a specific storage engine:

```ts
interface MemoryRepository {
  startExecution(input): Promise<{ executionId: string }>;
  appendEvent(event): Promise<void>;
  recordOutcome(outcome): Promise<void>;
  persistMemory(memory, sourceExecutionIds): Promise<void>;
  searchMemory(input): Promise<MemorySearchResult>;
  recordDecision(decision, retrievalId?): Promise<void>;
  getTrace(executionId): Promise<unknown>;
}
```

For this submission, HydraDB is the active implementation target.

## Submission thesis

> **Most memory systems answer: “What does the agent remember?”**
>
> **Engram asks: “What did reality teach the agent, and what did that lesson later cause it to do?”**

For HydraDB, the extension is:

> **When reality changes, can the agent show why it changed its mind without rewriting what happened before?**

See [`HACK_HYDRA.md`](HACK_HYDRA.md) for the evidence plan and submission scope.
