import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type pg from "pg";
import type { EmbeddingProvider, OperationalMemory } from "../../packages/memory-core/src/domain.js";
import { createCockroachPool } from "../../packages/cockroach/src/client.js";
import { applyEngramMigrations } from "../../packages/cockroach/src/migrations.js";
import { CockroachMemoryRepository } from "../../packages/cockroach/src/repository.js";
import { CockroachRuntimeStore } from "../../packages/cockroach/src/runtime-store.js";
import type { EngramRuntimeStore } from "../../packages/runtime/src/store.js";
import { EngramRuntime } from "../../packages/runtime/src/runtime.js";
import { DEFAULT_RUNTIME_POLICIES } from "../../packages/runtime/src/defaults.js";

const live = Boolean(process.env.DATABASE_URL);
const suite = live ? describe : describe.skip;

class DeterministicEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = 1024;
  async embed(text: string): Promise<number[]> {
    const safeText = text || "engram";
    const vector = Array.from({ length: 1024 }, (_, index) => ((safeText.charCodeAt(index % safeText.length) || 1) % 97) / 97);
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    return vector.map((value) => value / norm);
  }
}

suite("Cockroach-backed Engram runtime", () => {
  let pool: pg.Pool;
  let repository: CockroachMemoryRepository;
  let store: CockroachRuntimeStore;

  beforeAll(async () => {
    pool = createCockroachPool();
    await applyEngramMigrations(pool);
    repository = new CockroachMemoryRepository(pool, new DeterministicEmbeddingProvider());
    store = new CockroachRuntimeStore(pool, repository);
  });

  afterAll(async () => {
    await pool?.end();
  });

  it("reloads an exposed recall after a cold start and persists influence provenance", async () => {
    const agentId = `runtime-agent-${randomUUID()}`;
    const source = await repository.startExecution({
      agentId,
      workflowType: "deployment",
      intent: "Deploy API",
      context: { service: "api" },
      constraints: {},
      environmentVersion: "prod-v1",
      toolVersion: "1.4.0",
      policyVersion: "agent-policy-v1",
    });
    await repository.recordOutcome({
      id: randomUUID(),
      executionId: source.executionId,
      status: "FAILURE",
      failureType: "DEPENDENCY_UNAVAILABLE",
      summary: "Dependency alpha was unavailable during deployment.",
      result: { dependency: "alpha" },
      evidenceState: "OBSERVED",
    });

    const memory: OperationalMemory = {
      id: randomUUID(),
      agentId,
      memoryType: "UNEXPECTED_FAILURE",
      summary: "Dependency alpha was unavailable during a comparable production deployment.",
      structuredContext: {
        workflowType: "deployment",
        sourceExecutionId: source.executionId,
        failureType: "DEPENDENCY_UNAVAILABLE",
        dependency: "alpha",
      },
      confidence: 0.93,
      evidenceState: "OBSERVED",
      validFrom: new Date(),
      environmentVersion: "prod-v1",
      toolVersion: "1.3.0",
      policyVersion: "engram-admission-v1",
    };
    await repository.persistMemory(memory, [source.executionId]);

    const firstInvocation = new EngramRuntime(store, DEFAULT_RUNTIME_POLICIES);
    const current = await firstInvocation.startExecution({
      agentId,
      workflowType: "deployment",
      intent: "Deploy API",
      context: { service: "api" },
      constraints: {},
      environmentVersion: "prod-v1",
      toolVersion: "1.4.0",
      policyVersion: "agent-policy-v1",
    });

    const recall = await firstInvocation.recall({
      executionId: current.executionId,
      query: "production deployment dependency failures",
      status: ["FAILURE", "COMPENSATED", "PARTIAL"],
    });
    expect(recall.recall.candidates.some((candidate) => candidate.memoryId === memory.id)).toBe(true);

    // New runtime instance simulates a Lambda cold start. Recall state must be
    // reconstructed from CockroachDB, not retained in process memory.
    const secondInvocation = new EngramRuntime(store, DEFAULT_RUNTIME_POLICIES);
    await secondInvocation.recordDecision({
      executionId: current.executionId,
      decisionType: "DEPENDENCY_SELECTION",
      selectedAction: { dependency: "beta" },
      alternatives: [{ dependency: "alpha" }],
      reasoningSummary: "Prior execution memory changed the selected dependency.",
      influences: [{
        memoryId: memory.id,
        retrievalId: recall.recall.id,
        influenceType: "CHANGED_ACTION",
        summary: "Comparable dependency failure caused alpha to be replaced by beta.",
        relevance: recall.candidates.find((candidate) => candidate.memory.id === memory.id)?.score,
        counterfactual: {
          action: { dependency: "alpha" },
          source: "APPLICATION_DECLARED",
          evidenceState: "OBSERVED",
          explanation: "The application recorded alpha as the memory-free baseline.",
        },
      }],
    });

    const persistedRecalls = await store.getRecalls(current.executionId);
    expect(persistedRecalls[0]?.candidates.some((candidate) => candidate.memoryId === memory.id)).toBe(true);

    const runtimeStore: EngramRuntimeStore = store;
    const trace = await runtimeStore.getTrace(current.executionId) as {
      decisions: Array<{ memory_influences: Array<Record<string, unknown>> }>;
      retrievals: Array<Record<string, unknown>>;
      runtimeEvaluations?: Array<Record<string, unknown>>;
    };
    expect(trace.retrievals).toHaveLength(1);
    expect(trace.decisions).toHaveLength(1);
    expect(trace.decisions[0]?.memory_influences).toHaveLength(1);
  });
});
