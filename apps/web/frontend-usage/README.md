# Marketing landing — Frontend Usage

**Consumption mode:** `BROWSER_SAFE`

**Evidence status:** IMPLEMENTED

## What exists

The public Engram marketing surface at `/` in `apps/web`. It states the product thesis, canonical lifecycle, protocol invariants, integration surfaces, and evidence boundary. Original abstract brand stills live in `apps/web/public/brand/`.

The existing four-screen causal demo remains at `/proof`.

## Canonical integration

- Landing route: `/`
- Causal demo route: `/proof`
- Dev: `npm run dev:web`
- Build: `npm run build:web` → `dist-web/`

Do not import this module into a browser SDK bundle. It is the website.

## Inputs and outputs

None. The landing is static. The `/proof` demo still POSTs to `${VITE_API_BASE_URL}/v1/demo/run`.

## Example

```ts
// Open the marketing surface.
window.location.assign("/");

// Open the deterministic causal demo.
window.location.assign("/proof");
```

## Authentication and environment

The landing ships no tokens. `ENGRAM_API_TOKEN` must never enter this bundle. The optional `VITE_API_BASE_URL` is used only by `/proof`.

## Important invariants

- Retrieval is not influence.
- The application owns action selection.
- Simulated external workload stays labeled simulated.
- Live-cloud claims stay UNKNOWN until credentialed artifacts exist.

## Failure/empty states

`/proof` continues to show an empty state until the public demo is run. The landing does not invent customer logos or unverified metrics.

## Implementation/tests

- `apps/web/src/landing.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/proof.tsx`
- `tests/conformance/frontend-module-registry.test.ts`
