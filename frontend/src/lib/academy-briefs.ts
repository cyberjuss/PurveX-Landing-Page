import type { RoleId } from "@/lib/academy-certs";

/** The Home Lab brief for each role a student can pick at intake. Keep it brief. */
export type RoleBrief = {
  title: string;
  lede: string;
  checks: [string, string, string];
  flags: [string, string, string];
  /** The goal line, split so the last words can be emphasised. */
  goal: [string, string];
};

export const ROLE_BRIEFS: Record<RoleId, RoleBrief> = {
  "help-desk": {
    title: "Help Desk Brief",
    lede: "You work the tickets. Ask these before you change an account.",
    checks: ["Is the caller the account owner?", "Locked, disabled, or wrong password?", "Does the access match their job?"],
    flags: ["A reset for someone else", "Access with no approval", "A ticket the directory disagrees with"],
    goal: ["Close tickets", "without giving away access"],
  },
  sysadmin: {
    title: "Sysadmin Brief",
    lede: "You own the directory. Ask these about anything you touch.",
    checks: ["Is it in the right OU?", "Does the group grant only what it should?", "Can you undo this change?"],
    flags: ["An account nobody owns", "A group nested where it should not be", "A service account with extra rights"],
    goal: ["Keep the directory", "clean enough to trust"],
  },
  "soc-analyst": {
    title: "SOC Analyst Brief",
    lede: "You watch the logs. Ask these about any event.",
    checks: ["Does this activity fit the account's role?", "Normal time, normal machine?", "Typo or pattern (4625, 4740)?"],
    flags: ["Failed logons across many accounts", "A 2 AM login from a new machine", "A privileged group change with no ticket"],
    goal: ["Learn to tell", "which alert is real"],
  },
  "cyber-analyst": {
    title: "Cybersecurity Analyst Brief",
    lede: "You find weakness first. Ask these about any finding.",
    checks: ["Who can reach sensitive data?", "Do lockout and password rules hold up?", "Are the right events audited?"],
    flags: ["A policy that never locks an account", "Admin rights on an everyday account", "Auditing turned off"],
    goal: ["Rank findings by", "the risk they carry"],
  },
  "ir-analyst": {
    title: "Incident Response Brief",
    lede: "You arrive after something breaks. Ask these first.",
    checks: ["Which accounts are involved?", "What changed, and when?", "How do you contain it and keep evidence?"],
    flags: ["Activity outside normal hours", "A change with no ticket", "A gap in the logs"],
    goal: ["Fix it", "and prove what happened"],
  },
};
