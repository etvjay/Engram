import { z } from "zod";
import { createCockroachPool } from "../../../packages/cockroach/src/client.js";
import { CockroachControlPlaneStore } from "../../../packages/cockroach/src/control-plane.js";
import { CockroachMemoryEvaluationStore } from "../../../packages/cockroach/src/evaluation-store.js";

export type ControlPlaneRouteResult = {
  statusCode: number;
  payload: unknown;
} | null;

let controlPlane: CockroachControlPlaneStore | undefined;
let evaluation: CockroachMemoryEvaluationStore | undefined;

function stores() {
  if (!controlPlane || !evaluation) {
    const pool = createCockroachPool();
    controlPlane = new CockroachControlPlaneStore(pool);
    evaluation = new CockroachMemoryEvaluationStore(pool);
  }
  return { controlPlane, evaluation };
}

function optionalPositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error("limit must be a positive integer");
  return Math.min(parsed, 200);
}

function page(query: Record<string, string | undefined>) {
  return {
    cursor: query.cursor,
    limit: optionalPositiveInt(query.limit),
  };
}

export async function handleControlPlaneRoute(
  method: string,
  path: string,
  query: Record<string, string | undefined> = {},
): Promise<ControlPlaneRouteResult> {
  if (method !== "GET") return null;
  const { controlPlane, evaluation } = stores();

  if (path === "/v1/control-plane/overview") {
    return { statusCode: 200, payload: await controlPlane.overview() };
  }

  if (path === "/v1/control-plane/agents") {
    return { statusCode: 200, payload: await controlPlane.listAgents(page(query)) };
  }

  if (path === "/v1/control-plane/executions") {
    return {
      statusCode: 200,
      payload: await controlPlane.listExecutions({
        ...page(query),
        agentId: query.agentId ? z.string().uuid().parse(query.agentId) : undefined,
        status: query.status,
        workflowType: query.workflowType,
      }),
    };
  }

  if (path === "/v1/control-plane/memories") {
    return {
      statusCode: 200,
      payload: await controlPlane.listMemories({
        ...page(query),
        agentId: query.agentId ? z.string().uuid().parse(query.agentId) : undefined,
        evidenceState: query.evidenceState,
        memoryType: query.memoryType,
      }),
    };
  }

  if (path === "/v1/control-plane/influences") {
    return {
      statusCode: 200,
      payload: await controlPlane.listInfluences({
        ...page(query),
        executionId: query.executionId ? z.string().uuid().parse(query.executionId) : undefined,
        memoryId: query.memoryId ? z.string().uuid().parse(query.memoryId) : undefined,
        influenceType: query.influenceType,
      }),
    };
  }

  if (path === "/v1/control-plane/policies") {
    return { statusCode: 200, payload: await controlPlane.listPolicyBundles(page(query)) };
  }

  if (path === "/v1/control-plane/policy-assignments") {
    return { statusCode: 200, payload: await controlPlane.listPolicyAssignments(page(query)) };
  }

  const evaluationMatch = path.match(/^\/v1\/control-plane\/memories\/([0-9a-fA-F-]{36})\/evaluation$/);
  if (evaluationMatch?.[1]) {
    const memoryId = z.string().uuid().parse(evaluationMatch[1]);
    const [metrics, evaluations, relationships, experiments] = await Promise.all([
      evaluation.getUsefulnessMetrics(memoryId),
      evaluation.listEvaluations(memoryId),
      evaluation.listRelationships(memoryId),
      evaluation.listExperiments(memoryId),
    ]);
    return {
      statusCode: 200,
      payload: {
        memoryId,
        metrics,
        evaluations,
        relationships,
        experiments,
        interpretationBoundary: "Effect labels require explicit evaluation evidence; retrieval or later success alone is not treated as proof of benefit.",
      },
    };
  }

  return null;
}
