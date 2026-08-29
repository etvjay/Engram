# Evidence Ledger

Allowed states:
`UNVERIFIED | SIMULATED_PASS | LOCAL_PASS | FORK_PASS | TESTNET_PASS | LIVE_PASS | PUBLIC_EVALUATOR_PASS | PRODUCTION_PASS | FAILED | BLOCKED`

## Current claim ledger

| Claim / gate | State | Evidence | Negative mutation | Notes |
|---|---|---|---|---|
| Sibyl persists decision-critical memory | LOCAL_PASS | GitHub Actions run `33264345953`, job `99131636029`, branch head `b6ffe6fcc824c20e8f41f2e64532ada3867c858d`: SDK 0.6.1 installed; route/provider/conflict memories persisted through Sibyl | missing Sibyl runtime | Pre-build-window evidence; must be re-run during official window |
| Fresh session/process recalls prior memory | LOCAL_PASS | run `33264345953`: separate seed and recall processes; route memory plus provider relationship memory recalled in later processes; conflict test creates a fresh `SibylRuntimeStore` before retrieving both contradictory memories | terminate source process / unavailable Sibyl | Stronger than fresh-object-only proof |
| Recalled memory changes action | LOCAL_PASS | run `33264345953`: route `A-B-C -> A-B-D`; urgent provider `atlas -> beacon`; explicit `CHANGED_ACTION` traces | no-memory control | Paired behavioral deltas, not retrieval-only |
| Recalled memory constrains authority without global blacklist | LOCAL_PASS | run `33264345953`, fresh routine provider process: Atlas remains selected while prepay falls `5000 -> 1000` bps and milestone verification becomes required; trace records `CONSTRAINED_ACTION` | routine-context control | Demonstrates contextual relationship posture rather than global reputation |
| Multi-execution experience becomes bounded relationship memory | LOCAL_PASS | run `33264345953`: two historical Atlas breach executions plus admitting execution produced `CONTEXT_GUARDED` relationship memory | single-failure fixture / cross-task fixture | Pure scenario tests also require >=2 source executions and task-type applicability |
| Urgent provider experience changes outcome | LOCAL_PASS | run `33264345953`: no-memory Atlas path deterministically returns `SLA_BREACH`; memory-conditioned Beacon path returns `SUCCESS` | no-memory provider control | Application fixture, not a claim about a live provider network |
| Deleting/unavailable Sibyl breaks/degrades core function | LOCAL_PASS | run `33264345953`: deletion CLI emitted degradation with no fallback | remove/disable Sibyl runtime | VETO; mutation harness fails if Sibyl unexpectedly stays available |
| Engram provenance remains reconstructable | LOCAL_PASS | run `33264345953`: recall IDs, memory IDs, `engram.memory-state/v1` digests, counterfactuals, accepted influence and evaluation events appear in route/provider traces | post-recall memory tamper | Sibyl backend preserves trace material needed for influence validation |
| Expired Sibyl memory is retrieved but blocked before exposure | LOCAL_PASS | run `33264345953`, `npm run test:sibyl` | expired memory fixture | Demonstrates retrieval != legitimate influence |
| Post-recall memory tamper is rejected | LOCAL_PASS | run `33264345953`, `npm run test:sibyl` | overwrite memory after digest exposure | Protects recall-to-decision state integrity |
| Conflicting memory remains non-silently adjudicated through Sibyl store | LOCAL_PASS | run `33264345953`, job `99131636029`: contradictory memories remain recall-visible, unresolved influence is rejected, explicit `SUPERSEDES` resolves the relevant side | unresolved `CONTRADICTS` pair | Proves Sibyl persistence/retrieval does not silently turn ranking into adjudication |
| Expanded Sibyl pressure suite | LOCAL_PASS | run `33264345953`, job `99131636029`: `3` test files / `7` tests passed, followed by route/provider/deletion process-boundary proof | expiry, tamper, contradiction, deletion, single-failure/cross-task controls | Same evaluated profile remains repeatable on clean hosted runners |
| Self-verifying evidence capture path | LOCAL_PASS | run `33264345953`, job `99131636029`: exact evidence capture and manifest check passed on head `b6ffe6fc` | dirty source / unexpected untracked file; failed precursor run `33232299952` | Capture v2 records git/source state, environment versions, dependency digests, output SHA-256 values and final Sibyl DB digest |
| Base settlement authority follows Engram memory-conditioned decision | LOCAL_PASS | run `33264345953`, check job `99131636110`: canonical `npm run check` includes `test:base`; urgent memory changes recipient Atlas -> Beacon, routine memory changes authorized prepay `4.000000 -> 0.800000 USDC` | no-memory decision / malformed address | This is local causal-model evidence, not an executed Base transaction |
| Base serialized intent is internally bound | LOCAL_PASS | run `33264345953`, check job `99131636110`: serialized intent schema fixes network/token/provider/address/provenance fields and rejects inconsistent atomic/decimal prepay values | malformed schema, wrong chain, inconsistent amount | Removes unsafe-cast ambiguity from the live verifier input |
| Base receipt verification fails closed | LOCAL_PASS | run `33264345953`, check job `99131636110`: receipt verifier rejects wrong RPC chain, wrong payer, wrong recipient, wrong amount, wrong token, and reverted transaction | chain/payer/recipient/amount/token/status mutations | Live verifier independently calls `eth_chainId`; receipt evidence still requires real official-window transaction for partner promotion |
| Canonical Engram suite remains green with Sibyl + Base evaluated profiles | LOCAL_PASS | run `33264345953`, check job `99131636110`: `npm run check` passed; SAM build run `33264345950` also passed | canonical test suite | Strongest tested code head `b6ffe6fcc824c20e8f41f2e64532ada3867c858d` |
| Root README exposes critical write/read/influence/conflict/deletion/evidence call map | LOCAL_PASS | root README on `hackathon/sibyl-ebi` exposes core judged paths plus one-command capture | cold reviewer navigation | Base call-map synchronization is being added after the tested code head; human under-two-minute timing remains pending |
| Hackathon-window rerun of core proof | UNVERIFIED | — | clean clone + fresh DB | Pre-window proof cannot substitute for final event-window evidence |
| Base integration does real product work onchain | UNVERIFIED | settlement authority adapter, hardened verifier and live runbook exist; no real Base Sepolia settlement yet | remove Base action / mismatch settlement | `BASE-001` partner claim remains unearned until a decision-linked action is executed and verified |
| Virtuals integration does real product work | UNVERIFIED | adapter/conformance/live-ingest path implemented; local conformance passed; no authenticated ACP job yet | remove Virtuals interaction | partner multiplier remains unclaimed |

## Current flagship interpretation
The strongest current memory claim is not `the agent remembers Atlas is bad`.

It is:

> Multiple attributable executions become an agent-specific, task-specific relationship posture. In a fresh session that posture can change delegation entirely for urgent work, or narrow payment/verification authority for routine work, while preserving the same provider relationship.

This is evidence-bounded experiential continuity, not a universal reputation score.

The adversarial corollary is equally important:

> Retrieval rank is not adjudication. If two persisted memories explicitly contradict each other, Engram may expose both but refuses to let either silently become authority until relationship evidence resolves the conflict.

The economic consequence is now explicit at local conformance level:

> The same remembered relationship posture can change who is authorized to receive a Base settlement for urgent work, or reduce how much USDC the same provider is authorized to receive upfront for routine work. A Base receipt is accepted only when chain, payer when bound, token, recipient, amount and success state agree with the serialized Engram settlement intent.

## Evidence-history note
Run `32753747711` remains an earlier pre-window baseline for the original six-test profile.

Head `8f616545...` / run `33221823993` added the Sibyl-backed contradiction gate and passed 7/7 Sibyl tests.

The first exact capture-smoke run on head `45806957...`, CI `33232299952`, intentionally surfaced an evidence-harness failure after every product/Sibyl phase passed: `npm install` generated an untracked `package-lock.json`, which the first strict source-tree guard treated as unexpected dirtiness. That run is retained as a failed harness attempt, not a product failure.

Head `afb3ac37...` / run `33232373531` corrected and proved the exact self-verifying evidence-capture path.

Head `266d3c38...` / run `33264157362` added the first Base settlement-authority and receipt-verification local conformance while keeping the complete Sibyl profile green.

The current strongest tested pre-window code baseline is branch head `b6ffe6fcc824c20e8f41f2e64532ada3867c858d`:
- Engram CI `33264345953`: SUCCESS
- Sibyl profile job `99131636029`: SUCCESS, including deletion, exact evidence-capture smoke and manifest check
- canonical check job `99131636110`: SUCCESS, including hardened Base schema/chain/payer/receipt pressure
- Engram SAM Build `33264345950`: SUCCESS

The hardened Base verifier schema-validates serialized settlement intent, recomputes amount consistency, independently verifies RPC chain ID `84532`, and may bind ERC-20 `Transfer.from` to the expected requester wallet before accepting recipient/amount evidence.

A green run proves only the commit/run it actually executed. Later documentation commits may record that evidence but do not strengthen it.

Every promotion above `LOCAL_PASS` must point to the exact hackathon-window artifact/run that supports it.

No claim may be promoted above the smallest state actually supported by evidence.
