# Engram Decisions

This file records architectural decisions that materially affect the Execution Memory invariant.

## D-001 — Engram is the product; Execution Memory is the primitive

**Status:** ACCEPTED

Engram is the canonical product/system name. Execution Memory is the primitive Engram implements.

## D-002 — Domain core remains adapter-independent

**Status:** ACCEPTED

`memory-core` must not depend on CockroachDB, Bedrock, MCP, AWS, or the demo simulator. Adapters depend on the core.

## D-003 — CockroachDB is the canonical operational memory substrate

**Status:** ACCEPTED

Structured execution state, provenance, decisions, outcomes, runtime evaluations, policy assignments, explicit evaluation evidence, and vector embeddings live in CockroachDB. The MVP does not use a separate vector database.

## D-004 — MCP is an agent-facing read/inspection plane, not the transactional write path

**Status:** ACCEPTED

Deterministic application writes use the PostgreSQL-compatible CockroachDB driver. Managed MCP is used for schema/database inspection, read-only provenance inspection, SELECT, and EXPLAIN-style agent operations. Engram MCP exposes Engram semantics rather than raw SQL semantics.

## D-005 — The demo workload is simulated; the memory substrate is not

**Status:** ACCEPTED

The venue execution scenario is deterministic and explicitly `SIMULATED`. Persistence, retrieval, memory-decision links, runtime influence validation, and trace reconstruction are real repository/runtime operations. Live verification upgrades only external integrations that were actually exercised.

## D-006 — Memory-caused behavior requires an explicit influence edge

**Status:** ACCEPTED

Retrieval alone is not evidence of influence. A consequential memory must be recorded in `decision_memories` with an influence type, summary, retrieval reference where available, and counterfactual action.

## D-007 — Run A / Run B is a controlled causal proof

**Status:** ACCEPTED

Control and treatment use comparable task/environment/constraints. The principal controlled difference is availability of prior operational memory. The claim is limited to observable behavioral change in this controlled system, not general human-like learning.

## D-008 — UNKNOWN remains first-class

**Status:** ACCEPTED

Missing memory infrastructure, inconclusive outcomes, unavailable retrieval, and unverified external integrations must remain explicitly UNKNOWN or unavailable. The system must not infer success from configuration alone.

## D-009 — Live verification artifacts are the authority for external integration claims

**Status:** ACCEPTED

A CockroachDB/AWS/MCP integration claim can be upgraded to `VERIFIED` only after the explicit live-verification workflow succeeds and emits the corresponding evidence artifact.

## D-010 — Recall exposure is fail-closed and persisted

**Status:** ACCEPTED

Retrieval candidates begin unexposed. The runtime applies expiry, compatibility, score, and evidence policy before marking a candidate exposed to the agent. Influence claims must reference a persisted exposed recall, so correctness does not depend on a warm Lambda process.

## D-011 — Memory policy is first-class, immutable by version, and frozen per execution

**Status:** ACCEPTED

Policy bundles are registered as immutable versions and assigned by explicit scope. The active bundle is resolved when an execution starts and its version is persisted on that execution. Later activation or retirement cannot silently change the rules of an in-flight execution.

## D-012 — Engram records decisions; it does not choose application actions

**Status:** ACCEPTED

The runtime validates memory provenance and influence eligibility but does not select the application's action. SDKs, HTTP, MCP, and framework adapters must not turn Engram into an autonomous planner or adjudicator.

## D-013 — ExecutionEpisode is the adapter boundary

**Status:** ACCEPTED

Framework integrations translate external execution state and telemetry into the versioned `ExecutionEpisode` schema. Framework-specific graph state, traces, or checkpoints are evidence inputs, not Engram operational memory and not automatic proof of memory influence.

## D-014 — One semantic runtime serves all integration surfaces

**Status:** ACCEPTED

TypeScript SDK, Python SDK, HTTP API, Engram MCP, and demo orchestration are transports or clients of the same runtime contract. They must not implement independent admission, retrieval, expiry, or influence rules.

## D-015 — Memory usefulness requires explicit evaluation evidence

**Status:** ACCEPTED

Retrieval frequency, later success, or correlation is insufficient to label a memory beneficial or harmful. Effect claims must be tied to an explicit method such as control run, shadow run, replay, or human assessment, with evidence state and provenance.

## D-016 — Conflict is an assessed relationship, not a vector-similarity inference

**Status:** ACCEPTED

Semantic proximity can nominate memories for review but cannot establish contradiction. Conflict/supersession/support relationships are stored only when an evaluation process supplies a rationale and evidence state.

## D-017 — Control plane begins read-only

**Status:** ACCEPTED

The initial control-plane API exposes agents, executions, memories, influences, policies, assignments, and evaluation dossiers. Policy mutation and evaluation writes remain outside the public HTTP surface until authentication, authorization, and audit semantics are explicit.

## D-018 — Production vector retrieval is agent-scoped and distance-matched

**Status:** ACCEPTED

Engram's production retrieval predicate is scoped by agent identity and ranks candidates with cosine distance (`<=>`). The production CockroachDB vector index therefore prefixes `agent_id` and uses `vector_cosine_ops`. Query success is not accepted as proof that C-SPANN served the query: live verification must capture a natural optimizer plan and separately report vector-distance retrieval and index selection.

## D-019 — Inspection surfaces fail closed

**Status:** ACCEPTED

Execution traces, control-plane reads, memory search, and MCP/provenance inspection expose operational history and therefore require explicit bearer-token authorization. If `ENGRAM_INSPECTION_TOKEN` is not configured, these inspection routes fail closed rather than silently becoming public. `/health` remains public. This token is an MVP inspection boundary, not a claim of complete multi-tenant identity or authorization.
