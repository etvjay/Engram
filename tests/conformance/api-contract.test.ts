import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { handler } from "../../services/api/src/handler.js";

function event(method: string, rawPath: string, queryStringParameters?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    rawPath,
    queryStringParameters,
  };
}

describe("Engram API contract", () => {
  it("serves health without requiring database configuration", async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const result = await handler(event("GET", "/health"));
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body) as {
        status: string;
        protocolBoundary: Record<string, string>;
      };
      expect(body.status).toBe("ok");
      expect(body.protocolBoundary.externalExecution).toBe("APPLICATION_DEFINED");
      expect(body.protocolBoundary.operationalMemory).toBe("ENGRAM_MANAGED");
      expect(body.protocolBoundary.decisionAuthority).toBe("APPLICATION_OWNED");
      expect(body.protocolBoundary.demoExternalExecution).toBe("SIMULATED");
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });

  it("returns 404 for unknown routes without initializing CockroachDB", async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const result = await handler(event("GET", "/v1/not-a-route"));
      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toMatchObject({ error: "NOT_FOUND" });
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });

  it("validates control-plane UUID filters before database access", async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const result = await handler(event("GET", "/v1/control-plane/executions", { agentId: "not-a-uuid" }));
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toMatchObject({ error: "INVALID_REQUEST" });
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });

  it("keeps SAM routes aligned with the canonical control-plane paths", async () => {
    const template = await readFile(new URL("../../template.yaml", import.meta.url), "utf8");
    for (const route of [
      "/v1/control-plane/overview",
      "/v1/control-plane/agents",
      "/v1/control-plane/executions",
      "/v1/control-plane/memories",
      "/v1/control-plane/influences",
      "/v1/control-plane/policies",
      "/v1/control-plane/policy-assignments",
      "/v1/control-plane/memories/{id}/evaluation",
      "/v1/demo/run",
    ]) {
      expect(template).toContain(route);
    }
    expect(template).not.toContain("/v1/control/overview");
  });
});
