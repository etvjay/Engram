import type { OperationalMemory } from "../../../memory-core/src/domain.js";

export type IncidentStrategy = "FLEET_RESTART" | "DRAIN_AND_CANARY_RESTART";

export type IncidentContext = {
  workflowType: "incident_recovery";
  service: string;
  symptom: "SATURATED_WORKERS";
  retrySensitive: boolean;
  environmentVersion: string;
};

export type IncidentDecision = {
  strategy: IncidentStrategy;
  memoryRefs: string[];
  reason: string;
  counterfactualStrategy?: IncidentStrategy;
};

export type IncidentResult = {
  status: "SUCCESS" | "PARTIAL";
  strategy: IncidentStrategy;
  primaryRecovered: boolean;
  secondaryFailure?: "RETRY_STORM";
  recoveryQuality: "CLEAN" | "DEGRADED";
};

export type RecalledIncidentMemory = {
  memory: OperationalMemory;
  finalScore: number;
};

const BASELINE: IncidentStrategy = "FLEET_RESTART";
const STAGED: IncidentStrategy = "DRAIN_AND_CANARY_RESTART";

export function decideIncidentStrategy(input: {
  context: IncidentContext;
  memories: RecalledIncidentMemory[];
}): IncidentDecision {
  const relevant = input.memories.find(({ memory, finalScore }) => {
    const context = memory.structuredContext;
    return finalScore >= 0.65
      && memory.confidence >= 0.8
      && context.workflowType === input.context.workflowType
      && context.symptom === input.context.symptom
      && context.secondaryFailure === "RETRY_STORM"
      && context.failedStrategy === BASELINE
      && context.recommendedStrategy === STAGED
      && input.context.retrySensitive;
  });

  if (!relevant) {
    return {
      strategy: BASELINE,
      memoryRefs: [],
      reason: "No applicable execution memory constrains the fleet-restart baseline.",
    };
  }

  return {
    strategy: STAGED,
    memoryRefs: [relevant.memory.id],
    counterfactualStrategy: BASELINE,
    reason: "A comparable fleet restart restored workers but caused a retry storm, so recovery is staged through drain and canary restart.",
  };
}

export function executeIncidentRecovery(
  strategy: IncidentStrategy,
  context: IncidentContext,
): IncidentResult {
  if (strategy === BASELINE && context.retrySensitive) {
    return {
      status: "PARTIAL",
      strategy,
      primaryRecovered: true,
      secondaryFailure: "RETRY_STORM",
      recoveryQuality: "DEGRADED",
    };
  }

  return {
    status: "SUCCESS",
    strategy,
    primaryRecovered: true,
    recoveryQuality: "CLEAN",
  };
}
