import { afterEach, describe, expect, it } from "vitest";
import { authorizeInspection, requiresInspectionAuthorization } from "../../services/api/src/auth.js";
import { handler } from "../../services/api/src/handler.js";

const originalToken = process.env.ENGRAM_INSPECTION_TOKEN;

afterEach(() => {
  if (originalToken === undefined) delete process.env.ENGRAM_INSPECTION_TOKEN;
  else process.env.ENGRAM_INSPECTION_TOKEN = originalToken;
});

describe("inspection authorization", () => {
  it("protects inspection surfaces while leaving public runtime/demo operations outside this gate", () => {
    expect(requiresInspectionAuthorization("GET", "/v1/mcp/status")).toBe(true);
    expect(requiresInspectionAuthorization("GET", "/v1/control-plane/memories")).toBe(true);
    expect(requiresInspectionAuthorization("GET", "/v1/executions/11111111-1111-4111-8111-111111111111/trace")).toBe(true);
    expect(requiresInspectionAuthorization("POST", "/v1/memory/search")).toBe(true);

    expect(requiresInspectionAuthorization("GET", "/health")).toBe(false);
    expect(requiresInspectionAuthorization("POST", "/v1/demo/run")).toBe(false);
    expect(requiresInspectionAuthorization("POST", "/v1/executions")).toBe(false);
  });

  it("fails closed when no deployment token is configured", () => {
    expect(authorizeInspection({ authorization: "Bearer anything" }, undefined)).toEqual({
      ok: false,
      statusCode: 503,
      error: "INSPECTION_AUTH_NOT_CONFIGURED",
    });
  });

  it("accepts only the exact bearer token", () => {
    expect(authorizeInspection(undefined, "secret")).toMatchObject({ ok: false, statusCode: 401 });
    expect(authorizeInspection({ Authorization: "Bearer wrong" }, "secret")).toMatchObject({ ok: false, statusCode: 401 });
    expect(authorizeInspection({ authorization: "Bearer secret" }, "secret")).toEqual({ ok: true });
  });

  it("rejects a protected handler route before database access when auth is unconfigured", async () => {
    delete process.env.ENGRAM_INSPECTION_TOKEN;
    const result = await handler({
      requestContext: { http: { method: "GET" } },
      rawPath: "/v1/control-plane/overview",
    });
    expect(result.statusCode).toBe(503);
    expect(JSON.parse(result.body)).toEqual({ error: "INSPECTION_AUTH_NOT_CONFIGURED" });
  });

  it("rejects an incorrect handler bearer token before database access", async () => {
    process.env.ENGRAM_INSPECTION_TOKEN = "expected";
    const result = await handler({
      requestContext: { http: { method: "GET" } },
      rawPath: "/v1/control-plane/overview",
      headers: { authorization: "Bearer wrong" },
    });
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body)).toEqual({ error: "UNAUTHORIZED" });
  });
});
