# Development Environment

Status: `PROBED_AWAITING_GOLDEN_CI` for Sibyl integration.

## Existing Engram baseline
- Node.js 22
- npm
- TypeScript monorepo
- canonical checks: `npm install` then `npm run check`

## Sibyl toolchain lock
Verified from first-party Sibyl documentation/repository on 2026-08-24:

- direct SDK language: Python;
- package: `sibyl-memory-client`;
- public client: `MemoryClient.local(path, tenant_id=...)`;
- durable tiers used by this profile: WARM entities plus COLD journal audit events;
- retrieval API used by this profile: `search_entities(...)`;
- Python requirement: >=3.10 in the upstream package metadata;
- currently observed PyPI release: `0.6.1`;
- upstream GitHub `main` currently declares `0.7.0`, so release status must be revalidated before the Sep 1 build window and again before submission freeze.

Evaluated dependency pin:

```text
packages/sibyl/requirements.txt
sibyl-memory-client==0.6.1
```

## Runtime configuration

```bash
ENGRAM_SIBYL_DB=/absolute/path/to/memory.db
ENGRAM_SIBYL_TENANT=engram-hackathon
ENGRAM_SIBYL_PYTHON=python3
# optional if repository layout differs
ENGRAM_SIBYL_BRIDGE=/absolute/path/to/packages/sibyl/bridge.py
```

There is deliberately no Cockroach fallback flag in `SibylRuntimeStore`.

## Current commands

```bash
npm install
python -m pip install -r packages/sibyl/requirements.txt
npm run build
npm run test:sibyl
```

`test:sibyl` exercises a Run A -> fresh store/runtime Run B recall path against a shared Sibyl DB and separately checks fail-closed behavior when the configured Sibyl Python runtime is absent.

## CI
`.github/workflows/sibyl-profile.yml` provisions Node 22 + Python 3.12, installs the pinned Sibyl SDK, builds Engram, and runs `npm run test:sibyl` on pull requests.

## Toolchain probe gate
- [x] current Sibyl SDK/package/API verified from first-party docs;
- [x] local-first configuration path understood;
- [x] public write/read API can preserve Engram IDs/structured metadata by construction;
- [x] deletion/unavailable-Sibyl mutation is implementable and encoded as a test;
- [x] no Sibyl secret is required for the local-first core path;
- [ ] golden integration passes in clean CI;
- [ ] fresh-session behavior promoted from test design to observed CI evidence;
- [ ] SDK/version truth revalidated at Sep 1.

Do not promote the EBI state to `READY_TO_BUILD` until the clean CI run passes and its evidence is recorded.
