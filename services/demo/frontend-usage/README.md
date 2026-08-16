# Public Demo Surface — Frontend Usage

**Consumption mode:** `API_ONLY`

## What exists

The demo service provides Engram's deterministic causal proof workload. The public API exposes it through:

`POST /v1/demo/run`

The canonical runtime demo follows:

`Run A → operational memory → Run B`

where prior execution memory changes a later application action and the trace preserves the relationship.

## Frontend use cases

Use this endpoint for demo screens, onboarding, judge walkthroughs, and visual explanations of memory-caused behavior without requiring an authenticated production workflow.

```ts
const result = await fetch(`${baseUrl}/v1/demo/run`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({}),
}).then(r => r.json());
```

## Important invariants

- external venue/workload execution is SIMULATED;
- the demo is evidence for Engram runtime semantics, not live market execution;
- UI should distinguish source execution, admitted memory, later recall, influence, counterfactual, and observed outcome;
- never label mere prompt inclusion as causal memory proof.

## Implementation/tests

- `services/demo/src/run-runtime-demo.ts`
- `services/demo/src/runtime-policy.ts`
- `services/demo/src/create-demo-runtime.ts`
- `tests/e2e/demo-orchestration.test.ts`

**Evidence status:** TESTED for deterministic runtime behavior. External workload remains SIMULATED.