import { timingSafeEqual } from "node:crypto";

export type InspectionAuthorization =
  | { ok: true }
  | { ok: false; statusCode: 401 | 503; error: "UNAUTHORIZED" | "INSPECTION_AUTH_NOT_CONFIGURED" };

function normalizedHeader(headers: Record<string, string | undefined> | undefined, name: string): string | undefined {
  if (!headers) return undefined;
  const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : undefined;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requiresInspectionAuthorization(method: string, path: string): boolean {
  if (method === "GET" && path.startsWith("/v1/mcp/")) return true;
  if (method === "GET" && path.startsWith("/v1/control/")) return true;
  if (method === "GET" && /^\/v1\/memories\/[0-9a-fA-F-]{36}\/evaluation$/.test(path)) return true;
  if (method === "GET" && /^\/v1\/executions\/[0-9a-fA-F-]{36}\/trace$/.test(path)) return true;
  if (method === "POST" && path === "/v1/memory/search") return true;
  return false;
}

/**
 * Inspection endpoints expose execution/memory/provenance data. They fail
 * closed unless a deployment supplies ENGRAM_INSPECTION_TOKEN.
 */
export function authorizeInspection(
  headers: Record<string, string | undefined> | undefined,
  expectedToken = process.env.ENGRAM_INSPECTION_TOKEN?.trim(),
): InspectionAuthorization {
  if (!expectedToken) {
    return { ok: false, statusCode: 503, error: "INSPECTION_AUTH_NOT_CONFIGURED" };
  }

  const authorization = normalizedHeader(headers, "authorization")?.trim();
  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return { ok: false, statusCode: 401, error: "UNAUTHORIZED" };
  }

  const supplied = authorization.slice(7).trim();
  if (!supplied || !safeEqual(supplied, expectedToken)) {
    return { ok: false, statusCode: 401, error: "UNAUTHORIZED" };
  }

  return { ok: true };
}
