import type { Results, Skill } from "@/lib/academy-score";
import { PROOF_TICKETS } from "@/lib/academy-proof";

export type MissionCatalogEntry = {
  id: string;
  challenge:
    | "day-one"
    | "ticket-queue"
    | "alert-queue"
    | "wire"
    | "crypto"
    | "client-data"
    | "soc-alert"
    | "baseline-alert"
    | "threshold-alert"
    | "access-alert"
    | "credential-campaign"
    | "phishing-chain"
    | "open-door";
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
  "sm-01": {
    id: "sm-01",
    challenge: "soc-alert",
    title: "Check the Record Before You React (INC-1065)",
    prompt: "An alert flagged an off-hours sign-in. Read the account's own Description for the approved window it names.",
    skill: "security",
  },
  "sm-02": {
    id: "sm-02",
    challenge: "soc-alert",
    title: "Classify What You Actually Found (INC-1065)",
    prompt: "Given what the account's record showed, choose the classification that actually fits.",
    skill: "security",
  },
  "bt-01": {
    id: "bt-01",
    challenge: "baseline-alert",
    title: "Build the Baseline (INC-1066)",
    prompt: "Compare four Compliance Analysts' group membership and name the one whose access does not match the rest.",
    skill: "security",
  },
  "bt-02": {
    id: "bt-02",
    challenge: "baseline-alert",
    title: "Name the Extra Access (INC-1066)",
    prompt: "Name the group on the outlier account that the other three analysts do not have.",
    skill: "security",
  },
  "bt-03": {
    id: "bt-03",
    challenge: "baseline-alert",
    title: "Fix the Baseline (INC-1066)",
    prompt: "Remove the outlier account from the access-level group it does not need.",
    skill: "security",
  },
  "zt-01": {
    id: "zt-01",
    challenge: "open-door",
    title: "Find What It Actually Trusts (INC-1067)",
    prompt: "Find the inbound rule on the domain controller that trusts the whole network just for being inside it.",
    skill: "security",
  },
  "zt-02": {
    id: "zt-02",
    challenge: "open-door",
    title: "Close It (INC-1067)",
    prompt: "Disable the legacy internal-trust rule and report the port it allowed.",
    skill: "security",
  },
  "th-01": {
    id: "th-01",
    challenge: "threshold-alert",
    title: "Wealth Management Needs Its Own Threshold (INC-1068)",
    prompt: "Apply a Fine-Grained Password Policy balancing lockout friction against guessing resistance, then report the threshold set.",
    skill: "security",
  },
  "cp-03": {
    id: "cp-03",
    challenge: "credential-campaign",
    title: "What They Left Running (INC-1069)",
    prompt: "Find the unexplained scheduled task on the domain controller and name it.",
    skill: "security",
  },
  "cp-04": {
    id: "cp-04",
    challenge: "credential-campaign",
    title: "Close Its Channel (INC-1069)",
    prompt: "Find and disable the outbound rule the task relies on, then report the port.",
    skill: "security",
  },
  "cc-11": {
    id: "cc-11",
    challenge: "credential-campaign",
    title: "Write the Detection (INC-1072)",
    prompt: "Write the KQL summarize clause that flags a password spray by counting distinct accounts per source.",
    skill: "logs",
  },
  "cc-12": {
    id: "cc-12",
    challenge: "credential-campaign",
    title: "Name the Stage That Never Happened",
    prompt: "Name the Cyber Kill Chain stage after Command and Control that this campaign never reached.",
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
  "ea-01": {
    id: "ea-01",
    challenge: "access-alert",
    title: "Find the Right Tool (INC-1071)",
    prompt: "Name the PowerShell cmdlet that lists every group an account belongs to, including through nested membership.",
    skill: "security",
  },
  "ea-02": {
    id: "ea-02",
    challenge: "access-alert",
    title: "Find Who Does Not Belong (INC-1071)",
    prompt: "A Help Desk account can open the Compliance share's case files. Name the account.",
    skill: "security",
  },
  "ea-03": {
    id: "ea-03",
    challenge: "access-alert",
    title: "Remove the Access (INC-1071)",
    prompt: "Remove the account from the group that grants it, and report the group.",
    skill: "security",
  },
  "sl-01": {
    id: "sl-01",
    challenge: "credential-campaign",
    title: "Count the Spray (INC-1072)",
    prompt: "Find the accounts that each received a failed sign-in within the same short window, and count them.",
    skill: "security",
  },
  "sl-02": {
    id: "sl-02",
    challenge: "credential-campaign",
    title: "The One That Got Through (INC-1072)",
    prompt: "One account signed in successfully with no failed attempts before it at all. Name it.",
    skill: "security",
  },
  "sl-03": {
    id: "sl-03",
    challenge: "credential-campaign",
    title: "Unlock the Real Lockout (INC-1072)",
    prompt: "Find the account the log shows was actually locked out, unlock it, and report its name.",
    skill: "security",
  },
  "rc-01": {
    id: "rc-01",
    challenge: "phishing-chain",
    title: "Four Names That Were Never Real (INC-1073)",
    prompt: "Count the failed sign-ins whose status code says the account does not exist, not that the password was wrong.",
    skill: "security",
  },
  "dl-01": {
    id: "dl-01",
    challenge: "phishing-chain",
    title: "Find the Disguise (INC-1074)",
    prompt: "Find the disguised attachment on the Wealth Management share and report its full name.",
    skill: "security",
  },
  "pc-03": {
    id: "pc-03",
    challenge: "phishing-chain",
    title: "Hash It and Check It (INC-1074)",
    prompt: "Hash the disguised attachment with SHA-256 and check that hash on VirusTotal.",
    skill: "security",
  },
  "pi-01": {
    id: "pi-01",
    challenge: "phishing-chain",
    title: "Find What Got Planted (INC-1075)",
    prompt: "Find the scheduled task nobody on the team created, and report its exact name.",
    skill: "security",
  },
  "pc-05": {
    id: "pc-05",
    challenge: "phishing-chain",
    title: "Capture the Beacon Live (INC-1075)",
    prompt: "Capture the task's own outbound connection in Wireshark and report the destination port.",
    skill: "logs",
  },
  "pi-02": {
    id: "pi-02",
    challenge: "phishing-chain",
    title: "Close Its Channel (INC-1075)",
    prompt: "Find and disable the outbound firewall rule the task relies on, then report the port.",
    skill: "security",
  },
  "ao-01": {
    id: "ao-01",
    challenge: "phishing-chain",
    title: "Find What Got Collected (INC-1076)",
    prompt: "Find the file staged on the IT share that has no business being there, and report its name.",
    skill: "security",
  },
  "ao-02": {
    id: "ao-02",
    challenge: "phishing-chain",
    title: "Take It Off the Share (INC-1076)",
    prompt: "Move the staged file to Quarantine, then report the folder it is in now.",
    skill: "security",
  },
  "pc-10": {
    id: "pc-10",
    challenge: "phishing-chain",
    title: "Two Chains, One Pattern",
    prompt: "Name the one Kill Chain stage both this phase's campaigns reached and were stopped at.",
    skill: "security",
  },
  "od-02": {
    id: "od-02",
    challenge: "open-door",
    title: "Prove It Is Being Used (INC-1067)",
    prompt: "Find a real Logon Type 3 event crossing the open rule and report the logon type number.",
    skill: "logs",
  },
  "od-04": {
    id: "od-04",
    challenge: "open-door",
    title: "What They Left Behind (INC-1077)",
    prompt: "Find the scheduled task nobody on the team created, and report its exact name.",
    skill: "security",
  },
  "od-05": {
    id: "od-05",
    challenge: "open-door",
    title: "Close Its Channel (INC-1077)",
    prompt: "Find and disable the outbound firewall rule the task relies on, then report the port.",
    skill: "security",
  },
  "od-06": {
    id: "od-06",
    challenge: "open-door",
    title: "Find What They Were After (INC-1078)",
    prompt: "Find the file staged on the Compliance share that has no business being there, and report its name.",
    skill: "security",
  },
  "od-07": {
    id: "od-07",
    challenge: "open-door",
    title: "Take It Off the Share (INC-1078)",
    prompt: "Move the staged file to Quarantine, then report the folder it is in now.",
    skill: "security",
  },
  "od-08": {
    id: "od-08",
    challenge: "open-door",
    title: "No Delivery, No Problem",
    prompt: "Explain why this campaign never had a Delivery stage.",
    skill: "security",
  },
  "od-09": {
    id: "od-09",
    challenge: "open-door",
    title: "Three Campaigns, One Rule",
    prompt: "Name the one control that would have stopped all three campaigns' beacons.",
    skill: "security",
  },
};

export const CHALLENGE_PATHS: Record<
  MissionCatalogEntry["challenge"],
  { href: string; tab: string }
> = {
  "day-one": { href: "/range/phase-1/home-lab-challenges", tab: "operation-day-one" },
  "ticket-queue": { href: "/range/phase-1/home-lab-challenges", tab: "ticket-queue" },
  "alert-queue": { href: "/range/phase-2/capstone", tab: "the-credential-campaign" },
  "wire": { href: "/range/phase-1/week-3", tab: "the-nightly-settlement-push" },
  "crypto": { href: "/range/phase-1/week-2", tab: "the-mirror-that-does-not-match" },
  "client-data": { href: "/range/phase-1/home-lab-challenges", tab: "the-client-data-review" },
  "soc-alert": { href: "/range/phase-2/capstone", tab: "approved-overnight-or-not" },
  "baseline-alert": { href: "/range/phase-2/capstone", tab: "baseline-a-team-then-find-who-breaks-it" },
  "threshold-alert": { href: "/range/phase-2/capstone", tab: "set-a-defensible-lockout-threshold" },
  "access-alert": { href: "/range/phase-1/week-4", tab: "who-can-open-the-compliance-case-files" },
  "credential-campaign": { href: "/range/phase-2/capstone", tab: "the-credential-campaign" },
  "phishing-chain": { href: "/range/phase-2/capstone", tab: "the-phishing-chain" },
  "open-door": { href: "/range/phase-2/capstone", tab: "the-open-door" },
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
  "alert-queue": "The Credential Campaign",
  "wire": "The Nightly Settlement Push",
  "crypto": "The Mirror That Does Not Match",
  "client-data": "The Client Data Review",
  "soc-alert": "Approved Overnight, or Not?",
  "baseline-alert": "Baseline a Team, Then Find Who Breaks It",
  "threshold-alert": "Set a Defensible Lockout Threshold",
  "access-alert": "Who Can Open the Compliance Case Files?",
  "credential-campaign": "The Credential Campaign",
  "phishing-chain": "The Phishing Chain",
  "open-door": "The Open Door",
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
export const LAB_GATED_MISSIONS = [
  "tq-01", "tq-02", "tq-03", "tq-04", "tq-05", "tq-11", "tq-12", "tq-13", "tq-14", "tq-15", "tq-16", "tq-17", "tq-18", "tq-19", "tq-20", "tq-21", "tq-22", "tq-23", "tq-24", "tq-25",
  "cap-06", "cry-06", "bt-03", "zt-02", "th-01", "cp-04", "ea-03",
  "sl-01", "sl-02", "sl-03",
  "rc-01", "dl-01", "pc-03", "pi-01", "pc-05", "pi-02", "ao-01", "ao-02",
  "od-02", "od-04", "od-05", "od-06", "od-07",
];

/**
 * The on-the-job task each mission practices. A gated ticket seen in the lab
 * counts as proven. Built from PROOF_TICKETS, the Portfolio's own ticket-to-job
 * map, so "Work you have done" can never credit a ticket the Portfolio does
 * not, or the other way around -- a hand-kept second copy of this list drifted
 * from PROOF_TICKETS as new tickets were added, which is exactly the kind of
 * mismatch that is otherwise invisible until a student compares the two.
 */
export const MISSION_JOBS: Record<string, string> = {
  ...Object.fromEntries(Object.entries(PROOF_TICKETS).map(([id, t]) => [id, t.job])),
  // Investigation tickets: nothing changes in the lab, so there is no portfolio job.
  "tq-06": "trace-logon",
  "tq-07": "read-logs",
  "tq-08": "read-logs",
  "tq-09": "triage-alert",
  "tq-10": "triage-alert",
};
