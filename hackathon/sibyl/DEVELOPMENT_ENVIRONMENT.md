# Development Environment

Status: `UNPROBED` for Sibyl integration.

## Existing Engram baseline
- Node.js 22
- npm
- TypeScript monorepo
- canonical checks: `npm install` then `npm run check`

## Hackathon profile target
Proposed environment flag:

```bash
ENGRAM_MEMORY_PROFILE=sibyl
```

The exact Sibyl package/API/env configuration is intentionally **not frozen yet**. Research/toolchain probing must verify current first-party docs before implementation.

## Required local commands after adapter implementation

```bash
npm install
npm run check
npm run test:sibyl
npm run demo:sibyl:seed
# terminate process/session
npm run demo:sibyl:recall
npm run demo:sibyl:no-memory-control
npm run test:sibyl:deletion
```

Command names above are target interfaces, not evidence that they currently exist.

## Toolchain probe gate
Before `READY_TO_BUILD`:
- [ ] current Sibyl SDK/package/API verified from first-party docs;
- [ ] credentials/config path understood;
- [ ] persistence survives a clean process restart;
- [ ] write/read semantics can preserve Engram provenance IDs/metadata;
- [ ] local golden fixture passes;
- [ ] deletion mutation is implementable;
- [ ] no secrets enter frontend/repo/logs.
