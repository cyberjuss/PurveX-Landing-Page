import "server-only";

// Which Claude models the Academy uses. In their own module so the Coach, the
// drill writer and the role research can share them without importing each other.
export const COACH_SONNET_MODEL = process.env.ACADEMY_COACH_MODEL || "claude-sonnet-5-5";
// The fast model is what every cheap, narrow job runs on. Haiku 5.5 costs a
// tenth of Haiku 4.5 per token and holds a far larger context, so a lookup or a
// graded answer is close to free beside a Sonnet turn.
export const COACH_HAIKU_MODEL = process.env.ACADEMY_COACH_FAST_MODEL || "claude-haiku-5-5";

export const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";

/**
 * The web search tool for a model. The dynamic-filtering version needs a
 * current Sonnet or Opus; Haiku and older models get the basic version.
 */
export function webSearchTool(model: string, maxUses: number) {
  const basic = /haiku|claude-3|sonnet-4-5|opus-4-5|opus-4-1|sonnet-4-2|opus-4-2/.test(model);
  return { type: basic ? "web_search_20250305" : "web_search_20260209", name: "web_search", max_uses: maxUses };
}
