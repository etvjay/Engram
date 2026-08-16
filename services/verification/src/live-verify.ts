import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createCockroachPool } from "../../../packages/cockroach/src/client.js";
import { CockroachMemoryRepository } from "../../../packages/cockroach/src/repository.js";
import { TitanEmbeddingProvider } from "../../../packages/bedrock/src/embeddings.js";
import {
  getCockroachMcpStatus,
  inspectMemoryProvenanceViaMcp,
} from "../../../packages/cockroach-mcp/src/client.js";
import { runEngramDemo } from "../../demo/src/run-demo.js";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for live verification`);
  return value;
}

async function main() {
  requireEnv("DATABASE_URL");
  requireEnv("AWS_REGION");
  requireEnv("COCKROACH_MCP_CLUSTER_ID");
  requireEnv("COCKROACH_MCP_API_KEY");

  const startedAt = new Date().toISOString();
  const pool = createCockroachPool();

  try {
    const migration = await readFile(new URL("../../../db/migrations/001_initial.sql", import.meta.url), "utf8");
    await pool.query(migration);

    const repository = new CockroachMemoryRepository(pool, new TitanEmbeddingProvider());
    const agentId = `engram-live-${randomUUID()}`;
    const demo = await runEngramDemo(repository, { agentId });

    if (!demo.changedBehavior) throw new Error("Live demo did not change behavior");
    if (demo.runA.outcome !== "COMPENSATED") throw new Error(`Unexpected Run A outcome: ${demo.runA.outcome}`);
    if (demo.runB.outcome !== "SUCCESS") throw new Error(`Unexpected Run B outcome: ${demo.runB.outcome}`);
    if (!demo.runB.memoryRefs.includes(demo.memory.id)) throw new Error("Run B does not reference the memory produced by Run A");

    const trace = await repository.getTrace(demo.runB.executionId);
    const mcpStatus = await getCockroachMcpStatus();
    if (!mcpStatus.connected) throw new Error("CockroachDB Managed MCP did not connect");
    if (mcpStatus.missingExpectedTools.length > 0) {
      throw new Error(`Managed MCP is missing expected tools: ${mcpStatus.missingExpectedTools.join(", ")}`);
    }

    const mcpProvenance = await inspectMemoryProvenanceViaMcp(demo.memory.id);
    const completedAt = new Date().toISOString();

    const evidence = {
      evidenceClass: "VERIFIED",
      verificationKind: "LIVE_EXTERNAL_INTEGRATION",
      startedAt,
      completedAt,
      commitSha: process.env.GITHUB_SHA ?? null,
      githubRunId: process.env.GITHUB_RUN_ID ?? null,
      boundaries: {
        externalVenueExecution: "SIMULATED",
        cockroachPersistence: "VERIFIED",
        distributedVectorRetrieval: "VERIFIED",
        bedrockEmbedding: "VERIFIED",
        decisionMemoryTrace: "VERIFIED",
        managedMcpConnection: "VERIFIED",
        managedMcpProvenanceQuery: "VERIFIED",
      },
      demo,
      trace,
      mcp: {
        status: mcpStatus,
        provenance: mcpProvenance,
      },
    };

    await mkdir("evidence/live", { recursive: true });
    const output = "evidence/live/latest.json";
    await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ok: true, output, memoryId: demo.memory.id, runA: demo.runA.executionId, runB: demo.runB.executionId }));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
