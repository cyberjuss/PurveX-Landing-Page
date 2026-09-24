import type { Results, Skill } from "@/lib/academy-score";

export type MissionCatalogEntry = {
  id: string;
  challenge: "day-one" | "ticket-queue" | "alert-queue";
  title: string;
  prompt: string;
  skill: Skill;
};

// Questions and titles only — never flags or explanations. The coach uses
// this to know what a mission asked, not how to solve it.
export const MISSION_CATALOG: Record<string, MissionCatalogEntry> = {
  "d1-01": {
    id: "d1-01",
    challenge: "day-one",
    title: "Which Group Is Jordan In?",
    prompt: "Which department group is jordan.ellis in?",
    skill: "accounts",
  },
  "d1-02": {
    id: "d1-02",
    challenge: "day-one",
    title: "Who Is an Admin?",
    prompt: "Find who has admin rights in the directory.",
    skill: "accounts",
  },
  "d1-03": {
    id: "d1-03",
    challenge: "day-one",
    title: "Where Are the Access Groups?",
    prompt: "Find where the access groups live in the directory.",
    skill: "directory",
  },
  "d1-04": {
    id: "d1-04",
    challenge: "day-one",
    title: "The Folder That Is Not an OU",
    prompt: "Spot the default folder that is not an OU.",
    skill: "directory",
  },
  "d1-05": {
    id: "d1-05",
    challenge: "day-one",
    title: "What Is the Admin Group For?",
    prompt: "Read a description on an admin group.",
    skill: "accounts",
  },
  "d1-06": {
    id: "d1-06",
    challenge: "day-one",
    title: "Is Priya on the Help Desk Group?",
    prompt: "Decide whether a job title means group membership.",
    skill: "accounts",
  },
  "d1-07": {
    id: "d1-07",
    challenge: "day-one",
    title: "Who Is the Settlements Coordinator?",
    prompt: "Find an account by title.",
    skill: "accounts",
  },
  "d1-08": {
    id: "d1-08",
    challenge: "day-one",
    title: "What Is the Workstation Called?",
    prompt: "Find a computer object in the directory.",
    skill: "directory",
  },
  "d1-09": {
    id: "d1-09",
    challenge: "day-one",
    title: "How Many People Are in Compliance?",
    prompt: "Count members of a group.",
    skill: "accounts",
  },
  "d1-10": {
    id: "d1-10",
    challenge: "day-one",
    title: "How Many Departments Are There?",
    prompt: "Count departments in the lab.",
    skill: "directory",
  },
  "tq-01": {
    id: "tq-01",
    challenge: "ticket-queue",
    title: "Missing Announcements (INC-1041)",
    prompt: "Jamie Torres is not getting company-wide email. Add her to All Employees, then report how many members the group has.",
    skill: "accounts",
  },
  "tq-02": {
    id: "tq-02",
    challenge: "ticket-queue",
    title: "Locked Out (INC-1042)",
    prompt: "Riley Kwan cannot sign in and thinks she is locked out. Check the account, restore sign-in if needed, then report whether the account is enabled.",
    skill: "troubleshooting",
  },
  "tq-03": {
    id: "tq-03",
    challenge: "ticket-queue",
    title: "New Hire Access (INC-1043)",
    prompt: "Create Casey Reed with IT Users only, remove what does not belong in that staff group, then report how many members IT Users has.",
    skill: "accounts",
  },
  "tq-04": {
    id: "tq-04",
    challenge: "ticket-queue",
    title: "The Backup Account (INC-1044)",
    prompt: "Auditors require a written run window on svc-backup-job. Put the window from the ticket on the account, then report it.",
    skill: "troubleshooting",
  },
  "tq-05": {
    id: "tq-05",
    challenge: "ticket-queue",
    title: "The Transfer That Did Not Happen (INC-1045)",
    prompt: "HR transferred Taylor Osei to Compliance. Move the account so Compliance policy applies, then report the department OU.",
    skill: "troubleshooting",
  },
  "tq-06": {
    id: "tq-06",
    challenge: "alert-queue",
    title: "The 2 AM Login (INC-1046)",
    prompt: "Alex logged in at 2 AM from WM-WKS07. Which department OU holds that computer?",
    skill: "security",
  },
  "tq-07": {
    id: "tq-07",
    challenge: "alert-queue",
    title: "Read the Log (INC-1046)",
    prompt: "How many failed logons (4625) happen before the first successful logon (4624)?",
    skill: "security",
  },
  "tq-08": {
    id: "tq-08",
    challenge: "alert-queue",
    title: "Why the Privileges? (INC-1046)",
    prompt: "Which of Alex's groups explains why the session received special privileges?",
    skill: "security",
  },
  "tq-09": {
    id: "tq-09",
    challenge: "alert-queue",
    title: "Mistake or Attack? (INC-1046)",
    prompt: "Choose the best explanation for the incident.",
    skill: "security",
  },
  "tq-10": {
    id: "tq-10",
    challenge: "alert-queue",
    title: "Your First Move (INC-1046)",
    prompt: "Choose the best first response move.",
    skill: "security",
  },
};

export const CHALLENGE_PATHS: Record<
  MissionCatalogEntry["challenge"],
  { href: string; tab: string }
> = {
  "day-one": { href: "/academy/phase-1/home-lab-active-directory", tab: "operation-day-one" },
  "ticket-queue": { href: "/academy/phase-1/home-lab-active-directory", tab: "ticket-queue" },
  "alert-queue": { href: "/academy/phase-2/week-2", tab: "the-2-am-login" },
};

export function missionHref(id: string): string {
  const mission = MISSION_CATALOG[id];
  if (!mission) return "/academy";
  return `${CHALLENGE_PATHS[mission.challenge].href}#${id}`;
}

/** Next open ticket in a challenge — last one they touched if still open. */
export function continueMissionId(challenge: MissionCatalogEntry["challenge"], results: Results): string {
  const list = Object.values(MISSION_CATALOG).filter((m) => m.challenge === challenge);
  let last: { id: string; t: number } | null = null;
  for (const m of list) {
    const r = results[m.id];
    if (!r?.at) continue;
    const t = new Date(r.at).getTime();
    if (Number.isNaN(t)) continue;
    if (!last || t > last.t) last = { id: m.id, t };
  }
  if (last && !results[last.id]?.solved) return last.id;
  return list.find((m) => !results[m.id]?.solved)?.id ?? list[0].id;
}

export function challengeHref(challenge: MissionCatalogEntry["challenge"], results: Results): string {
  return missionHref(continueMissionId(challenge, results));
}

export const CHALLENGE_LABELS: Record<MissionCatalogEntry["challenge"], string> = {
  "day-one": "Operation Day One",
  "ticket-queue": "Ticket Queue",
  "alert-queue": "The 2 AM Login",
};

export function lastTouchedMission(results: Results): MissionCatalogEntry | null {
  let best: { id: string; t: number } | null = null;
  for (const [id, r] of Object.entries(results)) {
    if (!MISSION_CATALOG[id] || !r.at) continue;
    const t = new Date(r.at).getTime();
    if (Number.isNaN(t)) continue;
    if (!best || t > best.t) best = { id, t };
  }
  return best ? MISSION_CATALOG[best.id] : null;
}

export function nextMissions(results: Results, n = 2): MissionCatalogEntry[] {
  const last = lastTouchedMission(results);
  const challenge = last?.challenge ?? "day-one";
  const list = Object.values(MISSION_CATALOG).filter((m) => m.challenge === challenge);
  const open = list.filter((m) => !results[m.id]?.solved);
  return (open.length ? open : list).slice(0, n);
}

export function findMissionsByQuery(query: string): MissionCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return Object.values(MISSION_CATALOG);
  return Object.values(MISSION_CATALOG).filter((m) => {
    const hay = `${m.id} ${m.title} ${m.prompt} ${m.challenge}`.toLowerCase();
    return hay.includes(q) || q.includes(m.id);
  });
}
