# Evidence Ledger

Allowed states:
`UNVERIFIED | SIMULATED_PASS | LOCAL_PASS | FORK_PASS | TESTNET_PASS | LIVE_PASS | PUBLIC_EVALUATOR_PASS | PRODUCTION_PASS | FAILED | BLOCKED`

## Current claim ledger

| Claim / gate | State | Evidence | Negative mutation | Notes |
|---|---|---|---|---|
| Sibyl persists decision-critical memory | LOCAL_PASS | GitHub Actions run `32753747711`, job `97516430322`, code head `d3d6e983`: SDK 0.6.1 installed; route and provider profile state persisted through Sibyl | missing Sibyl runtime | Pre-build-window evidence; must be re-run during official window |
| Fresh session/process recalls prior memory | LOCAL_PASS | same job: separate seed and recall processes; route memory `d9996c9c-af00-4c05-99b0-bafcdac15b10` and provider relationship memory `f269d755-f642-4495-8f68-da735618d74b` were recalled in later processes | terminate source process / unavailable Sibyl | Stronger than fresh-object-only proof |
| Recalled memory changes action | LOCAL_PASS | same job: route `A-B-C -> A-B-D`; urgent provider `atlas -> beacon`; explicit `CHANGED_ACTION` traces | no-memory control | Paired behavioral deltas, not retrieval-only |
| Recalled memory constrains authority without global blacklist | LOCAL_PASS | same job, fresh routine provider process: Atlas remains selected while prepay falls `5000 -> 1000` bps and milestone verification becomes required; trace records `CONSTRAINED_ACTION` | routine-context control | Demonstrates contextual relationship posture rather than global reputation |
| Multi-execution experience becomes bounded relationship memory | LOCAL_PASS | same job: historical executions `fb0570f6...` + `22a66402...` plus admitting execution `2965c23d...` produced `REPEATED_PATTERN` memory `f269d755...` with `CONTEXT_GUARDED` posture | single-failure fixture / cross-task fixture | Pure scenario tests also require >=2 source executions and task-type applicability |
| Urgent provider experience changes outcome | LOCAL_PASS | same job: no-memory Atlas path deterministically returns `SLA_BREACH`; memory-conditioned Beacon path returns `SUCCESS` | no-memory provider control | This is an application fixture, not a claim about a live provider network |
| Deleting/unavailable Sibyl breaks/degrades core function | LOCAL_PASS | same job: deletion CLI emitted `degraded: true`, `fallbackAvailable: false`, missing-runtime ENOENT | remove/disable Sibyl runtime | VETO; mutation harness fails if Sibyl unexpectedly stays available |
| Engram provenance remains reconstructable | LOCAL_PASS | same job: recall IDs, memory IDs, `engram.memory-state/v1` digests, counterfactuals, accepted influence and evaluation events appear in route/provider traces | post-recall memory tamper | Sibyl backend preserves the trace needed for Engram influence validation |
| Expired Sibyl memory is retrieved but blocked before exposure | LOCAL_PASS | same job `npm run test:sibyl`: expired-memory test passed | expired memory fixture | Demonstrates retrieval != legitimate influence |
| Post-recall memory tamper is rejected | LOCAL_PASS | same job `npm run test:sibyl`: state-digest tamper test passed | overwrite memory after digest exposure | Protects recall-to-decision state integrity |
| Expanded Sibyl pressure suite | LOCAL_PASS | same job: `6 passed` across core + provider-continuity integration tests | timeout/retry history preserved | Initial provider run timed out at 5s; bounded 15s integration timeout added without changing assertions; subsequent run green |
| Canonical Engram suite remains green with optional Sibyl profile | LOCAL_PASS | run `32753747711`, job `97516431430`: `npm run check` passed | canonical test suite | Sibyl external SDK test remains isolated to provisioned Sibyl CI job |
| Conflicting memory remains non-silently adjudicated through Sibyl store | UNVERIFIED | existing Engram semantics only | contradictory Sibyl memory fixture | Still worth adding before final submission pressure |
| Root README exposes critical write/read/influence call map | UNVERIFIED | — | cold reviewer navigation | Published evaluator gate; still required |
| Hackathon-window rerun of core proof | UNVERIFIED | — | clean clone + fresh DB | Pre-window proof cannot substitute for final event-window evidence |
| Base integration does real product work | UNVERIFIED | — | remove Base action | optional |
| Virtuals integration does real product work | UNVERIFIED | — | remove Virtuals interaction | optional |

## Current flagship interpretation
The strongest current memory claim is not `the agent remembers Atlas is bad`.

It is:

> Multiple attributable executions become an agent-specific, task-specific relationship posture. In a fresh session that posture can change delegation entirely for urgent work, or narrow payment/verification authority for routine work, while preserving the same provider relationship.

This is evidence-bounded experiential continuity, not a universal reputation score.

## Evidence-history note
A green run proves only the commit/run it actually executed. Run `32753747711` checked the PR state whose candidate head was `d3d6e983...`. Later documentation commits record that evidence but do not strengthen it.

Every promotion above `LOCAL_PASS` must point to the exact hackathon-window artifact/run that supports it.

No claim may be promoted above the smallest state actually supported by evidence.
