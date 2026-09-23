import type { Skill } from "@/lib/academy-score";

export type MissionCatalogEntry = {
  id: string;
  challenge: "day-one" | "ticket-queue";
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
    prompt: "Jamie Torres is not getting company-wide email. How many members does the All Employees group have?",
    skill: "accounts",
  },
  "tq-02": {
    id: "tq-02",
    challenge: "ticket-queue",
    title: "Locked Out (INC-1042)",
    prompt: "Riley Kwan says the account is locked. Is riley.kwan actually locked out? true or false.",
    skill: "troubleshooting",
  },
  "tq-03": {
    id: "tq-03",
    challenge: "ticket-queue",
    title: "New Hire Access (INC-1043)",
    prompt: "A new hire needs access. How many members does the IT Users group have?",
    skill: "accounts",
  },
  "tq-04": {
    id: "tq-04",
    challenge: "ticket-queue",
    title: "The Backup Account (INC-1044)",
    prompt: "Read the description of svc-backup-job and report its run window as 00:00-00:00.",
    skill: "troubleshooting",
  },
  "tq-05": {
    id: "tq-05",
    challenge: "ticket-queue",
    title: "The Transfer That Did Not Happen (INC-1045)",
    prompt: "How many OU= entries are in the path of taylor.osei?",
    skill: "troubleshooting",
  },
  "tq-06": {
    id: "tq-06",
    challenge: "ticket-queue",
    title: "The 2 AM Login (INC-1046)",
    prompt: "What ticket ID does the description of WM-WKS07 reference?",
    skill: "security",
  },
  "tq-07": {
    id: "tq-07",
    challenge: "ticket-queue",
    title: "Read the Log (INC-1046)",
    prompt: "How many failed logons (4625) happen before the first successful logon (4624)?",
    skill: "security",
  },
  "tq-08": {
    id: "tq-08",
    challenge: "ticket-queue",
    title: "Why the Privileges? (INC-1046)",
    prompt: "Which of Alex's groups explains why the session received special privileges?",
    skill: "security",
  },
  "tq-09": {
    id: "tq-09",
    challenge: "ticket-queue",
    title: "Mistake or Attack? (INC-1046)",
    prompt: "Choose the best explanation for the incident.",
    skill: "security",
  },
  "tq-10": {
    id: "tq-10",
    challenge: "ticket-queue",
    title: "Your First Move (INC-1046)",
    prompt: "Choose the best first response move.",
    skill: "security",
  },
};

export function findMissionsByQuery(query: string): MissionCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return Object.values(MISSION_CATALOG);
  return Object.values(MISSION_CATALOG).filter((m) => {
    const hay = `${m.id} ${m.title} ${m.prompt} ${m.challenge}`.toLowerCase();
    return hay.includes(q) || q.includes(m.id);
  });
}
