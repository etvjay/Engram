# Evidence Ledger

Allowed states:
`UNVERIFIED | SIMULATED_PASS | LOCAL_PASS | FORK_PASS | TESTNET_PASS | LIVE_PASS | PUBLIC_EVALUATOR_PASS | PRODUCTION_PASS | FAILED | BLOCKED`

## Current claim ledger

| Claim / gate | State | Evidence | Negative mutation | Notes |
|---|---|---|---|---|
| Sibyl persists decision-critical memory | LOCAL_PASS | GitHub Actions `Engram Sibyl Profile` run `32749722101`, job `97503556005`, head `630e59d`: pinned SDK installed, build passed, `npm run test:sibyl` passed | missing Sibyl runtime | Public clean runner, but not yet the final hackathon-window proof |
| Fresh store/runtime recalls prior memory | LOCAL_PASS | same run/test; Run A and Run B use separate `SibylRuntimeStore` + `EngramRuntime` instances against durable Sibyl state | no recall / unavailable Sibyl | Stronger separate-Node-process CLI added later; latest CI still must promote it |
| Recalled memory changes action | LOCAL_PASS | same run/test: no-memory Route C versus Sibyl-recalled Route D | no-memory control | Paired behavioral delta, not retrieval-only |
| Deleting/unavailable Sibyl breaks/degrades core function | LOCAL_PASS | same run/test: configured missing Python/Sibyl runtime rejects `ping()` and no fallback is invoked | remove/disable Sibyl runtime | VETO; CLI mutation later hardened against false-positive catch behavior |
| Engram provenance remains reconstructable | LOCAL_PASS | same run/test records recall, memory-state digest exposure, `CHANGED_ACTION` decision and retrieves trace from Sibyl-backed store | wrong/stale recall digest | Broader adversarial lineage fixtures still pending on Sibyl store |
| Separate Node process A -> process B cold-start demo | UNVERIFIED | `scripts/sibyl-demo.ts` + CI steps added after first green run | terminate process A, run process B | Must pass on latest clean CI before promotion |
| Canonical Engram suite remains green with optional Sibyl profile | UNVERIFIED | prior generic CI run `32749722041` failed because optional SDK was absent and `packages/sibyl` lacked server-only classification; both causes patched after diagnosis | canonical `npm run check` | Do not claim regression-free until latest CI passes |
| Stale/incompatible memory blocked through Sibyl store | UNVERIFIED | Engram runtime semantics already contain eligibility checks, but Sibyl-profile-specific mutation not yet observed | stale memory fixture | Next pressure-harness task |
| Conflicting memory remains non-silently adjudicated | UNVERIFIED | existing Engram semantics only | contradictory Sibyl memory fixture | Next pressure-harness task |
| Base integration does real product work | UNVERIFIED | — | remove Base action | optional |
| Virtuals integration does real product work | UNVERIFIED | — | remove Virtuals interaction | optional |

## Evidence-history note
A green run proves only the commit/run it actually executed. Later source changes do not inherit that evidence automatically. Every promotion above `LOCAL_PASS` must point to the exact hackathon-window artifact/run that supports it.

No claim may be promoted above the smallest state actually supported by evidence.
