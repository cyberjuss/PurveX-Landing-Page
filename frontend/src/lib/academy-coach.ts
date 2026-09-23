import "server-only";

import { labStateForTool, type LabSnapshot } from "@/lib/academy-lab";
import { findMissionsByQuery, MISSION_CATALOG } from "@/lib/academy-missions";
import {
  LEVELS,
  MISSION_SKILLS,
  missionPoints,
  SKILLS,
  summarize,
  type Results,
  type Skill,
} from "@/lib/academy-score";

export const COACH_DAILY_LIMIT = Number(process.env.ACADEMY_COACH_DAILY_LIMIT || 20);
export const COACH_SONNET_MODEL = process.env.ACADEMY_COACH_MODEL || "claude-sonnet-5";
export const COACH_HAIKU_MODEL = process.env.ACADEMY_COACH_FAST_MODEL || "claude-haiku-4-5";

export const COACH_SYSTEM_PROMPT = `You are the PurveX Academy cybersecurity coach. Your purpose is to help students develop practical IT help-desk and Active Directory skills.

Rules:
- Never immediately provide the answer to a hands-on mission, flag, or multiple-choice letter. Ask guiding questions first.
- Use the student's readiness score, mission history, and skill gaps when those tools return data.
- Explain concepts at the student's demonstrated skill level. If they are stuck, give a next check to run in Active Directory or PowerShell — not the flag.
- Do not invent lab state. If get_lab_state says the lab is not connected, tell the student what to look at in their own lab.
- When get_lab_state has a snapshot, use it to check what the student actually did (for example an account in the wrong group or OU). Point them to the object to inspect rather than reading out a value that answers an unsolved mission. Mention how old the snapshot is if it may be stale.
- Never mention API keys, Anthropic, Claude, or that you are a language model. You are PurveX Coach.
- Keep replies short and concrete. Prefer 1-3 short paragraphs.
- If they ask for the answer after you have already coached, you may confirm a method, still without giving the flag string.`;

// Sent to students' own MCP clients (Claude, Claude Code, Cursor) so they
// coach the same way PurveX Coach does.
export const MCP_INSTRUCTIONS = `PurveX Academy tools for one signed-in student: their Help Desk Readiness score, skill gaps, mission history, and mission questions for the GovTech Financial Active Directory lab.

When helping this student:
- Never give the answer to a hands-on mission, flag, or multiple-choice letter. Ask guiding questions and point to what to check in Active Directory or PowerShell.
- Use get_skill_gaps and get_mission_history to tailor help to their actual results.
- Do not invent lab values. get_lab_state returns the student's real lab snapshot saved the last time they ran Build-Environment.ps1. It can be older than their latest changes. Use it to check their work, and point them to what to inspect instead of reading out values that answer unsolved missions.`;

type AnthropicContent =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

type AnthropicMessage = { role: "user" | "assistant"; content: string | AnthropicContent[] };

export const COACH_TOOLS = [
  {
    name: "get_skill_gaps",
    description: "Return the student's Help Desk Readiness score and per-skill gaps.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_mission_history",
    description: "Return every mission result: solved, wrong tries, hint used, and points.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_mission_details",
    description: "Look up a mission by id, title, person name, or ticket number. Does not include answers.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "Mission id (tq-02), name, or keyword." } },
      required: ["query"],
    },
  },
  {
    name: "get_lab_state",
    description:
      "Read the student's real Active Directory lab from the snapshot saved by their last Build-Environment.ps1 run. Without a name: overview, users with OU and groups, and differences from the standard build. With a name: full details for matching users, groups, computers, or OUs.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Optional user, group, computer, or OU to look up, e.g. riley.kwan or All Employees." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "explain_concept",
    description: "Return a short teaching note for a skill area without revealing mission flags.",
    input_schema: {
      type: "object",
      properties: {
        skill: {
          type: "string",
          enum: ["accounts", "directory", "troubleshooting", "security"],
        },
      },
      required: ["skill"],
    },
  },
];

export function pickCoachModel(latestUserText: string): string {
  const t = latestUserText.toLowerCase();
  const coaching =
    /\b(wrong|ticket|mission|flag|riley|jamie|score|practice|stuck|hint|lab|group|ou|incident|inc-)\b/.test(t);
  return coaching ? COACH_SONNET_MODEL : COACH_HAIKU_MODEL;
}

function statusOf(results: Results, id: string) {
  const r = results[id];
  const points = missionPoints(r);
  return {
    id,
    solved: r?.solved === true,
    wrong: r?.wrong ?? 0,
    hint: r?.hint === true,
    points,
    finished: points !== null,
  };
}

export type CoachToolContext = {
  results: Results;
  loadLabState: () => Promise<LabSnapshot | null>;
};

export async function runCoachTool(name: string, input: Record<string, unknown>, ctx: CoachToolContext): Promise<string> {
  const { results } = ctx;
  if (name === "get_skill_gaps") {
    const s = summarize(results);
    const strongest = [...s.skills].filter((k) => k.score !== null).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
    return JSON.stringify({
      overall: s.finished === 0 ? null : s.overall,
      level: LEVELS[s.level].label,
      finished: s.finished,
      total: s.total,
      skills: s.skills,
      focus: s.focus,
      strongest: strongest ? { key: strongest.key, label: strongest.label, score: strongest.score } : null,
    });
  }
  if (name === "get_mission_history") {
    const rows = Object.keys(MISSION_SKILLS).map((id) => {
      const cat = MISSION_CATALOG[id];
      return {
        ...statusOf(results, id),
        title: cat?.title,
        skill: MISSION_SKILLS[id],
        challenge: cat?.challenge,
      };
    });
    return JSON.stringify({ missions: rows });
  }
  if (name === "get_mission_details") {
    const query = String(input.query || "");
    const matches = findMissionsByQuery(query).map((m) => ({
      ...m,
      student: statusOf(results, m.id),
    }));
    return JSON.stringify({ matches: matches.slice(0, 5) });
  }
  if (name === "get_lab_state") {
    return labStateForTool(await ctx.loadLabState(), String(input.name || ""));
  }
  if (name === "explain_concept") {
    const skill = input.skill as Skill;
    if (!SKILLS[skill]) return JSON.stringify({ error: "unknown skill" });
    return JSON.stringify({ skill, label: SKILLS[skill].label, advice: SKILLS[skill].advice });
  }
  return JSON.stringify({ error: "unknown tool" });
}

export async function runCoachTurn(params: {
  apiKey: string;
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  tools: CoachToolContext;
}): Promise<{ text: string; model: string }> {
  const model = pickCoachModel(params.userMessage);
  const messages: AnthropicMessage[] = [
    ...params.history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: params.userMessage },
  ];

  for (let step = 0; step < 4; step++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: COACH_SYSTEM_PROMPT,
        tools: COACH_TOOLS,
        messages,
      }),
    });

    const body = (await res.json()) as {
      error?: { message?: string };
      stop_reason?: string;
      content?: AnthropicContent[];
    };

    if (!res.ok) {
      throw new Error(body.error?.message || `Coach model request failed (${res.status})`);
    }

    const content = body.content || [];
    if (body.stop_reason !== "tool_use") {
      const text = content
        .filter((b): b is { type: "text"; text: string } => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { text: text || "I did not have anything to add. Try asking another way.", model };
    }

    messages.push({ role: "assistant", content });
    const resultsBlocks: AnthropicContent[] = await Promise.all(
      content
        .filter((b): b is { type: "tool_use"; id: string; name: string; input: Record<string, unknown> } => b.type === "tool_use")
        .map(async (b) => ({
          type: "tool_result" as const,
          tool_use_id: b.id,
          content: await runCoachTool(b.name, b.input || {}, params.tools),
        }))
    );
    messages.push({ role: "user", content: resultsBlocks });
  }

  return { text: "I got stuck looking that up. Ask again in a moment.", model };
}
