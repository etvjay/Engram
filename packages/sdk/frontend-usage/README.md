# TypeScript SDK — Frontend Usage

**Consumption mode:** `BROWSER_CONDITIONAL`

## What exists

`packages/sdk/src/index.ts` exposes `Engram`, `EngramExecution`, `EngramTransport`, `runtimeTransport`, `httpTransport`, and `EngramHttpError`.

For frontend applications, use **`httpTransport`**. `runtimeTransport` embeds `EngramRuntime` in-process and is not the normal browser boundary.

## Canonical usage

```ts
import { Engram, httpTransport } from "<engram-sdk-path>";

const engram = new Engram(httpTransport({
  baseUrl: ENGRAM_API_BASE_URL,
  // apiToken only when your deployment has a browser-safe user/session token.
}));

const run = await engram.startExecution({
  agentId: "ui-agent",
  workflowType: "example",
  intent: "Perform a task",
  context: {},
  constraints: {},
});

const recall = await run.recall({ query: "comparable prior executions" });
const trace = await run.trace();
```

## Execution-scoped methods

- `recall({ query, status? })`
- `recordDecision(...)`
- `observe(...)`
- `complete(...)`
- `trace()`

The application decides the action. Engram does not provide `run.decide()`.

## Authentication

The current protected `/v1` API uses bearer authorization. **Do not embed the privileged MVP `ENGRAM_API_TOKEN` in a public static frontend.** Use a server-side/BFF/session boundary unless the token is explicitly designed for the end user.

Public endpoints currently include `/health` and `/v1/demo/run`.

## Important invariants

- recall does not imply influence;
- influence must reference memory actually exposed by the referenced retrieval;
- `CHANGED_ACTION` requires counterfactual evidence under the configured policy;
- do not invent counterfactuals in UI code;
- use API/server state as canonical, not local component state.

## Implementation/tests

- `packages/sdk/src/index.ts`
- `packages/sdk/src/http.ts`
- `tests/sdk/sdk.test.ts`
- `tests/sdk/http-transport.test.ts`

**Evidence status:** TESTED. Published package registry consumption and public authenticated deployment remain UNVERIFIED.