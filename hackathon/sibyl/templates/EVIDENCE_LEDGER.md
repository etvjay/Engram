# Evidence Ledger

Allowed states:
`UNVERIFIED | SIMULATED_PASS | LOCAL_PASS | FORK_PASS | TESTNET_PASS | LIVE_PASS | PUBLIC_EVALUATOR_PASS | PRODUCTION_PASS | FAILED | BLOCKED`

| Claim / gate | State | Evidence | Negative mutation | Notes |
|---|---|---|---|---|
| Sibyl persists decision-critical memory | UNVERIFIED | — | disable write | |
| Fresh session recalls prior memory | UNVERIFIED | — | kill process + disable recall | |
| Recalled memory changes action | UNVERIFIED | — | no-memory control | |
| Deleting Sibyl breaks/degrades core function | UNVERIFIED | — | remove/disable Sibyl path | VETO |
| Engram provenance remains reconstructable | UNVERIFIED | — | wrong provenance injection | |
| Stale/incompatible memory blocked | UNVERIFIED | — | stale memory fixture | |
| Base integration does real product work | UNVERIFIED | — | remove Base action | optional |
| Virtuals integration does real product work | UNVERIFIED | — | remove Virtuals interaction | optional |

No claim may be promoted above the smallest state actually supported by evidence.
