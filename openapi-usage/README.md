# Engram OpenAPI Contract — Frontend Usage

**Consumption mode:** `BROWSER_SAFE`

## What exists

`openapi.json` is the machine-readable HTTP contract for the Engram API.

Use it to:

- inspect available routes and response shapes;
- generate typed clients;
- validate frontend assumptions against backend contracts;
- derive mock fixtures without reading server implementation.

## Example

A frontend toolchain may generate a client from `openapi.json` and bind it to an environment-specific Engram API base URL.

```bash
npx openapi-typescript openapi.json -o src/generated/engram-api.d.ts
```

The generated types describe transport shapes only; bind requests to the appropriate API base URL and authorization boundary in your application.

Do not hardcode production credentials into generated code.

## Current important routes

- `GET /health`
- `POST /v1/demo/run`
- execution start/recall/decision/observation/complete/trace routes;
- control-plane read routes;
- evaluation read routes;
- MCP inspection/status routes.

Refer to the JSON file itself for canonical operation schemas.

## Important invariants

- the OpenAPI contract describes transport shape, not product semantics by itself;
- protected routes still require an appropriate server/session authorization strategy;
- generated clients must not introduce a second set of memory semantics;
- API and SDK should continue to mirror the same runtime authority.

## Implementation/tests

- `openapi.json`
- `services/api/src/handler.ts`
- `tests/conformance/api-contract.test.ts`

**Evidence status:** IMPLEMENTED; API contract behavior is TESTED. Public deployment remains UNVERIFIED.