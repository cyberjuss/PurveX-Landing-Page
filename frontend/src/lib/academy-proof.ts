import type { RoleId } from "@/lib/academy-certs";
import type { DrillEntry } from "@/lib/academy-drills";
import type { LabPassId, Results } from "@/lib/academy-score";

// The Proof Profile: confirmed lab work, written for employers and for the
// student's resume. Every item comes from a change the lab itself confirmed,
// either a Ticket Queue ticket or a lab fix in a daily drill or weekly CTF.

/** Resume bullets are written for three kinds of job. */
export type Track = "soc" | "help" | "sys";
/** One STAR part of a bullet: situation, task, action or result. */
export type StarPart = ["s" | "t" | "a" | "r", string];

type Entry = {
  /** The task, said the way an employer reads it. */
  title: string;
  /** What the student did and why it mattered, one step per line. */
  actions: string[];
  keywords: string[];
  bullets: Record<Track, StarPart[]>;
};

export const TRACK_FOR_ROLE: Record<RoleId, Track> = {
  "help-desk": "help",
  sysadmin: "sys",
  "soc-analyst": "soc",
  "cyber-analyst": "soc",
  "ir-analyst": "soc",
};

export const TRACK_LABEL: Record<Track, string> = { soc: "SOC Analyst", help: "Help Desk", sys: "Sysadmin" };

const CATALOG: Record<string, Entry> = {
  "lockout-policy": {
    title: "Enforced an account lockout policy against password guessing",
    actions: ["Configured a domain lockout threshold, capping how many passwords an attacker can try on one account", "Set lockout duration and counter reset to slow guessing without locking real users out for long", "Validated the policy on the domain controller so it applied to every account"],
    keywords: ["Account Lockout Policy", "Group Policy (GPO)"],
    bullets: {
      soc: [["a", "Hardened"], ["s", "an Active Directory domain"], ["t", "against password guessing"], ["a", "by enforcing account lockout after repeated failed sign-ins,"], ["r", "a fix confirmed by an automated lab check."]],
      help: [["a", "Strengthened"], ["s", "domain sign-in security"], ["t", "against guessed passwords"], ["a", "by setting an account lockout policy."]],
      sys: [["a", "Configured"], ["s", "Group Policy account lockout"], ["t", "to stop password guessing,"], ["r", "verified by an automated lab check."]],
    },
  },
  "password-policy": {
    title: "Strengthened the domain password policy",
    actions: ["Raised the minimum password length, making stolen password hashes far slower to crack", "Enforced complexity requirements through Group Policy across every domain account", "Validated the new policy on the domain controller"],
    keywords: ["Password Policy", "Group Policy (GPO)"],
    bullets: {
      soc: [["a", "Raised"], ["s", "the domain password standard"], ["a", "to a 12-character minimum with complexity,"], ["r", "cutting the risk of cracked passwords."]],
      help: [["a", "Tightened"], ["s", "password rules for all users"], ["a", "with a longer minimum and complexity,"], ["r", "reducing reset-prone weak passwords."]],
      sys: [["a", "Configured"], ["s", "the domain password policy in Group Policy"], ["a", "with a 12-character minimum and complexity."]],
    },
  },
  "enable-auditing": {
    title: "Closed a security auditing gap for incident investigation",
    actions: ["Identified a missing category in the domain's advanced audit policy that left sign-ins and changes unrecorded", "Enabled success and failure auditing through Group Policy, giving investigators the events needed to trace an incident"],
    keywords: ["Security Auditing", "Advanced Audit Policy", "Windows Event Logs"],
    bullets: {
      soc: [["a", "Enabled"], ["s", "missing Windows security auditing on a domain controller"], ["t", "to support incident investigations,"], ["r", "so key events are logged."]],
      help: [["a", "Turned on"], ["s", "Windows security auditing"], ["r", "so account and sign-in events are recorded for review."]],
      sys: [["a", "Configured"], ["s", "advanced audit policy on a domain controller,"], ["r", "giving investigators a usable log."]],
    },
  },
  "log-retention": {
    title: "Extended Security log retention for forensic readiness",
    actions: ["Assessed Security log capacity against how long investigations need evidence", "Increased the maximum log size so sign-in evidence lasts long enough to investigate an intrusion found weeks later"],
    keywords: ["Log Management", "Windows Event Logs"],
    bullets: {
      soc: [["a", "Extended"], ["s", "Security log retention on a domain controller"], ["t", "so evidence survives an investigation window."]],
      help: [["a", "Increased"], ["s", "the Security log size"], ["r", "so older sign-in events stay available."]],
      sys: [["a", "Resized"], ["s", "the Windows Security log"], ["r", "to keep events long enough to investigate."]],
    },
  },
  "admin-password-policy": {
    title: "Applied a stricter password policy to privileged accounts",
    actions: ["Created a fine-grained password policy (PSO) for the accounts that can change the whole domain", "Scoped it to administrative accounts, leaving standard users on the domain policy", "Required longer passwords and tighter lockout, raising the bar on the accounts attackers want most"],
    keywords: ["Fine-Grained Password Policies (FGPP)", "Privileged Account Security"],
    bullets: {
      soc: [["a", "Hardened"], ["s", "privileged accounts"], ["a", "with a fine-grained password policy and strict lockout."]],
      help: [["a", "Applied"], ["s", "a stricter password policy to admin accounts."]],
      sys: [["a", "Implemented"], ["s", "a fine-grained password policy for admin accounts,"], ["r", "requiring longer passwords than standard users."]],
    },
  },
  "harden-account": {
    title: "Remediated a Kerberos pre-authentication weakness",
    actions: ["Identified an account without Kerberos pre-authentication, exposed to offline password cracking", "Required pre-authentication and a password, so no one on the network can request crackable data for it"],
    keywords: ["Kerberos", "Security Hardening"],
    bullets: {
      soc: [["a", "Remediated"], ["s", "an account open to offline password cracking"], ["a", "by requiring Kerberos pre-authentication and a password."]],
      help: [["a", "Secured"], ["s", "a weakly configured account"], ["a", "by requiring a password and Kerberos pre-authentication."]],
      sys: [["a", "Hardened"], ["s", "an Active Directory account"], ["a", "by clearing unsafe account flags."]],
    },
  },
  "group-access": {
    title: "Provisioned access through role-based group membership",
    actions: ["Identified the security group mapped to the requested resource", "Granted access through that group instead of direct rights, giving the user only what the role needs", "Verified the user's effective access, keeping it easy to review and remove later"],
    keywords: ["Role-Based Access Control (RBAC)", "Least Privilege"],
    bullets: {
      soc: [["a", "Granted"], ["s", "a user's missing access"], ["a", "through the correct security group instead of admin rights,"], ["r", "keeping least privilege intact."]],
      help: [["a", "Resolved"], ["s", "a missing-access ticket"], ["a", "by adding the user to the right security group,"], ["r", "restoring access without over-granting."]],
      sys: [["a", "Managed"], ["s", "Active Directory group membership"], ["t", "to grant access by role"], ["a", "instead of assigning rights directly."]],
    },
  },
  "enable-account": {
    title: "Diagnosed and resolved a user sign-in failure",
    actions: ["Distinguished a disabled account from a lockout before acting, avoiding the wrong fix", "Restored the account without an unnecessary password reset, sparing the user extra downtime", "Confirmed the user could sign in again"],
    keywords: ["Account Management", "Troubleshooting"],
    bullets: {
      soc: [["a", "Investigated"], ["s", "a user sign-in failure"], ["a", "by checking account state before acting,"], ["r", "telling a disabled account from a lockout."]],
      help: [["a", "Resolved"], ["s", "a locked-out user ticket"], ["a", "by inspecting the account first and re-enabling it,"], ["r", "restoring sign-in without an unneeded password reset."]],
      sys: [["a", "Restored"], ["s", "a disabled Active Directory account"], ["a", "after verifying its state,"], ["r", "and confirmed the user could sign in."]],
    },
  },
  "create-user": {
    title: "Onboarded a new hire to naming and access standards",
    actions: ["Created the account in the correct department OU so the right policies applied from day one", "Assigned only the role-required security group, giving the new hire exactly the access the job needs", "Removed a stale account that still held access, closing an unused way in"],
    keywords: ["User Provisioning", "Organizational Units (OUs)"],
    bullets: {
      soc: [["a", "Provisioned"], ["s", "a new hire account"], ["a", "with only the required group,"], ["r", "and removed a leftover account with stale access."]],
      help: [["a", "Onboarded"], ["s", "a new employee in Active Directory,"], ["a", "creating the account to the naming standard with the right group."]],
      sys: [["a", "Provisioned"], ["s", "user accounts in Active Directory"], ["a", "to the naming standard in the correct OU and groups,"], ["r", "and cleaned up a stale account."]],
    },
  },
  "fix-ou": {
    title: "Processed a department transfer and removed legacy access",
    actions: ["Moved the account to the new department's OU so the right policies applied", "Replaced the previous department group with the new one, removing access the new role did not need", "Confirmed no access to the former department remained"],
    keywords: ["Organizational Units (OUs)", "Least Privilege"],
    bullets: {
      soc: [["a", "Remediated"], ["s", "leftover access for a transferred employee"], ["a", "by moving the account to the correct OU and department group,"], ["r", "enforcing least privilege."]],
      help: [["a", "Processed"], ["s", "a department transfer in Active Directory,"], ["a", "moving the user to the correct OU and group,"], ["r", "so access matched the org chart."]],
      sys: [["a", "Corrected"], ["s", "a misplaced Active Directory account"], ["a", "by moving it to the right OU and group,"], ["r", "so the right policies applied."]],
    },
  },
  "least-privilege": {
    title: "Revoked unnecessary privileges in an access review",
    actions: ["Reviewed group membership against the user's role", "Removed access the role did not require, limiting what a stolen sign-in for the account could reach"],
    keywords: ["Least Privilege", "Access Reviews"],
    bullets: {
      soc: [["a", "Reduced"], ["s", "excess privileges on an account"], ["a", "by reviewing group membership and removing unneeded access,"], ["r", "shrinking the attack surface."]],
      help: [["a", "Cleaned up"], ["s", "a user's access"], ["a", "by removing a group their role did not need."]],
      sys: [["a", "Enforced"], ["s", "least privilege in Active Directory"], ["a", "by auditing group membership and removing unneeded access."]],
    },
  },
  offboard: {
    title: "Offboarded a departing user while preserving audit history",
    actions: ["Disabled the account instead of deleting it, stopping sign-ins while keeping history for auditors and investigators", "Removed every group membership so the account held no access"],
    keywords: ["User Deprovisioning"],
    bullets: {
      soc: [["a", "Contained"], ["s", "a departed user's access"], ["a", "by disabling the account and removing every group,"], ["r", "while keeping it for audit."]],
      help: [["a", "Offboarded"], ["s", "a departed employee"], ["a", "by disabling the account and removing group access."]],
      sys: [["a", "Offboarded"], ["s", "a user account"], ["a", "by disabling it and clearing its group memberships,"], ["r", "keeping the object for audit."]],
    },
  },
  "service-account": {
    title: "Documented a service account's approved operating window",
    actions: ["Located the approved run hours for the service account", "Recorded them on the account, giving the SOC a baseline so off-hours sign-ins stand out"],
    keywords: ["Service Account Management"],
    bullets: {
      soc: [["a", "Documented"], ["s", "a service account's approved run window"], ["t", "for auditors,"], ["r", "so off-hours logons stand out."]],
      help: [["a", "Updated"], ["s", "a service account record"], ["a", "with its approved run window for an audit request."]],
      sys: [["a", "Managed"], ["s", "a service account"], ["a", "by recording its approved run window,"], ["r", "supporting audit and monitoring."]],
    },
  },
  "stale-objects": {
    title: "Retired an inactive directory object",
    actions: ["Confirmed the object had been inactive for more than 90 days", "Disabled it, removing an unused sign-in nobody would notice being misused"],
    keywords: ["Account Lifecycle Management"],
    bullets: {
      soc: [["a", "Disabled"], ["s", "an inactive account"], ["t", "to reduce the attack surface,"], ["r", "after confirming 90 days without a sign-in."]],
      help: [["a", "Retired"], ["s", "an unused account"], ["a", "after confirming 90 days of inactivity."]],
      sys: [["a", "Retired"], ["s", "stale Active Directory objects"], ["a", "inactive for over 90 days,"], ["r", "keeping the directory clean."]],
    },
  },
  "password-hygiene": {
    title: "Restored password expiration on a user account",
    actions: ["Identified a user account exempt from password expiration", "Removed the exemption, putting the account back under the domain's password policy like every other account"],
    keywords: ["Password Policy"],
    bullets: {
      soc: [["a", "Closed"], ["s", "a password exposure risk"], ["a", "by removing a non-expiring password from a user account."]],
      help: [["a", "Corrected"], ["s", "a user account set to never expire its password."]],
      sys: [["a", "Enforced"], ["s", "password expiration"], ["a", "by clearing Password never expires on a user account."]],
    },
  },
  "group-type": {
    title: "Corrected a group that could not grant permissions",
    actions: ["Diagnosed a distribution group being used for access control, which cannot grant permissions", "Converted it to a security group so the permissions assigned to it took effect"],
    keywords: ["Security Groups"],
    bullets: {
      soc: [["a", "Fixed"], ["s", "an access gap"], ["a", "by converting a distribution group to a security group."]],
      help: [["a", "Resolved"], ["s", "an access issue"], ["a", "by converting a distribution group to a security group."]],
      sys: [["a", "Converted"], ["s", "a distribution group to a security group"], ["r", "so it could grant permissions."]],
    },
  },
};

/** Ticket Queue tickets whose change the lab confirms, and the job each proves. */
export const PROOF_TICKETS: Record<string, { job: string; label: string }> = {
  "tq-01": { job: "group-access", label: "Service ticket INC-1041" },
  "tq-02": { job: "enable-account", label: "Service ticket INC-1042" },
  "tq-03": { job: "create-user", label: "Service ticket INC-1043" },
  "tq-04": { job: "service-account", label: "Service ticket INC-1044" },
  "tq-05": { job: "fix-ou", label: "Service ticket INC-1045" },
};

export type OpenTask = { job: string; title: string; where: string; href: string };

/** Tasks the portfolio can show that the student has not done yet, and where to do each one. */
export function openTasks(done: string[]): OpenTask[] {
  const have = new Set(done);
  const ticketFor = new Map(Object.entries(PROOF_TICKETS).map(([id, t]) => [t.job, { id, label: t.label }]));
  return Object.entries(CATALOG)
    .filter(([job]) => !have.has(job))
    .map(([job, e]) => {
      const t = ticketFor.get(job);
      return t
        ? { job, title: e.title, where: `Ticket Queue · ${t.label.replace("Service ticket ", "")}`, href: `/academy/phase-1/home-lab-active-directory#${t.id}` }
        : { job, title: e.title, where: "Daily drill", href: "/academy/drill" };
    })
    .sort((a, b) => Number(b.where !== "Daily drill") - Number(a.where !== "Daily drill"));
}

export type WorkItem = {
  job: string;
  title: string;
  actions: string[];
  /** YYYY-MM-DD the lab confirmed it. */
  date: string;
  /** Where it was done: a ticket, a daily drill, or the weekly CTF. */
  from: string;
  keywords: string[];
  bullets: Record<Track, StarPart[]>;
};

/** Every confirmed lab task, one per job, newest first. */
export function buildWorkItems(results: Results, drills: DrillEntry[]): WorkItem[] {
  const found = new Map<string, { date: string; from: string }>();
  const note = (job: string, date: string, from: string) => {
    if (!CATALOG[job]) return;
    const had = found.get(job);
    if (!had || date > had.date) found.set(job, { date, from });
  };
  for (const [id, t] of Object.entries(PROOF_TICKETS)) {
    const r = results[id];
    if (r?.labOk) note(t.job, (r.at ?? "").slice(0, 10), t.label);
  }
  for (const entry of drills) {
    for (const d of entry.detail ?? []) {
      if (d.k === "change" && d.c === 1 && d.j) note(d.j, entry.day, entry.mode === "ctf" ? "Weekly CTF" : "Daily drill");
    }
  }
  return [...found.entries()]
    .map(([job, f]) => ({ job, ...CATALOG[job], date: f.date, from: f.from }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Skills as the keywords job postings use, grouped like a resume Skills section. */
/** Skills a passed browser lab shows. Each lab confirms the work: the hash must match, the decode must be right. */
const LAB_PASS_SKILLS: Record<LabPassId, string[]> = {
  "lab-risk-triage": ["Risk Assessment", "CIA Triad"],
  "lab-hash-verify": ["Cryptographic Hashing (SHA-256)", "Indicators of Compromise (IOCs)"],
  "lab-password-table": ["Password Hashing and Salting", "Encryption (AES)", "Base64 Encoding"],
  "lab-signin-log": ["Log Analysis", "Windows Event Logs", "Incident Triage"],
  "lab-effective-access": ["NTFS Permissions", "Share Permissions", "Access Control"],
};

export function buildSkills(items: WorkItem[], hasLab: boolean, didCtf: boolean, results: Results = {}): { group: string; items: string[] }[] {
  const identity = new Set<string>();
  const monitoring = new Set<string>();
  if (hasLab || items.length) identity.add("Active Directory");
  for (const it of items) {
    for (const k of it.keywords) {
      if (/audit|event|log/i.test(k)) monitoring.add(k);
      else identity.add(k);
    }
  }
  if (didCtf) {
    monitoring.add("Windows Event Logs");
    monitoring.add("Event Viewer");
    monitoring.add("Log Analysis");
  }
  const groups = [
    { group: "Identity and Access Management (IAM)", items: [...identity] },
    { group: "Security Monitoring", items: [...monitoring] },
    { group: "Security Analysis", items: (Object.keys(LAB_PASS_SKILLS) as LabPassId[]).filter((id) => results[id]?.solved).flatMap((id) => LAB_PASS_SKILLS[id]) },
    { group: "Scripting", items: hasLab ? ["PowerShell"] : [] },
  ];
  return groups.filter((g) => g.items.length);
}

export const SHOTS_PER_ITEM = 5;

/** A certification the student adds beyond the ones Goals tracks. */
export type ExtraCert = { name: string; status: "earned" | "booked" | "studying"; date?: string };

export const CERT_STATUS_LABEL: Record<ExtraCert["status"], string> = { earned: "Certified", booked: "Exam booked", studying: "Studying now" };

/** Common entry-level certifications, offered as suggestions. */
export const CERT_SUGGESTIONS = [
  "CompTIA A+",
  "CompTIA Network+",
  "CompTIA Linux+",
  "CompTIA PenTest+",
  "ISC2 Certified in Cybersecurity (CC)",
  "Google Cybersecurity Certificate",
  "Cisco CCNA",
  "Cisco CyberOps Associate",
  "Microsoft SC-900",
  "Microsoft AZ-900",
  "Microsoft SC-200",
  "Splunk Core Certified User",
  "ITIL 4 Foundation",
];

/** "Certified · Mar 2026", "Exam booked Nov 18" or "Studying now". */
export function certStatusText(c: ExtraCert): string {
  if (!c.date) return CERT_STATUS_LABEL[c.status];
  const d = new Date(`${c.date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return CERT_STATUS_LABEL[c.status];
  if (c.status === "earned") return `Certified · ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
  if (c.status === "booked") return `Exam booked ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  return CERT_STATUS_LABEL[c.status];
}

/** When the student can start, as employers see it. */
export const AVAILABILITY = ["Available now", "Available in 2 weeks", "Available in a month", "Available after graduation"] as const;
/** Self-reported work eligibility. Hidden unless the student picks one. */
export const WORK_AUTH = ["US citizen", "Authorized to work in the US", "Will need visa sponsorship"] as const;
export const CLEARANCE = ["Willing to obtain a clearance", "Active Public Trust", "Active Secret clearance", "Active Top Secret clearance"] as const;

/** A job the Proof Profile can show. */
export const isProofJob = (job: unknown): job is string => typeof job === "string" && job in CATALOG;

/** Asks the Academy to offer an optional screenshot for a task the lab just confirmed. */
export const PROOF_PROMPT_EVENT = "academy:proof-prompt";
export function askForProofShot(job: string, from: string) {
  if (typeof window === "undefined" || !isProofJob(job)) return;
  window.dispatchEvent(new CustomEvent(PROOF_PROMPT_EVENT, { detail: { job, from } }));
}
