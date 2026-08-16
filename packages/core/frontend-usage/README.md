# Protocol Contracts — Frontend Usage

**Consumption mode:** `BROWSER_SAFE`

## What exists

`packages/core/src/protocol.ts` exposes the canonical protocol vocabulary and Zod schemas for:

- evidence states;
- memory influence types;
- counterfactual sources and objects;
- provenance references;
- recall references;
- memory influences;
- memory recall objects.

## Frontend use cases

Use these schemas/types when rendering trace state, validating API payloads, formatting evidence badges, or building provenance views.

```ts
import {
  EvidenceStateSchema,
  MemoryInfluenceSchema,
  MemoryRecallSchema,
} from "<engram-core-path>";

const recall = MemoryRecallSchema.parse(payload);
```

## Important invariants

- `VERIFIED`, `OBSERVED`, `SIMULATED`, `INFERRED`, `PROPOSED`, and `UNKNOWN` are distinct evidence states;
- recall is not influence;
- a memory influence is an explicit provenance object;
- `CONTROL_RUN`, `SHADOW_RUN`, `REPLAY`, and application-declared counterfactuals must not be visually conflated;
- UI labels should preserve `UNKNOWN` rather than invent certainty.

## Implementation/tests

- `packages/core/src/protocol.ts`
- `packages/core/src/validate.ts`
- `tests/conformance/protocol.test.ts`

**Evidence status:** TESTED.