import type { OperationalMemory, Outcome } from "./domain.js";
import type { SimulationResult } from "../../execution-simulator/src/index.js";
import { randomUUID } from "node:crypto";

export type AdmissionInput = {
  agentId: string;
  executionId: string;
  workflowType: string;
  environmentVersion?: string;
  toolVersion?: string;
  policyVersion?: string;
  outcome: Outcome;
  simulation: SimulationResult;
};

export function admitOperationalMemory(input: AdmissionInput): OperationalMemory | null {
  const { outcome, simulation } = input;

  const notable =
    outcome.status === "COMPENSATED" ||
    outcome.status === "FAILURE" ||
    outcome.status === "PARTIAL" ||
    outcome.status === "ABORTED" ||
    outcome.status === "UNKNOWN";

  if (!notable) return null;
  if (!simulation.failedVenue || outcome.failureType !== "LIQUIDITY_UNAVAILABLE") return null;

  return {
    id: randomUUID(),
    agentId: input.agentId,
    memoryType: "OPERATIONAL_LESSON",
    summary: `Venue ${simulation.failedVenue} failed under insufficient liquidity; avoid it under comparable conditions or revalidate liquidity before prior commitments.`,
    structuredContext: {
      workflowType: input.workflowType,
      sourceExecutionId: input.executionId,
      failureType: outcome.failureType,
      failedVenue: simulation.failedVenue,
      outcome: outcome.status,
      recoveryStrategy: simulation.recovery?.strategy,
      capitalRecovered: simulation.recovery?.capitalRecovered ?? false,
    },
    confidence: outcome.status === "COMPENSATED" ? 0.91 : 0.82,
    evidenceState: outcome.evidenceState,
    environmentVersion: input.environmentVersion,
    toolVersion: input.toolVersion,
    policyVersion: input.policyVersion,
  };
}
