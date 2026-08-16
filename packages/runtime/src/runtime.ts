import { randomUUID } from "node:crypto";
import {
  MemoryInfluenceSchema,
  MemoryRecallSchema,
  type MemoryInfluence,
} from "../../core/src/protocol.js";
import { assertDecisionInfluencesValid } from "../../core/src/validate.js";
import {
  ExecutionContextSchema,
  OutcomeSchema,
  type OperationalMemory,
} from "../../memory-core/src/domain.js";
import type { MemoryPolicyRegistry } from "../../policy/src/registry.js";
import type { MemoryPolicyBundle } from "../../policy/src/contracts.js";
import type { EngramRuntimeStore } from "./store.js";
import {
  evaluateAdmissionSignal,
  evaluateInfluenceMemory,
  evaluateRecallCandidate,
} from "./policy.js";
import type {
  RuntimeCompleteInput,
  RuntimeCompleteResult,
  RuntimeDecisionInput,
  RuntimeDecisionRecord,
  RuntimeEvaluationEvent,
  RuntimeExecutionRecord,
  RuntimeObservationInput,
  RuntimePolicyBundle,
  RuntimeRecallResult,
} from "./types.js";

export class EngramRuntime {
  constructor(
    private readonly store: EngramRuntimeStore,
    private readonly fallbackPolicies: RuntimePolicyBundle,
    private readonly policyRegistry?: MemoryPolicyRegistry,
  ) {}

  async startExecution(input: unknown): Promise<{ executionId: string }> {
    const parsed = ExecutionContextSchema.parse(input);
    if (this.policyRegistry && !this.store.setExecutionMemoryPolicy) {
      throw new Error("Configured policy registry requires a runtime store that can freeze execution policy versions");
    }

    const resolved = this.policyRegistry
      ? await this.policyRegistry.resolve({
          agentId: parsed.agentId,
          workflowType: parsed.workflowType,
          environmentVersion: parsed.environmentVersion,
        })
      : null;

    const started = await this.store.startExecution(parsed);
    if (resolved) {
      await this.store.setExecutionMemoryPolicy!(started.executionId, resolved.bundle.bundleVersion);
    }
    return started;
  }

  async recall(input: {
    executionId: string;
    query: string;
    status?: Array<"SUCCESS" | "FAILURE" | "PARTIAL" | "COMPENSATED" | "ABORTED" | "UNKNOWN">;
  }): Promise<RuntimeRecallResult> {
    const execution = await this.requireRunningExecution(input.executionId);
    const policies = await this.policiesFor(execution);
    const raw = await this.store.searchMemory({
      agentId: execution.agentId,
      executionId: execution.id,
      query: input.query,
      workflowType: execution.workflowType,
      status: input.status,
      environmentVersion: policies.retrieval.requireEnvironmentMatch
        ? execution.environmentVersion
        : undefined,
      retrievalPolicyVersion: policies.retrieval.policyVersion,
      limit: policies.retrieval.maxCandidates,
    });

    const accepted: RuntimeRecallResult["candidates"] = [];
    const rejected: RuntimeRecallResult["rejected"] = [];

    for (const candidate of raw.candidates) {
      const reasons = evaluateRecallCandidate(candidate.memory, execution, policies);
      if (candidate.finalScore < policies.retrieval.minimumScore) reasons.push("SCORE_BELOW_THRESHOLD");

      if (reasons.length > 0) {
        rejected.push({ memoryId: candidate.memory.id, reasons });
        continue;
      }

      accepted.push({
        memory: candidate.memory,
        rank: accepted.length + 1,
        score: candidate.finalScore,
        semanticScore: candidate.semanticScore,
        contextScore: candidate.contextScore,
        outcomeScore: candidate.outcomeScore,
        confidenceScore: candidate.confidenceScore,
        recencyScore: candidate.recencyScore,
      });
    }

    const recall = MemoryRecallSchema.parse({
      id: raw.retrievalId,
      executionId: execution.id,
      query: input.query,
      policyVersion: policies.retrieval.policyVersion,
      recalledAt: new Date(),
      candidates: accepted.map((candidate) => ({
        retrievalId: raw.retrievalId,
        memoryId: candidate.memory.id,
        rank: candidate.rank,
        score: candidate.score,
      })),
    });

    await this.store.updateRecallExposure({
      retrievalId: raw.retrievalId,
      exposedMemoryIds: accepted.map((candidate) => candidate.memory.id),
      rejected,
    });
    await this.evaluation(execution.id, rejected.length ? "RECALL_FILTERED" : "RECALL_COMPLETED", {
      retrievalId: recall.id,
      exposedMemoryIds: recall.candidates.map((candidate) => candidate.memoryId),
      rejected,
      policyVersion: recall.policyVersion,
      memoryPolicyBundleVersion: execution.memoryPolicyBundleVersion ?? null,
    });

    return { recall, candidates: accepted, rejected };
  }

  async recordDecision(input: RuntimeDecisionInput): Promise<RuntimeDecisionRecord> {
    const execution = await this.requireRunningExecution(input.executionId);
    const policies = await this.policiesFor(execution);
    const influences = (input.influences ?? []).map((influence) => MemoryInfluenceSchema.parse(influence));
    const recalls = await this.store.getRecalls(execution.id);

    try {
      assertDecisionInfluencesValid({ executionId: execution.id, influences }, recalls);
      await this.assertInfluencePolicy(execution, influences, policies);
    } catch (error) {
      await this.evaluation(execution.id, "INFLUENCE_REJECTED", {
        decisionType: input.decisionType,
        message: error instanceof Error ? error.message : String(error),
        memoryIds: influences.map((influence) => influence.memoryId),
        memoryPolicyBundleVersion: execution.memoryPolicyBundleVersion ?? null,
      });
      throw error;
    }

    const decision: RuntimeDecisionRecord = {
      ...input,
      id: input.id ?? randomUUID(),
      alternatives: input.alternatives ?? [],
      influences,
      decidedAt: input.decidedAt ?? new Date(),
    };

    await this.store.recordRuntimeDecision(decision);
    if (influences.length) {
      await this.evaluation(execution.id, "INFLUENCE_ACCEPTED", {
        decisionId: decision.id,
        influences,
        policyVersion: policies.influence.policyVersion,
        memoryPolicyBundleVersion: execution.memoryPolicyBundleVersion ?? null,
      });
    }
    await this.evaluation(execution.id, "DECISION_RECORDED", {
      decisionId: decision.id,
      decisionType: decision.decisionType,
      influenceCount: influences.length,
    });
    return decision;
  }

  async observe(input: RuntimeObservationInput): Promise<void> {
    await this.requireRunningExecution(input.executionId);
    await this.store.appendEvent({
      id: input.id ?? randomUUID(),
      executionId: input.executionId,
      sequenceNo: await this.nextSequence(input.executionId),
      eventType: input.type,
      payload: {
        ...input.payload,
        provenance: input.provenance ?? [],
      },
      evidenceState: input.evidenceState,
      occurredAt: input.observedAt ?? new Date(),
    });
  }

  async complete(input: RuntimeCompleteInput): Promise<RuntimeCompleteResult> {
    const execution = await this.requireRunningExecution(input.executionId);
    const policies = await this.policiesFor(execution);
    const outcome = OutcomeSchema.parse({
      id: randomUUID(),
      executionId: execution.id,
      status: input.status,
      failureType: input.failureType,
      summary: input.summary,
      result: input.result ?? {},
      evidenceState: input.evidenceState,
    });
    await this.store.recordOutcome(outcome);

    const admittedMemories: OperationalMemory[] = [];
    const rejectedSignals: RuntimeCompleteResult["rejectedSignals"] = [];

    for (const signal of input.admissionSignals ?? []) {
      const reasons = evaluateAdmissionSignal(signal, policies);
      if (reasons.length) {
        rejectedSignals.push({ kind: signal.kind, reasons });
        await this.evaluation(execution.id, "MEMORY_NOT_ADMITTED", {
          kind: signal.kind,
          reasons,
          memoryPolicyBundleVersion: execution.memoryPolicyBundleVersion ?? null,
        });
        continue;
      }

      const memory: OperationalMemory = {
        id: randomUUID(),
        agentId: execution.agentId,
        memoryType: signal.kind,
        summary: signal.summary,
        structuredContext: {
          ...signal.details,
          sourceExecutionId: execution.id,
          workflowType: execution.workflowType,
          outcome: input.status,
        },
        confidence: signal.confidence ?? defaultConfidence(signal.evidenceState),
        evidenceState: signal.evidenceState,
        validFrom: input.completedAt ?? new Date(),
        environmentVersion: execution.environmentVersion,
        toolVersion: execution.toolVersion,
        policyVersion: policies.admission.policyVersion,
      };
      await this.store.persistMemory(memory, [execution.id]);
      admittedMemories.push(memory);
      await this.evaluation(execution.id, "MEMORY_ADMITTED", {
        memoryId: memory.id,
        kind: signal.kind,
        policyVersion: policies.admission.policyVersion,
        memoryPolicyBundleVersion: execution.memoryPolicyBundleVersion ?? null,
      });
    }

    return { executionId: execution.id, admittedMemories, rejectedSignals };
  }

  async trace(executionId: string): Promise<unknown> {
    return this.store.getTrace(executionId);
  }

  async inspectMemory(memoryId: string): Promise<OperationalMemory | null> {
    return this.store.getMemory(memoryId);
  }

  async compareExecutions(leftExecutionId: string, rightExecutionId: string): Promise<{
    left: unknown;
    right: unknown;
  }> {
    const [left, right] = await Promise.all([
      this.store.getTrace(leftExecutionId),
      this.store.getTrace(rightExecutionId),
    ]);
    return { left, right };
  }

  private async policiesFor(execution: RuntimeExecutionRecord): Promise<RuntimePolicyBundle> {
    if (!execution.memoryPolicyBundleVersion) return this.fallbackPolicies;
    if (!this.policyRegistry) {
      throw new Error(`Execution ${execution.id} requires frozen memory policy ${execution.memoryPolicyBundleVersion}, but no policy registry is configured`);
    }
    const registered = await this.policyRegistry.get(execution.memoryPolicyBundleVersion);
    if (!registered) {
      throw new Error(`Frozen memory policy ${execution.memoryPolicyBundleVersion} for execution ${execution.id} no longer exists`);
    }
    return runtimePolicies(registered.bundle);
  }

  private async assertInfluencePolicy(
    execution: RuntimeExecutionRecord,
    influences: MemoryInfluence[],
    policies: RuntimePolicyBundle,
  ): Promise<void> {
    for (const influence of influences) {
      const memory = await this.store.getMemory(influence.memoryId);
      if (!memory) throw new Error(`Influential memory ${influence.memoryId} does not exist`);
      const reasons = evaluateInfluenceMemory(memory, execution, policies);
      if (
        influence.influenceType === "CHANGED_ACTION" &&
        policies.influence.requireCounterfactualForChangedAction &&
        !influence.counterfactual
      ) {
        reasons.push("COUNTERFACTUAL_REQUIRED_BY_POLICY");
      }
      if (reasons.length) {
        throw new Error(`Memory ${memory.id} is not eligible to influence this execution: ${reasons.join(", ")}`);
      }
    }
  }

  private async requireRunningExecution(executionId: string) {
    const execution = await this.store.getExecution(executionId);
    if (!execution) throw new Error(`Execution ${executionId} does not exist`);
    if (execution.status !== "RUNNING") {
      throw new Error(`Execution ${executionId} is ${execution.status}; operation requires RUNNING`);
    }
    return execution;
  }

  private async nextSequence(executionId: string): Promise<number> {
    const trace = await this.store.getTrace(executionId) as { events?: unknown[] } | null;
    return Array.isArray(trace?.events) ? trace.events.length : 0;
  }

  private async evaluation(
    executionId: string,
    eventType: RuntimeEvaluationEvent["eventType"],
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.store.appendRuntimeEvaluationEvent({
      id: randomUUID(),
      executionId,
      eventType,
      payload,
      createdAt: new Date(),
    });
  }
}

function runtimePolicies(bundle: MemoryPolicyBundle): RuntimePolicyBundle {
  return {
    admission: bundle.admission,
    retrieval: bundle.retrieval,
    influence: bundle.influence,
    expiry: bundle.expiry,
  };
}

function defaultConfidence(evidenceState: OperationalMemory["evidenceState"]): number {
  switch (evidenceState) {
    case "VERIFIED": return 0.98;
    case "OBSERVED": return 0.9;
    case "SIMULATED": return 0.75;
    case "INFERRED": return 0.65;
    case "PROPOSED": return 0.45;
    case "UNKNOWN": return 0.25;
  }
}
