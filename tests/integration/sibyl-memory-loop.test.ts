import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EngramRuntime } from "../../packages/runtime/src/runtime.js";
import { DEFAULT_RUNTIME_POLICIES } from "../../packages/runtime/src/defaults.js";
import { SibylRuntimeStore } from "../../packages/sibyl/src/runtime-store.js";
import { decideRoute, ROUTE_C, ROUTE_D } from "../../packages/memory-core/src/policy.js";

const describeSibyl = process.env.ENGRAM_SIBYL_TEST_REQUIRED === "1" ? describe : describe.skip;

let dir: string;
let previousDb: string | undefined;
let previousTenant: string | undefined;
let previousPython: string | undefined;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "engram-sibyl-"));
  previousDb = process.env.ENGRAM_SIBYL_DB;
  previousTenant = process.env.ENGRAM_SIBYL_TENANT;
  previousPython = process.env.ENGRAM_SIBYL_PYTHON;
  process.env.ENGRAM_SIBYL_DB = join(dir, "memory.db");
  process.env.ENGRAM_SIBYL_TENANT = "engram-integration-test";
  delete process.env.ENGRAM_SIBYL_PYTHON;
});

afterEach(async () => {
  if (previousDb === undefined) delete process.env.ENGRAM_SIBYL_DB;
  else process.env.ENGRAM_SIBYL_DB = previousDb;
  if (previousTenant === undefined) delete process.env.ENGRAM_SIBYL_TENANT;
  else process.env.ENGRAM_SIBYL_TENANT = previousTenant;
  if (previousPython === undefined) delete process.env.ENGRAM_SIBYL_PYTHON;
  else process.env.ENGRAM_SIBYL_PYTHON = previousPython;
  await rm(dir, { recursive: true, force: true });
});

describeSibyl("Engram × Sibyl evaluated profile", () => {
  it("persists execution-derived memory and changes a later fresh-store decision", async () => {
    const firstStore = new SibylRuntimeStore();
    const firstRuntime = new EngramRuntime(firstStore, DEFAULT_RUNTIME_POLICIES);
    await expect(firstStore.ping()).resolves.toMatchObject({ tenant: "engram-integration-test" });

    const runA = await firstRuntime.startExecution({
      agentId: "agent-demo",
      workflowType: "multi_venue_execution",
      intent: "route value through available venues",
      context: { liquidityClass: "thin" },
      constraints: {},
    });

    const completedA = await firstRuntime.complete({
      executionId: runA.executionId,
      status: "COMPENSATED",
      summary: "Venue C lacked required liquidity; recovery through D succeeded.",
      result: { failedVenue: "C", recoveryVenue: "D" },
      evidenceState: "OBSERVED",
      admissionSignals: [{
        kind: "UNEXPECTED_FAILURE",
        summary: "Venue C failed with LIQUIDITY_UNAVAILABLE under thin liquidity; prefer D under comparable conditions.",
        evidenceState: "OBSERVED",
        confidence: 0.91,
        details: {
          failureType: "LIQUIDITY_UNAVAILABLE",
          failedVenue: "C",
          recoveryVenue: "D",
          liquidityClass: "thin",
        },
      }],
    });
    expect(completedA.admittedMemories).toHaveLength(1);

    // Fresh store + runtime instance: no JS object from Run A is reused.
    const secondStore = new SibylRuntimeStore();
    const secondRuntime = new EngramRuntime(secondStore, DEFAULT_RUNTIME_POLICIES);
    const runB = await secondRuntime.startExecution({
      agentId: "agent-demo",
      workflowType: "multi_venue_execution",
      intent: "route value through available venues",
      context: { liquidityClass: "thin" },
      constraints: {},
    });

    const recalled = await secondRuntime.recall({
      executionId: runB.executionId,
      query: "Venue C failed LIQUIDITY_UNAVAILABLE",
    });
    expect(recalled.candidates).toHaveLength(1);
    expect(recalled.candidates[0]?.memory.id).toBe(completedA.admittedMemories[0]?.id);

    const control = decideRoute({ memories: [], memoryAvailable: true });
    expect(control.route).toEqual(ROUTE_C);

    const treatment = decideRoute({
      memoryAvailable: true,
      memories: recalled.candidates.map((candidate) => ({
        memory: candidate.memory,
        semanticScore: candidate.semanticScore,
        contextScore: candidate.contextScore,
        outcomeScore: candidate.outcomeScore,
        recencyScore: candidate.recencyScore,
      })),
    });
    expect(treatment.route).toEqual(ROUTE_D);

    await secondRuntime.recordDecision({
      executionId: runB.executionId,
      decisionType: "ROUTE_SELECTION",
      selectedAction: { route: treatment.route },
      alternatives: [{ route: control.route }],
      reasoningSummary: treatment.reason,
      influences: [{
        memoryId: recalled.candidates[0]!.memory.id,
        retrievalId: recalled.recall.id,
        influenceType: "CHANGED_ACTION",
        summary: "Prior venue failure changed the selected route from C to D.",
        counterfactual: {
          action: { route: control.route },
          source: "APPLICATION_DECLARED",
          evidenceState: "OBSERVED",
          explanation: "The same route policy without recalled memory selects Route C.",
        },
      }],
    });

    const trace = await secondRuntime.trace(runB.executionId) as Record<string, unknown>;
    expect(trace.memoryBackend).toBe("sibyl-memory-client");
    expect((trace.decisions as unknown[])).toHaveLength(1);
    expect((trace.retrievals as unknown[])).toHaveLength(1);
  });

  it("fails closed when the Sibyl runtime is removed", async () => {
    process.env.ENGRAM_SIBYL_PYTHON = join(dir, "missing-python");
    const store = new SibylRuntimeStore();
    await expect(store.ping()).rejects.toThrow();
  });
});
