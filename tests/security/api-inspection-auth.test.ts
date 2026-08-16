import { describe, expect, it } from "vitest";
import { authorizeInspection, requiresInspectionAuthorization } from "../../services/api/src/auth.js";

const UUID = "11111111-1111-4111-8111-111111111111";

describe("inspection authorization", () => {
  it("classifies every read-oriented inspection surface as protected", () => {
    const protectedRoutes: Array<[string, string]> = [
      ["GET", "/v1/mcp/status"],
      ["GET", `/v1/mcp/memories/${UUID}/provenance`],
      ["GET", "/v1/control-plane/overview"],
      ["GET", "/v1/control-plane/agents"],
      ["GET", "/v1/control-plane/executions"],
      ["GET", "/v1/control-plane/memories"],
      ["GET", "/v1/control-plane/influences"],
      ["GET", "/v1/control-plane/policies"],
      ["GET", "/v1/control-plane/policy-assignments"],
      ["GET", `/v1/control-plane/memories/${UUID}/evaluation`],
      ["GET", `/v1/executions/${UUID}/trace`],
      ["POST", "/v1/memory/search"],
    ];

    for (const [method, path] of protectedRoutes) {
      expect(requiresInspectionAuthorization(method, path), `${method} ${path}`).toBe(true);
    }
  });

  it("does not classify health or execution lifecycle writes as inspection endpoints", () => {
    const applicationRoutes: Array<[string, string]> = [
      ["GET", "/health"],
      ["POST", "/v1/executions"],
      ["POST", `/v1/executions/${UUID}/recall`],
      ["POST", `/v1/executions/${UUID}/decisions`],
      ["POST", `/v1/executions/${UUID}/observations`],
      ["POST", `/v1/executions/${UUID}/complete`],
      ["POST", "/v1/demo/run"],
    ];

    for (const [method, path] of applicationRoutes) {
      expect(requiresInspectionAuthorization(method, path), `${method} ${path}`).toBe(false);
    }
  });

  it("fails closed when inspection auth is unconfigured or invalid", () => {
    expect(authorizeInspection(undefined, undefined)).toEqual({
      ok: false,
      statusCode: 503,
      error: "INSPECTION_AUTH_NOT_CONFIGURED",
    });
    expect(authorizeInspection({ authorization: "Bearer wrong" }, "expected")).toEqual({
      ok: false,
      statusCode: 401,
      error: "UNAUTHORIZED",
    });
    expect(authorizeInspection({ Authorization: "Bearer expected" }, "expected")).toEqual({ ok: true });
  });
});
