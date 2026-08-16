# EXP-013 — Decision

Date: 2026-08-16
Status: **ACCEPTED**
Evidence: GitHub Actions Engram CI `31940184852`

## Decision

Memory invalidation and explicit supersession are accepted as canonical Engram lifecycle semantics.

## Accepted invariant

A prior Operational Memory may remain durable and inspectable while losing recall or influence authority because current context invalidates it or explicit relationship evidence supersedes it.

For EXP-013:

- environment/tool drift invalidates one historical memory;
- explicit `SUPERSEDES` evidence invalidates another still-compatible memory;
- the current memory remains eligible;
- rejected candidates retain explicit machine-readable reasons;
- historical memories remain stored and inspectable;
- the application still owns the resulting release strategy.

## Architectural consequence

Engram should evolve toward a first-class lifecycle/control-plane model that exposes why a memory is currently active, expired, invalidated, superseded or otherwise non-authoritative without rewriting source history. This work is tracked in roadmap issue #3.

## Boundary

The runtime already provides the first composable primitives; EXP-013 does not claim the full long-horizon lifecycle management UX/API described in issue #3. The release workload remains SIMULATED.