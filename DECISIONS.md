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

Structured execution state, provenance, decisions, outcomes, and vector embeddings live in CockroachDB. The MVP does not use a separate vector database.

## D-004 — MCP is an agent-facing read/inspection plane, not the transactional write path

**Status:** ACCEPTED

Deterministic application writes use the PostgreSQL-compatible CockroachDB driver. Managed MCP is used for schema/database inspection, read-only provenance inspection, SELECT, and EXPLAIN-style agent operations.

## D-005 — The demo workload is simulated; the memory substrate is not

**Status:** ACCEPTED

The venue execution scenario is deterministic and explicitly `SIMULATED`. Persistence, retrieval, memory-decision links, and trace reconstruction are real repository operations. Live verification upgrades only those external integrations that were actually exercised.

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
