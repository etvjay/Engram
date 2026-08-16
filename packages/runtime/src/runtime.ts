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
import type { MemoryEligibilityAdvisor } from "./eligibility.js";
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
  RuntimeDecision