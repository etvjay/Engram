import { Client, StreamableHTTPClientTransport, type Tool } from "@modelcontextprotocol/client";

const DEFAULT_MCP_URL = "https://cockroachlabs.cloud/mcp";
const EXPECTED_READ_TOOLS = [
  "list_databases",
  "list_tables",
  "get_table_schema",
  "select_query",
  "explain_query",
] as const;

export type CockroachMcpConfig = {
  url: string;
  clusterId: string;
  apiKey?: string;
  database?: string;
};

export type