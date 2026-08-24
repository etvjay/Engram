# Evidence Ledger

Allowed states:
`UNVERIFIED | SIMULATED_PASS | LOCAL_PASS | FORK_PASS | TESTNET_PASS | LIVE_PASS | PUBLIC_EVALUATOR_PASS | PRODUCTION_PASS | FAILED | BLOCKED`

## Current claim ledger

| Claim / gate | State | Evidence | Negative mutation | Notes |
|---|---|---|---|---|
| Sibyl persists decision-critical memory | LOCAL_PASS | GitHub Actions run `32750511943`, job `97506098369`, code head `df341ef`: SDK 0.6.1 installed, build passed, seed process admitted memory `2783541a-a21f-49e9-8263-a35c46ff6717` | missing Sibyl runtime | Pre-build-window evidence; must be re-run during official window |
| Fresh session/process recalls prior memory | LOCAL_PASS | same job: separate `npm run demo:sibyl:seed` and `npm run demo:sibyl:recall` processes; process B recalled exact memory ID `2783541a-a21f-49e9-8263-a35c46ff6717` | terminate process A / unavailable Sibyl | Stronger than fresh-object-only proof |
| Recalled memory changes action | LOCAL_PASS | same job: control route `A-B-C`; memory-conditioned route `A-B-D`; `changedAction: true`; decision trace records `CHANGED_ACTION` | no-memory control | Paired behavioral delta, not retrieval-only |
| Deleting/unavailable Sibyl breaks/degrades core function | LOCAL_PASS | same job: deletion CLI emitted `degraded: true`, `fallbackAvailable: false`, missing-runtime ENOENT | remove/disable Sibyl runtime | VETO; mutation harness fails if Sibyl unexpectedly stays available |
| Engram provenance remains reconstructable | LOCAL_PASS | same job: recall ID, memory ID, `engram.memory-state/v1` digest, counterfactual Route C, accepted influence and runtime evaluation events appear in trace | post-recall memory tamper | Sibyl backend preserves the trace needed for Engram influence validation |
| Expired Sibyl memory is retrieved but blocked before exposure | LOCAL_PASS | same job `npm run test:sibyl`: `retrieves but refuses to expose expired Sibyl memory` passed | expired memory fixture | Demonstrates retrieval ≠ legitimate influence |
| Post-recall memory tamper is rejected | LOCAL_PASS | same job `npm run test:sibyl`: `rejects influence when Sibyl memory changes after recall` passed | overwrite memory after digest exposure | Protects recall-to-decision state integrity |
| Canonical Engram suite remains green with optional Sibyl profile | LOCAL_PASS | run `32750511943`, job `97506098115`: `npm run check` passed; same PR also passed earlier generic run `32750255631` after optional-integration fixes | canonical test suite | Sibyl external SDK test is required only in the Sibyl CI job |
| Conflicting memory remains non-silently adjudicated through Sibyl store | UNVERIFIED | existing Engram semantics only | contradictory Sibyl memory fixture | Next memory-pressure task |
| Root README exposes critical write/read/influence call map | UNVERIFIED | — | cold reviewer navigation | Published evaluator gate; still required |
| Hackathon-window rerun of core proof | UNVERIFIED | — | clean clone + fresh DB | Pre-window proof cannot substitute for final event-window evidence |
| Base integration does real product work | UNVERIFIED | — | remove Base action | optional |
| Virtuals integration does real product work | UNVERIFIED | — | remove Virtuals interaction | optional |

## Evidence-history note
A green run proves only the commit/run it actually executed. Run `32750511943` checked out PR merge `ad748635...`, whose candidate code head was `df341ef...`. Subsequent EBI documentation-only commits record that evidence but do not strengthen it.

Every promotion above `LOCAL_PASS` must point to the exact hackathon-window artifact/run that supports it.

No claim may be promoted above the smallest state actually supported by evidence.
