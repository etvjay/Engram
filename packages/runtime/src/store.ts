import type { MemoryRecall } from "../../core/src/protocol.js";
import type {
  ExecutionContext,
  ExecutionEvent,
  MemorySearchInput,
  MemorySearchResult,
  OperationalMemory,
  Outcome,
} from "../../memory-core/src/domain.js";
import type {
  RecallExposureUpdate,
  RuntimeDecisionRecord,
  RuntimeEvaluationEvent,
  RuntimeExecutionRecord,
} from "./types.js";

export interface EngramRuntimeStore {
  startExecution(input: ExecutionContext): Promise<{ executionId: string }>;
  getExecution(executionId: string): Promise<RuntimeExecutionRecord | null>;

  appendEvent(event: ExecutionEvent): Promise<void>;
  recordOutcome(outcome: Outcome): Promise<void>;

  searchMemory(input: MemorySearchInput): Promise<MemorySearchResult>;
  getMemory(memoryId: string): Promise<OperationalMemory | null>;
  persistMemory(memory: OperationalMemory, sourceExecutionIds: string[]): Promise<void>;

  getRecalls(executionId: string): Promise<MemoryRecall[]>;
  updateRecallExposure(update: RecallExposureUpdate): Promise<void>;

  recordRuntimeDecision(decision: RuntimeDecisionRecord): Promise<void>;
  appendRuntimeEvaluationEvent(event: RuntimeEvaluationEvent): Promise<void>;

  getTrace(executionId: string): Promise<unknown>;
}
