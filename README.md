# Engram

**Durable Operational Memory for Autonomous Agents**

Engram is an Execution Memory system for autonomous agents. It persists what an agent attempted, the context and constraints under which it acted, the decisions and actions it took, the observed outcome and recovery, and the operational memories that should influence future comparable decisions.

## Governing invariant

A prior execution persisted in CockroachDB must be retrievable under comparable future context, explicitly influence a later agent decision, cause an observable change from a memory-free baseline, and leave enough provenance to reconstruct that relationship.

## MVP proof

Run A has no relevant memory, selects Route C, fails, recovers, and produces an operational memory. Run B receives comparable context, retrieves that memory, records it as an influence, selects Route D instead, and succeeds.

The product is not generic chat memory, a generic RAG wrapper, or a TALOS port. TALOS only inspires the first deterministic failure/recovery workload.
