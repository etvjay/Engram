# Engram

**Execution memory for autonomous agents.**

> Engram gives autonomous agents memory for what they have done, not just what they know.

Engram is execution-memory infrastructure for autonomous systems. It preserves prior executions, derives operational memory from evidence, recalls that experience under comparable future conditions, governs whether it may influence action, and leaves enough provenance to reconstruct what changed because of it.

The application or agent remains the decision authority. Engram does **not** choose the business action.

## Sibyl Labs Hackathon evaluated profile

The `hackathon/sibyl-ebi` branch contains a dedicated evaluated profile for the Sibyl Labs Hackathon. Canonical Engram remains CockroachDB-backed; in this judged profile **Sibyl is the load-bearing execution-memory store and there is no Cockroach fallback for the decision-critical path**.

The hackathon profile is designed around the deletion test: remove Sibyl and the cross-session memory required to reproduce the claimed behavior disappears.

### Judge call map — write → read → influence → deletion

| Judge question | Critical path |
|---|---|
| Where is Sibyl wired into Engram? | `packages/sibyl/src/runtime-store.ts` implements `EngramRuntimeStore`; `packages/sibyl/bridge.py` calls the public Sibyl Python SDK. |
| Where is decision-critical memory written? | `SibylRuntimeStore.persistMemory(...)` → bridge `put` → Sibyl WARM entity `operational_memory`. |
| Where is it read in a later session? | `SibylRuntimeStore.searchMemory(...)` → bridge `search_memories`; Engram Runtime then applies recall eligibility before exposure. |
| How is recall distinguished from influence? | `packages/runtime/src/runtime.ts`: `recall(...)` creates a memory-state digest; `recordDecision(...)` validates retrieval provenance and influence policy before recording `CHANGED_ACTION` / `CONSTRAINED_ACTION`. |
| Where is the flagship relationship-memory policy? | `packages/scenarios/provider-continuity/src/index.ts`. |
| Where is the Sibyl integration pressure test? | `tests/integration/sibyl-memory-loop.test.ts` and `tests/integration/sibyl-provider-continuity.test.ts`. |
| How do I see process-boundary recall? | `npm run demo:sibyl:provider:seed`, terminate that process, then run `npm run demo:sibyl:provider:urgent` or `npm run demo:sibyl:provider:routine` against the same Sibyl DB/tenant. |
| How is load-bearing deletion tested? | `npm run test:sibyl:deletion`; it removes the configured Sibyl runtime and must report degradation with no fallback. |

### How memory made this possible

The flagship profile models experiential continuity between a requester agent and service providers.

Two prior requester-owned executions observe Atlas breaching an urgent `data_fetch` SLA. Engram admits a provenance-linked multi-execution `REPEATED_PATTERN` relationship memory and Sibyl persists it. In a fresh session:

- without memory, the cheapest eligible provider is Atlas;
- for **urgent** work, recalled relationship memory changes delegation from Atlas to Beacon and records `CHANGED_ACTION`;
- for **routine** work, Atlas is not globally blacklisted: it remains selected, but prepayment falls from 50% to 10% and milestone verification is required, recorded as `CONSTRAINED_ACTION`.

The claim is therefore not “Atlas has a low reputation.” It is: **this agent's attributable experience with Atlas changes the authority Atlas receives in the matching future context.**

### Prior Work declaration

Engram's protocol, runtime, execution-memory semantics, CockroachDB production profile, SDK/API/MCP surfaces, causal influence model, and earlier scenarios existed before the Sibyl Labs Hackathon build window.

The Sibyl EBI adapter, pressure harness and provider-continuity work currently present on this branch were also implemented before the official **September 1–10, 2026** build window. If retained for submission, they must be declared as prior work rather than represented as hackathon-window implementation. Final submission evidence must identify the work performed during the official window and regenerate the required fresh-session/deletion proof there.

Current pre-window evidence is recorded under [`hackathon/sibyl/`](hackathon/sibyl/) and must not be confused with final submission evidence.

## Governing invariant

Engram is complete only when a prior execution persisted in its configured operational-memory substrate is retrieved under comparable future context, explicitly influences a later application/agent decision, causes an observable change from the memory-free baseline, and leaves enough provenance to reconstruct that relationship.

```text
source execution
      ↓
operational memory
      ↓
future recall
      ↓
application decision references memory
      ↓
action differs from baseline/control
      ↓
outcome observed
```

Retrieval alone is not influence. Prompt inclusion alone is not causal proof.

## What Engram includes

- versioned `ExecutionEpisode` protocol;
- stateless Engram Runtime for execution lifecycle and memory semantics;
- policy-controlled admission, retrieval, influence, expiry and invalidation;
- explicit recall → influence → counterfactual provenance;
- CockroachDB-backed execution, memory, vector and evaluation state;
- agent-scoped cosine vector retrieval;
- Amazon Bedrock Titan embedding provider;
- CockroachDB Cloud Managed MCP provenance inspection;
- TypeScript SDK and Python HTTP SDK;
- HTTP API;
- semantic Engram MCP server;
- OpenAI Agents, LangGraph and custom adapter surfaces;
- read-focused control-plane backend;
- evidence-safe memory evaluation and controlled experiments.

See [`docs/architecture.md`](docs/architecture.md) for the system model.

## First demo proof

The original deterministic demo is deliberately small:

1. Run A has no relevant memory.
2. The application selects Route C.
3. Route C encounters `LIQUIDITY_UNAVAILABLE`.
4. Recovery is observed and Engram admits an operational lesson.
5. A comparable Run B recalls that lesson.
6. The application selects Route D instead and records the memory as `CHANGED_ACTION`.
7. Run B succeeds.
8. Engram preserves the memory-to-action trace.

The external multi-venue executor is **SIMULATED**. That boundary is intentional and independent from persistence, retrieval, provenance and cloud-integration evidence.

## Stronger acceptance scenarios

Engram is also tested outside the initial venue workload:

- **experiential provider continuity** — repeated requester-owned provider executions become bounded relationship posture that can change urgent delegation or constrain routine payment/verification authority;
- **software deployment recovery** — prior migration failure/recovery changes a later comparable deployment strategy with a real memory-free control execution;
- **autonomous coding regression** — prior reverted regression changes a later comparable coding methodology from patch-first to regression-test-first;
- **incident recovery** — prior recovery that restored the primary service but caused a harmful secondary consequence changes the later mitigation sequence;
- **bad memory** — stale or incompatible memory can be retrieved yet blocked before exposure/influence;
- **competing memories** — contradictory evidence remains visible without implicit overwrite/adjudication;
- **competing recall provenance** — a valid memory paired with the wrong retrieval is rejected.

Canonical experiment records live under [`experiments/`](experiments/) and are registry-checked in CI.

## Architecture

```text
Control Plane
  executions · memories · policies · evaluations
        |
Integration Surfaces
  TypeScript SDK · Python SDK · HTTP API · Engram MCP · adapters
        |
Engram Runtime
  recall · admission · eligibility · influence · provenance
        |
Execution Model
  episodes · decisions · observations · outcomes · counterfactuals
        |
Evidence + Storage
  CockroachDB · VECTOR/C-SPANN · evaluations · lineage
        |
External Integrations
  Amazon Bedrock · CockroachDB Cloud Managed MCP
```

Canonical lifecycle:

```text
context → recall → application decides → authorize → execute → observe → recover → remember
```

## Quick start

Requirements:

- Node.js 22
- npm

```bash
git clone https://github.com/etvjay/Engram.git
cd Engram
npm install
npm run check
```

`npm run check` builds the project and runs the full deterministic/conformance test suite. Credential-gated CockroachDB integration bodies are not equivalent to live verification when `DATABASE_URL` is absent.

### Environment

Copy the template and fill only the integrations you intend to exercise:

```bash
cp .env.example .env
```

Never commit API keys, database credentials or `ENGRAM_API_TOKEN`.

## CockroachDB

Apply the complete ordered migration chain:

```bash
DATABASE_URL='postgresql://...' npm run migrate
```

Run the credential-gated integration suite:

```bash
DATABASE_URL='postgresql://...' npm run test:integration
```

CockroachDB is Engram's canonical operational-memory substrate. Application hot-path reads/writes use the PostgreSQL-compatible connection. CockroachDB Cloud Managed MCP is a separate read/introspection/provenance plane.

Production retrieval is agent-scoped and cosine based. Successful vector ordering does **not** prove C-SPANN index use; the live verifier records the natural `EXPLAIN` plan and promotes that claim only when the optimizer actually selects the expected vector index.

## TypeScript SDK

Inside this monorepo, the canonical SDK barrel is `packages/sdk/src/index.ts` and exposes `Engram`, `httpTransport`, `runtimeTransport`, and the transport types:

```ts
import { Engram, httpTransport } from "./packages/sdk/src/index.js";

const engram = new Engram(httpTransport({
  baseUrl: process.env.ENGRAM_API_URL!,
  apiToken: process.env.ENGRAM_API_TOKEN,
}));

const execution = await engram.startExecution({
  agentId: "deployment-agent",
  workflowType: "deployment",
  intent: "Deploy safely",
  context: { service: "api" },
  constraints: {},
});

const recall = await execution.recall({ query: "comparable prior failures" });

// The application/agent decides. Engram does not.
const decision = await application.decide({ memories: recall.candidates });

await execution.recordDecision({
  decisionType: "DEPLOYMENT_STRATEGY",
  selectedAction: decision.action,
  reasoningSummary: decision.summary,
  influences: decision.memoryInfluences,
});
```

The SDK is currently a monorepo package surface; publication as an installable `@engram/sdk` registry package is not claimed yet.

## Python SDK

```python
from engram import Engram

client = Engram(
    "https://YOUR_API",
    api_token="SERVER_SIDE_TOKEN",
)

execution = client.start_execution(
    agentId="deployment-agent",
    workflowType="deployment",
    intent="Deploy safely",
    context={"service": "api"},
    constraints={},
)

recall = execution.recall("comparable prior failures")
```

## HTTP API

Core runtime routes:

```text
POST /v1/executions
POST /v1/executions/{id}/recall
POST /v1/executions/{id}/decisions
POST /v1/executions/{id}/observations
POST /v1/executions/{id}/complete
GET  /v1/executions/{id}/trace
```

Read-focused control-plane routes live under `/v1/control-plane/*`.

`GET /health` and `POST /v1/demo/run` are intentionally public in the MVP. Every other `/v1/*` route requires `Authorization: Bearer $ENGRAM_API_TOKEN` and fails closed if the server token is not configured.

The shared bearer token is an initial deployment guard, **not** production multi-tenant RBAC. Do not place it in a public frontend bundle.

## Engram MCP vs CockroachDB Managed MCP

These are intentionally different surfaces.

**Engram MCP** exposes execution-memory semantics such as execution inspection, memory inspection, recall and influence explanation.

**CockroachDB Cloud Managed MCP** is used as a read/introspection/provenance interface to the underlying CockroachDB data plane.

Managed MCP is not Engram's transactional application database driver.

## AWS deployment

The SAM application packages successfully in CI. Local package proof:

```bash
npm install
export PATH="$PWD/node_modules/.bin:$PATH"
sam build
```

The repository contains two manual external-proof workflows:

- `.github/workflows/live-verification.yml` — CockroachDB + Bedrock + Managed MCP + natural C-SPANN plan evidence;
- `.github/workflows/aws-deploy-verification.yml` — SAM deploy plus deployed public/authenticated API exercise.

Neither external workflow should be treated as successful merely because its code exists. See [`docs/deployment.md`](docs/deployment.md) for credentials, promotion rules and evidence artifacts.

## Evidence status

Engram keeps implementation/test evidence separate from live-cloud evidence.

Current high-level boundary:

| Area | Status |
|---|---|
| Protocol/runtime causal invariants | TESTED |
| SDK/API/MCP/adapters | TESTED |
| Memory policy/evaluation | TESTED |
| Stronger execution-memory scenarios | TESTED |
| Sibyl evaluated profile, pre-window | LOCAL_PASS |
| SAM packaging | TESTED |
| External demo workload | SIMULATED |
| CockroachDB Cloud live persistence | UNVERIFIED until credentialed live proof |
| Bedrock Titan live invocation | UNVERIFIED until credentialed live proof |
| Managed MCP live provenance | UNVERIFIED until credentialed live proof |
| Natural C-SPANN index selection | UNVERIFIED until EXPLAIN proves it |
| AWS Lambda public deployment | UNVERIFIED until deploy-verification succeeds |

The authoritative machine-readable claim ledger is [`evidence/claims.yaml`](evidence/claims.yaml). The Sibyl hackathon evidence ledger is [`hackathon/sibyl/templates/EVIDENCE_LEDGER.md`](hackathon/sibyl/templates/EVIDENCE_LEDGER.md).

## Repository map

```text
apps/web/                  Control-plane UI
services/api/              Lambda/HTTP API
services/runtime/          Runtime composition
services/demo/             Deterministic causal demo
services/verification/     Credentialed external verifier
packages/core/             Protocol primitives
packages/episode/          ExecutionEpisode schema
packages/runtime/          Memory runtime
packages/policy/           Policy contracts/registry
packages/evaluation/       Memory evaluation semantics
packages/sdk/              TypeScript SDK
packages/python/           Python SDK
packages/mcp-server/       Engram semantic MCP
packages/adapters/         Framework adapters
packages/cockroach/        Cockroach persistence/vector runtime
packages/cockroach-mcp/    Managed MCP client
packages/bedrock/          Titan embeddings
packages/sibyl/            Sibyl evaluated runtime-store profile (server-only)
packages/scenarios/        Domain acceptance workloads
db/migrations/             Ordered schema migrations
experiments/               Governed acceptance evidence
evidence/                  Claim ledger and adversarial reviews
tests/                     Unit/integration/conformance/E2E proofs
hackathon/sibyl/            Sibyl EBI truth/evidence wrapper
```

## What Engram is not

Engram is not generic chat memory, a generic RAG wrapper, an autonomous adjudicator, or a replacement for an agent framework. It does not infer that retrieval equals influence and does not turn a later successful outcome into proof that a memory was beneficial.

## License

MIT. See [`LICENSE`](LICENSE).
