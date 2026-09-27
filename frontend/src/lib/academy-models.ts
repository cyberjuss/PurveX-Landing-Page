import "server-only";

// Which Claude models the Academy uses. In their own module so the Coach, the
// drill writer and the role research can share them without importing each other.
export const COACH_SONNET_MODEL = process.env.ACADEMY_COACH_MODEL || "claude-sonnet-5";
export const COACH_HAIKU_MODEL = process.env.ACADEMY_COACH_FAST_MODEL || "claude-haiku-4-5";

export const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";

/**
 * The web search tool for a model. The dynamic-filtering version needs a
 * current Sonnet or Opus; Haiku and older models get the basic version.
 */
export function webSearchTool(model: string, maxUses: number) {
  const basic = /haiku|claude-3|sonnet-4-5|opus-4-5|opus-4-1|sonnet-4-2|opus-4-2/.test(model);
  return { type: basic ? "web_search_20250305" : "web_search_20260209", name: "web_search", max_uses: maxUses };
}
