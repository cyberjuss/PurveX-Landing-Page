import { NextResponse } from "next/server";
import { COACH_TOOL_TITLES, COACH_TOOLS, MCP_INSTRUCTIONS, runCoachToolResult } from "@/lib/academy-coach";
import { getMcpPrompt, MCP_PROMPTS } from "@/lib/academy-mcp-prompts";
import { loadLabState, loadProgress, resolveMcpKey } from "@/lib/academy-store";

export const runtime = "nodejs";

// Range MCP server (Streamable HTTP, stateless, JSON responses).
// Students connect their own MCP client with a personal pvx_ key created in
// the Academy. Every tool is scoped to the key's student and none returns
// mission flags or explanations. Tools only read, except record_practice_result,
// which logs a practice question the student answered with their assistant,
// and the CTF tools. Prompts carry the web Coach's modes to the client.

const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"];
const SERVER_INFO = { name: "purvex-academy", title: "Range", version: "1.1.0" };

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
  if (!key) return unauthorized("Missing Range key. Create one in Range under Coach, Connect to Claude.");
  const userId = await resolveMcpKey(key);
  if (!userId) return unauthorized("This Range key is not valid. Create a new one in Range.");

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
        capabilities: { tools: { listChanged: false }, prompts: { listChanged: false } },
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
          title: COACH_TOOL_TITLES[t.name],
          description: t.description,
          inputSchema: t.input_schema,
          annotations: { readOnlyHint: !["record_practice_result", "start_investigation", "check_investigation"].includes(t.name), openWorldHint: false },
        })),
      });
    case "tools/call": {
      const name = String(params.name || "");
      if (!COACH_TOOLS.some((t) => t.name === name)) {
        return rpcError(id, -32602, `Unknown tool: ${name}`);
      }
      const args = params.arguments && typeof params.arguments === "object" ? (params.arguments as Record<string, unknown>) : {};
      const results = await loadProgress(userId);
      const { text, isError } = await runCoachToolResult(name, args, {
        results,
        loadLabState: async () => (await loadLabState(userId))?.snapshot ?? null,
        userId,
      });
      return rpcResult(id, { content: [{ type: "text", text }], isError });
    }
    case "prompts/list":
      return rpcResult(id, { prompts: MCP_PROMPTS });
    case "prompts/get": {
      const raw = params.arguments && typeof params.arguments === "object" ? (params.arguments as Record<string, unknown>) : {};
      const args = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? v : ""]));
      const prompt = getMcpPrompt(String(params.name || ""), args, await loadProgress(userId));
      if (!prompt) return rpcError(id, -32602, `Unknown prompt: ${String(params.name || "")}`);
      return rpcResult(id, prompt);
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
