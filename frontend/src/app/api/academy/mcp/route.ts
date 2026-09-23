import { NextResponse } from "next/server";
import { COACH_TOOLS, MCP_INSTRUCTIONS, runCoachTool } from "@/lib/academy-coach";
import { loadLabState, loadProgress, resolveMcpKey } from "@/lib/academy-store";

export const runtime = "nodejs";

// PurveX Academy MCP server (Streamable HTTP, stateless, JSON responses).
// Students connect their own MCP client with a personal pvx_ key created in
// the Academy. Every tool is read-only and scoped to the key's student, and
// no tool returns mission flags or explanations.

const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"];
const SERVER_INFO = { name: "purvex-academy", title: "PurveX Academy", version: "1.0.0" };

type JsonRpcId = string | number | null;
type JsonRpcMessage = { jsonrpc?: string; id?: JsonRpcId; method?: string; params?: Record<string, unknown> };

function rpcResult(id: JsonRpcId, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: JsonRpcId, code: number, message: string, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status });
}

function unauthorized(message: string) {
  return NextResponse.json(
    { jsonrpc: "2.0", id: null, error: { code: -32001, message } },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="purvex-academy"' } }
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return rpcError(null, -32000, "Origin not allowed.", 403);
  }

  const version = request.headers.get("mcp-protocol-version");
  if (version && !SUPPORTED_VERSIONS.includes(version)) {
    return rpcError(null, -32000, `Unsupported MCP-Protocol-Version: ${version}`, 400);
  }

  const auth = request.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!key) return unauthorized("Missing PurveX Academy key. Create one in the Academy under Coach, Connect to Claude.");
  const userId = await resolveMcpKey(key);
  if (!userId) return unauthorized("This PurveX Academy key is not valid. Create a new one in the Academy.");

  let msg: JsonRpcMessage;
  try {
    msg = (await request.json()) as JsonRpcMessage;
  } catch {
    return rpcError(null, -32700, "Parse error", 400);
  }
  if (!msg || typeof msg !== "object" || Array.isArray(msg) || msg.jsonrpc !== "2.0") {
    return rpcError(null, -32600, "Invalid Request", 400);
  }

  // Notifications and client responses carry no id and get no body.
  if (msg.id === undefined || !msg.method) {
    return new NextResponse(null, { status: 202 });
  }

  const id = msg.id;
  const params = msg.params || {};

  switch (msg.method) {
    case "initialize": {
      const requested = String(params.protocolVersion || "");
      return rpcResult(id, {
        protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: MCP_INSTRUCTIONS,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, {
        tools: COACH_TOOLS.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.input_schema,
          annotations: { readOnlyHint: true, openWorldHint: false },
        })),
      });
    case "tools/call": {
      const name = String(params.name || "");
      if (!COACH_TOOLS.some((t) => t.name === name)) {
        return rpcError(id, -32602, `Unknown tool: ${name}`);
      }
      const args = params.arguments && typeof params.arguments === "object" ? (params.arguments as Record<string, unknown>) : {};
      const results = await loadProgress(userId);
      const text = await runCoachTool(name, args, {
        results,
        loadLabState: async () => (await loadLabState(userId))?.snapshot ?? null,
      });
      return rpcResult(id, { content: [{ type: "text", text }], isError: text.startsWith('{"error"') });
    }
    default:
      return rpcError(id, -32601, `Method not found: ${msg.method}`);
  }
}

export function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

export function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
