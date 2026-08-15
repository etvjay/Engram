import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

const DEFAULT_MCP_URL = "https://cockroachlabs.cloud/mcp";
const READ_TOOL_ALLOWLIST = new Set([
  "list_clusters",
  "get_cluster",
  "list_databases",
  "list_tables",
  "get_table_schema",
  "select_query",
  "explain_query",
  "show_running_queries",
]);

export type CockroachMcpConfig = {
  url: string;
  clusterId: string;
  apiKey?: string;
};

export type CockroachMcpStatus = {
  configured: boolean;
  connected: boolean;
  serverUrl: string;
  clusterId?: string;
  availableTools: string[];
  readTools: string[];
  missingExpectedTools: string[];
};

export function getCockroachMcpConfig(): CockroachMcpConfig | null {
  const clusterId = process.env.COCKROACH_MCP_CLUSTER_ID?.trim();
  if (!clusterId) return null;

  return {
    url: process.env.COCKROACH_MCP_URL?.trim() || DEFAULT_MCP_URL,
    clusterId,
    apiKey: process.env.COCKROACH_MCP_API_KEY?.trim() || undefined,
  };
}

function withCockroachHeaders(config: CockroachMcpConfig): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("mcp-cluster-id", config.clusterId);
    if (config.apiKey) headers.set("authorization", `Bearer ${config.apiKey}`);
    return fetch(input, { ...init, headers });
  };
}

export class CockroachManagedMcpClient {
  private readonly client = new Client({ name: "engram", version: "0.1.0" });
  private connected = false;

  constructor(private readonly config: CockroachMcpConfig) {}

  async connect(): Promise<void> {
    if (this.connected) return;
    const transport = new StreamableHTTPClientTransport(new URL(this.config.url), {
      fetch: withCockroachHeaders(this.config),
    });
    await this.client.connect(transport);
    this.connected = true;
  }

  async close(): Promise<void> {
    if (!this.connected) return;
    await this.client.close();
    this.connected = false;
  }

  async status(): Promise<CockroachMcpStatus> {
    await this.connect();
    const tools = await this.client.listTools();
    const availableTools = tools.tools.map((tool) => tool.name).sort();
    const readTools = availableTools.filter((name) => READ_TOOL_ALLOWLIST.has(name));
    const expected = ["list_databases", "list_tables", "get_table_schema", "select_query", "explain_query"];

    return {
      configured: true,
      connected: true,
      serverUrl: this.config.url,
      clusterId: this.config.clusterId,
      availableTools,
      readTools,
      missingExpectedTools: expected.filter((name) => !availableTools.includes(name)),
    };
  }

  async callReadTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!READ_TOOL_ALLOWLIST.has(name)) {
      throw new Error(`MCP tool ${name} is not permitted by Engram's read-only MCP policy`);
    }
    await this.connect();
    const tools = await this.client.listTools();
    if (!tools.tools.some((tool) => tool.name === name)) {
      throw new Error(`MCP tool ${name} is not exposed by the connected CockroachDB server`);
    }
    return this.client.callTool({ name, arguments: args });
  }
}

export async function getCockroachMcpStatus(): Promise<CockroachMcpStatus> {
  const config = getCockroachMcpConfig();
  if (!config) {
    return {
      configured: false,
      connected: false,
      serverUrl: DEFAULT_MCP_URL,
      availableTools: [],
      readTools: [],
      missingExpectedTools: ["list_databases", "list_tables", "get_table_schema", "select_query", "explain_query"],
    };
  }

  const client = new CockroachManagedMcpClient(config);
  try {
    return await client.status();
  } finally {
    await client.close();
  }
}
