# AUDIT.md — Engram × HydraDB Benchmark Contract

Status: **GOVERNING AUDIT DOCUMENT** for the Hack Hydra workstream.

This file exists to prevent the project from drifting into a polished application that has not first demonstrated a strong memory system against the baselines named by Hack Hydra Track 03.

> **Benchmark first. Primitive second. Application third.**
>
> Any product, demo, vertical, agent workflow, or use case is an application built **on top of** the audited memory substrate. It does not replace the substrate evaluation.

---

## 0. Authority order

When documents disagree, use this precedence:

1. **Official Hack Hydra rules and Track 03 problem statement**
2. **Current `hydra-db/hydradb` open-source repository and its executable behavior**
3. **LongMemEval-V2 official repository and evaluation harness**
4. **LongMemEval official repository and evaluation harness**
5. **BEAM official repository and evaluation harness**
6. **Engram-specific experiments and causal-memory extensions**
7. **Applications, demos, UI, product narratives, and use cases**

No application claim can override a failed benchmark or conformance result.

---

# 1. Hack Hydra eligibility gate

## 1.1 Track

Primary submission track:

**03 | Memory + Context Retrieval**

The official problem is cross-session agent memory over long histories, changing facts, multiple sessions, chronological order, overwritten information, and abstention.

## 1.2 HydraDB requirement

HydraDB must perform real work in the project.

The submission must be able to answer:

- Where exactly is the HydraDB OSS repository used?
- Which core capability disappears if HydraDB is removed?
- Which retrieval or reasoning operation is graph-native rather than a README-level integration?
- Which benchmark result is produced through HydraDB-backed memory?

**Managed HydraDB API usage alone is not sufficient for this audit.** The hackathon explicitly requires building with the HydraDB open-source repository. The audited path therefore uses the OSS implementation directly, locally or self-hosted, and records the exact HydraDB commit/image used.

## 1.3 Repository-history blocker

The official rules require a fresh project started on or after **2026-08-12** and state that the public submission repository must contain no participant-authored commits from before that date.

Current working repository: `etvjay/Engram`.

Audit state:

`SUBMISSION_REPO_ELIGIBILITY = BLOCKED`

until one of the following is true:

1. a fresh public submission repository is created with participant-authored history beginning on or after 2026-08-12; or
2. the organizers explicitly confirm that the existing repository history is acceptable.

Pre-existing Engram work must be treated as pre-existing/open-source work and clearly separated or attributed. Do not silently rewrite old work as hackathon work.

---

# 2. Core research contract

Engram's Hack Hydra work is evaluated as a **memory system** before it is evaluated as a product.

The audited primitive must demonstrate:

1. persistence across sessions/runtimes;
2. retrieval from long histories;
3. chronological and temporal correctness;
4. knowledge updates without silent history deletion;
5. contradiction/premise awareness;
6. abstention when evidence is absent;
7. multi-session reasoning;
8. environment/workflow memory;
9. isolation/scoping correctness;
10. measurable latency and retrieval quality;
11. causal provenance when Engram claims that prior experience influenced a later action.

The application layer may provide trading, operations, coding, workflow, enterprise, or other demonstrations, but those demonstrations do not substitute for these properties.

---

# 3. Baseline A — LongMemEval

Source: `xiaowu0162/LongMemEval`

LongMemEval is the classic long-term interactive-memory baseline.

## 3.1 Required abilities

Audit these categories separately:

- Information Extraction
- Multi-Session Reasoning
- Knowledge Updates
- Temporal Reasoning
- Abstention

Also preserve the benchmark's preference/single-session subtypes where present in the released data.

## 3.2 Required scales

The released benchmark includes:

- **LongMemEval-S**: roughly 115K tokens and around 40 history sessions;
- **LongMemEval-M**: roughly 500 history sessions;
- **Oracle**: evidence sessions only.

Do not report a result as `LongMemEval` without recording which split/file was used.

## 3.3 Retrieval metrics

At minimum preserve the official retrieval metrics when running retrieval evaluation:

Session level:

- `recall_all@5`
- `ndcg_any@5`
- `recall_all@10`
- `ndcg_any@10`

Turn level:

- `recall_all@5`
- `ndcg_any@5`
- `recall_all@10`
- `ndcg_any@10`
- `recall_all@50`
- `ndcg_any@50`

The official retrieval evaluator skips abstention instances because they have no ground-truth answer location. **Do not convert that into an abstention score of zero or one.** Abstention must be evaluated at the QA layer.

## 3.4 QA metric

Use the official LongMemEval answer-evaluation path when claiming benchmark answer accuracy.

Required artifact fields:

```json
{
  "benchmark": "LongMemEval",
  "dataset_variant": "...",
  "dataset_commit_or_release": "...",
  "hydradb_commit": "...",
  "engram_commit": "...",
  "reader_model": "...",
  "retrieval_config": {},
  "retrieval_metrics": {},
  "qa_metrics": {},
  "latency": {},
  "coverage": "FULL|SUBSET|SMOKE"
}
```

---

# 4. Baseline B — LongMemEval-V2

Source: `xiaowu0162/LongMemEval-V2`

This is the **primary agent-experience baseline** for Engram because it evaluates long-term memory over web-agent trajectories and customized environments rather than only chat history.

## 4.1 Dataset characteristics to preserve

The public repository currently describes:

- 451 manually curated questions;
- up to 500 trajectories per haystack;
- up to 115M tokens in the largest haystacks;
- web and enterprise domains;
- small and medium public leaderboard tiers.

## 4.2 Required memory abilities

Audit separately:

- **Static state recall**
- **Dynamic state tracking**
- **Workflow knowledge**
- **Environment gotchas**
- **Premise awareness**

These are not optional product labels. They are benchmark dimensions.

## 4.3 Required comparison methods

Where feasible, preserve/reproduce the official baseline classes before claiming improvement:

- `no_retrieval`
- `rag_query_to_slice`
- `rag_query_to_slice_notes`
- `agentrunbook_r`
- `codex`
- `agentrunbook_c`

If a baseline cannot be reproduced due to model/GPU/time constraints, mark it `NOT_RUN` with the reason. Never silently omit it while saying Engram beats "the baselines."

## 4.4 Official scored outputs

Preserve these metrics from completed web + enterprise runs:

- `overall_full_set`
- `gotchas_accuracy`
- `static_accuracy`
- `dynamic_accuracy`
- `procedure_accuracy`
- `memory_query_avg_seconds`

For leaderboard-compatible comparisons, preserve **LAFS** inputs and gain against the fixed reference frontier.

## 4.5 Harness integrity

The Engram backend must not use hidden benchmark metadata at query time.

The retrieval decision may use only the query and the memory state that would legitimately exist in deployment. Dataset question IDs, gold answers, evaluator labels, question types, and ground-truth evidence locations must remain inaccessible to the memory query path.

Any violation is `BENCHMARK_LEAKAGE = FAIL`.

---

# 5. Baseline C — BEAM

Source: `mohammadtavakoli78/BEAM`

BEAM expands the stress surface beyond 115K-token chat histories.

## 5.1 Required scales

BEAM contains 100 conversations and 2,000 validated probing questions across:

- 128K
- 500K
- 1M
- 10M token conversations

Coverage must be labeled exactly:

- `FULL`
- `SUBSET`
- `SMOKE`

A 128K run is not a 1M or 10M result.

## 5.2 Required abilities

Track all ten BEAM probing categories where present:

1. Abstention
2. Contradiction Resolution
3. Event Ordering
4. Information Extraction
5. Instruction Following
6. Knowledge Update
7. Multi-Session Reasoning
8. Preference Following
9. Summarization
10. Temporal Reasoning

## 5.3 Evaluation

When claiming BEAM answer quality, use or remain compatible with the official evaluation pipeline and record the judge model/configuration.

Do not compare numbers produced by materially different judges as if they were directly equivalent without labeling the difference.

---

# 6. HydraDB OSS conformance

HydraDB is not merely the storage layer for these experiments. It must be measurable as the graph substrate.

For every audited run, record:

```text
HydraDB repository     hydra-db/hydradb
HydraDB commit SHA     <exact SHA>
Build/image            <source build or exact image/digest>
Graph namespace        <value>
Graph id               <value>
Cell configuration     <value>
Storage backend        <local/S3-compatible/etc>
Bolt endpoint          <if used>
HTTP endpoint          <if used>
```

Minimum OSS proof:

1. HydraDB node starts from the open-source project/image.
2. Readiness passes.
3. A graph mutation round-trips.
4. The process restarts and durable state remains when durability is claimed.
5. Engram writes benchmark memory into HydraDB.
6. Engram retrieves benchmark evidence through HydraDB.
7. At least one evaluated path uses graph relationships/traversal materially.
8. Removing graph structure produces a measurable degradation or capability loss on a graph-sensitive test, or the project does not claim a graph-native advantage.

---

# 7. Engram causal-memory extension

The benchmark suites define the baseline. Engram may extend them with execution-memory semantics, but these extensions are **additional evidence**, not replacement evidence.

Canonical Engram chain:

```text
Execution A
  -> Outcome A
  -> Operational Memory
  -> originating runtime ends
  -> Recall B
  -> Decision B
  -> explicit Influence
  -> Action B
  -> Outcome B
```

Required distinction:

`RECALL != INFLUENCE`

A retrieved memory may be:

- `CONSIDERED`
- `SUPPORTED_ACTION`
- `CONSTRAINED_ACTION`
- `CHANGED_ACTION`

Only evidence-backed state transitions may be claimed.

## 7.1 Temporal repair

Engram's Hydra-native extension should test:

```text
T1: experience says C is unsafe
T2: later evidence changes the environment
T3: current decision may legitimately use C again
```

The old experience must remain inspectable. New evidence may supersede applicability; it must not rewrite history.

This experiment should map most directly to:

- LongMemEval knowledge updates / temporal reasoning;
- LongMemEval-V2 dynamic state / gotchas / premise awareness;
- BEAM contradiction resolution / event ordering / knowledge update / temporal reasoning.

---

# 8. Mandatory ablations

A strong claim requires a comparison.

For each benchmark or canonical experiment, run as many of these as the harness permits:

### A0 — No memory

Agent/reader receives no retrieved long-term memory.

### A1 — Flat retrieval

Conventional similarity/BM25/vector retrieval without Engram causal semantics or graph traversal.

### A2 — Hydra retrieval without graph advantage

Hydra-backed content retrieval with graph-sensitive features disabled/unused where possible.

### A3 — Hydra graph memory

HydraDB relationships/traversal enabled.

### A4 — Engram + Hydra causal memory

Hydra graph substrate plus Engram admission, applicability, provenance, and influence semantics.

Claims such as "graph improves X" or "Engram improves X" require the relevant adjacent ablation.

---

# 9. Audit dimensions

Every experimental run is audited on four independent dimensions.

## 9.1 Correctness

- answer accuracy
- retrieval recall/ranking
- abstention
- knowledge-update correctness
- temporal ordering
- contradiction/premise handling
- cross-session reasoning

## 9.2 Systems

- ingestion time
- memory query latency p50/p95 where available
- end-to-end answer latency
- index/storage size
- restart/recovery behavior
- peak memory/CPU when measured

## 9.3 Isolation and integrity

- no cross-agent/collection contamination
- no benchmark label leakage
- deterministic identifiers where required
- provenance reconstructability
- historical state preservation

## 9.4 Hydra-native value

- actual graph model documented
- graph traversals/relationships used in live execution
- capability or quality lost when Hydra graph behavior is removed
- exact HydraDB OSS commit reproducible by judges

---

# 10. Evidence states

Use conservative labels.

```text
IMPLEMENTED   code exists
TESTED        deterministic/local test passed
DEPLOYED      running in target environment
SIMULATED     surrounding workload/environment is simulated
PROPOSED      designed but not implemented
UNKNOWN       not established
NOT_RUN       benchmark/ablation intentionally not executed, with reason
```

Do not promote one state into another through prose.

A benchmark subset must additionally state:

```text
coverage = FULL | SUBSET | SMOKE
n_examples = <integer>
dataset_filter = <exact selection rule>
```

---

# 11. Required run manifest

Every benchmark/experiment directory must contain a machine-readable manifest.

Minimum schema:

```json
{
  "run_id": "...",
  "started_at": "...",
  "git": {
    "submission_commit": "...",
    "engram_upstream_commit": "...",
    "hydradb_commit": "..."
  },
  "benchmark": {
    "name": "LongMemEval|LongMemEval-V2|BEAM|Engram-Causal",
    "source_commit": "...",
    "split": "...",
    "coverage": "FULL|SUBSET|SMOKE",
    "n_examples": 0
  },
  "models": {},
  "retrieval": {},
  "hydradb": {},
  "hardware": {},
  "metrics": {},
  "artifacts": [],
  "notes": []
}
```

No benchmark table in the README should contain a number that cannot be traced to one of these manifests and its raw output.

---

# 12. Artifact layout

Target layout:

```text
audit/
  manifests/
  baseline-status.json
  claim-ledger.json

evidence/
  hydradb/
    oss-smoke/
    conformance/
  longmemeval/
    runs/
    reports/
  longmemeval-v2/
    runs/
    reports/
  beam/
    runs/
    reports/
  engram/
    causal/
    temporal-repair/
    isolation/
    ablations/
```

Raw artifacts are retained. `*-latest.json` aliases may point to the most recent accepted run but must not replace immutable run records.

---

# 13. Claim ledger

Before any claim enters the README, demo script, landing page, submission form, or pitch, add it to the claim ledger.

Example:

```json
{
  "claim": "Engram improves knowledge-update accuracy over flat retrieval on LongMemEval-S",
  "status": "PROPOSED",
  "required_runs": ["A1", "A4"],
  "artifact_refs": [],
  "approved_for_public_use": false
}
```

Approval requires:

1. matching benchmark split;
2. matching reader/judge configuration where comparison requires it;
3. raw evidence available;
4. no benchmark leakage;
5. result reproducible from documented commands;
6. wording no stronger than the evidence.

---

# 14. Application/use-case rule

Applications are permitted and encouraged, but they sit above the audited substrate.

```text
BEAM / LongMemEval / LongMemEval-V2
              ↓
      audited memory substrate
              ↓
        Engram semantics
              ↓
       HydraDB graph layer
              ↓
   application / product / demo
```

An application may demonstrate why the primitive matters. It may not redefine whether the primitive works.

Examples:

- trading execution memory;
- browser/web-agent continuity;
- enterprise workflow memory;
- coding-agent memory;
- operations/runbook memory.

Each application must declare which audited capabilities it consumes rather than inventing a new unmeasured definition of memory quality.

---

# 15. Submission audit

Before submission all items below must have an explicit PASS/FAIL state.

## Eligibility

- [ ] Public submission repo is fresh and rule-compliant.
- [ ] No participant-authored pre-Aug-12 commits in submission history, unless organizer-approved.
- [ ] Open-source license present.
- [ ] Third-party datasets/code attributed.

## HydraDB

- [ ] Uses `hydra-db/hydradb` OSS directly.
- [ ] Exact HydraDB commit/image recorded.
- [ ] Reproducible startup instructions.
- [ ] Real ingestion.
- [ ] Real retrieval.
- [ ] Graph-native operation demonstrated.
- [ ] Judge can identify what breaks if HydraDB is removed.

## Benchmarks

- [ ] LongMemEval run state documented.
- [ ] LongMemEval-V2 run state documented.
- [ ] BEAM run state documented.
- [ ] Every subset labeled SUBSET/SMOKE rather than FULL.
- [ ] Baselines/ablations documented.
- [ ] Latency recorded where required.
- [ ] Abstention measured, not inferred.
- [ ] Knowledge-update/temporal behavior measured.

## Engram extensions

- [ ] Runtime-death continuity proof.
- [ ] Recall != influence proof.
- [ ] Agent isolation proof.
- [ ] Causal trace proof.
- [ ] Temporal-repair proof.

## Evidence

- [ ] Run manifests committed.
- [ ] Raw outputs retained.
- [ ] Claim ledger reconciled.
- [ ] README numbers trace to artifacts.
- [ ] Setup commands reproduce on a clean machine.

## Product

- [ ] Functional demo.
- [ ] Clear use case.
- [ ] Product/UI sits on the audited primitive rather than replacing it.
- [ ] 3-minute demo shows the system working.
- [ ] Demo explains how HydraDB OSS is used and why it matters.

---

# 16. Current audit state

```text
Hack Hydra Track 03 alignment       DEFINED
Benchmark authority order           DEFINED
LongMemEval baseline                DEFINED / NOT_RUN
LongMemEval-V2 baseline             DEFINED / NOT_RUN
BEAM baseline                       DEFINED / NOT_RUN
HydraDB OSS runtime                 NOT_RUN
HydraDB graph integration           PROPOSED
Engram causal proof on Hydra        PROPOSED
Temporal repair                     PROPOSED
Submission repo eligibility         BLOCKED
Application layer                   OUT OF SCOPE UNTIL BASELINE PATH RUNS
```

The audit is intentionally strict. Passing a product demo does not change a failed benchmark gate, and passing a benchmark does not automatically justify a causal or graph-native claim.
