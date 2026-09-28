import "server-only";
import { coachModeInstructions, modeFromReport, socraticRules, type CoachMode } from "@/lib/academy-coach-mode";
import type { Results } from "@/lib/academy-score";

// MCP prompts: the web Coach's modes as one-click starts in the student's own
// client (Claude, Claude Code, Cursor). Each carries the same rules the web
// Coach runs on, because some clients never show the server instructions.

type PromptArg = { name: string; description: string; required?: boolean };
type PromptDef = { name: string; title: string; description: string; arguments: PromptArg[] };

export const MCP_PROMPTS: PromptDef[] = [
  {
    name: "coach_me",
    title: "Coach me from where I am",
    description: "Picks up where you left off in CaseFile and coaches the next step without giving answers.",
    arguments: [{ name: "mode", description: "need-help, double-check or mentor. Leave empty to pick from your readiness report." }],
  },
  {
    name: "explain_topic",
    title: "Explain a topic",
    description: "Teaches one topic the way your lessons do, then checks you understood it.",
    arguments: [{ name: "topic", description: "For example least privilege, Event ID 4625, or salted hashes.", required: true }],
  },
  {
    name: "practice_quiz",
    title: "Quiz me on my weak spots",
    description: "Questions written from your own lab, aimed at your weakest skill. Results feed your drills.",
    arguments: [{ name: "skill", description: "accounts, directory, troubleshooting or security. Leave empty for your weakest." }],
  },
  {
    name: "exam_prep",
    title: "Security+ or CySA+ prep",
    description: "Scenario questions on the exam area you have practiced least.",
    arguments: [{ name: "cert", description: "Security+ or CySA+. Leave empty to use your goals." }],
  },
  {
    name: "weekly_ctf",
    title: "Run this week's CTF",
    description: "An investigation of your own domain controller's Security log.",
    arguments: [],
  },
  {
    name: "mock_interview",
    title: "Mock interview",
    description: "A scored Tier 1 help desk or junior SOC interview, drawn from the work you have done.",
    arguments: [{ name: "focus", description: "Optional: a skill or ticket to be asked about." }],
  },
  {
    name: "review_resume",
    title: "Review my resume",
    description: "A recruiter's review for Tier 1 help desk and SOC roles, using only work you can prove.",
    arguments: [{ name: "resume", description: "Paste your resume text, or leave empty and paste it next." }],
  },
];

const CORE = `You are coaching a CaseFile student through the purvex-academy tools. You are the subject matter expert on the desk: a Windows and Active Directory sysadmin, Tier 2 help desk and junior SOC analyst. Train judgment, not recipes.
- Talk like a person on the desk. Full sentences, plain and specific. No pep talk, no praise openers, no filler closers.
- Teach the GUI first (Active Directory Users and Computers, Event Viewer), with the exact path. PowerShell only after, or when asked.
- Never state the answer to an unsolved mission, flag, CTF or multiple-choice question. Point to where the answer is and ask what they find.
- Never invent lab state, accounts or tickets. Use what the tools return.
- Before you explain a concept, call search_lessons and teach it the way the lesson does.
- Under 140 words a reply unless they ask for depth. One specific question at a time.`;

const BRIEF = `The student brief is what these tools return: get_current_activity, get_weakness_profile, get_goal_plan and get_mission_history. Read them before your first reply. Do not recite them back.`;

const MODE_ARG: Record<string, CoachMode> = { "need-help": "walkthrough", "double-check": "check", mentor: "mentor" };

const text = (s: string) => ({ role: "user" as const, content: { type: "text" as const, text: s } });

export function getMcpPrompt(name: string, args: Record<string, string>, results: Results) {
  const def = MCP_PROMPTS.find((p) => p.name === name);
  if (!def) return null;
  const arg = (k: string) => (args[k] ?? "").toString().trim().slice(0, k === "resume" ? 6000 : 200);
  let body = "";

  if (name === "coach_me") {
    const mode = MODE_ARG[arg("mode").toLowerCase()] ?? modeFromReport(results);
    body = `${CORE}

${BRIEF}

${coachModeInstructions(mode)}

${socraticRules("labs and challenges")}

Start: call get_current_activity, get_weakness_profile and get_review_queue. Name where I am in a few words and coach my next step from there. If a review topic is due, offer one question on it before new material.`;
  } else if (name === "explain_topic") {
    body = `${CORE}

Explain "${arg("topic") || "the topic I name next"}" to me.
1. Call search_lessons with the topic. Teach from what it returns and name the tab it sits in.
2. Definition first, in one or two plain sentences. Then why it matters on the desk, then how to see it in my own lab (call get_lab_state if a real object makes it concrete).
3. No scenario framing and no metaphors for the definition itself.
4. End with one question that checks I understood. When I answer, tell me if I am right and why, then call record_practice_result.`;
  } else if (name === "practice_quiz") {
    const skill = arg("skill");
    body = `${CORE}

Quiz me.
1. Call get_review_queue. Ask the due topics first, as fresh questions on the same idea, and record each with the topic exactly as given. Then call get_weakness_profile and get_environment_question_seeds${skill ? ` with skill "${skill}"` : " for my weakest skill"}.
2. Write one question at a time from a seed: two or three sentences with the evidence on screen, then four choices where the wrong ones are real new-hire mistakes, or an open question.
3. Wait for my answer. Then say if I was right, explain why in two lines using search_lessons where it helps, and call record_practice_result.
4. Make each question different. Raise the difficulty after two right in a row. Stop after five and name the one habit to work on.`;
  } else if (name === "exam_prep") {
    const cert = arg("cert");
    body = `${CORE}

Prep me for ${cert || "the exam in my goals"}.
1. Call get_goal_plan. Use focusNow, the exam area I have practiced least, unless I name another.
2. Tell me in one line which area we are working and its weight on the exam.
3. Ask scenario questions from my own lab (get_environment_question_seeds) that test that area. One at a time. After each answer, explain the concept the exam expects, drawn from search_lessons, and call record_practice_result.
4. Be honest about coverage: CaseFile does not cover every exam topic. When a topic is outside it, say so and point me to the official CompTIA objectives.`;
  } else if (name === "weekly_ctf") {
    body = `${CORE}

Run this week's CTF with me.
1. Call investigation_status. If it is not started, call start_investigation.
2. Tell me the question and where to look in Event Viewer. Do not give the answer or the account it points at.
3. When I answer, call check_investigation with my answer. If it has a second half, guide me to find and fix the real problem in my lab, then call it again.
4. If my lab has not sent a log digest, tell me to run the latest lab script from Build the Environment.`;
  } else if (name === "mock_interview") {
    const focus = arg("focus");
    body = `${CORE}

${BRIEF}

${coachModeInstructions("interview")}

Start my mock interview now.${focus ? ` Focus on: ${focus}.` : ""}`;
  } else if (name === "review_resume") {
    const resume = arg("resume");
    body = `${CORE}

${BRIEF}

${coachModeInstructions("interview")}

Review my resume for a Tier 1 help desk or junior SOC role. Call get_weakness_profile first so every line you suggest is backed by work I have proven.${resume ? `\n\nMy resume:\n${resume}` : " I will paste it in my next message."}`;
  }

  return { description: def.description, messages: [text(body)] };
}
