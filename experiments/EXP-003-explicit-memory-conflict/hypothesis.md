# EXP-003 — Explicit Memory Conflict

## Hypothesis

Engram must not infer that two memories contradict, or choose a winner between them, from semantic similarity alone. Conflict and supersession must be explicit assessed relationships with provenance.

## Attack cases

### A. Explicit contradiction without resolution

Two memories are assessed as `CONTRADICTS` and no `SUPERSEDES` relationship exists.

Expected behavior: the relationship assessor reports `UNRESOLVED_CONTRADICTION`. Neither memory is silently declared authoritative.

### B. Explicit supersession

A newer memory is assessed as `SUPERSEDES` an older memory that it also contradicts.

Expected behavior: the older memory reports the newer memory in `supersededBy`, and the contradiction is no longer classified as unresolved. Historical records remain intact.

### C. Similar or qualifying memories

A memory merely `QUALIFIES` another, or an unrelated pair contradicts elsewhere.

Expected behavior: Engram does not invent a contradiction for the target memory.

## Falsification conditions

The hypothesis fails if:

- a contradiction is inferred without an explicit relationship;
- `CONTRADICTS` automatically chooses a winner;
- supersession deletes or overwrites either historical memory;
- a relationship involving unrelated memories contaminates the target assessment;
- qualification is treated as contradiction.

## Principle under test

**Retrieval discovers candidates. Evidence assesses relationships. Neither vector similarity nor recency adjudicates truth by itself.**
