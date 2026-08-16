# EXP-003 Setup

## Component under test

`assessMemoryRelationships()` in `packages/evaluation/src/relationships.ts`.

The experiment supplies only explicit `MemoryRelationship` records. No embeddings, similarity scores, timestamps, or retrieval ranks are available to the assessor, making accidental vector-based adjudication impossible within this test.

## Case A — unresolved contradiction

Relationships:

- Memory A `CONTRADICTS` Memory B.

Expected assessment for Memory A:

- `contradicts = [B]`
- `unresolvedContradictions = [B]`
- warning includes `UNRESOLVED_CONTRADICTION`
- no `supersedes` or `supersededBy` result.

## Case B — contradiction plus explicit supersession

Relationships:

- Memory A `CONTRADICTS` Memory B;
- Memory B `SUPERSEDES` Memory A.

Expected assessment for Memory A:

- `contradicts = [B]`
- `supersededBy = [B]`
- `unresolvedContradictions = []`
- warning includes `MEMORY_SUPERSEDED`.

The assessor does not delete Memory A. It only reports the explicit relationship state.

## Case C — no invented conflict

Relationships:

- target memory `QUALIFIES` another memory;
- a separate unrelated pair has `CONTRADICTS`.

Expected assessment for target:

- qualifier is preserved;
- no contradiction;
- no unresolved contradiction warning.

## Automated proof

`tests/evaluation/relationships.test.ts`
