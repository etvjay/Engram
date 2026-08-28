# Evidence Ledger

Allowed states:
`UNVERIFIED | SIMULATED_PASS | LOCAL_PASS | FORK_PASS | TESTNET_PASS | LIVE_PASS | PUBLIC_EVALUATOR_PASS | PRODUCTION_PASS | FAILED | BLOCKED`

## Current claim ledger

| Claim / gate | State | Evidence | Negative mutation | Notes |
|---|---|---|---|---|
| Sibyl persists decision-critical memory | LOCAL_PASS | GitHub Actions run `33221823993`, job `99017280805`, branch head `8f616545`: SDK 0.6.1 installed; route/provider/conflict memories persisted through Sibyl | missing Sibyl runtime | Pre-build-window evidence; must be re-run during official window |
| Fresh session/process recalls prior memory | LOCAL_PASS | run `33221823993`: separate seed and recall processes; route memory plus provider relationship memory were recalled in later processes; conflict test creates a fresh `SibylRuntimeStore` before retrieving both contradictory memories | terminate source process / unavailable Sibyl | Stronger than fresh-object-only proof |
| Recalled memory changes action | LOCAL_PASS | run `33221823993`: route `A-B-C -> A-B-D`; urgent provider `atlas -> beacon`; explicit `CHANGED_ACTION` traces | no-memory control | Paired behavioral deltas, not retrieval-only |
| Recalled memory constrains authority without global blacklist | LOCAL_PASS | run `33221823993`, fresh routine provider process: Atlas remains selected while prepay falls `5000 -> 1000` bps and milestone verification becomes required; trace records `CONSTRAINED_ACTION` | routine-context control | Demonstrates contextual relationship posture rather than global reputation |
| Multi-execution experience becomes bounded relationship memory | LOCAL_PASS | run `33221823993`: two historical Atlas breach executions plus admitting execution produced `CONTEXT_GUARDED` relationship memory | single-failure fixture / cross-task fixture | Pure scenario tests also require >=2 source executions and task-type applicability |
| Urgent provider experience changes outcome | LOCAL_PASS | run `33221823993`: no-memory Atlas path deterministically returns `SLA_BREACH`; memory-conditioned Beacon path returns `SUCCESS` | no-memory provider control | Application fixture, not a claim about a live provider network |
| Deleting/unavailable Sibyl breaks/degrades core function | LOCAL_PASS | run `33221823993`: deletion CLI emitted `degraded: true`, `fallbackAvailable: false`, missing-runtime ENOENT | remove/disable Sibyl runtime | VETO; mutation harness fails if Sibyl unexpectedly stays available |
| Engram provenance remains reconstructable | LOCAL_PASS | run `33221823993`: recall IDs, memory IDs, `engram.memory-state/v1` digests, counterfactuals, accepted influence and evaluation events appear in route/provider traces | post-recall memory tamper | Sibyl backend preserves trace material needed for influence validation |
| Expired Sibyl memory is retrieved but blocked before exposure | LOCAL_PASS | run `33221823993`, `npm run test:sibyl` | expired memory fixture | Demonstrates retrieval != legitimate influence |
| Post-recall memory tamper is rejected | LOCAL_PASS | run `33221823993`, `npm run test:sibyl` | overwrite memory after digest exposure | Protects recall-to-decision state integrity |
| Conflicting memory remains non-silently adjudicated through Sibyl store | LOCAL_PASS | run `33221823993`, job `99017280805`: `sibyl-competing-memories.test.ts` persisted contradictory memories, retrieved both through a fresh Sibyl-backed runtime, rejected influence with `UNRESOLVED_MEMORY_CONTRADICTION`, then allowed the resolved side only after explicit `SUPERSEDES` evidence | unresolved `CONTRADICTS` pair | Proves Sibyl persistence/retrieval does not silently turn ranking into adjudication |
| Expanded Sibyl pressure suite | LOCAL_PASS | run `33221823993`, job `99017280805`: `3` test files and `7/7` tests passed | expiry, tamper, contradiction, deletion, single-failure/cross-task controls | Provider tests retain bounded 15s timeout; contradiction integration test uses bounded 20s timeout because bridge-backed round trips are multi-process |
| Canonical Engram suite remains green with evaluated Sibyl profile | LOCAL_PASS | run `33221823993`, check job `99017280705`: `npm run check` passed; SAM build run `33221823973` also passed | canonical test suite | Same branch head `8f616545a856bb9ce3ab95b14f06af0306417d4e` |
| Root README exposes critical write/read/influence call map | LOCAL_PASS | root README on `hackathon/sibyl-ebi` opens with judge-facing call map for Sibyl wiring, write/read, influence, provider scenario, process-boundary demo and deletion path | cold reviewer navigation | Human under-two-minute timing remains to be performed; therefore not `PUBLIC_EVALUATOR_PASS` |
| Hackathon-window rerun of core proof | UNVERIFIED | — | clean clone + fresh DB | Pre-window proof cannot substitute for final event-window evidence |
| Base integration does real product work | UNVERIFIED | — | remove Base action | optional; do not add decoratively |
| Virtuals integration does real product work | UNVERIFIED | adapter/conformance/live-ingest path implemented; no authenticated ACP job yet | remove Virtuals interaction | optional; partner multiplier remains unclaimed |

## Current flagship interpretation
The strongest current memory claim is not `the agent remembers Atlas is bad`.

It is:

> Multiple attributable executions become an agent-specific, task-specific relationship posture. In a fresh session that posture can change delegation entirely for urgent work, or narrow payment/verification authority for routine work, while preserving the same provider relationship.

This is evidence-bounded experiential continuity, not a universal reputation score.

The adversarial corollary is equally important:

> Retrieval rank is not adjudication. If two persisted memories explicitly contradict each other, Engram may expose both but refuses to let either silently become authority until relationship evidence resolves the conflict.

## Evidence-history note
Run `32753747711` remains an earlier pre-window baseline for the original six-test profile.

The current stronger pre-window baseline is branch head `8f616545a856bb9ce3ab95b14f06af0306417d4e`:
- Engram CI `33221823993`: SUCCESS
- Sibyl profile job `99017280805`: SUCCESS, 3 files / 7 tests
- canonical check job `99017280705`: SUCCESS
- Engram SAM Build `33221823973`: SUCCESS

A green run proves only the commit/run it actually executed. Later documentation commits may record that evidence but do not strengthen it.

Every promotion above `LOCAL_PASS` must point to the exact hackathon-window artifact/run that supports it.

No claim may be promoted above the smallest state actually supported by evidence.
