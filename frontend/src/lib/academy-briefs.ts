import type { RoleId } from "@/lib/academy-certs";

/** The Home Lab brief, written for each role a student can pick at intake. */
export type RoleBrief = {
  title: string;
  lede: string;
  checks: [string, string, string, string, string];
  flags: [string, string, string];
  /** The goal line, split so the last words can be emphasised. */
  goal: [string, string];
};

export const ROLE_BRIEFS: Record<RoleId, RoleBrief> = {
  "help-desk": {
    title: "Help Desk Brief",
    lede: "You work the tickets. Before you change an account, confirm who is asking and what access they should have. For any ticket, answer these five questions.",
    checks: [
      "Is the caller really the person on the account?",
      "Is the account locked or disabled, or is the password wrong?",
      "Does the access they want match their department and job?",
      "Who approved this request, and is that on the ticket?",
      "Did the change work, and did you confirm it with the user?",
    ],
    flags: ["A reset asked for by someone other than the user", "An access request with no approval", "A ticket that does not match the directory"],
    goal: ["Close every ticket", "without giving away access"],
  },
  sysadmin: {
    title: "Sysadmin Brief",
    lede: "You own the directory. Every object should sit in the right place, with the right access and a reason to exist. For anything you touch, answer these five questions.",
    checks: [
      "Is this object in the OU its policies expect?",
      "Does this group grant only the access its name promises?",
      "Is this account still needed, and who owns it?",
      "Which Group Policy applies here, and is it the one you expect?",
      "Could you undo this change if it goes wrong?",
    ],
    flags: ["An account nobody owns", "A group nested where it should not be", "A service account with more rights than its job"],
    goal: ["Keep the directory", "clean enough to trust"],
  },
  "soc-analyst": {
    title: "SOC Analyst Brief",
    lede: "You watch the logs. An alert is only a starting point until you know what normal looks like here. For any event, answer these five questions.",
    checks: [
      "Which account is this, and does its activity fit its role?",
      "Is this login at a normal time, from a normal machine?",
      "Are these failed logons a typo or a pattern (4625, 4740)?",
      "Did group membership change, and who made the change (4728)?",
      "Is this worth escalating, and what evidence backs it?",
    ],
    flags: ["Failed logons across many accounts", "A 2 AM login from an unfamiliar workstation", "A user added to a privileged group with no ticket"],
    goal: ["Learn to tell", "which alert is real"],
  },
  "cyber-analyst": {
    title: "Cybersecurity Analyst Brief",
    lede: "You look for weakness before an attacker does. The directory shows where access is wider than it should be. For any finding, answer these five questions.",
    checks: [
      "Who can reach sensitive data, and should they?",
      "Does the password and lockout policy meet a real standard?",
      "Are the events you need actually being audited?",
      "Which accounts would an attacker target first?",
      "How serious is this, and what is the fix?",
    ],
    flags: ["A policy that never locks an account", "Admin rights on an everyday account", "Auditing turned off for logons or group changes"],
    goal: ["Rank every finding by", "the risk it carries"],
  },
  "ir-analyst": {
    title: "Incident Response Brief",
    lede: "You arrive when something has gone wrong. First you need to know what normal was, so you can see what changed. For any incident, answer these five questions.",
    checks: [
      "Which accounts are involved, and what should they normally do?",
      "What changed, and when did it change?",
      "How do you contain this without destroying evidence?",
      "What do the logs show before and after the first sign?",
      "What would you write in the report, and in what order?",
    ],
    flags: ["An account used outside its normal hours", "A change with no ticket behind it", "Logs cleared or missing for a window of time"],
    goal: ["Fix the incident", "and prove what happened"],
  },
};
