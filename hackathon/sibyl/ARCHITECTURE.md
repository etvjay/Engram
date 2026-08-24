# Architecture — Engram × Sibyl Hackathon Profile

## Architectural decision
Do **not** rewrite canonical Engram around Sibyl. Introduce a hackathon storage profile where Sibyl is the sole decision-critical persistence/recall substrate.

```text
Application / Agent
        |
        v
Engram Runtime
- ExecutionEpisode
- admission
- eligibility
- influence
- provenance
- invalidation/expiry
- counterfactual evaluation
        |
        v
SibylMemoryStore
- persist execution-derived memory
- retrieve across process/session boundary
- preserve identifiers/metadata needed for provenance
        |
        v
fresh-session recall
        |
        v
application decision + observable changed action
```

## Boundary

### Engram owns
- what qualifies as an execution episode;
- when an observation may become operational memory;
- whether recalled memory is eligible to influence action;
- explicit influence recording;
- provenance from source execution to later decision;
- counterfactual comparison;
- expiry/invalidation/conflict semantics.

### Sibyl owns in the judged profile
- durable persistence of decision-critical memories;
- cross-session retrieval;
- historical state required for Engram recall.

### Application owns
- final business/action decision;
- external action execution.

## Forbidden architecture

```text
Engram -> CockroachDB canonical memory
      \-> Sibyl mirror
```

If CockroachDB can independently produce equivalent fresh-session behavior, Sibyl is decorative and the gate is at risk.

## Adapter contract (proposed)

```ts
interface ExecutionMemoryStore {
  persist(memory: OperationalMemory): Promise<PersistReceipt>
  recall(query: RecallQuery): Promise<MemoryCandidate[]>
  get(memoryId: string): Promise<OperationalMemory | null>
  invalidate(memoryId: string, reason: string): Promise<void>
}
```

`SibylMemoryStore` implements this contract for the hackathon profile.

## Minimum causal acceptance
1. Run A executes with no relevant memory.
2. Failure/recovery evidence is observed.
3. Engram admits an operational memory and persists it to Sibyl.
4. Process terminates.
5. Fresh Run B starts.
6. Sibyl recalls the memory.
7. Engram eligibility permits influence.
8. Application records memory influence and chooses a different action.
9. Outcome and trace are recorded.
10. A no-memory control demonstrates the action difference.

## Production boundary
This profile proves storage portability and load-bearing cross-session behavior. It does not replace the canonical Engram production persistence decision unless separately adopted after the hackathon.
