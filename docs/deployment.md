# Engram live deployment runbook

Status labels in this document are deliberate. Do not mark a step VERIFIED until its corresponding command or deployed endpoint has been exercised.

## Required external resources

- CockroachDB Cloud cluster with a database for Engram.
- CockroachDB SQL connection string (`DATABASE_URL`).
- AWS account with Lambda/API Gateway deployment rights.
- Amazon Bedrock access to `amazon.titan-embed-text-v2:0` in the deployment region.
- Optional but recommended for the hackathon: CockroachDB Cloud Managed MCP service account with read-only access to the Engram cluster.

## CockroachDB

Apply the migration in `db/migrations/001_initial.sql` to the target database, then run:

```bash
DATABASE_URL='postgresql://...' npm run test:integration
```

The integration test must prove the persisted sequence:

`Run A -> compensated outcome -> operational memory -> Run B retrieval -> changed route -> decision-memory provenance`.

Until this test runs against CockroachDB Cloud, the database path is IMPLEMENTED but not VERIFIED.

## Managed MCP

CockroachDB Cloud's managed MCP endpoint is:

`https://cockroachlabs.cloud/mcp`

Engram uses these environment variables:

```bash
COCKROACH_MCP_CLUSTER_ID='...'
COCKROACH_MCP_API_KEY='...'
COCKROACH_MCP_URL='https://cockroachlabs.cloud/mcp'
```

The application deliberately permits only CockroachDB read/introspection tools through its MCP adapter. Transactional Engram writes continue through the PostgreSQL-compatible application connection.

After deployment, call:

```bash
curl "$API_URL/v1/mcp/status"
```

Expected when configured: `connected=true`, with read tools including `list_databases`, `list_tables`, `get_table_schema`, `select_query`, and `explain_query` when exposed by the server.

Never store the MCP API key inside an execution event, memory, decision, trace, or frontend bundle.

## AWS SAM

Build:

```bash
sam build
```

Deploy:

```bash
sam deploy --guided \
  --parameter-overrides \
    DatabaseUrl='postgresql://...' \
    CorsOrigin='https://YOUR_FRONTEND' \
    CockroachMcpClusterId='YOUR_CLUSTER_ID' \
    CockroachMcpApiKey='YOUR_SERVICE_ACCOUNT_KEY'
```

The deployed Lambda exposes:

- `GET /health`
- `GET /v1/mcp/status`
- `POST /v1/demo/run`
- `POST /v1/memory/search`
- `GET /v1/executions/{id}/trace`

## Web UI

Build with the deployed API URL:

```bash
VITE_API_BASE_URL="$API_URL" npm run build:web
```

The output is written to `dist-web/` and can be hosted on S3 + CloudFront or another static host.

## Hackathon evidence boundary

The canonical demo must visibly state:

- external venue execution: **SIMULATED**
- CockroachDB persistence: **REAL** once live cluster test passes
- vector/structured retrieval: **REAL** once live cluster test passes
- memory-to-decision provenance: **REAL** once live cluster test passes
- Managed MCP: **VERIFIED** only after `/v1/mcp/status` successfully connects to the target cluster

Do not upgrade any of these labels based only on configuration or code presence.
