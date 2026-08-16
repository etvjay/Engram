import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  CounterfactualSchema,
  MemoryInfluenceSchema,
  MemoryRecallSchema,
} from "../../packages/core/src/protocol.js";
import { ExecutionEpisodeSchema, EXECUTION_EPISODE_SCHEMA_VERSION } from "../../packages/episode/src/schema.js";
import {
  AdmissionPolicySchema,
  ExpiryPolicySchema,
  InfluencePolicySchema,
  MEMORY_POLICY_CONTRACT_VERSION,
  RetrievalPolicySchema,
} from "../../packages/policy/src/contracts.js";

function uuid() {
  return randomUUID();
}

describe("Engram protocol conformance", () => {
  it("allows recall without claiming influence", () => {
    const retrievalId = uuid();
    const memoryId = uuid();
    const executionId = uuid();

    const recall = MemoryRecallSchema.parse({
      id: retrievalId,
      executionId,
      query: "prior deployment failures in this environment",
      policyVersion: "retrieval-v1",
      recalledAt: new Date(),
      candidates: [{ retrievalId, memoryId, rank: 1, score: 0.91 }],
    });

    expect(recall.candidates).toHaveLength(1);
  });

  it("requires an explicit counterfactual source", () => {
    expect(() => CounterfactualSchema.parse({
      action: { route: "C" },
      evidenceState: "OBSERVED",
      explanation: "baseline action",
    })).toThrow();
  });

  it("accepts an influence only when its semantics are explicit", () => {
    const influence = MemoryInfluenceSchema.parse({
      memoryId: uuid(),
      retrievalId: uuid(),
      influenceType: "CHANGED_ACTION",
      summary: "Prior failure caused the agent to avoid the baseline action.",
      counterfactual: {
        action: { route: "C" },
        source: "CONTROL_RUN",
        evidenceState: "OBSERVED",
        explanation: "Control run selected Route C without memory.",
      },
    });

    expect(influence.influenceType).toBe("CHANGED_ACTION");
  });

  it("validates the portable execution episode envelope", () => {
    const episode = ExecutionEpisodeSchema.parse({
      schemaVersion: EXECUTION_EPISODE_SCHEMA_VERSION,
      protocolVersion: "engram.protocol/v1",
      id: uuid(),
      agent: { id: "deployment-agent", version: "1.0.0" },
      workflowType: "deployment",
      intent: "Deploy service safely",
      context: { service: "api" },
      constraints: { environment: "production" },
      environment: { environmentVersion: "prod-2026-08" },
      startedAt: new Date(),
      decisions: [],
      observations: [],
      provenance: [],
    });

    expect(episode.schemaVersion).toBe("engram.execution-episode/v1");
  });

  it("validates all four memory policy classes", () => {
    expect(AdmissionPolicySchema.parse({
      contractVersion: MEMORY_POLICY_CONTRACT_VERSION,
      policyVersion: "admission-v1",
      admitOn: ["UNEXPECTED_FAILURE"],
      minimumEvidence: "OBSERVED",
    }).policyVersion).toBe("admission-v1");

    expect(RetrievalPolicySchema.parse({
      contractVersion: MEMORY_POLICY_CONTRACT_VERSION,
      policyVersion: "retrieval-v1",
      maxCandidates: 8,
      minimumScore: 0.6,
      requireEnvironmentMatch: true,
      allowExpired: false,
    }).maxCandidates).toBe(8);

    expect(InfluencePolicySchema.parse({
      contractVersion: MEMORY_POLICY_CONTRACT_VERSION,
      policyVersion: "influence-v1",
      allowedEvidenceStates: ["VERIFIED", "OBSERVED"],
      minimumConfidence: 0.85,
      requireCounterfactualForChangedAction: true,
    }).minimumConfidence).toBe(0.85);

    expect(ExpiryPolicySchema.parse({
      contractVersion: MEMORY_POLICY_CONTRACT_VERSION,
      policyVersion: "expiry-v1",
      invalidateOnEnvironmentChange: true,
      invalidateOnToolMajorVersionChange: true,
    }).invalidateOnEnvironmentChange).toBe(true);
  });
});
