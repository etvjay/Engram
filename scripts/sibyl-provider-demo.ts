import { EngramRuntime } from "../packages/runtime/src/runtime.js";
import { DEFAULT_RUNTIME_POLICIES } from "../packages/runtime/src/defaults.js";
import { SibylRuntimeStore } from "../packages/sibyl/src/runtime-store.js";
import { decideProviderEngagement, type ProviderContinuityContext, type ProviderOffer } from "../packages/scenarios/provider-continuity/src/index.js";

const command = process.argv[2];
const offers: ProviderOffer[] = [
  { providerId: "atlas", priceUsd: 8, expectedLatencySeconds: 20 },
  { providerId: "beacon", priceUsd: 11, expectedLatencySeconds: 18 },
];

const baseContext: ProviderContinuityContext = {
  workflowType: "agent_provider_selection",
  taskType: "data_fetch",
  urgency: "URGENT",
  budgetUsd: 20,
  maxLatencySeconds: 30,
  environmentVersion: "provider-market-v1",
};

function emit(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function recordBreach(runtime: EngramRuntime, attempt: number) {
  const run = await runtime.startExecution({
    agentId: "requester-agent",
    workflowType: "agent_provider_selection",
    intent: "obtain urgent data from an eligible provider",
    context: { taskType: "data_fetch", urgency: "URGENT", providerId: "atlas", attempt },
    constraints: { maxLatencySeconds: 30 },
    environmentVersion: "provider-market-v1",
  });
  await runtime.observe({
    executionId: run.executionId,
    type: "PROVIDER_SLA_BREACH",
    payload: { providerId: "atlas", taskType: "data_fetch", latencySeconds: 55 + attempt },
    evidenceState: "OBSERVED",
  });
  await runtime.complete({
    executionId: run.executionId,
    status: "PARTIAL",
    failureType: "SLA_BREACH",
    summary: `Atlas breached the urgent SLA on attempt ${attempt}.`,
    result: { providerId: "atlas", failureType: "SLA_BREACH" },
    evidenceState: "OBSERVED",
  });
  return run.executionId;
}

async function seed() {
  const runtime = new EngramRuntime(new SibylRuntimeStore(), DEFAULT_RUNTIME_POLICIES);
  const first = await recordBreach(runtime, 1);
  const second = await recordBreach(runtime, 2);
  const admitting = await runtime.startExecution({
    agentId: "requester-agent",
    workflowType: "agent_provider_selection",
    intent: "consolidate repeated provider execution experience",
    context: { taskType: "data_fetch", providerId: "atlas", purpose: "relationship-state-update" },
    constraints: {},
    environmentVersion: "provider-market-v1",
  });
  const completed = await runtime.complete({
    executionId: admitting.executionId,
    status: "PARTIAL",
    summary: "Two requester-owned Atlas executions breached the urgent data-fetch SLA.",
    evidenceState: "OBSERVED",
    admissionSignals: [{
      kind: "REPEATED_PATTERN",
      summary: "Across two requester-owned executions, Atlas repeatedly breached urgent data-fetch SLAs. Guard urgent delegation and reduce prepayment authority on routine work.",
      evidenceState: "OBSERVED",
      confidence: 0.92,
      sourceExecutionIds: [first, second, admitting.executionId],
      details: {
        memoryPrimitive: "EXPERIENTIAL_RELATIONSHIP",
        taskType: "data_fetch",
        providerId: "atlas",
        relationshipPosture: "CONTEXT_GUARDED",
        failureType: "SLA_BREACH",
        breachCount: 2,
      },
    }],
  });
  emit({ phase: "provider-seed", sourceExecutions: [first, second, admitting.executionId], admittedMemoryIds: completed.admittedMemories.map((m) => m.id) });
}

async function decide(urgency: "URGENT" | "ROUTINE") {
  const runtime = new EngramRuntime(new SibylRuntimeStore(), DEFAULT_RUNTIME_POLICIES);
  const run = await runtime.startExecution({
    agentId: "requester-agent",
    workflowType: "agent_provider_selection",
    intent: `obtain ${urgency.toLowerCase()} data from an eligible provider`,
    context: { taskType: "data_fetch", urgency },
    constraints: { budgetUsd: 20, maxLatencySeconds: 30 },
    environmentVersion: "provider-market-v1",
  });
  const recalled = await runtime.recall({ executionId: run.executionId, query: "Atlas repeated data fetch SLA breaches relationship" });
  const context: ProviderContinuityContext = { ...baseContext, urgency };
  const control = decideProviderEngagement({ context, offers, memories: [] });
  const treatment = decideProviderEngagement({
    context,
    offers,
    memories: recalled.candidates.map((candidate) => ({ memory: candidate.memory, finalScore: candidate.score })),
  });
  emit({
    phase: urgency === "URGENT" ? "provider-urgent-fresh-session" : "provider-routine-fresh-session",
    recalledMemoryIds: recalled.candidates.map((c) => c.memory.id),
    control,
    memoryConditioned: treatment,
    providerChanged: control.providerId !== treatment.providerId,
    authorityChanged: JSON.stringify(control.terms) !== JSON.stringify(treatment.terms),
  });
}

switch (command) {
  case "seed": await seed(); break;
  case "urgent": await decide("URGENT"); break;
  case "routine": await decide("ROUTINE"); break;
  default: throw new Error("Usage: tsx scripts/sibyl-provider-demo.ts <seed|urgent|routine>");
}
