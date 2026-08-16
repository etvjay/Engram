# EXP-004 — Decision

Date: 2026-08-16
Status: ACCEPTED
Evidence run: GitHub Actions Engram CI `31923329226`

## Decision

Engram will keep the following as separate guarantees:

1. **Recall provenance integrity is mandatory runtime behavior.**
   A decision-memory influence must reference the exact retrieval that exposed that memory. A valid memory paired with the wrong retrieval is rejected.

2. **Conflicting memories remain append-only history and may remain recall-visible.**
   Retrieval rank or semantic similarity does not resolve contradiction.

3. **Unresolved contradiction may be configured as an influence-time eligibility constraint.**
   `MemoryEligibilityAdvisor` is the extension point for autonomous or safety-sensitive workloads that want fail-closed influence behavior when explicit contradiction remains unresolved.

4. **The contradiction advisor is not a universal Engram protocol default.**
   Different workloads may surface, constrain, escalate, or require human review for conflicting evidence. The runtime owns when eligibility is checked; external evaluation evidence supplies additional reasons.

5. **Resolution requires explicit evidence.**
   Relationships such as `SUPERSEDES` may resolve an influence block only when represented as explicit assessed relationship evidence. Engram does not manufacture resolution from recency or vector score.

## Architectural consequence

The runtime retains a domain-neutral core while permitting evaluation-aware eligibility composition:

`recall -> expose competing evidence -> application decides -> influence eligibility -> provenance validation -> persist or reject`

This preserves Engram's constitutional boundary: Engram governs whether remembered experience is eligible to influence an action and records provenance; the application/agent remains the decision authority.
