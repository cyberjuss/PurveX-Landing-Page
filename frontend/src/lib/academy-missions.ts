import type { Results, Skill } from "@/lib/academy-score";

export type MissionCatalogEntry = {
  id: string;
  challenge: "day-one" | "ticket-queue" | "alert-queue" | "wire" | "crypto" | "client-data";
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
    prompt: "Jamie Torres is not getting company-wide email. Find the firm-wide announcement group, add her if she is missing, then report how many members it has.",
    skill: "accounts",
  },
  "tq-02": {
    id: "tq-02",
    challenge: "ticket-queue",
    title: "Locked Out (INC-1042)",
    prompt: "Riley Kwan cannot sign in and thinks she is locked out. Open the account before you act. Restore sign-in if needed, then report what was actually wrong, locked or disabled.",
    skill: "troubleshooting",
  },
  "tq-03": {
    id: "tq-03",
    challenge: "ticket-queue",
    title: "New Hire Access (INC-1043)",
    prompt: "Create Casey Reed with IT Users only and clean out anyone who is not a current IT person. Read the leftover intern Description before you delete it and report the ticket number written there.",
    skill: "accounts",
  },
  "tq-04": {
    id: "tq-04",
    challenge: "ticket-queue",
    title: "The Backup Account (INC-1044)",
    prompt: "Auditors need a written run window on svc-backup-job. Find the approved hours on the folder that holds the account, write them on Description, then report the window you wrote.",
    skill: "troubleshooting",
  },
  "tq-05": {
    id: "tq-05",
    challenge: "ticket-queue",
    title: "The Transfer That Did Not Happen (INC-1045)",
    prompt: "HR transferred Taylor Osei to Compliance. Move the account and switch the groups, then report the title still on the account.",
    skill: "troubleshooting",
  },
  "tq-11": {
    id: "tq-11",
    challenge: "ticket-queue",
    title: "Contractor Offboarding (INC-1047)",
    prompt: "A contractor's engagement has ended. Disable kai.mendes and remove the account's access while keeping it for records, then report the sponsor named on the account.",
    skill: "accounts",
  },
  "tq-12": {
    id: "tq-12",
    challenge: "ticket-queue",
    title: "Admin Rights Request (INC-1048)",
    prompt: "Sam Whitfield asks to be added to Server Admins to install software. Read the group's Description before deciding, then report the access level it grants.",
    skill: "security",
  },
  "tq-13": {
    id: "tq-13",
    challenge: "ticket-queue",
    title: "Audit Finding (INC-1049)",
    prompt: "An auditor found a staff account whose password never expires. Find it among the accounts with that setting, clear it, and report the username.",
    skill: "security",
  },
  "tq-14": {
    id: "tq-14",
    challenge: "ticket-queue",
    title: "New Laptop Missing Policies (INC-1050)",
    prompt: "Jordan's new laptop FIN-LT14 is not getting Finance policies. Find where it landed, move it to the Finance workstations OU, and report the folder it was sitting in.",
    skill: "directory",
  },
  "tq-15": {
    id: "tq-15",
    challenge: "ticket-queue",
    title: "Group Cannot Open the Share (INC-1051)",
    prompt: "Members of Finance Reports cannot open the reports share. Find why the group grants nothing, fix it, and report how many members it has.",
    skill: "accounts",
  },
  "tq-16": {
    id: "tq-16",
    challenge: "ticket-queue",
    title: "Share Will Not Open by Name (INC-1052)",
    prompt: "Staff can reach the file share by IP address but not by the name files. Find what the name resolves to, point it back at the domain controller, and report the wrong address.",
    skill: "troubleshooting",
  },
  // The hardening tickets. Unlike the others nothing is planted for these:
  // the domain ships this way, which is the point. A real estate is not
  // broken, it is unfinished, and the work is noticing that and closing it.
  "tq-21": {
    id: "tq-21",
    challenge: "ticket-queue",
    title: "Nothing Stops Password Guessing (INC-1059)",
    prompt: "Security found the domain never locks an account, however many times a password is wrong. Set a lockout policy of 10 tries or fewer with a lock of at least 15 minutes, then report the event ID a domain controller writes when an account is locked out.",
    skill: "security",
  },
  "tq-22": {
    id: "tq-22",
    challenge: "ticket-queue",
    title: "No Record of What Ran (INC-1060)",
    prompt: "An investigation stalled because nothing on the domain controller records which programs were started. Turn on auditing for process creation, then report the event ID that records a new process.",
    skill: "security",
  },
  "tq-23": {
    id: "tq-23",
    challenge: "ticket-queue",
    title: "The Security Log Runs Out (INC-1061)",
    prompt: "The Security log is overwriting itself within days, so last week's sign-ins are already gone. Raise its maximum size to at least 512 MB, then report the size in MB it was set to before you changed it.",
    skill: "security",
  },
  "tq-24": {
    id: "tq-24",
    challenge: "ticket-queue",
    title: "Admins Under the Same Rules as Everyone (INC-1062)",
    prompt: "Accounts that can change the domain are held to the same password rules as everyone else. Apply a fine-grained password policy of at least 16 characters, locking after 5 tries or fewer, to the IT administrators group. Then report the group you applied it to.",
    skill: "security",
  },
  "tq-25": {
    id: "tq-25",
    challenge: "ticket-queue",
    title: "A Workstation Nobody Uses (INC-1063)",
    prompt: "Operations says a workstation in their folder was decommissioned and never retired in the directory. Find it, read its Description, disable it without deleting it, and report the ticket number written there.",
    skill: "directory",
  },
  "tq-20": {
    id: "tq-20",
    challenge: "ticket-queue",
    title: "Payroll Works for Some People (INC-1056)",
    prompt: "The payroll portal times out for some people and works for others. Find why the name resolves differently between attempts, remove the stale record, and report its address.",
    skill: "troubleshooting",
  },
  "tq-17": {
    id: "tq-17",
    challenge: "ticket-queue",
    title: "Vendor Remote Access Left Open (INC-1053)",
    prompt: "A firewall rule opened for a vendor visit is still allowing remote access to the domain controller. Find it, disable it, and report the port it allowed.",
    skill: "security",
  },
  "tq-18": {
    id: "tq-18",
    challenge: "ticket-queue",
    title: "Screens That Never Lock (INC-1054)",
    prompt: "Finance screens never lock while Operations screens lock early. Find the screen lock GPO, link it to Finance, remove the wrong link, and report the OU it was linked to.",
    skill: "directory",
  },
  "tq-19": {
    id: "tq-19",
    challenge: "ticket-queue",
    title: "The Invoice Nobody Saved (INC-1055)",
    prompt: "An unknown invoice file appeared on the Finance share. Find it, move it to quarantine without opening it, and report its full name with every extension.",
    skill: "security",
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
    skill: "logs",
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
  "cap-01": { id: "cap-01", challenge: "wire", title: "Where the Job Signs In", prompt: "Capture the nightly job and name the port its directory sign-in uses.", skill: "logs" },
  "cap-02": { id: "cap-02", challenge: "wire", title: "Who the Job Signs In As", prompt: "Read the directory sign-in and name the account the job uses.", skill: "logs" },
  "cap-03": { id: "cap-03", challenge: "wire", title: "What the Sign-In Gives Away", prompt: "Read the password the job sends over the wire.", skill: "security" },
  "cap-04": { id: "cap-04", challenge: "wire", title: "The File on the Wire", prompt: "Read the copied settlement file and name its first reference.", skill: "logs" },
  "cap-05": { id: "cap-05", challenge: "wire", title: "Narrowing the Capture", prompt: "Give the Wireshark display filter that isolates the directory traffic.", skill: "logs" },
  "cap-06": { id: "cap-06", challenge: "wire", title: "Containing a Burned Credential", prompt: "Disable the service account and name the protocol the job should use.", skill: "security" },
  "cry-01": { id: "cry-01", challenge: "crypto", title: "Three Mirrors, One Checksum", prompt: "Hash three mirrors and name the one that fails the published checksum.", skill: "security" },
  "cry-02": { id: "cry-02", challenge: "crypto", title: "What Changed Inside It", prompt: "Compare the failing mirror and name the field whose line differs.", skill: "security" },
  "cry-03": { id: "cry-03", challenge: "crypto", title: "Naming the Algorithm", prompt: "Name the hashing algorithm from the length of the exported hashes.", skill: "security" },
  "cry-04": { id: "cry-04", challenge: "crypto", title: "Cracking a Weak Hash", prompt: "Recover a password from its hash using the common-password list.", skill: "security" },
  "cry-05": { id: "cry-05", challenge: "crypto", title: "The Hash That Repeats", prompt: "Name the other account that reused the same password.", skill: "security" },
  "cry-06": { id: "cry-06", challenge: "crypto", title: "Containing the Unsigned Mirror", prompt: "Quarantine the unsigned mirror and name what a trustworthy build carries.", skill: "security" },
  "cd-01": { id: "cd-01", challenge: "client-data", title: "Where the Numbers Live", prompt: "Find the file on the shares that holds client Social Security numbers.", skill: "security" },
  "cd-02": { id: "cd-02", challenge: "client-data", title: "Counting the Book", prompt: "Count the clients in the client register.", skill: "security" },
  "cd-03": { id: "cd-03", challenge: "client-data", title: "Waiting on Paperwork", prompt: "Count the KYC reviews still awaiting documents.", skill: "security" },
  "cd-04": { id: "cd-04", challenge: "client-data", title: "One Signature on Every Payment", prompt: "Find who approved the vendor payments.", skill: "security" },
  "cd-05": { id: "cd-05", challenge: "client-data", title: "The Batch That Did Not Balance", prompt: "Find the settlement batch that did not reconcile.", skill: "security" },
  "cd-06": { id: "cd-06", challenge: "client-data", title: "Fingerprint the Register", prompt: "Take the SHA-256 hash of the client register.", skill: "security" },
  "cd-07": { id: "cd-07", challenge: "client-data", title: "Who Can Read the Register", prompt: "Build a least-privilege reader group and name the group the share lets read it today.", skill: "accounts" },
};

export const CHALLENGE_PATHS: Record<
  MissionCatalogEntry["challenge"],
  { href: string; tab: string }
> = {
  "day-one": { href: "/range/phase-1/home-lab-challenges", tab: "operation-day-one" },
  "ticket-queue": { href: "/range/phase-1/home-lab-challenges", tab: "ticket-queue" },
  "alert-queue": { href: "/range/phase-2/week-2", tab: "the-2-am-login" },
  "wire": { href: "/range/phase-1/week-3", tab: "the-nightly-settlement-push" },
  "crypto": { href: "/range/phase-1/week-2", tab: "the-mirror-that-does-not-match" },
  "client-data": { href: "/range/phase-1/home-lab-challenges", tab: "the-client-data-review" },
};

export function missionHref(id: string): string {
  const mission = MISSION_CATALOG[id];
  if (!mission) return "/range";
  return `${CHALLENGE_PATHS[mission.challenge].href}#${id}`;
}

export function challengeTabHref(challenge: MissionCatalogEntry["challenge"]): string {
  const p = CHALLENGE_PATHS[challenge];
  return `${p.href}#${p.tab}`;
}

export function challengeFromMission(id: string): MissionCatalogEntry["challenge"] | null {
  if (id.startsWith("d1-")) return "day-one";
  if (/^tq-(0[1-5]|1[1-9]|20)$/.test(id)) return "ticket-queue";
  if (id.startsWith("tq-")) return "alert-queue";
  if (id.startsWith("cap-")) return "wire";
  if (id.startsWith("cry-")) return "crypto";
  if (id.startsWith("cd-")) return "client-data";
  return MISSION_CATALOG[id]?.challenge ?? null;
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
  "wire": "The Nightly Settlement Push",
  "crypto": "The Mirror That Does Not Match",
  "client-data": "The Client Data Review",
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

/** Tickets that need a real change in the student's lab before they can answer. */
export const LAB_GATED_MISSIONS = ["tq-01", "tq-02", "tq-03", "tq-04", "tq-05", "tq-11", "tq-12", "tq-13", "tq-14", "tq-15", "tq-16", "tq-17", "tq-18", "tq-19", "tq-20", "tq-21", "tq-22", "tq-23", "tq-24", "tq-25", "cap-06", "cry-06"];

/** The on-the-job task each mission practices. A gated ticket seen in the lab counts as proven. */
export const MISSION_JOBS: Record<string, string> = {
  "tq-01": "group-access",
  "tq-02": "enable-account",
  "tq-03": "create-user",
  "tq-05": "fix-ou",
  "tq-11": "offboard",
  "tq-13": "password-hygiene",
  "tq-15": "group-type",
  "tq-06": "trace-logon",
  "tq-07": "read-logs",
  "tq-08": "read-logs",
  "tq-09": "triage-alert",
  "tq-10": "triage-alert",
};
