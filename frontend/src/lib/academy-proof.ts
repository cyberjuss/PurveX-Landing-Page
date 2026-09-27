import type { RoleId } from "@/lib/academy-certs";
import type { DrillEntry } from "@/lib/academy-drills";
import type { Results } from "@/lib/academy-score";

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
  /** What the student did, in plain generic steps. */
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
    title: "Stopped password guessing across the domain",
    actions: ["Set a lockout threshold for failed sign-ins", "Set how long a locked account stays locked"],
    keywords: ["Account lockout policy", "Group Policy (GPO)"],
    bullets: {
      soc: [["a", "Hardened"], ["s", "an Active Directory domain"], ["t", "against password spraying"], ["a", "by enforcing account lockout after repeated failed sign-ins,"], ["r", "a fix confirmed by an automated lab check."]],
      help: [["a", "Strengthened"], ["s", "domain sign-in security"], ["t", "against guessed passwords"], ["a", "by setting an account lockout policy."]],
      sys: [["a", "Configured"], ["s", "Group Policy account lockout"], ["t", "to stop password guessing,"], ["r", "verified by an automated lab check."]],
    },
  },
  "password-policy": {
    title: "Required stronger passwords",
    actions: ["Raised the minimum password length", "Enabled password complexity"],
    keywords: ["Password policy", "Group Policy (GPO)"],
    bullets: {
      soc: [["a", "Raised"], ["s", "the domain password standard"], ["a", "to a 12-character minimum with complexity,"], ["r", "cutting the risk of cracked passwords."]],
      help: [["a", "Tightened"], ["s", "password rules for all users"], ["a", "with a longer minimum and complexity,"], ["r", "reducing reset-prone weak passwords."]],
      sys: [["a", "Configured"], ["s", "the domain password policy in Group Policy"], ["a", "with a 12-character minimum and complexity."]],
    },
  },
  "enable-auditing": {
    title: "Turned on the auditing investigators need",
    actions: ["Enabled a missing Windows audit category"],
    keywords: ["Windows Security auditing", "Advanced Audit Policy", "Event Viewer"],
    bullets: {
      soc: [["a", "Enabled"], ["s", "missing Windows security auditing on a domain controller"], ["t", "to support incident investigations,"], ["r", "so key events are logged."]],
      help: [["a", "Turned on"], ["s", "Windows security auditing"], ["r", "so account and sign-in events are recorded for review."]],
      sys: [["a", "Configured"], ["s", "advanced audit policy on a domain controller,"], ["r", "giving investigators a usable log."]],
    },
  },
  "log-retention": {
    title: "Kept security events from being overwritten",
    actions: ["Increased the Security log size"],
    keywords: ["Event log management", "Event Viewer"],
    bullets: {
      soc: [["a", "Extended"], ["s", "Security log retention on a domain controller"], ["t", "so evidence survives an investigation window."]],
      help: [["a", "Increased"], ["s", "the Security log size"], ["r", "so older sign-in events stay available."]],
      sys: [["a", "Resized"], ["s", "the Windows Security log"], ["r", "to keep events long enough to investigate."]],
    },
  },
  "admin-password-policy": {
    title: "Gave admins a stricter password policy",
    actions: ["Created a fine-grained password policy", "Applied it to admin accounts"],
    keywords: ["Fine-grained password policy", "Privileged access"],
    bullets: {
      soc: [["a", "Hardened"], ["s", "privileged accounts"], ["a", "with a fine-grained password policy and strict lockout."]],
      help: [["a", "Applied"], ["s", "a stricter password policy to admin accounts."]],
      sys: [["a", "Implemented"], ["s", "a fine-grained password policy for admin accounts,"], ["r", "requiring longer passwords than standard users."]],
    },
  },
  "harden-account": {
    title: "Closed a password-cracking risk on an account",
    actions: ["Required Kerberos pre-authentication", "Required a password on the account"],
    keywords: ["Kerberos", "Account hardening"],
    bullets: {
      soc: [["a", "Remediated"], ["s", "an account open to offline password cracking"], ["a", "by requiring Kerberos pre-authentication and a password."]],
      help: [["a", "Secured"], ["s", "a weakly configured account"], ["a", "by requiring a password and Kerberos pre-authentication."]],
      sys: [["a", "Hardened"], ["s", "an Active Directory account"], ["a", "by clearing unsafe account flags."]],
    },
  },
  "group-access": {
    title: "Granted access with a group, not admin rights",
    actions: ["Found the group that grants the access", "Added the user to that group"],
    keywords: ["Security groups", "Least privilege"],
    bullets: {
      soc: [["a", "Granted"], ["s", "a user's missing access"], ["a", "through the correct security group instead of admin rights,"], ["r", "keeping least privilege intact."]],
      help: [["a", "Resolved"], ["s", "a missing-access ticket"], ["a", "by adding the user to the right security group,"], ["r", "restoring access without over-granting."]],
      sys: [["a", "Managed"], ["s", "Active Directory group membership"], ["t", "to grant access by role"], ["a", "instead of assigning rights directly."]],
    },
  },
  "enable-account": {
    title: "Restored a blocked account the right way",
    actions: ["Checked whether the account was locked or disabled", "Re-enabled the account", "Confirmed the user could sign in"],
    keywords: ["Account troubleshooting"],
    bullets: {
      soc: [["a", "Investigated"], ["s", "a user sign-in failure"], ["a", "by checking account state before acting,"], ["r", "telling a disabled account from a lockout."]],
      help: [["a", "Resolved"], ["s", "a locked-out user ticket"], ["a", "by inspecting the account first and re-enabling it,"], ["r", "restoring sign-in without an unneeded password reset."]],
      sys: [["a", "Restored"], ["s", "a disabled Active Directory account"], ["a", "after verifying its state,"], ["r", "and confirmed the user could sign in."]],
    },
  },
  "create-user": {
    title: "Onboarded a new employee to the naming standard",
    actions: ["Created the user in the right department", "Added only the required group", "Removed access that no longer belonged"],
    keywords: ["User provisioning", "OU and group management"],
    bullets: {
      soc: [["a", "Provisioned"], ["s", "a new hire account"], ["a", "with only the required group,"], ["r", "and removed a leftover account with stale access."]],
      help: [["a", "Onboarded"], ["s", "a new employee in Active Directory,"], ["a", "creating the account to the naming standard with the right group."]],
      sys: [["a", "Provisioned"], ["s", "user accounts in Active Directory"], ["a", "to the naming standard in the correct OU and groups,"], ["r", "and cleaned up a stale account."]],
    },
  },
  "fix-ou": {
    title: "Moved an account to the right department",
    actions: ["Moved the account to its department", "Swapped the old department group for the new one"],
    keywords: ["OU and group management", "Least privilege"],
    bullets: {
      soc: [["a", "Remediated"], ["s", "leftover access for a transferred employee"], ["a", "by moving the account to the correct OU and department group,"], ["r", "enforcing least privilege."]],
      help: [["a", "Processed"], ["s", "a department transfer in Active Directory,"], ["a", "moving the user to the correct OU and group,"], ["r", "so access matched the org chart."]],
      sys: [["a", "Corrected"], ["s", "a misplaced Active Directory account"], ["a", "by moving it to the right OU and group,"], ["r", "so the right policies applied."]],
    },
  },
  "least-privilege": {
    title: "Removed access an account did not need",
    actions: ["Reviewed the account's group membership", "Removed the group it should not have"],
    keywords: ["Least privilege", "Access review"],
    bullets: {
      soc: [["a", "Reduced"], ["s", "excess privileges on an account"], ["a", "by reviewing group membership and removing unneeded access,"], ["r", "shrinking the attack surface."]],
      help: [["a", "Cleaned up"], ["s", "a user's access"], ["a", "by removing a group their role did not need."]],
      sys: [["a", "Enforced"], ["s", "least privilege in Active Directory"], ["a", "by auditing group membership and removing unneeded access."]],
    },
  },
  offboard: {
    title: "Offboarded an account without deleting it",
    actions: ["Disabled the account", "Removed it from every group"],
    keywords: ["User offboarding"],
    bullets: {
      soc: [["a", "Contained"], ["s", "a departed user's access"], ["a", "by disabling the account and removing every group,"], ["r", "while keeping it for audit."]],
      help: [["a", "Offboarded"], ["s", "a departed employee"], ["a", "by disabling the account and removing group access."]],
      sys: [["a", "Offboarded"], ["s", "a user account"], ["a", "by disabling it and clearing its group memberships,"], ["r", "keeping the object for audit."]],
    },
  },
  "service-account": {
    title: "Documented a service account's run window",
    actions: ["Found the approved hours", "Recorded them on the account"],
    keywords: ["Service accounts"],
    bullets: {
      soc: [["a", "Documented"], ["s", "a service account's approved run window"], ["t", "for auditors,"], ["r", "so off-hours logons stand out."]],
      help: [["a", "Updated"], ["s", "a service account record"], ["a", "with its approved run window for an audit request."]],
      sys: [["a", "Managed"], ["s", "a service account"], ["a", "by recording its approved run window,"], ["r", "supporting audit and monitoring."]],
    },
  },
  "stale-objects": {
    title: "Retired an account nobody used",
    actions: ["Confirmed the object had been inactive for over 90 days", "Disabled it"],
    keywords: ["Account lifecycle"],
    bullets: {
      soc: [["a", "Disabled"], ["s", "an inactive account"], ["t", "to reduce the attack surface,"], ["r", "after confirming 90 days without a sign-in."]],
      help: [["a", "Retired"], ["s", "an unused account"], ["a", "after confirming 90 days of inactivity."]],
      sys: [["a", "Retired"], ["s", "stale Active Directory objects"], ["a", "inactive for over 90 days,"], ["r", "keeping the directory clean."]],
    },
  },
  "password-hygiene": {
    title: "Made a user's password expire again",
    actions: ["Turned off Password never expires on a user account"],
    keywords: ["Password policy"],
    bullets: {
      soc: [["a", "Closed"], ["s", "a password exposure risk"], ["a", "by removing a non-expiring password from a user account."]],
      help: [["a", "Corrected"], ["s", "a user account set to never expire its password."]],
      sys: [["a", "Enforced"], ["s", "password expiration"], ["a", "by clearing Password never expires on a user account."]],
    },
  },
  "group-type": {
    title: "Fixed a group that could not grant access",
    actions: ["Changed a distribution group to a security group"],
    keywords: ["Security groups"],
    bullets: {
      soc: [["a", "Fixed"], ["s", "an access gap"], ["a", "by converting a distribution group to a security group."]],
      help: [["a", "Resolved"], ["s", "an access issue"], ["a", "by converting a distribution group to a security group."]],
      sys: [["a", "Converted"], ["s", "a distribution group to a security group"], ["r", "so it could grant permissions."]],
    },
  },
};

/** Ticket Queue tickets whose change the lab confirms, and the job each proves. */
export const PROOF_TICKETS: Record<string, { job: string; label: string }> = {
  "tq-01": { job: "group-access", label: "Ticket Queue · INC-1041" },
  "tq-02": { job: "enable-account", label: "Ticket Queue · INC-1042" },
  "tq-03": { job: "create-user", label: "Ticket Queue · INC-1043" },
  "tq-04": { job: "service-account", label: "Ticket Queue · INC-1044" },
  "tq-05": { job: "fix-ou", label: "Ticket Queue · INC-1045" },
};

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
export function buildSkills(items: WorkItem[], hasLab: boolean, didCtf: boolean): { group: string; items: string[] }[] {
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
    monitoring.add("Event Viewer");
    monitoring.add("Windows Security log analysis");
  }
  const groups = [
    { group: "Identity and access", items: [...identity] },
    { group: "Security monitoring", items: [...monitoring] },
    { group: "Scripting", items: hasLab ? ["PowerShell"] : [] },
  ];
  return groups.filter((g) => g.items.length);
}

export const SHOTS_PER_ITEM = 5;

/** When the student can start, as employers see it. */
export const AVAILABILITY = ["Available now", "Available in 2 weeks", "Available in a month", "Available after graduation"] as const;

/** A job the Proof Profile can show. */
export const isProofJob = (job: unknown): job is string => typeof job === "string" && job in CATALOG;

/** Asks the Academy to offer an optional screenshot for a task the lab just confirmed. */
export const PROOF_PROMPT_EVENT = "academy:proof-prompt";
export function askForProofShot(job: string, from: string) {
  if (typeof window === "undefined" || !isProofJob(job)) return;
  window.dispatchEvent(new CustomEvent(PROOF_PROMPT_EVENT, { detail: { job, from } }));
}
