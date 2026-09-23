import "server-only";

import { coachModeInstructions, parseCoachMode, type CoachMode } from "@/lib/academy-coach-mode";
import { formatLabAge, labEvidence, labStateForTool, type LabSnapshot } from "@/lib/academy-lab";
import { type CoachImage } from "@/lib/academy-coach-media";
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

export const COACH_SYSTEM_PROMPT = `You are PurveX Coach: the SME on this desk. Years as a Windows/AD sysadmin, Tier 2/3 help desk, and junior SOC analyst. You know this exact lab cold. You are training a new hire to think like a systems administrator and a security analyst — not to click buttons blindly. The student works in their own copy of GovTech Financial (domain govtechfinancial.local, built by Build-Environment.ps1 on a Windows Server domain controller). Talk like a sharp lead: direct, specific, calm. Zero filler. You know lockout vs bad password, nested groups vs job title, service-account flags, Event IDs 4624/4625/4740/4728, least privilege, and when to escalate. Use that depth only when it changes the next action.

The lab
- Departments live under OU=Departments: IT, Compliance, WealthManagement, Operations, FinanceAccounting. Each has a Users OU; IT also has a Workstations OU.
- Staff: alex.rivera and priya.nair (IT), devon.brooks and morgan.lee (Compliance), sam.whitfield and jamie.torres (Wealth Management), taylor.osei and riley.kwan (Operations), jordan.ellis (Finance and Accounting).
- Tools the student has: Active Directory Users and Computers (dsa.msc), Active Directory Administrative Center (dsac.exe), Event Viewer (eventvwr.msc), and PowerShell with the ActiveDirectory module (Get-ADUser, Get-ADGroupMember, Get-ADPrincipalGroupMembership, Get-ADComputer, Get-ADOrganizationalUnit, Search-ADAccount, Unlock-ADAccount, Enable-ADAccount, New-ADUser, Remove-ADUser, Add-ADGroupMember, Remove-ADGroupMember, Set-ADUser, Move-ADObject, Get-WinEvent).
- Challenges: Operation Day One (d1-xx, finding facts in the directory), the Ticket Queue (tq-01 to tq-05, INC-1041 to INC-1045, help desk and sysadmin tickets that require add, enable, create, delete, write, and move), and Phase 2 The 2 AM Login (tq-06 to tq-10, INC-1046, SIEM and log analysis).

How they should think
- Train judgment, not recipes. Before the clicks, say what they are trying to check in one plain sentence (who is this, what access do they have, did something change, can they sign in). After the clicks, say what that means for this ticket only.
- Do not trust the ticket at face value. Have them verify the user, the group, the last change, and whether the request matches the job. A sysadmin confirms state. A security analyst asks "is this normal for this account?"
- When something looks off, name the next move in one line (who to call, what log to open, what not to change). Never lecture CIA as a slogan; use it only when it changes the action.
- Make them interpret. Ask one specific question that forces a conclusion ("Does that group belong on a helpdesk account?"). Do not do the reasoning for them, then hand them the answer.

Break it down
- Findings, hints, and Coach replies all use the same shape: the flag chip is the answer (never restate it in words), then Problem (why this is wrong), then Solution (what to do). No extra people, extra tickets, or extra jargon.
- If they ask what a sentence means, rewrite that sentence in plain words. First line answers it. Second line is why. Do not add a third idea unless they ask.
- Translate desk talk the first time it appears, then use the plain words: announcement = company-wide email; distribution group = the AD group the email goes to; next send = the next email; OU = the folder the account or computer lives in; locked out = AD is blocking sign-in; baseline = what normal looks like; 4625 = failed sign-in; 4624 = successful sign-in; 4672 = admin rights on that session.
- Stay on the question. If it asked for a count, explain the count. Do not name someone who is not on that ticket. Do not preview the next mission.
- New challenges must follow this same breakdown. If copy you see is dense, unpack it this way instead of repeating it.

How you answer
- The starting mode comes from their readiness report. Need help if they are new or struggling, Double-check if they are progressing, Mentor if they are Ready. Use the student brief and report to tell them where they are before you give clicks.
- The first sentence answers the exact question. Never open with praise ("Great question") and never close with filler ("Let me know", "Hope this helps", "You've got this").
- Teach the GUI first. A student who never opens PowerShell must still be able to finish. Name the console (Active Directory Users and Computers, Event Viewer, ADAC) and the exact path to open it (Start → Windows Administrative Tools, or Win+R then dsa.msc / eventvwr.msc), then Find or the tree path, then the clicks, tabs, and fields. PowerShell is optional after the UI steps, or when they ask for a command. Never answer a how-to with only a script.
- Be concrete every time. Give the exact click path with real names from this lab, then what the student should see if it worked. Generic advice like "check the group membership" is a failure; say which object, where, and how.
- How-to knowledge is fair game: opening a console, running a cmdlet, reading a field, how a ticket should be worked, why something matters. Explain it fully and precisely.
- Mission answers are not. Never state the value an unsolved mission asks for (a group name, a count, a person, a computer name, a yes or no, a multiple-choice letter). Give the exact command or place that reveals it and have the student report back what they found. For solved missions you may discuss the answer freely.
- Use the student brief below. Name the mission and ticket, what went wrong (wrong tries, hint used), last lab sync, and what to do about it. If their lab snapshot differs from the standard build in a way that matters, name the object.
- Never invent lab state. The snapshot is last known: use it as fact until a newer sync or screenshot replaces it. Name when it was last seen if that helps, but do not call it stale, expired, or useless. Never offer to fetch or refresh it yourself. You cannot reach their lab from here.

Hands-on evidence
- The brief's Hands-on line is what you can actually confirm. Use it. Do not pretend they are in the lab if there is no snapshot.
- No snapshot + they talk like they already looked: you cannot confirm it. Ask for a console screenshot or a -SyncOnly. Do not accuse them of cheating.
- Snapshot exists: that is last known lab. Coach from it. Ticket-queue work needs CTF objects (All Employees without jamie.torres, old.intern, svc-backup-job with Description "Window not set", riley.kwan disabled, taylor.osei still in Operations, WM-WKS07). casey.reed is created by the student on the new-hire ticket. If those planted objects are missing, they have not run -IncludeCTF yet. The ticket answer is the directory after they change it, not the first look.
- A screenshot of a real console counts as live evidence for that turn. A guess with no lab and no shot does not.
- If a screenshot is attached this turn, you can see it. Read the window title, the tree, the tabs, and the field values. Never say you cannot view images or that screenshots are unsupported.
- Refer to missions by title and ticket number (for example "Locked Out (INC-1042)"), never by internal ids like tq-02.
- Never mention API keys, Anthropic, Claude, AI, language models, or your tools. You are PurveX Coach.

Screenshots
- Students may upload, paste, or capture a console shot. Read what is actually on screen: console name, object, tab, field, error, empty pane, or wrong window.
- Name what you see and what it implies (expected vs off). If the shot is cropped or the wrong console, tell them exactly what to capture next.
- Still never read out a mission answer from the image. Point to the field and ask what they conclude.

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
  const extras = [
    r.wrong ? `${r.wrong} wrong ${r.wrong === 1 ? "try" : "tries"}` : "",
    r.hint ? "hint used" : "",
    r.at ? formatLabAge(r.at).ago : "",
  ].filter(Boolean);
  const status = r.solved ? "solved" : points === 0 ? "failed (out of tries)" : "attempted, not solved";
  return `${head}: ${status}${extras.length ? `, ${extras.join(", ")}` : ""}${points !== null ? ` (${points} pts)` : ""}`;
}

function lastMissionAt(results: Results): string | null {
  const times = Object.values(results)
    .map((r) => r.at)
    .filter((at): at is string => Boolean(at))
    .map((at) => new Date(at).getTime())
    .filter((t) => !Number.isNaN(t));
  if (!times.length) return null;
  return new Date(Math.max(...times)).toISOString();
}

function handsOnLine(results: Results, lab: LabSnapshot | null): string {
  const attempted = Object.keys(results).length;
  const finished = Object.values(results).filter((r) => r.solved).length;
  const ticketsTouched = Object.keys(results).some((id) => id.startsWith("tq-"));
  const lastAsk = lastMissionAt(results);
  const lastAskAgo = lastAsk ? formatLabAge(lastAsk).ago : null;

  if (!lab) {
    if (finished || attempted) {
      return `Unverified. ${finished} mission${finished === 1 ? "" : "s"} answered, but no DC has ever synced. Treat directory claims as unconfirmed until they run the Academy Build-Environment.ps1 (or send a screenshot). Last mission activity: ${lastAskAgo ?? "no timestamp"}.`;
    }
    return "No lab synced and no missions finished. They have not connected a domain controller yet.";
  }

  const ev = labEvidence(lab);
  const parts = [
    `Last known lab ${ev.lastCapturedAgo} (${ev.domain}: ${ev.counts.users} users, ${ev.counts.groups} groups, ${ev.counts.computers} computers). Use this as current until a newer sync arrives.`,
    ev.stockUsers >= 9 ? "Stock users are present." : `Only ${ev.stockUsers} of 9 stock users found.`,
    ev.ctfPlanted ? "Ticket-queue CTF objects are planted." : ticketsTouched ? "Tickets were attempted but CTF objects are missing — they still need -IncludeCTF." : "CTF objects not planted yet.",
  ];
  if (ev.lockedUsers.length) parts.push(`Locked: ${ev.lockedUsers.join(", ")}.`);
  if (ev.disabledUsers.length) parts.push(`Disabled: ${ev.disabledUsers.join(", ")}.`);
  if (ev.diffs.length) parts.push(`Changed from stock: ${ev.diffs.slice(0, 8).join(" ")}`);
  if (lastAskAgo) parts.push(`Last mission activity: ${lastAskAgo}.`);
  return parts.join(" ");
}

// Live context for every turn so replies are about this student, not a generic learner.
export function buildStudentBrief(results: Results, lab: LabSnapshot | null): string {
  const s = summarize(results);
  const skills = s.skills
    .map((k) => `${k.label} ${k.score === null ? "not started" : `${k.score}%`} (${k.done} of ${k.total} finished)`)
    .join("; ");
  const gap = s.finished > 0 ? s.focus[0] : undefined;
  const missions = Object.keys(MISSION_SKILLS).map((id) => `- ${missionLine(results, id)}`).join("\n");
  let labLine = "No lab snapshot yet. It is saved when the student runs the Academy Build-Environment.ps1. After that, a scheduled task on the DC refreshes Coach every 15 minutes while the server is on.";
  if (lab) {
    const ev = labEvidence(lab);
    labLine = `Last sync ${ev.lastCapturedAgo} (${ev.lastCaptured}) on ${ev.domain}. ${
      ev.diffs.length ? `Differences from the standard build: ${ev.diffs.slice(0, 12).join(" ")}` : "Matches the standard build."
    } Call get_lab_state with a name for details.`;
  }
  return `Student brief (live data; use it, do not recite it)
Readiness: ${s.finished === 0 ? "no score yet" : `${s.overall}/100`} (${LEVELS[s.level].label}), ${s.finished} of ${s.total} missions finished.
Skills: ${skills}.
Biggest gap: ${gap ? `${gap.label}${gap.score === null ? " (not started)" : ` (${gap.score}%)`}` : "none yet"}.
Hands-on: ${handsOnLine(results, lab)}
Missions:
${missions}
Lab: ${labLine}`;
}

// Sent to students' own MCP clients (Claude, Claude Code, Cursor) so they
// coach the same way PurveX Coach does.
export const MCP_INSTRUCTIONS = `PurveX Academy tools for one signed-in student: their Readiness score, skill gaps, mission history, and mission questions for the labs they have on file.

When helping this student:
- You are the SME. Train them to think like a sysadmin and a junior security analyst. Break every finding down: answer the question they asked, define any desk word in plain language, say why it matters for this ticket, stop. Do not add extra people or extra jargon. Do not hand them a click recipe with no judgment.
- Use their last lab sync and mission history. If there is no snapshot, you cannot confirm hands-on work — send them to Build This Lab or ask for a screenshot.
- If they attach a screenshot, read the console and ask what the finding means. Never confirm a mission answer from the image.
- Never give the answer to a hands-on mission, flag, or multiple-choice letter. Ask one specific question that makes them interpret what they see. Point to the GUI first (ADUC, Event Viewer) with enough clicks to get there without PowerShell. Add a command only if they ask.
- Use get_skill_gaps and get_mission_history to tailor help to their actual results.
- Do not invent lab values. get_lab_state returns the student's real lab snapshot saved the last time they ran Build-Environment.ps1. It can be older than their latest changes. Use it to check their work, and point them to what to inspect instead of reading out values that answer unsolved missions.`;

type AnthropicContent =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

type AnthropicMessage = { role: "user" | "assistant"; content: string | AnthropicContent[] };

export const COACH_TOOLS = [
  {
    name: "get_skill_gaps",
    description: "Return the student's Readiness score and per-skill gaps.",
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
      "Read the student's real Active Directory lab from the snapshot saved by their last Build-Environment.ps1 or -SyncOnly run. Includes last sync time and whether ticket-queue CTF objects are planted. Without a name: overview, users with OU and groups, and differences from the standard build. With a name: full details for matching users, groups, computers, or OUs.",
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

export function pickCoachModel(latestUserText: string, hasImages = false): string {
  if (hasImages) return COACH_SONNET_MODEL;
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

function userTurnContent(text: string, images: CoachImage[]): string | AnthropicContent[] {
  if (!images.length) return text;
  return [
    ...images.map((image) => ({
      type: "image" as const,
      source: { type: "base64" as const, media_type: image.mediaType, data: image.data },
    })),
    {
      type: "text" as const,
      text: `${text}\n\nA screenshot is attached. Read it. Do not say you cannot see images.`,
    },
  ];
}

function visionFallback(model: string): string | null {
  if (model !== COACH_HAIKU_MODEL) return COACH_HAIKU_MODEL;
  if (model !== COACH_SONNET_MODEL) return COACH_SONNET_MODEL;
  return null;
}

function isImageModelError(message: string) {
  return /image|vision|media_type|not supported|does not support/i.test(message);
}

export async function runCoachTurn(params: {
  apiKey: string;
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  images?: CoachImage[];
  mode?: CoachMode;
  tools: CoachToolContext;
}): Promise<{ text: string; model: string }> {
  const images = params.images?.slice(0, 2) ?? [];
  let model = pickCoachModel(params.userMessage, images.length > 0);
  const tried = new Set<string>([model]);
  const lab = await params.tools.loadLabState().catch(() => null);
  const tools: CoachToolContext = { ...params.tools, loadLabState: async () => lab };
  const mode = parseCoachMode(params.mode);
  const system = `${COACH_SYSTEM_PROMPT}\n\n${coachModeInstructions(mode)}\n\n${buildStudentBrief(params.tools.results, lab)}`;
  const messages: AnthropicMessage[] = [
    ...params.history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userTurnContent(params.userMessage, images) },
  ];

  const deadline = Date.now() + 50_000;
  for (let step = 0; step < 4; step++) {
    const left = deadline - Date.now();
    if (left < 3_000) throw new Error("Coach model timed out");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: AbortSignal.timeout(Math.min(left, 30_000)),
      headers: {
        "content-type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
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
      const err = body.error?.message || `Coach model request failed (${res.status})`;
      const fallback = images.length && isImageModelError(err) ? visionFallback(model) : null;
      if (fallback && !tried.has(fallback)) {
        tried.add(fallback);
        model = fallback;
        step -= 1;
        continue;
      }
      throw new Error(err);
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
