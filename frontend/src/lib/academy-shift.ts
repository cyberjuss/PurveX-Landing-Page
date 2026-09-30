import "server-only";
import type { RoleId } from "@/lib/academy-certs";
import { evalCheck, seeded, shuffle, type Check } from "@/lib/academy-drills";
import type { LabEvents, LabSnapshot } from "@/lib/academy-lab";

// Shift: a 15-minute tour on the PurveX Financial desk. Real incidents fire
// inside the student's own hosted lab on a timer (see academy-hosted.ts, which
// runs the matching Incident-*.ps1 scripts through SSM). The student
// investigates in the lab, acts, and writes up each one before its deadline.
// Grading reads the lab the same way missions do: real end state, real events.
// Nothing here is faked. Difficulty rises with the student's phase and level.

export const SHIFT_MINUTES = 30;
export const SHIFT_SECONDS = SHIFT_MINUTES * 60;

export type Severity = "P1" | "P2" | "P3";
/** Response deadline from the moment an incident arrives. */
const DEADLINE_SEC: Record<Severity, number> = { P1: 300, P2: 480, P3: 720 };
/** What each hint rung costs, as a fraction of the incident's points. */
export const HINT_COST = [0.1, 0.2, 0.4];

/** A member of the fictional company's staff. The roster must match the accounts
 *  seeded by Build-Environment.ps1 so a rotated victim is a real lab account. */
export type Staff = { sam: string; name: string; dept: string };
export const ROSTER: Staff[] = [
  { sam: "alex.rivera", name: "Alex Rivera", dept: "IT" },
  { sam: "priya.nair", name: "Priya Nair", dept: "IT" },
  { sam: "devon.brooks", name: "Devon Brooks", dept: "Compliance" },
  { sam: "morgan.lee", name: "Morgan Lee", dept: "Compliance" },
  { sam: "sam.whitfield", name: "Sam Whitfield", dept: "Wealth Management" },
  { sam: "jamie.torres", name: "Jamie Torres", dept: "Wealth Management" },
  { sam: "taylor.osei", name: "Taylor Osei", dept: "Operations" },
  { sam: "riley.kwan", name: "Riley Kwan", dept: "Operations" },
  { sam: "jordan.ellis", name: "Jordan Ellis", dept: "Finance and Accounting" },
];
/** Accounts that can be a rotating victim. Excludes alex.rivera (the baseline IT
 *  admin other incidents rely on) so a shift never contradicts itself. */
export const VICTIMS: Staff[] = ROSTER.filter((s) => s.sam !== "alex.rivera");

/** The victim-specific parts of an incident, bound once when the shift is built
 *  so the same scenario targets a different person each time. Stored on the run;
 *  grading and injection read this in place of the template. */
export type Bind = {
  /** Extra args passed to the injection script, e.g. { Sam: "priya.nair" }. */
  args?: Record<string, string>;
  resolve: { c: Check; label: string }[];
  noHarm?: { c: Check; label: string }[];
  diagnosis: { prompt: string; accept: string[] };
  brief: string;
  /** Proof the attack actually landed, read from the durable Security-log digest.
   *  Resolution requires this, so a fix can never trivially pass on a lab where
   *  the incident never fired. */
  evidence?: (events?: LabEvents) => boolean;
};

export type IncidentDef = {
  id: string;
  kind: "alert" | "ticket";
  severity: Severity;
  /** Earliest phase and drill level (1-4) this incident can appear at. */
  minPhase: number;
  minLevel: number;
  /** Harder incidents are weighted up as the level rises. */
  weight?: number;
  falseAlarm?: boolean;
  /** Which target roles this incident is bread-and-butter for. Weighted up when the student picked one. */
  roles: RoleId[];
  /** The Incident-*.ps1 script baked into the lab image. */
  script: string;
  points: number;
  /** The alert or ticket the student sees. Claude varies the wording per shift; this is the fallback. */
  from: string;
  title: string;
  brief: string;
  /** The lab end state that means resolved. Read from the snapshot like a mission. */
  resolve: { c: Check; label: string }[];
  /** Must stay true, or the student broke something they should not have. */
  noHarm?: { c: Check; label: string }[];
  /** The one fact that proves they investigated: an account, a count, an event id. */
  diagnosis: { prompt: string; accept: string[] };
  /** What a strong write-up covers. Coach scores the free-text response against these. */
  rubric: string[];
  /** Three rungs, each more explicit, none giving the answer. */
  hints: string[];
  /** The MITRE ATT&CK technique this maps to, shown on the alert. Real attacks;
   *  many line up with an Atomic Red Team test of the same id. */
  attack?: { id: string; name: string };
  /** Proof the attack landed (for incidents that do not rotate a victim). */
  evidence?: (events?: LabEvents) => boolean;
  /** When set, the incident rotates its victim each shift: given a picker, it
   *  returns the concrete checks, brief and script args for this run. */
  bind?: (pick: <T>(arr: T[]) => T) => Bind;
};

// ---- the incident library -------------------------------------------------
// Each incident's reality is planted by its script; the checks below read what
// the student did about it. Keep resolve checks to the student's own actions.

// ---- attack-landed evidence, read from the durable Security-log digest -----
// These persist after the student remediates, so they prove the attack really
// fired without depending on the account still being in its bad state.
const evAcct = (rows: { account: string }[] | undefined, sam: string) => (rows ?? []).some((r) => (r.account ?? "").toLowerCase().includes(sam.toLowerCase()));
const evLocked = (e: LabEvents | undefined, sam: string) => evAcct(e?.lockouts, sam) || evAcct(e?.failures, sam);
const evDisabled = (e: LabEvents | undefined, sam: string) => evAcct(e?.disabled, sam);
const evFailed = (e: LabEvents | undefined, sam: string) => evAcct(e?.failures, sam);
const evGroupAdd = (e: LabEvents | undefined, member: string, group: string) =>
  (e?.groupAdds ?? []).some((g) => (g.member ?? "").toLowerCase().includes(member.toLowerCase()) && (g.group ?? "").toLowerCase().includes(group.toLowerCase()));
// A 4738 (account changed) proves an attribute/flag attack was applied to the account.
const evChanged = (e: LabEvents | undefined, sam: string) => (e?.accountChanges ?? []).some((r) => (r.account ?? "").toLowerCase().includes(sam.toLowerCase()));
// A 4739 (domain policy changed) proves the password/lockout policy was tampered with.
const evPolicy = (e: LabEvents | undefined) => (e?.policyChanges ?? []).length > 0;

export const INCIDENTS: IncidentDef[] = [
  {
    id: "lockout-ticket",
    kind: "ticket",
    severity: "P3",
    minPhase: 1,
    minLevel: 1,
    weight: 1,
    roles: ["help-desk", "sysadmin"],
    script: "Incident-Lockout.ps1",
    points: 100,
    from: "Riley Kwan, Operations",
    title: "I'm locked out again",
    brief: "Riley Kwan cannot sign in and thinks the account is locked. Confirm what is actually wrong before you act, then restore sign-in. Not every ticket is an attack.",
    resolve: [
      { c: { t: "enabled", sam: "riley.kwan", want: true }, label: "riley.kwan can sign in" },
      { c: { t: "flag", sam: "riley.kwan", flag: "lockedOut", want: false }, label: "riley.kwan is not locked out" },
    ],
    diagnosis: { prompt: "Was riley.kwan locked out or disabled?", accept: ["locked", "locked out", "lockout"] },
    rubric: ["What the account state actually was", "What you did to restore access", "Why no escalation was needed"],
    hints: [
      "Open the account in Active Directory Users and Computers and read the Account tab.",
      "Locked out and disabled are different boxes. Only one is checked here.",
      "Unlock the account (do not reset the password unless it is also expired), then confirm the lockout box is clear.",
    ],
    bind: (pick) => {
      const v = pick(VICTIMS);
      return {
        args: { Sam: v.sam },
        resolve: [
          { c: { t: "enabled", sam: v.sam, want: true }, label: `${v.sam} can sign in` },
          { c: { t: "flag", sam: v.sam, flag: "lockedOut", want: false }, label: `${v.sam} is not locked out` },
        ],
        diagnosis: { prompt: `Was ${v.sam} locked out or disabled?`, accept: ["locked", "locked out", "lockout"] },
        brief: `${v.name} in ${v.dept} cannot sign in and thinks the account is locked. Confirm what is actually wrong before you act, then restore sign-in. Not every ticket is an attack.`,
        evidence: (e) => evLocked(e, v.sam),
      };
    },
  },
  {
    id: "spray",
    kind: "alert",
    severity: "P2",
    minPhase: 1,
    minLevel: 1,
    weight: 1.3,
    roles: ["soc-analyst", "cyber-analyst", "help-desk"],
    script: "Incident-Spray.ps1",
    attack: { id: "T1110.003", name: "Password Spraying" },
    points: 150,
    from: "SIEM · automated detection",
    title: "Burst of failed sign-ins across many accounts",
    brief: "A wave of failed sign-ins hit several accounts in under a minute, and some are now locked out. Work out whether this is a password spray, find who was targeted, and restore the real users without opening anything up.",
    resolve: [
      { c: { t: "flag", sam: "priya.nair", flag: "lockedOut", want: false }, label: "priya.nair is unlocked" },
      { c: { t: "flag", sam: "jordan.ellis", flag: "lockedOut", want: false }, label: "jordan.ellis is unlocked" },
    ],
    noHarm: [{ c: { t: "policy", key: "lockoutThreshold", min: 1 }, label: "Account lockout is still enforced" }],
    diagnosis: { prompt: "Which event ID marks the failed sign-ins?", accept: ["4625", "event 4625", "id 4625"] },
    rubric: ["Named the pattern (spray, not one user's typo)", "Named the event id and the affected accounts", "Restored the real users, kept lockout on", "Escalated with the evidence"],
    hints: [
      "Open Event Viewer, Windows Logs, Security, and filter for the failed sign-in event.",
      "One account failing many times is a typo. Many accounts failing once each in the same minute is a spray.",
      "Unlock the locked staff accounts. Do not lower the lockout policy to 'fix' it, and escalate with the account list.",
    ],
    bind: (pick) => {
      const t1 = pick(VICTIMS);
      const t2 = pick(VICTIMS.filter((x) => x.sam !== t1.sam));
      const targets = [t1, t2];
      return {
        args: { Targets: targets.map((t) => t.sam).join(","), Sprayed: VICTIMS.map((s) => s.sam).join(",") },
        resolve: targets.map((t) => ({ c: { t: "flag", sam: t.sam, flag: "lockedOut", want: false } as Check, label: `${t.sam} is unlocked` })),
        noHarm: [{ c: { t: "policy", key: "lockoutThreshold", min: 1 }, label: "Account lockout is still enforced" }],
        diagnosis: { prompt: "Which event ID marks the failed sign-ins?", accept: ["4625", "event 4625", "id 4625"] },
        brief: `A wave of failed sign-ins hit ${VICTIMS.length} accounts in under a minute, and ${t1.name} and ${t2.name} are now locked out. Work out whether this is a password spray, find who was targeted, and restore the real users without opening anything up.`,
        evidence: (e) => targets.every((t) => evLocked(e, t.sam)),
      };
    },
  },
  {
    id: "rogue-admin",
    kind: "alert",
    severity: "P1",
    minPhase: 1,
    minLevel: 2,
    weight: 1.6,
    roles: ["soc-analyst", "sysadmin", "ir-analyst"],
    script: "Incident-RogueAdmin.ps1",
    attack: { id: "T1098", name: "Account Manipulation" },
    points: 200,
    from: "SIEM · automated detection",
    title: "New account added to IT Admins overnight",
    brief: "A member was added to IT Admins at an odd hour with no change ticket. Contain it without destroying the evidence, and find out how it got there.",
    resolve: [{ c: { t: "member", sam: "svc.helpdesk", group: "IT Admins", want: false }, label: "svc.helpdesk is out of IT Admins" }],
    evidence: (e) => evGroupAdd(e, "svc.helpdesk", "IT Admins"),
    noHarm: [{ c: { t: "member", sam: "alex.rivera", group: "IT Admins", want: true }, label: "The real admin alex.rivera is untouched" }],
    diagnosis: { prompt: "Which event ID records the group addition?", accept: ["4728", "event 4728", "id 4728"] },
    rubric: ["Named the account added and when", "Named the event id for the group add", "Removed it without deleting the account (kept evidence)", "Escalated as a possible compromise"],
    hints: [
      "Open Event Viewer, Security, and look for a member added to a security group.",
      "Compare who is in IT Admins now against who should be. One account does not belong.",
      "Remove the extra account from IT Admins. Do not delete the account itself yet; it is evidence. Then escalate.",
    ],
  },
  {
    id: "false-alarm",
    kind: "alert",
    severity: "P3",
    minPhase: 1,
    minLevel: 3,
    weight: 1.2,
    falseAlarm: true,
    roles: ["soc-analyst", "cyber-analyst"],
    script: "Incident-ApprovedChange.ps1",
    points: 120,
    from: "SIEM · automated detection",
    title: "After-hours group change flagged",
    brief: "An alert fired for a group change made after hours. There is a matching approved change ticket in the notes. Decide whether this is an incident at all, and close it correctly. Do not undo an approved change.",
    resolve: [{ c: { t: "member", sam: "morgan.lee", group: "Compliance Users", want: true }, label: "The approved change is left in place" }],
    evidence: (e) => evGroupAdd(e, "morgan.lee", "Compliance Users"),
    diagnosis: { prompt: "Is this a real incident? Answer incident or approved.", accept: ["approved", "approved change", "not an incident", "false", "false alarm", "no"] },
    rubric: ["Checked the change against the approval", "Concluded it was approved, not an attack", "Closed it without reverting the change", "Noted the evidence that made it approved"],
    hints: [
      "Read the alert notes and the change ticket before you touch anything.",
      "An approved change with a ticket and the right approver is not an incident.",
      "Close it as a false alarm. Reverting an approved change would be the mistake here.",
    ],
  },
  {
    id: "compromised-account",
    kind: "alert",
    severity: "P1",
    minPhase: 2,
    minLevel: 3,
    weight: 1.8,
    roles: ["soc-analyst", "ir-analyst"],
    script: "Incident-Compromise.ps1",
    attack: { id: "T1078", name: "Valid Accounts" },
    points: 220,
    from: "SIEM · automated detection",
    title: "Failed sign-ins then a success on one account",
    brief: "One account shows many failed sign-ins and then a success, off-hours, from a workstation it never uses. Treat it as compromised: contain the account and keep the evidence.",
    resolve: [{ c: { t: "enabled", sam: "jamie.torres", want: false }, label: "jamie.torres is disabled (contained)" }],
    noHarm: [{ c: { t: "enabled", sam: "sam.whitfield", want: true }, label: "Other Wealth Management staff are untouched" }],
    diagnosis: { prompt: "Which event ID is the successful sign-in?", accept: ["4624", "event 4624", "id 4624"] },
    rubric: ["Named the account and the failed-then-success pattern", "Named 4625 and 4624 and the odd host/time", "Disabled the account instead of only resetting it", "Preserved evidence and escalated"],
    hints: [
      "In the Security log, line up the failed sign-ins and the success on the same account.",
      "Failures then a success, off-hours, on a strange host, means the password was guessed and worked.",
      "Disable the account to contain it, do not delete it, then escalate. A reset alone does not stop an active session.",
    ],
    bind: (pick) => {
      // riley.kwan is disabled in the baseline lab, so it is never the compromised account here.
      const pool = VICTIMS.filter((x) => x.sam !== "riley.kwan");
      const v = pick(pool);
      const peer = pick(pool.filter((x) => x.sam !== v.sam));
      return {
        args: { Sam: v.sam },
        resolve: [{ c: { t: "enabled", sam: v.sam, want: false }, label: `${v.sam} is disabled (contained)` }],
        noHarm: [{ c: { t: "enabled", sam: peer.sam, want: true }, label: `${peer.sam} was left alone` }],
        diagnosis: { prompt: "Which event ID is the successful sign-in?", accept: ["4624", "event 4624", "id 4624"] },
        brief: `${v.name} in ${v.dept} shows many failed sign-ins and then a success, off-hours, from a workstation they never use. Treat it as compromised: contain the account and keep the evidence.`,
        evidence: (e) => evFailed(e, v.sam),
      };
    },
  },
  {
    id: "weak-policy",
    kind: "alert",
    severity: "P2",
    minPhase: 2,
    minLevel: 4,
    weight: 1.7,
    roles: ["sysadmin", "cyber-analyst"],
    script: "Incident-WeakPolicy.ps1",
    attack: { id: "T1484.001", name: "Group Policy Modification" },
    points: 180,
    from: "SIEM · automated detection",
    title: "Domain password policy was weakened",
    brief: "The domain password policy was changed to allow short passwords and no lockout. Restore a safe policy and report who changed it.",
    resolve: [
      { c: { t: "policy", key: "minLength", min: 12 }, label: "Minimum password length is back to at least 12" },
      { c: { t: "policy", key: "lockoutThreshold", min: 1, max: 10 }, label: "Account lockout is enforced again" },
    ],
    evidence: (e) => evPolicy(e),
    diagnosis: { prompt: "Which event ID records a domain policy change?", accept: ["4739", "event 4739", "id 4739"] },
    rubric: ["Named what changed in the policy", "Named the event id for the policy change", "Restored length and lockout to safe values", "Reported who made the change"],
    hints: [
      "Check the Default Domain Policy password settings against what they should be.",
      "A safe baseline is at least 12 characters with lockout after a handful of tries.",
      "Set minimum length back to 12+ and turn lockout back on, then report the change with the event.",
    ],
  },
  {
    id: "wrong-disable",
    kind: "ticket",
    severity: "P3",
    minPhase: 1,
    minLevel: 1,
    weight: 1,
    roles: ["help-desk", "sysadmin"],
    script: "Incident-Disable.ps1",
    points: 100,
    from: "Taylor Osei, Operations",
    title: "I can't sign in at all this morning",
    brief: "A member of staff cannot sign in. Confirm whether the account is disabled or just locked out, then restore access. Not every ticket is an attack.",
    resolve: [{ c: { t: "enabled", sam: "taylor.osei", want: true }, label: "taylor.osei can sign in" }],
    diagnosis: { prompt: "Was the account disabled or locked out?", accept: ["disabled", "account disabled", "disable"] },
    rubric: ["What the account state actually was", "What you did to restore access", "Why no escalation was needed"],
    hints: [
      "Open the account in Active Directory Users and Computers and read the Account tab.",
      "A disabled account shows a down arrow and 'Account is disabled', which is different from locked out.",
      "Enable the account, then confirm the user can sign in. No password reset is needed for a disable.",
    ],
    bind: (pick) => {
      // riley.kwan is disabled in the baseline lab already, so keep it out of this ticket.
      const v = pick(VICTIMS.filter((x) => x.sam !== "riley.kwan"));
      return {
        args: { Sam: v.sam },
        resolve: [{ c: { t: "enabled", sam: v.sam, want: true }, label: `${v.sam} can sign in` }],
        diagnosis: { prompt: "Was the account disabled or locked out?", accept: ["disabled", "account disabled", "disable"] },
        brief: `${v.name} in ${v.dept} cannot sign in this morning. Confirm whether the account is disabled or just locked out, then restore access. Not every ticket is an attack.`,
        evidence: (e) => evDisabled(e, v.sam),
      };
    },
  },
  {
    id: "preauth-exposure",
    kind: "alert",
    severity: "P2",
    minPhase: 1,
    minLevel: 2,
    weight: 1.4,
    roles: ["soc-analyst", "cyber-analyst", "sysadmin"],
    script: "Incident-PreAuth.ps1",
    attack: { id: "T1558.004", name: "AS-REP Roasting" },
    points: 160,
    from: "SIEM · automated detection",
    title: "Account exposed to AS-REP roasting",
    brief: "An account was set to not require Kerberos pre-authentication, which lets an attacker request a crackable ticket without any credentials. Close the exposure and report who changed it.",
    resolve: [{ c: { t: "flag", sam: "priya.nair", flag: "noPreAuth", want: false }, label: "Pre-authentication is required again" }],
    diagnosis: { prompt: "What weakness was enabled on the account?", accept: ["as-rep", "asrep", "as rep", "pre-auth", "preauth", "pre authentication", "kerberos"] },
    rubric: ["Named the account and the setting that was flipped", "Explained why no-preauth enables AS-REP roasting", "Re-enabled pre-authentication", "Reported who made the change"],
    hints: [
      "Open the account's properties and check the Account options for a Kerberos pre-authentication setting.",
      "'Do not require Kerberos preauthentication' being on is the AS-REP roasting exposure.",
      "Turn that option off so pre-authentication is required again, then report the change.",
    ],
    bind: (pick) => {
      const v = pick(VICTIMS);
      return {
        args: { Sam: v.sam },
        resolve: [{ c: { t: "flag", sam: v.sam, flag: "noPreAuth", want: false }, label: `${v.sam} requires pre-authentication again` }],
        diagnosis: { prompt: "What weakness was enabled on the account?", accept: ["as-rep", "asrep", "as rep", "pre-auth", "preauth", "pre authentication", "kerberos"] },
        brief: `${v.name} in ${v.dept} was set to not require Kerberos pre-authentication, which lets an attacker request a crackable ticket without any credentials. Close the exposure and report who changed it.`,
        evidence: (e) => evChanged(e, v.sam),
      };
    },
  },
  {
    id: "access-request",
    kind: "ticket",
    severity: "P3",
    minPhase: 1,
    minLevel: 1,
    weight: 1,
    roles: ["help-desk", "sysadmin"],
    script: "Incident-AccessRequest.ps1",
    points: 100,
    from: "People Operations",
    title: "New team member needs Compliance access",
    brief: "A staff member moving to Compliance needs the access their team uses. Add them to the right group so they can do their job — grant only what the request asks for.",
    resolve: [{ c: { t: "member", sam: "priya.nair", group: "Compliance Users", want: true }, label: "the user is in Compliance Users" }],
    diagnosis: { prompt: "Which group grants Compliance access?", accept: ["compliance users", "compliance"] },
    rubric: ["Named the group that grants the access", "Added only that group", "Confirmed the change took", "Did not over-grant"],
    hints: [
      "Open the user in Active Directory Users and Computers, on the Member Of tab.",
      "Add them to the group the request names, and only that group.",
      "Add the user to Compliance Users, then confirm the membership.",
    ],
    bind: (pick) => {
      const v = pick(VICTIMS.filter((x) => ["priya.nair", "sam.whitfield", "jordan.ellis"].includes(x.sam)));
      return {
        args: { Sam: v.sam, Group: "Compliance Users" },
        resolve: [{ c: { t: "member", sam: v.sam, group: "Compliance Users", want: true } as Check, label: `${v.sam} is in Compliance Users` }],
        diagnosis: { prompt: "Which group grants Compliance access?", accept: ["compliance users", "compliance"] },
        brief: `${v.name} is moving to Compliance and needs the access their team uses. Add them to the right group so they can do their job — grant only what the request asks for.`,
      };
    },
  },
  {
    id: "offboarding",
    kind: "ticket",
    severity: "P2",
    minPhase: 1,
    minLevel: 2,
    weight: 1.1,
    roles: ["help-desk", "sysadmin"],
    script: "Incident-Offboarding.ps1",
    points: 130,
    from: "People Operations",
    title: "Employee has left — disable their access",
    brief: "An employee left the company today. Disable their account so they can no longer sign in, and leave it in place for records. Do not delete it.",
    resolve: [{ c: { t: "enabled", sam: "jordan.ellis", want: false }, label: "the leaver's account is disabled" }],
    diagnosis: { prompt: "What should happen to a leaver's account on their last day?", accept: ["disable", "disabled", "disable the account"] },
    rubric: ["Disabled the account instead of deleting it", "Left it in place for records", "Confirmed they can no longer sign in", "Noted the offboarding"],
    hints: [
      "Open the user in Active Directory Users and Computers.",
      "Disabling keeps the account for records; deleting destroys the evidence.",
      "Disable the account, then confirm it shows as disabled.",
    ],
    bind: (pick) => {
      const v = pick(VICTIMS.filter((x) => x.sam !== "riley.kwan"));
      return {
        args: { Sam: v.sam },
        resolve: [{ c: { t: "enabled", sam: v.sam, want: false } as Check, label: `${v.sam} is disabled` }],
        diagnosis: { prompt: "What should happen to a leaver's account on their last day?", accept: ["disable", "disabled", "disable the account"] },
        brief: `${v.name} in ${v.dept} left the company today. Disable their account so they can no longer sign in, and leave it in place for records. Do not delete it.`,
      };
    },
  },
  {
    id: "pwd-notreqd",
    kind: "alert",
    severity: "P2",
    minPhase: 1,
    minLevel: 2,
    weight: 1.4,
    roles: ["sysadmin", "soc-analyst", "cyber-analyst"],
    script: "Incident-PwdNotReq.ps1",
    attack: { id: "T1098", name: "Account Manipulation" },
    points: 160,
    from: "SIEM · automated detection",
    title: "Account set to not require a password",
    brief: "An account was flagged 'password not required', which lets it sign in with a blank password. Close the exposure and report who changed it.",
    resolve: [{ c: { t: "flag", sam: "priya.nair", flag: "pwdNotRequired", want: false }, label: "the account requires a password again" }],
    diagnosis: { prompt: "What weakness was set on the account?", accept: ["password not required", "passwd_notreqd", "pwdnotreqd", "no password", "blank password", "not required"] },
    rubric: ["Named the account and the flag", "Explained why a blank password is dangerous", "Cleared the flag", "Reported who changed it"],
    hints: [
      "Open the account and read its account options.",
      "'Password not required' (PASSWD_NOTREQD) lets it sign in with no password.",
      "Clear that option so a password is required again, then report it.",
    ],
    bind: (pick) => {
      const v = pick(VICTIMS.filter((x) => x.sam !== "riley.kwan"));
      return {
        args: { Sam: v.sam },
        resolve: [{ c: { t: "flag", sam: v.sam, flag: "pwdNotRequired", want: false } as Check, label: `${v.sam} requires a password again` }],
        diagnosis: { prompt: "What weakness was set on the account?", accept: ["password not required", "passwd_notreqd", "pwdnotreqd", "no password", "blank password", "not required"] },
        brief: `${v.name} in ${v.dept} was flagged 'password not required', which lets the account sign in with a blank password. Close the exposure and report who changed it.`,
        evidence: (e) => evChanged(e, v.sam),
      };
    },
  },
  {
    id: "delegation",
    kind: "alert",
    severity: "P1",
    minPhase: 2,
    minLevel: 3,
    weight: 1.7,
    roles: ["soc-analyst", "cyber-analyst", "ir-analyst"],
    script: "Incident-Delegation.ps1",
    attack: { id: "T1484", name: "Domain Policy Modification" },
    points: 200,
    from: "SIEM · automated detection",
    title: "Account trusted for delegation",
    brief: "An ordinary account was marked trusted for delegation, which an attacker can abuse to impersonate other users across the domain. Remove the trust and report who set it.",
    resolve: [{ c: { t: "flag", sam: "priya.nair", flag: "delegation", want: false }, label: "delegation trust is removed" }],
    diagnosis: { prompt: "What was enabled on the account?", accept: ["delegation", "trusted for delegation", "unconstrained delegation", "unconstrained"] },
    rubric: ["Named the account and the delegation trust", "Explained the impersonation risk", "Removed the trust", "Reported who set it"],
    hints: [
      "Open the account and check the Delegation tab and account options.",
      "'Trust this user for delegation' on a normal account is the exposure.",
      "Turn delegation off so the account is not trusted, then report it.",
    ],
    bind: (pick) => {
      const v = pick(VICTIMS.filter((x) => x.sam !== "riley.kwan"));
      return {
        args: { Sam: v.sam },
        resolve: [{ c: { t: "flag", sam: v.sam, flag: "delegation", want: false } as Check, label: `${v.sam} is no longer trusted for delegation` }],
        diagnosis: { prompt: "What was enabled on the account?", accept: ["delegation", "trusted for delegation", "unconstrained delegation", "unconstrained"] },
        brief: `${v.name} in ${v.dept} was marked trusted for delegation, which an attacker can abuse to impersonate other users across the domain. Remove the trust and report who set it.`,
        evidence: (e) => evChanged(e, v.sam),
      };
    },
  },
];

const byId = new Map(INCIDENTS.map((i) => [i.id, i]));
export const incidentDef = (id: string) => byId.get(id) ?? null;

// ---- picking a shift ------------------------------------------------------

export type ShiftIncident = {
  /** Unique per instance this shift; the same template can appear more than once. */
  uid: string;
  defId: string;
  severity: Severity;
  /** Seconds from shift start when it arrives, and the response deadline from arrival. */
  arriveSec: number;
  deadlineSec: number;
  /** The victim-specific specifics for this shift, if the incident rotates them. */
  bind?: Bind;
};

/** When each incident arrives. The first few land fast so the queue has a real
 *  backlog from the start, then the rest keep coming across the shift. The last
 *  lands with a buffer so even a P1 that arrives late still has its full SLA. */
function arrivalsFor(n: number): number[] {
  if (n <= 1) return [0];
  const head = [0, 40, 90].slice(0, Math.min(n, 3));
  if (n <= head.length) return head;
  const rest = n - head.length;
  const start = 210;
  const last = Math.max(start, SHIFT_SECONDS - 300);
  const tail = Array.from({ length: rest }, (_, j) => Math.round(start + (rest === 1 ? 0 : j / (rest - 1)) * (last - start)));
  return [...head, ...tail];
}

/** How many incidents a shift has, from phase and level. A 30-minute shift runs
 *  a busy queue — more than a beginner clears — so work keeps arriving. */
export function shiftSize(phase: number, level: number): number {
  return Math.min(10, 6 + level + (phase >= 2 ? 1 : 0));
}

/**
 * Choose the shift's incidents for this student. Only incidents at or below
 * their phase and level are eligible; harder ones are weighted up as the level
 * rises. A false alarm is included from Hard (level 3) up. To keep the queue
 * filling, victim-rotating incidents repeat (each hitting a different person).
 * Deterministic per seed.
 */
export function pickShift(seed: string, phase: number, level: number, roles: RoleId[] = []): ShiftIncident[] {
  const r = seeded(seed);
  const eligible = INCIDENTS.filter((i) => i.minPhase <= phase && i.minLevel <= level);
  const real = eligible.filter((i) => !i.falseAlarm);
  const alarms = eligible.filter((i) => i.falseAlarm);
  const size = eligible.length ? shiftSize(phase, level) : 0;

  // Incidents that match a target role are worth more, so the queue leans toward that job.
  const roleFit = (i: IncidentDef) => (roles.length && i.roles.some((x) => roles.includes(x)) ? 1.8 : 1);

  const chosen: IncidentDef[] = [];
  // From Hard up, one slot is a false alarm when one is eligible.
  if (level >= 3 && alarms.length) chosen.push(shuffle(r, alarms)[0]);

  const weighted = shuffle(r, real)
    .map((i) => ({ i, w: (i.weight ?? 1) * roleFit(i) * (0.6 + level * 0.2) + r() }))
    .sort((a, b) => b.w - a.w)
    .map((x) => x.i);
  // First the distinct incidents, most relevant first.
  for (const i of weighted) {
    if (chosen.length >= size) break;
    if (!chosen.includes(i)) chosen.push(i);
  }
  // Then keep the queue coming by repeating the ones that rotate their victim, so
  // each repeat is a different person and never a duplicate ticket.
  const repeatable = weighted.filter((i) => i.bind);
  for (let k = 0; chosen.length < size && repeatable.length; k++) {
    chosen.push(repeatable[k % repeatable.length]);
  }

  const arrivals = arrivalsFor(chosen.length);
  // A deterministic single-pick helper for the incidents that rotate their victim.
  const pickOne = <T,>(arr: T[]): T => shuffle(r, arr)[0];
  return chosen.map((def, n) => ({
    uid: `${def.id}-${n}`,
    defId: def.id,
    severity: def.severity,
    arriveSec: arrivals[n],
    deadlineSec: DEADLINE_SEC[def.severity],
    bind: def.bind?.(pickOne),
  }));
}

/** The specifics grading and injection should use for a run incident: the shift's
 *  bound victim when the incident rotates, otherwise the template. */
export function effectiveIncident(
  def: IncidentDef,
  inc: { bind?: Bind }
): { resolve: IncidentDef["resolve"]; noHarm: IncidentDef["noHarm"]; diagnosis: IncidentDef["diagnosis"]; brief: string; args?: Record<string, string>; evidence?: (events?: LabEvents) => boolean } {
  const b = inc.bind;
  return {
    resolve: b?.resolve ?? def.resolve,
    noHarm: b?.noHarm ?? def.noHarm,
    diagnosis: b?.diagnosis ?? def.diagnosis,
    brief: b?.brief ?? def.brief,
    args: b?.args,
    evidence: b?.evidence ?? def.evidence,
  };
}

// ---- grading one incident -------------------------------------------------

/** The lab-and-diagnosis parts. Write-up and on-time are added by the caller. */
export function gradeIncidentLab(
  def: Pick<IncidentDef, "resolve" | "noHarm" | "diagnosis" | "evidence">,
  snapshot: LabSnapshot | null,
  diagnosis: string
): { resolved: boolean; noHarm: boolean; diagnosisRight: boolean; results: { label: string; ok: boolean }[] } {
  const results: { label: string; ok: boolean }[] = [];
  let resolved = true;
  for (const { c, label } of def.resolve) {
    const ok = snapshot ? evalCheck(snapshot, c) : false;
    results.push({ label, ok });
    if (!ok) resolved = false;
  }
  // The fix only counts once the attack is proven in the lab's Security log, so a
  // clean baseline (attack never fired) can never trivially pass the resolve check.
  if (def.evidence && !def.evidence(snapshot?.events)) {
    results.push({ label: "The incident has not landed in your lab yet — give it a moment, then check again", ok: false });
    resolved = false;
  }
  let noHarm = true;
  if (def.noHarm && snapshot) {
    for (const { c, label } of def.noHarm) {
      const ok = evalCheck(snapshot, c);
      results.push({ label, ok });
      if (!ok) noHarm = false;
    }
  }
  const g = diagnosis.trim().toLowerCase();
  const diagnosisRight = def.diagnosis.accept.some((a) => g.includes(a.toLowerCase()));
  return { resolved, noHarm, diagnosisRight, results };
}

/**
 * Final points for one incident. Weights: resolve 45%, on-time 15%,
 * diagnosis 15%, no-harm 10%, write-up 15%. Hints are subtracted after.
 */
export function scoreIncident(
  def: IncidentDef,
  g: { resolved: boolean; onTime: boolean; noHarm: boolean; diagnosisRight: boolean; writeUp: number | null },
  hintsUsed: number
): number {
  let frac = 0;
  if (g.resolved) frac += 0.45;
  if (g.onTime) frac += 0.15;
  if (g.diagnosisRight) frac += 0.15;
  if (g.noHarm) frac += 0.1;
  frac += 0.15 * (g.writeUp ?? 0);
  // Never resolving the incident should cap the score, whatever the write-up.
  if (!g.resolved) frac = Math.min(frac, 0.4);
  const penalty = HINT_COST.slice(0, hintsUsed).reduce((a, b) => a + b, 0);
  return Math.max(0, Math.round(def.points * frac * (1 - penalty)));
}

/** A light read of the log digest, so the alert can quote a real number ("8 accounts hit"). */
export function logColor(events: LabEvents | undefined, def: IncidentDef): string | null {
  if (!events) return null;
  if (def.id === "spray") return events.failures.length ? `${events.failures.length} accounts show failed sign-ins.` : null;
  if (def.id === "rogue-admin") return events.groupAdds.length ? `${events.groupAdds.length} group change(s) in the window.` : null;
  return null;
}

// ---- a running shift ------------------------------------------------------
// Persisted per student while the shift is on (see academy-store). All timing
// is derived from startedAt and the fixed offsets, so the server never needs a
// background timer: the page and the grader both read the clock.

export type IncidentRun = {
  /** Unique per instance this shift; used for selection and actions (defId can repeat). */
  uid: string;
  defId: string;
  severity: Severity;
  arriveSec: number;
  deadlineSec: number;
  /** Seconds from shift start when the student acknowledged and resolved it. */
  ackedAtSec: number | null;
  resolvedAtSec: number | null;
  /** The incident's script has been fired into the lab. */
  injected: boolean;
  /** The victim-specific specifics bound when the shift was built. */
  bind?: Bind;
  /** Fresh wording Claude wrote for this shift, so no two read alike. Falls back to the template. */
  text?: { from: string; title: string; brief: string };
  hintsUsed: number;
  diagnosis: string;
  response: string;
  /** Filled in at grading time. */
  score?: number;
  writeUp?: number | null;
  onTime?: boolean;
  resolved?: boolean;
  noHarm?: boolean;
  diagnosisRight?: boolean;
};

export type ShiftRun = {
  id: string;
  startedAt: string;
  endsAt: string;
  phase: number;
  level: number;
  incidents: IncidentRun[];
  status: "active" | "done";
  finishedAt?: string;
  totalScore?: number;
  maxScore?: number;
};

/** Build a fresh shift for this student. The caller persists it and injects the incidents. */
export function newShiftRun(seed: string, phase: number, level: number, roles: RoleId[] = [], now = Date.now()): ShiftRun {
  const picked = pickShift(seed, phase, level, roles);
  return {
    id: `shift-${now.toString(36)}`,
    startedAt: new Date(now).toISOString(),
    endsAt: new Date(now + SHIFT_SECONDS * 1000).toISOString(),
    phase,
    level,
    status: "active",
    incidents: picked.map((p) => ({
      ...p,
      ackedAtSec: null,
      resolvedAtSec: null,
      injected: false,
      hintsUsed: 0,
      diagnosis: "",
      response: "",
    })),
  };
}

/** Seconds elapsed since the shift started. */
export const shiftElapsed = (run: ShiftRun, now = Date.now()) => Math.max(0, Math.floor((now - Date.parse(run.startedAt)) / 1000));

/** True once the 15 minutes are up. */
export const shiftOver = (run: ShiftRun, now = Date.now()) => now >= Date.parse(run.endsAt);

/** An incident is on the queue once its arrival time has passed. */
export const incidentArrived = (inc: IncidentRun, elapsedSec: number) => elapsedSec >= inc.arriveSec;

/** Was the incident resolved before its deadline (deadline measured from arrival)? */
export function resolvedOnTime(inc: IncidentRun): boolean {
  if (inc.resolvedAtSec === null) return false;
  return inc.resolvedAtSec - inc.arriveSec <= inc.deadlineSec;
}
