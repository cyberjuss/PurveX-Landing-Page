// Where to read up on a desk ticket: the lesson section that teaches the job it practices.
// Links open the exact tab (section-tabs reads the #slug of a tab's label).

import type { Skill } from "@/lib/academy-score";

export type LessonLink = { href: string; label: string };

const P1 = "/range/phase-1";
const L = (week: string, tab: string | null, label: string): LessonLink => ({
  href: `${P1}/${week}${tab ? `#${tab}` : ""}`,
  label,
});

const JOB_LESSONS: Record<string, LessonLink> = {
  "enable-account": L("home-lab-desk", "unlock-or-reset", "Unlock or Reset"),
  "reset-password": L("home-lab-desk", "unlock-or-reset", "Unlock or Reset"),
  "verify-claim": L("home-lab-desk", "find-an-account", "Find an Account"),
  "fix-ou": L("home-lab-desk", "move-an-account", "Move an Account"),
  "create-user": L("home-lab-directory", "accounts", "Accounts"),
  offboard: L("home-lab-directory", "accounts", "Accounts"),
  "stale-objects": L("home-lab-directory", "accounts", "Accounts"),
  "password-hygiene": L("home-lab-directory", "accounts", "Accounts"),
  "group-access": L("home-lab-directory", "groups", "Groups"),
  "group-type": L("home-lab-directory", "groups", "Groups"),
  "service-account": L("home-lab-directory", "service-accounts", "Service Accounts"),
  "harden-account": L("home-lab-directory", "service-accounts", "Service Accounts"),
  "gpo-scope": L("home-lab-directory", "group-policy", "Group Policy"),
  "least-privilege": L("week-4", "authorization", "Authorization"),
  "role-based-access": L("week-4", "authorization", "Authorization"),
  "contain-account": L("week-4", "authentication", "Authentication"),
  "admin-password-policy": L("week-4", "authentication", "Authentication"),
  "lockout-policy": L("week-4", "authentication", "Authentication"),
  "password-policy": L("week-4", "authentication", "Authentication"),
  "trace-logon": L("week-4", "authentication", "Authentication"),
  "enable-auditing": L("week-4", null, "Access Control"),
  "log-retention": L("week-4", null, "Access Control"),
  "read-logs": L("week-4", null, "Access Control"),
  "dns-fix": L("week-3", "protocols", "Protocols"),
  "contain-wire-credential": L("week-3", "protocols", "Protocols"),
  "firewall-rule": L("week-3", "common-ports", "Common Ports"),
  "verify-build-integrity": L("week-2", "hashing-and-integrity", "Hashing and Integrity"),
  "quarantine-file": L("week-1", "threats", "Threats"),
  "triage-alert": L("week-1", "risk", "Risk"),
  "escalate-note": L("week-1", "risk", "Risk"),
};

const SKILL_LESSONS: Record<Skill, LessonLink> = {
  accounts: L("home-lab-directory", "accounts", "Accounts"),
  directory: L("home-lab-directory", "organizational-units", "Organizational Units"),
  troubleshooting: L("home-lab-desk", "find-an-account", "Find an Account"),
  security: L("week-1", "threats", "Threats"),
  logs: L("week-4", "authentication", "Authentication"),
  access: L("week-4", "authorization", "Authorization"),
  risk: L("week-1", "risk", "Risk"),
};

/** The lesson behind a ticket: its job's section when known, else its skill's. */
export function lessonFor(job: string | undefined, skill: Skill): LessonLink {
  return (job && JOB_LESSONS[job]) || SKILL_LESSONS[skill];
}

export const JOB_LESSON_IDS = Object.keys(JOB_LESSONS);

/** Live-shift incidents, by the job their fix practices. */
const INCIDENT_JOBS: Record<string, string> = {
  "lockout-ticket": "enable-account",
  spray: "lockout-policy",
  "rogue-admin": "least-privilege",
  "false-alarm": "verify-claim",
  "compromised-account": "contain-account",
  "weak-policy": "password-policy",
  "wrong-disable": "enable-account",
  "preauth-exposure": "harden-account",
  "access-request": "group-access",
  offboarding: "offboard",
  "pwd-notreqd": "password-hygiene",
  delegation: "least-privilege",
  "pwd-expired": "reset-password",
  "wrong-ou": "fix-ou",
  "never-expires": "password-hygiene",
  "rogue-computer": "stale-objects",
  "audit-disabled": "enable-auditing",
  "reversible-enc": "password-hygiene",
  kerberoast: "harden-account",
  "domain-admins": "least-privilege",
  "backdoor-account": "contain-account",
  "targeted-bruteforce": "lockout-policy",
  "admin-pso": "admin-password-policy",
  "dept-transfer": "fix-ou",
  "threat-hunt-spn": "harden-account",
};

/** The lesson behind a live-shift incident. */
export function lessonForIncident(defId: string, skill: Skill): LessonLink {
  return lessonFor(INCIDENT_JOBS[defId], skill);
}

export const INCIDENT_LESSON_IDS = Object.keys(INCIDENT_JOBS);
