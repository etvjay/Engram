# Engram HTTP API — Frontend Usage

**Consumption mode:** `API_ONLY`

## What exists

`services/api/src/handler.ts` exposes the canonical HTTP boundary for execution lifecycle, trace reconstruction, control-plane reads, evaluation reads, demo execution and MCP inspection/status surfaces.

Use `openapi.json` as the route/schema contract rather than guessing endpoint shapes from the handler.

## Frontend integration

Typical flow:

```ts
const run = await fetch(`${baseUrl}/v1/executions`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${sessionToken}`,
  },
  body: JSON.stringify({
    agentId: "agent-1",
    workflowType: "research",
    intent: "Investigate topic",
    context: {},
    constraints: {},
  }),
}).then(r => r.json());

const trace = await fetch(`${baseUrl}/v1/executions/${run.executionId}/trace`, {
  headers: { authorization: `Bearer ${sessionToken}` },
}).then(r => r.json());
```

## Public surfaces

- `GET /health`
- `POST /v1/demo/run`

All other `/v1` routes are protected in the MVP.

## Security

Do not expose `ENGRAM_API_TOKEN` in a public static frontend. The current single bearer token is a deployment guard, not user/session RBAC.

## Important invariants

- the frontend/application owns action selection;
- trace/read endpoints reconstruct server-side evidence;
- control-plane/evaluation state should be rendered as evidence, not silently converted into truth claims;
- external demo execution remains SIMULATED.

## Canonical contract/tests

- `openapi.json`
- `services/api/src/handler.ts`
- `services/api/src/auth.ts`
- `tests/conformance/api-contract.test.ts`
- `tests/security/api-inspection-auth.test.ts`

**Evidence status:** TESTED for handler/contract/auth behavior. Public AWS deployment remains UNVERIFIED.