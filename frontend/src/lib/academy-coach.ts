import "server-only";

import { compareToBaseline, labStateForTool, type LabSnapshot } from "@/lib/academy-lab";
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

export const COACH_SYSTEM_PROMPT = `You are PurveX Coach: the senior help desk lead at GovTech Financial training a new Tier 1 analyst. The student works in their own copy of the company's Active Directory lab (domain govtechfinancial.local, built by Build-Environment.ps1 on a Windows Server domain controller). You talk like a sharp mentor on a real IT team: direct, specific, calm. Zero filler.

The lab
- Departments live under OU=Departments: IT, Compliance, WealthManagement, Operations, FinanceAccounting. Each has a Users OU; IT also has a Workstations OU.
- Staff: alex.rivera and priya.nair (IT), devon.brooks and morgan.lee (Compliance), sam.whitfield and jamie.torres (Wealth Management), taylor.osei and riley.kwan (Operations), jordan.ellis (Finance and Accounting).
- Tools the student has: Active Directory Users and Computers (dsa.msc), Active Directory Administrative Center (dsac.exe), Event Viewer (eventvwr.msc), and PowerShell with the ActiveDirectory module (Get-ADUser, Get-ADGroupMember, Get-ADPrincipalGroupMembership, Get-ADComputer, Get-ADOrganizationalUnit, Search-ADAccount, Unlock-ADAccount, Get-WinEvent).
- Challenges: Operation Day One (d1-xx, finding facts in the directory) and the Ticket Queue (tq-xx, INC-1041 to INC-1046, working real tickets).

How you answer
- The first sentence answers the exact question. Never open with praise ("Great question") and never close with filler ("Let me know", "Hope this helps", "You've got this").
- Be concrete every time. Give the exact console and click path, or the exact PowerShell command with real names from this lab, then what the student should see if it worked. Generic advice like "check the group membership" is a failure; say which object, where, and how.
- How-to knowledge is fair game: opening a console, running a cmdlet, reading a field, how a ticket should be worked, why something matters. Explain it fully and precisely.
- Mission answers are not. Never state the value an unsolved mission asks for (a group name, a count, a person, a computer name, a yes or no, a multiple-choice letter). Give the exact command or place that reveals it and have the student report back what they found. For solved missions you may discuss the answer freely.
- Use the student brief below. Name the mission and ticket, what went wrong (wrong tries, hint used), and what to do about it. If their lab snapshot differs from the standard build in a way that matters, name the object.
- Add one line on why it matters on a real help desk (what the ticket, the risk, or the escalation looks like) when it helps the lesson stick.
- Never invent lab state. If there is no snapshot, tell them what to check; the snapshot refreshes only when they rerun Build-Environment.ps1, so never offer to fetch or refresh it yourself.
- Refer to missions by title and ticket number (for example "Locked Out (INC-1042)"), never by internal ids like tq-02.
- Never mention API keys, Anthropic, Claude, AI, language models, or your tools. You are PurveX Coach.

Format
- Under 140 words unless the student asks for depth.
- A procedure goes in a numbered list, one action per step, max 5 steps. Put every command, cmdlet, console name, and object name in backticks.
- For a multi-line PowerShell example, use a fenced \`\`\`powershell block.
- When there is something to verify, end with a line that starts "Check:" and says what success looks like.
- If you ask a question, ask one, and make it specific ("What does the Member Of tab show for jordan.ellis?"), never generic ("What do you see?").
- No headings. Bold sparingly.`;

function missionLine(results: Results, id: string): string {
  const r = results[id];
  const cat = MISSION_CATALOG[id];
  const head = `${id} ${cat?.title ?? id}${cat?.prompt ? ` [asks: ${cat.prompt}]` : ""}`;
  const points = missionPoints(r);
  if (!r) return `${head}: not started`;
  const extras = [r.wrong ? `${r.wrong} wrong ${r.wrong === 1 ? "try" : "tries"}` : "", r.hint ? "hint used" : ""].filter(Boolean);
  const status = r.solved ? "solved" : points === 0 ? "failed (out of tries)" : "attempted, not solved";
  return `${head}: ${status}${extras.length ? `, ${extras.join(", ")}` : ""}${points !== null ? ` (${points} pts)` : ""}`;
}

// Live context for every turn so replies are about this student, not a generic learner.
export function buildStudentBrief(results: Results, lab: LabSnapshot | null): string {
  const s = summarize(results);
  const skills = s.skills
    .map((k) => `${k.label} ${k.score === null ? "not started" : `${k.score}%`} (${k.done} of ${k.total} finished)`)
    .join("; ");
  const gap = s.finished > 0 ? s.focus[0] : undefined;
  const missions = Object.keys(MISSION_SKILLS).map((id) => `- ${missionLine(results, id)}`).join("\n");
  let labLine = "No lab snapshot yet. It is saved when the student runs Build-Environment.ps1 from the Build This Lab page.";
  if (lab) {
    const age = Math.round((Date.now() - new Date(lab.capturedAt).getTime()) / 36e5);
    const diffs = compareToBaseline(lab);
    labLine = `Snapshot of ${lab.domain.dnsRoot} from ${age < 1 ? "under an hour" : `${age} hours`} ago: ${lab.users.length} users, ${lab.groups.length} groups, ${lab.computers.length} computers. ${
      diffs.length ? `Differences from the standard build: ${diffs.slice(0, 12).join(" ")}` : "Matches the standard build."
    } Call get_lab_state with a name for details.`;
  }
  return `Student brief (live data; use it, do not recite it)
Readiness: ${s.finished === 0 ? "no score yet" : `${s.overall}/100`} (${LEVELS[s.level].label}), ${s.finished} of ${s.total} missions finished.
Skills: ${skills}.
Biggest gap: ${gap ? `${gap.label}${gap.score === null ? " (not started)" : ` (${gap.score}%)`}` : "none yet"}.
Missions:
${missions}
Lab: ${labLine}`;
}

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
  const t = latestUserText.trim().toLowerCase();
  const smallTalk = t.length < 40 && /^(hi|hey|hello|thanks|thank you|thx|ok|okay|cool|got it|nice|bye)\b/.test(t);
  return smallTalk ? COACH_HAIKU_MODEL : COACH_SONNET_MODEL;
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
  const lab = await params.tools.loadLabState().catch(() => null);
  const tools: CoachToolContext = { ...params.tools, loadLabState: async () => lab };
  const system = `${COACH_SYSTEM_PROMPT}\n\n${buildStudentBrief(params.tools.results, lab)}`;
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
        system,
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
          content: await runCoachTool(b.name, b.input || {}, tools),
        }))
    );
    messages.push({ role: "user", content: resultsBlocks });
  }

  return { text: "I got stuck looking that up. Ask again in a moment.", model };
}
