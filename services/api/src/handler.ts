import { z } from "zod";
import { createCockroachPool } from "../../../packages/cockroach/src/client.js";
import { CockroachMemoryRepository } from "../../../packages/cockroach/src/repository.js";
import { TitanEmbeddingProvider } from "../../../packages/bedrock/src/embeddings.js";
import { runEngramDemo } from "../../demo/src/run-demo.js";

export type ApiGatewayV2Event = {
  requestContext?: { http?: { method?: string } };
  rawPath?: string;
  pathParameters?: Record<string, string | undefined>;
  body?: string | null;
  isBase64Encoded?: boolean;
};

export type ApiGatewayV2Response = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

let repository: CockroachMemoryRepository | undefined;

function getRepository(): CockroachMemoryRepository {
  if (!repository) {
    repository = new CockroachMemoryRepository(createCockroachPool(), new TitanEmbeddingProvider());
  }
  return repository;
}

const SearchSchema = z.object({
  agentId: z.string().min(1),
  executionId: z.string().uuid().optional(),
  query: z.string().min(1),
  workflowType: z.string().min(1).optional(),
  environmentVersion: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

function response(statusCode: number, payload: unknown): ApiGatewayV2Response {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": process.env.CORS_ORIGIN ?? "*",
    },
    body: JSON.stringify(payload),
  };
}

function parseJsonBody(event: ApiGatewayV2Event): unknown {
  if (!event.body) return {};
  const body = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  return JSON.parse(body);
}

export async function handler(event: ApiGatewayV2Event): Promise<ApiGatewayV2Response> {
  const method = event.requestContext?.http?.method?.toUpperCase() ?? "GET";
  const path = event.rawPath ?? "/";

  try {
    if (method === "GET" && path === "/health") {
      return response(200, { service: "engram-api", status: "ok" });
    }

    if (method === "POST" && path === "/v1/demo/run") {
      const result = await runEngramDemo(getRepository());
      return response(200, result);
    }

    if (method === "POST" && path === "/v1/memory/search") {
      const input = SearchSchema.parse(parseJsonBody(event));
      const result = await getRepository().searchMemory(input);
      return response(200, result);
    }

    const traceMatch = path.match(/^\/v1\/executions\/([0-9a-fA-F-]{36})\/trace$/);
    if (method === "GET" && traceMatch?.[1]) {
      const executionId = z.string().uuid().parse(traceMatch[1]);
      const result = await getRepository().getTrace(executionId);
      return response(200, result);
    }

    return response(404, { error: "NOT_FOUND", method, path });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response(400, { error: "INVALID_REQUEST", details: error.issues });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    const memoryUnavailable = message.includes("DATABASE_URL") || message.includes("Bedrock") || message.includes("embedding");
    return response(503, {
      error: memoryUnavailable ? "MEMORY_UNAVAILABLE" : "SERVICE_UNAVAILABLE",
      message,
    });
  }
}
