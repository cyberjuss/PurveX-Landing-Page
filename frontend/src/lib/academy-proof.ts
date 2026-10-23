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
  "lockout-threshold": {
    title: "Tuned a detection-style threshold for a high-value department",
    actions: ["Weighed the trade-off between a lockout threshold strict enough to resist password guessing and loose enough not to lock out typo-prone users", "Created a fine-grained password policy for a department handling client funds", "Set the lockout threshold within a defensible band, applying the same reasoning used to tune a SIEM detection threshold"],
    keywords: ["Fine-Grained Password Policies (FGPP)", "Detection Tuning", "False Positive / False Negative Trade-off"],
    bullets: {
      soc: [["a", "Tuned"], ["s", "a department's lockout threshold"], ["r", "to balance guessing resistance against false lockouts, the same trade-off behind a detection threshold."]],
      help: [["a", "Set"], ["s", "a stricter password policy for a high-value department"], ["r", "without increasing routine lockout tickets."]],
      sys: [["a", "Implemented"], ["s", "a fine-grained password policy"], ["t", "scoped to one department"], ["a", "with a lockout threshold chosen for a defensible balance."]],
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
    actions: ["Identified the security group mapped to the requested resource", "Granted access through that group instead of direct rights, giving the user only what the role needs", "Confirmed the membership in the directory, keeping access easy to review and remove later"],
    keywords: ["Role-Based Access Control (RBAC)", "Least Privilege"],
    bullets: {
      soc: [["a", "Granted"], ["s", "a user's missing access"], ["a", "through the correct security group instead of admin rights,"], ["r", "keeping least privilege intact."]],
      help: [["a", "Resolved"], ["s", "a missing-access ticket"], ["a", "by adding the user to the right security group,"], ["r", "restoring access without over-granting."]],
      sys: [["a", "Managed"], ["s", "Active Directory group membership"], ["t", "to grant access by role"], ["a", "instead of assigning rights directly."]],
    },
  },
  "enable-account": {
    title: "Diagnosed and resolved a user sign-in failure",
    actions: ["Checked the account state before acting, telling a disabled, locked, or expired account apart", "Applied the fix the account actually needed, not the one the caller named", "Confirmed in the directory that the account was active again"],
    keywords: ["Account Management", "Troubleshooting"],
    bullets: {
      soc: [["a", "Investigated"], ["s", "a user sign-in failure"], ["a", "by checking account state before acting,"], ["r", "telling a disabled account from a lockout."]],
      help: [["a", "Resolved"], ["s", "a sign-in ticket"], ["a", "by inspecting the account first"], ["r", "and applying the fix it actually needed."]],
      sys: [["a", "Restored"], ["s", "a blocked Active Directory account"], ["a", "after verifying its state,"], ["r", "and confirmed it was active again."]],
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
    actions: ["Disabled the account instead of deleting it, stopping sign-ins while keeping history for auditors and investigators", "Confirmed in the directory that the account could no longer sign in"],
    keywords: ["User Deprovisioning"],
    bullets: {
      soc: [["a", "Contained"], ["s", "a departed user's access"], ["a", "by disabling the account instead of deleting it,"], ["r", "keeping it for audit."]],
      help: [["a", "Offboarded"], ["s", "a departed employee"], ["a", "by disabling the account and keeping it for records."]],
      sys: [["a", "Offboarded"], ["s", "a user account"], ["a", "by disabling it instead of deleting it,"], ["r", "keeping the object for audit."]],
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
  "dns-fix": {
    title: "Restored name resolution for a file server",
    actions: ["Traced a share that worked by IP but not by name to a DNS record pointing at a dead address", "Corrected the record so the name resolved to the right server again"],
    keywords: ["DNS", "Network Troubleshooting"],
    bullets: {
      soc: [["a", "Diagnosed"], ["s", "a file share outage"], ["a", "to a bad DNS record"], ["r", "and restored name resolution."]],
      help: [["a", "Resolved"], ["s", "a shared drive that would not open by name"], ["a", "by correcting its DNS record."]],
      sys: [["a", "Corrected"], ["s", "an A record in Windows DNS"], ["r", "so clients reached the file server by name."]],
    },
  },
  "firewall-rule": {
    title: "Closed an exposed remote access firewall rule",
    actions: ["Found an inbound rule that still allowed Remote Desktop from any address after a vendor visit", "Disabled it while leaving the standard Remote Desktop rules in place"],
    keywords: ["Windows Defender Firewall", "Attack Surface Reduction"],
    bullets: {
      soc: [["a", "Closed"], ["s", "a leftover vendor firewall rule"], ["r", "that exposed Remote Desktop to any address."]],
      help: [["a", "Disabled"], ["s", "a temporary remote access rule"], ["r", "once the vendor visit was over."]],
      sys: [["a", "Removed"], ["s", "an over-broad inbound firewall rule"], ["r", "from a domain controller."]],
    },
  },
  "access-audit": {
    title: "Baselined peer group access and removed a privilege-creep finding",
    actions: ["Compared group membership across four peer accounts in the same role to establish what the role's access actually looks like", "Identified the one account holding an access-level group none of its peers had", "Removed the excess membership, confirming the account still kept the access its role needs"],
    keywords: ["Access Review", "Least Privilege", "Privilege Creep"],
    bullets: {
      soc: [["a", "Baselined"], ["s", "peer account access"], ["a", "across a team,"], ["r", "surfacing and removing one unexplained privileged-group membership."]],
      help: [["a", "Audited"], ["s", "four peer accounts' group membership"], ["r", "and removed one account's leftover admin-level access."]],
      sys: [["a", "Reviewed"], ["s", "role-based group membership"], ["t", "for privilege creep"], ["r", "removing access a role no longer needed."]],
    },
  },
  "gpo-scope": {
    title: "Applied a security policy to the right department with Group Policy",
    actions: ["Found a screen lock GPO linked to the wrong department OU", "Linked it to Finance and removed the wrong link, so the policy reached the users it was written for"],
    keywords: ["Group Policy (GPO)", "Organizational Units (OUs)"],
    bullets: {
      soc: [["a", "Fixed"], ["s", "a failed screen lock control"], ["a", "by correcting where its GPO was linked."]],
      help: [["a", "Resolved"], ["s", "screens that never locked"], ["a", "by linking the right Group Policy to Finance."]],
      sys: [["a", "Re-scoped"], ["s", "a Group Policy Object"], ["r", "from the wrong OU to the department it was built for."]],
    },
  },
  "contain-wire-credential": {
    title: "Recovered a credential from a network capture and contained the account",
    actions: ["Captured a nightly job and read the service account and password it sent over the network in the clear", "Disabled the exposed account as evidence and identified the encrypted protocol the job should have used"],
    keywords: ["Network Traffic Analysis", "Wireshark", "Credential Exposure", "Incident Response"],
    bullets: {
      soc: [["a", "Captured and analysed"], ["s", "a service account signing in over cleartext LDAP"], ["r", "and contained the exposed credential."]],
      help: [["a", "Identified"], ["s", "a job sending a password in the clear"], ["a", "and disabled the account while it was fixed."]],
      sys: [["a", "Traced"], ["s", "a nightly job to an unencrypted directory bind"], ["r", "and recommended LDAPS to protect the credential."]],
    },
  },
  "verify-build-integrity": {
    title: "Verified a software build against its published checksum",
    actions: ["Hashed three mirrors of an installer manifest and found the one that failed the published SHA-256 checksum", "Quarantined the unsigned build as evidence and reported that it carried no valid signature"],
    keywords: ["Cryptographic Hashing (SHA-256)", "File Integrity", "Software Supply Chain", "Incident Response"],
    bullets: {
      soc: [["a", "Verified"], ["s", "installer mirrors against a published checksum"], ["r", "and quarantined the altered, unsigned build."]],
      help: [["a", "Checked"], ["s", "three copies of an update"], ["a", "with SHA-256 and flagged the one that failed."]],
      sys: [["a", "Validated"], ["s", "a software build's integrity"], ["t", "against its published hash,"], ["r", "catching an unsigned copy before rollout."]],
    },
  },
  "quarantine-file": {
    title: "Quarantined a disguised executable on a file share",
    actions: ["Spotted a program named to look like a PDF invoice by showing full file extensions", "Moved it to quarantine without opening it, keeping it as evidence"],
    keywords: ["Malware Triage", "Incident Response"],
    bullets: {
      soc: [["a", "Quarantined"], ["s", "a double-extension executable"], ["r", "on a shared drive while preserving it as evidence."]],
      help: [["a", "Removed"], ["s", "a suspicious file from a shared drive"], ["a", "without opening it."]],
      sys: [["a", "Isolated"], ["s", "a disguised executable on a file server"], ["r", "for investigation."]],
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
  "tq-11": { job: "offboard", label: "Service ticket INC-1047" },
  "tq-13": { job: "password-hygiene", label: "Service ticket INC-1049" },
  "tq-15": { job: "group-type", label: "Service ticket INC-1051" },
  "tq-16": { job: "dns-fix", label: "Service ticket INC-1052" },
  "tq-17": { job: "firewall-rule", label: "Service ticket INC-1053" },
  "tq-18": { job: "gpo-scope", label: "Service ticket INC-1054" },
  "tq-19": { job: "quarantine-file", label: "Service ticket INC-1055" },
  "mw-02": { job: "firewall-rule", label: "Service ticket INC-1064" },
  "bt-03": { job: "access-audit", label: "Service ticket INC-1066" },
  "zt-02": { job: "firewall-rule", label: "Service ticket INC-1067" },
  "th-01": { job: "lockout-threshold", label: "Service ticket INC-1068" },
  "cp-04": { job: "firewall-rule", label: "Service ticket INC-1069" },
  "cp-06": { job: "access-audit", label: "Service ticket INC-1070" },
  "tq-20": { job: "dns-fix", label: "Service ticket INC-1056" },
  "tq-21": { job: "lockout-policy", label: "Service ticket INC-1059" },
  "tq-22": { job: "enable-auditing", label: "Service ticket INC-1060" },
  "tq-23": { job: "log-retention", label: "Service ticket INC-1061" },
  "tq-24": { job: "admin-password-policy", label: "Service ticket INC-1062" },
  "tq-25": { job: "stale-objects", label: "Service ticket INC-1063" },
  "cap-06": { job: "contain-wire-credential", label: "Service ticket INC-1057" },
  "cry-06": { job: "verify-build-integrity", label: "Service ticket INC-1058" },
  "ea-03": { job: "access-audit", label: "Service ticket INC-1071" },
  "sl-03": { job: "enable-account", label: "Service ticket INC-1072" },
  "pi-02": { job: "firewall-rule", label: "Service ticket INC-1075" },
  "ao-02": { job: "quarantine-file", label: "Service ticket INC-1076" },
};

/** Portfolio jobs a live Shift can prove, mapped from the incident that proves each.
 *  A task with a Shift path is locked until the student resolves it in a Shift. */
export const SHIFT_JOB: Record<string, string> = {
  "lockout-ticket": "enable-account",
  "wrong-disable": "enable-account",
  "pwd-expired": "enable-account",
  "access-request": "group-access",
  "wrong-ou": "fix-ou",
  "dept-transfer": "fix-ou",
  offboarding: "offboard",
  "never-expires": "password-hygiene",
  "rogue-admin": "least-privilege",
  "domain-admins": "least-privilege",
};
const SHIFT_JOBS = new Set(Object.values(SHIFT_JOB));

export type OpenTask = { job: string; bullets: Record<Track, StarPart[]>; where: string; href: string; locked: boolean };

/**
 * Tasks the portfolio can show that the student has not done yet, and where to
 * do each one. A task a Shift can prove is locked: it only joins the portfolio
 * once resolved in a Shift.
 *
 * A ticket or a shift only. Every other job used to be offered as a daily
 * drill, which filled this list with seven rows telling a student to go and
 * answer a quiz question. A drill is not portfolio work: there is no ticket to
 * point an employer at and nothing to photograph, because nothing has been
 * done yet. Those jobs still join the portfolio the moment the lab confirms
 * the change, so nothing is lost but the suggestion.
 */
export function openTasks(done: string[]): OpenTask[] {
  const have = new Set(done);
  const ticketFor = new Map(Object.entries(PROOF_TICKETS).map(([id, t]) => [t.job, { id, label: t.label }]));
  return Object.entries(CATALOG)
    .filter(([job]) => !have.has(job))
    .flatMap(([job, e]) => {
      if (SHIFT_JOBS.has(job)) {
        return [{ job, bullets: e.bullets, where: "Live shift", href: "/range/shift", locked: true }];
      }
      const t = ticketFor.get(job);
      if (!t) return [];
      return [
        {
          job,
          bullets: e.bullets,
          where: `Ticket Queue · ${t.label.replace("Service ticket ", "")}`,
          href: `/range/phase-1/home-lab-challenges#${t.id}`,
          locked: false,
        },
      ];
    })
    .sort((a, b) => Number(a.locked) - Number(b.locked));
}

export type WorkItem = {
  job: string;
  title: string;
  actions: string[];
  /** YYYY-MM-DD the lab confirmed it. */
  date: string;
  /** Where it was done: a ticket, a daily drill, or the weekly CTF. */
  from: string;
  /** Range confirmed it by asking the lab directly, not only from the lab's own report. */
  verified: boolean;
  keywords: string[];
  bullets: Record<Track, StarPart[]>;
};

/** Every confirmed lab task, one per job, newest first. */
export function buildWorkItems(results: Results, drills: DrillEntry[]): WorkItem[] {
  const found = new Map<string, { date: string; from: string; verified: boolean }>();
  const note = (job: string, date: string, from: string, verified = false) => {
    if (!CATALOG[job]) return;
    const had = found.get(job);
    // Verified once is verified: a later, unverified repeat does not undo it.
    if (!had || date > had.date) found.set(job, { date, from, verified: verified || Boolean(had?.verified) });
    else if (verified && !had.verified) had.verified = true;
  };
  for (const [id, t] of Object.entries(PROOF_TICKETS)) {
    const r = results[id];
    if (r?.labOk) note(t.job, (r.at ?? "").slice(0, 10), t.label, r.labVerified === true);
  }
  for (const entry of drills) {
    for (const d of entry.detail ?? []) {
      // A confirmed lab change (daily/ctf) or a shift incident the student resolved.
      if ((d.k === "change" || entry.mode === "shift") && d.c === 1 && d.j) {
        note(d.j, entry.day, entry.mode === "shift" ? "Live shift" : entry.mode === "ctf" ? "Weekly CTF" : "Daily drill", d.v === 1);
      }
    }
  }
  return [...found.entries()]
    .map(([job, f]) => ({ job, ...CATALOG[job], date: f.date, from: f.from, verified: f.verified }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Skills as the keywords job postings use, grouped like a resume Skills section. */
/** Skills a passed browser lab shows. Each lab confirms the work: the hash must match, the decode must be right. */
const LAB_PASS_SKILLS: Record<LabPassId, string[]> = {
  "lab-risk-triage": ["Risk Assessment", "CIA Triad"],
  "lab-network-map": ["Network Segmentation", "Port and Protocol Identification"],
};

export function buildSkills(items: WorkItem[], hasLab: boolean, didCtf: boolean, results: Results = {}): { group: string; items: string[] }[] {
  const identity = new Set<string>();
  const monitoring = new Set<string>();
  const network = new Set<string>();
  const response = new Set<string>();
  if (hasLab || items.length) identity.add("Active Directory");
  for (const it of items) {
    for (const k of it.keywords) {
      if (/audit|event|log/i.test(k)) monitoring.add(k);
      else if (/dns|network|firewall|attack surface/i.test(k)) network.add(k);
      else if (/malware|incident/i.test(k)) response.add(k);
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
    { group: "Networking and Infrastructure", items: [...network] },
    { group: "Incident Response", items: [...response] },
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
