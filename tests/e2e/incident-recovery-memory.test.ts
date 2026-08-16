import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { MemoryRecall } from "../../packages/core/src/protocol.js";
import type { ExecutionContext, ExecutionEvent, MemorySearchInput, OperationalMemory, Outcome } from "../../packages/memory-core/src/domain.js";
import { decideIncidentStrategy, executeIncidentRecovery, type IncidentContext } from "../../packages/scenarios/incident/src/index.js";
import { DEFAULT_RUNTIME_POLICIES } from "../../packages/runtime/src/defaults.js";
import { EngramRuntime } from "../../packages/runtime/src/runtime.js";
import type { EngramRuntimeStore } from "../../packages/runtime/src/store.js";
import type { RecallExposureUpdate, RuntimeDecisionRecord, RuntimeEvaluationEvent, RuntimeExecutionRecord } from "../../packages/runtime/src/types.js";

class IncidentStore implements EngramRuntimeStore {
  executions = new Map<string, RuntimeExecutionRecord>();
  memories: OperationalMemory[] = [];
  recalls: MemoryRecall[] = [];
  decisions: RuntimeDecisionRecord[] = [];
  evaluations: RuntimeEvaluationEvent[] = [];
  outcomes = new Map<string, Outcome>();
  events = new Map<string, ExecutionEvent[]>();
  private pending = new Map<string, { executionId: string; query: string }>();

  async startExecution(input: ExecutionContext) {
    const id = randomUUID();
    this.executions.set(id, {
      id,
      agentId: input.agentId,
      agentVersion: input.agentVersion,
      workflowType: input.workflowType,
      intent: input.intent,
      context: input.context,
      constraints: input.constraints,
      environmentVersion: input.environmentVersion,
      toolVersion: input.toolVersion,
      policyVersion: input.policyVersion,
      status: "RUNNING",
      startedAt: new Date(),
    });
    this.events.set(id, []);
    return { executionId: id };
  }
  async getExecution(id: string) { return this.executions.get(id) ?? null; }
  async appendEvent(event: ExecutionEvent) { this.events.get(event.executionId)?.push(event); }
  async recordOutcome(outcome: Outcome) {
    this.outcomes.set(outcome.executionId, outcome);
    const execution = this.executions.get(outcome.executionId);
    if (execution) execution.status = outcome.status;
  }
  async persistMemory(memory: OperationalMemory, _sources: string[]) { this.memories.push(memory); }
  async getMemory(id: string) { return this.memories.find((memory) => memory.id === id) ?? null; }
  async searchMemory(input: MemorySearchInput) {
    const retrievalId = randomUUID();
    if (!input.executionId) throw new Error("executionId required");
    this.pending.set(retrievalId, { executionId: input.executionId, query: input.query });
    return {
      retrievalId,
      candidates: this.memories.filter((m) => m.agentId === input.agentId).map((memory, index) => ({
        memoryId: memory.id,
        memory,
        semanticScore: 0.96,
        contextScore: 1,
        outcomeScore: 1,
        confidenceScore: memory.confidence,
        recencyScore: 1,
        finalScore: 0.96 - index * 0.01,
        rank: index + 1,
      })),
    };
  }
  async getRecalls(executionId: string) { return this.recalls.filter((r) => r.executionId === executionId); }
  async updateRecallExposure(update: RecallExposureUpdate) {
    const pending = this.pending.get(update.retrievalId);
    if (!pending) throw new Error("unknown retrieval");
    this.recalls.push({
      id: update.retrievalId,
      executionId: pending.executionId,
      query: pending.query,
      policyVersion: DEFAULT_RUNTIME_POLICIES.retrieval.policyVersion,
      recalledAt: new Date(),
      candidates: update.exposedMemoryIds.map((memoryId, index) => ({
        retrievalId: update.retrievalId,
        memoryId,
        rank: index + 1,
        score: 0.96 - index * 0.01,
      })),
    });
  }
  async recordRuntimeDecision(decision: RuntimeDecisionRecord) { this.decisions.push(decision); }
  async appendRuntimeEvaluationEvent(event: RuntimeEvaluationEvent) { this.evaluations.push(event); }
  async getTrace(executionId: string) {
    return {
      decisions: this.decisions.filter((d) => d.executionId === executionId),
      evaluations: this.evaluations.filter((e) => e.executionId === executionId),
      events: this.events.get(executionId) ?? [],
      outcome: this.outcomes.get(executionId) ?? null,
    };
  }
}

const incident: IncidentContext = {
  workflowType: "incident_recovery",
  service: "checkout-worker",
  symptom: "SATURATED_WORKERS",
  retrySensitive: true,
  environmentVersion: "prod-v9",
};

const executionContext = {
  agentId: "incident-agent",
  workflowType: incident.workflowType,
  intent: "Restore checkout processing without triggering a secondary overload",
  context: incident,
  constraints: { avoidSecondaryIncident: true, preserveQueueIntegrity: true },
  environmentVersion: incident.environmentVersion,
  toolVersion: "opsctl-5.1.0",
} as const;

describe("incident recovery execution memory", () => {
  it("remembers a mitigation side effect and changes later recovery strategy", async () => {
    const store = new IncidentStore();
    const runtime = new EngramRuntime(store, DEFAULT_RUNTIME_POLICIES);

    // Source incident: fleet restart restores workers but creates a secondary retry storm.
    const source = await runtime.startExecution(executionContext);
    const emptyRecall = await runtime.recall({ executionId: source.executionId, query: "worker saturation recovery retry storm" });
    expect(emptyRecall.candidates).toHaveLength(0);
    const sourceChoice = decideIncidentStrategy({ context: incident, memories: [] });
    expect(sourceChoice.strategy).toBe("FLEET_RESTART");
    await runtime.recordDecision({
      executionId: source.executionId,
      decisionType: "INCIDENT_MITIGATION",
      selectedAction: { strategy: sourceChoice.strategy },
      alternatives: [{ strategy: "DRAIN_AND_CANARY_RESTART" }],
      reasoningSummary: "No prior execution memory constrains the fleet-restart baseline.",
    });
    const sourceResult = executeIncidentRecovery(sourceChoice.strategy, incident);
    expect(sourceResult).toMatchObject({ status: "PARTIAL", primaryRecovered: true, secondaryFailure: "RETRY_STORM" });
    await runtime.observe({
      executionId: source.executionId,
      type: "PRIMARY_SERVICE_RECOVERED",
      payload: { strategy: sourceChoice.strategy },
      evidenceState: "OBSERVED",
    });
    await runtime.observe({
      executionId: source.executionId,
      type: "SECONDARY_RETRY_STORM",
      payload: { consequence: "queue saturation", strategy: sourceChoice.strategy },
      evidenceState: "OBSERVED",
    });
    const sourceComplete = await runtime.complete({
      executionId: source.executionId,
      status: "PARTIAL",
      summary: "Fleet restart restored workers but caused a retry storm and secondary queue saturation.",
      evidenceState: "OBSERVED",
      admissionSignals: [{
        kind: "SUCCESSFUL_RECOVERY",
        summary: "FLEET_RESTART restored SATURATED_WORKERS but caused RETRY_STORM; for comparable retry-sensitive incidents prefer DRAIN_AND_CANARY_RESTART.",
        evidenceState: "OBSERVED",
        confidence: 0.95,
        details: {
          workflowType: incident.workflowType,
          symptom: incident.symptom,
          failedStrategy: "FLEET_RESTART",
          secondaryFailure: "RETRY_STORM",
          recommendedStrategy: "DRAIN_AND_CANARY_RESTART",
          recoveryQuality: "DEGRADED",
        },
      }],
    });
    const incidentMemory = sourceComplete.admittedMemories[0]!;

    // Control: same incident without recall repeats the degraded recovery.
    const control = await runtime.startExecution(executionContext);
    const controlChoice = decideIncidentStrategy({ context: incident, memories: [] });
    const controlResult = executeIncidentRecovery(controlChoice.strategy, incident);
    expect(controlResult.recoveryQuality).toBe("DEGRADED");
    await runtime.recordDecision({
      executionId: control.executionId,
      decisionType: "INCIDENT_MITIGATION",
      selectedAction: { strategy: controlChoice.strategy },
      reasoningSummary: "Control excludes execution-memory recall.",
    });
    await runtime.complete({
      executionId: control.executionId,
      status: "PARTIAL",
      summary: "Control repeats the fleet restart and retry storm.",
      evidenceState: "OBSERVED",
    });

    // Treatment: recall includes the side effect, not merely the primary recovery.
    const treatment = await runtime.startExecution(executionContext);
    const recall = await runtime.recall({ executionId: treatment.executionId, query: "worker saturation recovery retry storm" });
    expect(recall.candidates.map((candidate) => candidate.memory.id)).toContain(incidentMemory.id);
    const choice = decideIncidentStrategy({
      context: incident,
      memories: recall.candidates.map((candidate) => ({ memory: candidate.memory, finalScore: candidate.score })),
    });
    expect(choice.strategy).toBe("DRAIN_AND_CANARY_RESTART");
    await runtime.recordDecision({
      executionId: treatment.executionId,
      decisionType: "INCIDENT_MITIGATION",
      selectedAction: { strategy: choice.strategy },
      alternatives: [{ strategy: controlChoice.strategy }],
      reasoningSummary: "Prior recovery restored the primary service but caused a secondary retry storm, so the mitigation is staged.",
      influences: [{
        memoryId: incidentMemory.id,
        retrievalId: recall.recall.id,
        influenceType: "CHANGED_ACTION",
        summary: "The remembered secondary failure changed the recovery strategy.",
        relevance: 0.96,
        counterfactual: {
          action: { strategy: controlChoice.strategy },
          source: "CONTROL_RUN",
          evidenceState: "OBSERVED",
          explanation: "The same-context control omitted recall, repeated FLEET_RESTART, and reproduced degraded recovery.",
          comparisonExecutionId: control.executionId,
        },
      }],
    });
    const treatmentResult = executeIncidentRecovery(choice.strategy, incident);
    expect(treatmentResult).toMatchObject({ status: "SUCCESS", recoveryQuality: "CLEAN", primaryRecovered: true });
    await runtime.observe({
      executionId: treatment.executionId,
      type: "INCIDENT_RECOVERED_CLEANLY",
      payload: { strategy: choice.strategy, secondaryFailure: null },
      evidenceState: "OBSERVED",
    });
    await runtime.complete({
      executionId: treatment.executionId,
      status: "SUCCESS",
      summary: "Staged drain and canary restart restored service without a retry storm.",
      evidenceState: "OBSERVED",
    });

    const trace = await runtime.trace(treatment.executionId) as {
      decisions: RuntimeDecisionRecord[];
      evaluations: RuntimeEvaluationEvent[];
      outcome: Outcome;
    };
    expect(trace.outcome.status).toBe("SUCCESS");
    expect(trace.decisions[0]?.influences[0]?.influenceType).toBe("CHANGED_ACTION");
    expect(trace.evaluations.some((event) => event.eventType === "INFLUENCE_ACCEPTED")).toBe(true);
  });
});
