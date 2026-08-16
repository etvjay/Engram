# REV-002 — Causal Spine Hardening Follow-up

Date: 2026-08-16
Baseline: REV-001
Repository checkpoint: Engram CI run 31922956931 passed through fail-closed inspection route coverage.

## Purpose

This review records which REV-001 hardening gaps have been closed in implementation and which still require credentialed external evidence. It does not retroactively rewrite REV-001.

## Closed implementation gaps

### A17 — inspection/control-plane exposure

**Status: PASS for current read-only deployment scope.**

The inspection plane is fail-closed behind `ENGRAM_INSPECTION_TOKEN`:

- Managed MCP status/provenance reads;
- control-plane agents/executions/memories/influences/policies/evaluation reads;
- execution trace reads;
- low-level memory search.

Health and execution lifecycle writes remain outside the inspection classification. Missing configuration returns `INSPECTION_AUTH_NOT_CONFIGURED`; invalid Bearer credentials return `UNAUTHORIZED` before database access. SAM provides a `NoEcho` inspection-token parameter.

Boundary: this is a single-token deployment guard, not production multi-tenant RBAC. Policy mutation remains unexposed and still requires actor identity, authorization, immutable audit, and review semantics before production exposure.

### A18 — mismatched idempotent event replay

**Status: PASS in implementation.**

`CockroachMemoryRepository.appendEvent()` now distinguishes:

- exact replay of the same event at an existing execution sequence: accepted as idempotent;
- different event content at the same execution sequence: rejected with `EVENT_IDEMPOTENCY_CONFLICT`.

Atomic sequence allocation is separately implemented through the store-side allocator.

Boundary: credentialed concurrent CockroachDB load evidence remains separate from repository CI.

### A19 — trace reconstruction ambiguity

**Status: PASS at contract level; live Cockroach execution pending.**

The credential-gated Cockroach integration suite now reconstructs:

- two distinct recalls in one execution;
- two decisions;
- the same memory used through distinct retrievals;
- each decision-memory edge retaining the retrieval ID that actually exposed the memory.

Normal CI proves the integration test compiles but skips the database body without `DATABASE_URL`; live execution remains part of external verification.

### A20 — failed live proof leaves only logs

**Status: PASS in implementation.**

The canonical verifier now writes `evidence/live/latest.json` on both success and failure. Failure evidence records:

- `LIVE_EXTERNAL_INTEGRATION_FAILED`;
- failure stage;
- sanitized error text;
- conservative `UNKNOWN` cloud/runtime boundaries;
- `SIMULATED` external workload boundary.

The canonical workflow uploads the evidence directory with `if: always()`.

## C-SPANN claim correction

Repository review found that the original vector index used CockroachDB's default distance opclass while Engram retrieval ranks with cosine distance. Forward migrations now provide a cosine-compatible, agent-scoped vector index:

`memories_agent_embedding_cosine_idx (agent_id, embedding vector_cosine_ops)`

The live verifier explains the exact persisted Run B retrieval query and promotes C-SPANN use only if the natural optimizer plan selects the expected cosine index. A successful vector-distance query alone is insufficient.

## Bedrock proof correction

The live artifact now records the concrete embedding identity:

- provider;
- model ID;
- AWS region;
- dimensions.

This prevents a successful run from ambiguously proving only that an unspecified embedding provider was invoked.

## New intelligence findings

### Bad memory

Automated adversarial tests establish:

`candidate retrieval != exposure != influence`

Stale/version-invalid memory can be rejected before exposure, while exposed low-confidence memory can still be rejected at influence time.

### Contradiction and harm

Contradiction, qualification, supersession, and harmful/beneficial effects remain append-only evidence. Vector similarity does not adjudicate conflict, and later success does not automatically establish usefulness.

### Competing eligible memories

EXP-004 is testing whether unresolved explicit contradiction should remain recall-visible but fail closed at influence through an optional eligibility advisor. This remains experimental until its comparison test passes; it is not a protocol default.

## External evidence still required

The following remain deliberately unpromoted:

1. CockroachDB Cloud persistence under the canonical live workflow.
2. Natural C-SPANN selection of the agent-scoped cosine index.
3. Real AWS Bedrock Titan invocation using recorded provider metadata.
4. Managed MCP connection plus provenance `select_query` output.
5. Successful SAM build/deploy and public API exercise.
6. Credentialed execution of the multi-recall Cockroach trace test.

## Current assessment

The dominant remaining risk has shifted from semantic architecture to external verification and deployment evidence. The runtime now has explicit boundaries for recall exposure, influence, frozen policy, evaluation, conflict, inspection authorization, idempotency, and failure evidence. None of those should be promoted to live-cloud guarantees solely from repository CI.
