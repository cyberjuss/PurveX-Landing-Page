// The core skills a help desk or SOC Tier 1 job asks for, named the way job
// postings name them, each made of the job tasks the portfolio already tracks
// (JOBS in academy-drills.ts). A badge's tier comes from those tasks' status,
// the same status the portfolio shows, so the two never disagree.

export type Competency = {
  id: string;
  title: string;
  /** What an employer gets from someone who has it, in one line. */
  why: string;
  /** Job task ids: every task in JOBS, once, plus portfolio-only tasks such as access-audit. */
  jobs: string[];
};

export const COMPETENCIES: Competency[] = [
  {
    id: "help-desk",
    title: "Help Desk Support",
    why: "Resolves sign-in and access tickets safely, checking the claim before acting.",
    jobs: ["verify-claim", "enable-account", "reset-password", "dns-fix"],
  },
  {
    id: "ad-admin",
    title: "Active Directory Administration",
    why: "Creates, files and retires accounts, groups and computers to the firm's standard.",
    jobs: ["create-user", "fix-ou", "group-type", "stale-objects", "gpo-scope"],
  },
  {
    id: "iam",
    title: "Identity and Access Management",
    why: "Grants access through roles and groups, and takes away what should not be there.",
    jobs: ["group-access", "role-based-access", "least-privilege", "access-audit", "offboard", "service-account"],
  },
  {
    id: "hardening",
    title: "Security Hardening",
    why: "Closes the settings attackers use: weak password rules, lockouts, exposed ports.",
    jobs: ["password-hygiene", "password-policy", "lockout-policy", "admin-password-policy", "firewall-rule", "harden-account"],
  },
  {
    id: "monitoring",
    title: "Log Analysis and Monitoring",
    why: "Turns on the logging a SOC needs and reads Windows security events.",
    jobs: ["enable-auditing", "log-retention", "read-logs", "trace-logon"],
  },
  {
    id: "incident-response",
    title: "Incident Response",
    why: "Triages an alert, contains the damage, keeps the evidence and escalates clearly.",
    jobs: ["triage-alert", "contain-account", "contain-wire-credential", "quarantine-file", "verify-build-integrity", "escalate-note"],
  },
];

export type JobState = { id: string; status: "new" | "practiced" | "proven" };
export type BadgeTier = "practiced" | "proficient" | "verified";
export const TIER_LABEL: Record<BadgeTier, string> = { practiced: "Practiced", proficient: "Proficient", verified: "Verified" };

export type CompetencyBadge = {
  id: string;
  title: string;
  why: string;
  tier: BadgeTier | null;
  proven: number;
  total: number;
  /** What the next tier needs, or null at the top. */
  next: string | null;
};

/**
 * Practiced: at least half its tasks tried. Proficient: at least half proven.
 * Verified: every task proven. Proven is the portfolio's own bar: confirmed in
 * the lab for a hands-on task, three right answers for the rest.
 */
export function competencyBadges(jobs: JobState[]): CompetencyBadge[] {
  const status = new Map(jobs.map((j) => [j.id, j.status]));
  return COMPETENCIES.map((c) => {
    const total = c.jobs.length;
    const proven = c.jobs.filter((id) => status.get(id) === "proven").length;
    const tried = c.jobs.filter((id) => status.get(id) === "proven" || status.get(id) === "practiced").length;
    const half = Math.ceil(total / 2);
    const tier: BadgeTier | null = proven === total ? "verified" : proven >= half ? "proficient" : tried >= half ? "practiced" : null;
    const next =
      tier === "verified"
        ? null
        : tier === "proficient"
          ? `Prove ${total - proven} more ${total - proven === 1 ? "task" : "tasks"} for Verified.`
          : tier === "practiced"
            ? `Prove ${half - proven} more ${half - proven === 1 ? "task" : "tasks"} for Proficient.`
            : `Try ${half - tried} more of its ${total} tasks.`;
    return { id: c.id, title: c.title, why: c.why, tier, proven, total, next };
  });
}

/** Two letters for a badge's seal: "Identity and Access Management" is IA. */
export function badgeInitials(title: string): string {
  return title
    .split(/\s+/)
    .filter((w) => w.toLowerCase() !== "and")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
