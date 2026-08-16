import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { handler } from "../../services/api/src/handler.js";

function event(
  method: string,
  rawPath: string,
  queryStringParameters?: Record<string, string>,
  headers?: Record<string, string>,
) {
  return {
    requestContext: { http: { method } },
    rawPath,
    queryStringParameters,
    headers,
  };
}

async function withEnv<T>(name: string, value: string | undefined, fn: () => Promise<T>): Promise<T> {
  const previous = process.env[name];
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
  try {
    return await fn();
  } finally {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  }
}

describe("Engram API contract", () => {
  it("serves health without requiring database or inspection-token configuration", async () => {
    await withEnv("DATABASE_URL", undefined, async () => {
      await withEnv("ENGRAM_INSPECTION_TOKEN", undefined, async () => {
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
      });
    });
  });

  it("returns 404 for unknown routes without initializing CockroachDB", async () => {
    await withEnv("DATABASE_URL", undefined, async () => {
      const result = await handler(event("GET", "/v1/not-a-route"));
      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toMatchObject({ error: "NOT_FOUND" });
    });
  });

  it("fails closed when an inspection route has no configured token", async () => {
    await withEnv("DATABASE_URL", undefined, async () => {
      await withEnv("ENGRAM_INSPECTION_TOKEN", undefined, async () => {
        const result = await handler(event("GET", "/v1/control-plane/overview"));
        expect(result.statusCode).toBe(503);
        expect(JSON.parse(result.body)).toEqual({ error: "INSPECTION_AUTH_NOT_CONFIGURED" });
      });
    });
  });

  it("rejects an incorrect inspection bearer token before database access", async () => {
    await withEnv("DATABASE_URL", undefined, async () => {
      await withEnv("ENGRAM_INSPECTION_TOKEN", "correct-token", async () => {
        const result = await handler(event(
          "GET",
          "/v1/control-plane/overview",
          undefined,
          { authorization: "Bearer wrong-token" },
        ));
        expect(result.statusCode).toBe(401);
        expect(JSON.parse(result.body)).toEqual({ error: "UNAUTHORIZED" });
      });
    });
  });

  it("validates control-plane UUID filters after valid authorization but before database access", async () => {
    await withEnv("DATABASE_URL", undefined, async () => {
      await withEnv("ENGRAM_INSPECTION_TOKEN", "inspection-token", async () => {
        const result = await handler(event(
          "GET",
          "/v1/control-plane/executions",
          { agentId: "not-a-uuid" },
          { Authorization: "Bearer inspection-token" },
        ));
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toMatchObject({ error: "INVALID_REQUEST" });
      });
    });
  });

  it("keeps SAM routes and inspection-token deployment configuration aligned", async () => {
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
    expect(template).toContain("InspectionToken:");
    expect(template).toContain("ENGRAM_INSPECTION_TOKEN: !Ref InspectionToken");
    expect(template).not.toContain("/v1/control/overview");
  });
});
