import "server-only";
import { evalCheck, type Check } from "@/lib/academy-drills";
import type { LabSnapshot } from "@/lib/academy-lab";

// Ticket Queue tickets that ask for a real change. The student cannot submit
// the answer until their own lab shows the change.

/** Objects a ticket needs in the snapshot. A lab built before the ticket existed lacks them. */
type Needs = { users?: string[]; groups?: string[]; ous?: string[]; computers?: string[]; tickets?: string[] };

const G = (checks: { c: Check; label: string }[], needs?: Needs) => ({ checks, needs });

const MISSION_LAB = {
  "tq-01": G([{ c: { t: "member", sam: "jamie.torres", group: "All Employees", want: true }, label: "Jamie Torres is a member of All Employees" }]),
  "tq-02": G([
    { c: { t: "enabled", sam: "riley.kwan", want: true }, label: "riley.kwan is enabled" },
    { c: { t: "flag", sam: "riley.kwan", flag: "lockedOut", want: false }, label: "riley.kwan is not locked out" },
  ]),
  "tq-03": G([
    { c: { t: "exists", sam: "casey.reed", ou: "OU=Users,OU=IT,OU=Departments" }, label: "casey.reed is in the IT Users folder (Departments, IT, Users)" },
    { c: { t: "member", sam: "casey.reed", group: "IT Users", want: true }, label: "casey.reed exists and is a member of IT Users" },
    // The ticket says delete the leftover account, so the check asks for that
    // rather than for a membership the student could untick. The snapshot
    // covers the lab OUs only, so an account moved out of them reads as gone
    // as well, which still means it is out of the staff folders.
    { c: { t: "gone", sam: "old.intern" }, label: "The leftover intern account is gone" },
    { c: { t: "member", sam: "svc-backup-job", group: "IT Users", want: false }, label: "svc-backup-job is no longer in IT Users" },
  ]),
  "tq-04": G([{ c: { t: "desc", sam: "svc-backup-job", text: "01:00-03:00" }, label: "svc-backup-job Description has the approved run window" }]),
  "tq-05": G([
    { c: { t: "container", sam: "taylor.osei", ou: "OU=Users,OU=Compliance,OU=Departments" }, label: "taylor.osei is in the Compliance Users folder" },
    { c: { t: "member", sam: "taylor.osei", group: "Compliance Users", want: true }, label: "taylor.osei is in Compliance Users" },
    { c: { t: "member", sam: "taylor.osei", group: "Operations Users", want: false }, label: "taylor.osei is no longer in Operations Users" },
  ]),
  "tq-11": G(
    [
      { c: { t: "enabled", sam: "kai.mendes", want: false }, label: "kai.mendes is disabled" },
      { c: { t: "member", sam: "kai.mendes", group: "Operations Users", want: false }, label: "kai.mendes is no longer in Operations Users" },
    ],
    { users: ["kai.mendes"] }
  ),
  "tq-12": G([{ c: { t: "member", sam: "sam.whitfield", group: "Server Admins", want: false }, label: "sam.whitfield is not in Server Admins" }]),
  "tq-13": G(
    [
      { c: { t: "noexpire", sam: "noah.kim", want: false }, label: "noah.kim's password can expire again" },
      { c: { t: "enabled", sam: "noah.kim", want: true }, label: "noah.kim's account is still enabled" },
    ],
    { users: ["noah.kim"] }
  ),
  "tq-14": G(
    [{ c: { t: "computerAt", name: "FIN-LT14", ou: "OU=Workstations,OU=FinanceAccounting,OU=Departments" }, label: "FIN-LT14 is in Departments, FinanceAccounting, Workstations" }],
    { ous: ["OU=Workstations,OU=FinanceAccounting,OU=Departments"] }
  ),
  "tq-15": G([{ c: { t: "group", name: "Finance Reports", category: "Security" }, label: "Finance Reports is a Security group" }], { groups: ["Finance Reports"] }),
  // Hardening tickets. Nothing is planted for these: the domain ships this
  // way. The checks read the policy the student set rather than an object
  // they moved, which is the same shape the lab audit already uses.
  // A lock time of 0 means an administrator must unlock the account by hand,
  // which is stricter than 15 minutes rather than weaker. evalCheck compares
  // numerically and would read 0 as a failure, so the ticket asks for a real
  // number of minutes and the hint says so.
  "tq-21": G([
    { c: { t: "policy", key: "lockoutThreshold", min: 1, max: 10 }, label: "Accounts lock after 10 wrong passwords or fewer" },
    { c: { t: "policy", key: "lockoutDurationMin", min: 15 }, label: "A locked account stays locked for at least 15 minutes" },
    { c: { t: "policy", key: "lockoutWindowMin", min: 15 }, label: "The count of wrong passwords resets no sooner than 15 minutes" },
  ]),
  "tq-22": G([{ c: { t: "audit", sub: "Process Creation", need: "Success" }, label: "Process creation is audited for success" }]),
  "tq-23": G([{ c: { t: "logsize", minMB: 512 }, label: "The Security log holds at least 512 MB" }]),
  "tq-24": G([{ c: { t: "pso", minLength: 16, appliesTo: "IT Admins", maxLockout: 5 }, label: "A 16-character policy locking after 5 tries applies to IT Admins" }]),
  "tq-25": G([{ c: { t: "computer", name: "OPS-WKS03", enabled: false }, label: "OPS-WKS03 is disabled" }], { computers: ["OPS-WKS03"] }),
  "tq-16": G([{ c: { t: "dnsToDc", name: "files" }, label: "files resolves to the domain controller" }], { tickets: ["INC-1052"] }),
  "tq-20": G([{ c: { t: "dnsToDc", name: "payroll" }, label: "payroll resolves only to the domain controller" }], { tickets: ["INC-1056"] }),
  "tq-17": G([{ c: { t: "fwRuleOff", name: "PurveX Temp - Vendor RDP" }, label: "The vendor RDP rule is disabled or removed" }], { tickets: ["INC-1053"] }),
  "tq-18": G(
    [
      {
        c: { t: "gpoLink", gpo: "PurveX - Finance Screen Lock", ous: ["OU=FinanceAccounting,OU=Departments", "OU=Users,OU=FinanceAccounting,OU=Departments"], want: true },
        label: "The screen lock GPO is linked to Finance",
      },
      { c: { t: "gpoLink", gpo: "PurveX - Finance Screen Lock", ous: ["OU=Operations,OU=Departments"], want: false }, label: "The screen lock GPO is no longer linked to Operations" },
    ],
    { tickets: ["INC-1054"] }
  ),
  "tq-19": G(
    [
      { c: { t: "file", path: "Shares\\Finance\\Invoice_0923.pdf.exe", want: false }, label: "The file is gone from the Finance share" },
      { c: { t: "file", path: "Quarantine\\Invoice_0923.pdf.exe", want: true }, label: "The file is kept in C:\\PurveX\\Quarantine" },
    ],
    { tickets: ["INC-1055"] }
  ),
  // The Quiet Beacon capstone: the outbound rule the planted task relies on
  // is disabled, which the snapshot reports the same way tq-17 does. mw-01
  // (naming the task) has no lab-state check, same as tq-06 -- the task
  // itself never changes, so the typed answer alone proves it was found.
  "mw-02": G(
    [{ c: { t: "fwRuleOff", name: "Windows Update Assistant Network" }, label: "The planted outbound rule is disabled or removed" }],
    { tickets: ["INC-1064"] }
  ),
  // The baseline-outlier capstone: theo.walsh's excess Server Admins
  // membership is removed, the same member check tq-01/tq-12 already use.
  // bt-01 and bt-02 (naming the account and the group) have no lab-state
  // check, same as tq-06 -- the four accounts' membership never changes on
  // its own, so the typed answers alone prove the comparison was done.
  "bt-03": G(
    [{ c: { t: "member", sam: "theo.walsh", group: "Server Admins", want: false }, label: "theo.walsh is not in Server Admins" }],
    { users: ["theo.walsh"] }
  ),
  // Lock Every Gate capstone: the legacy internal-trust rule is disabled,
  // the same fwRuleOff check tq-17/mw-02 already use. zt-01 (naming the
  // port) has no lab-state check, same as tq-06.
  "zt-02": G(
    [{ c: { t: "fwRuleOff", name: "PurveX Legacy - Internal File Access" }, label: "The legacy internal-trust rule is disabled or removed" }],
    { tickets: ["INC-1067"] }
  ),
  // Lockout-threshold capstone: same pso check tq-24 already uses, just a
  // different group and a middle-of-the-band threshold instead of tq-24's
  // tightest-possible one. No pre-planted ticket mark needed -- Wealth
  // Management Users already exists in the base roster, same as tq-24.
  "th-01": G([{ c: { t: "pso", minLength: 12, appliesTo: "Wealth Management Users", maxLockout: 12 }, label: "A 12-character policy locking after 12 or fewer tries applies to Wealth Management Users" }]),
  // Phase 2 capstone: two real findings from the same overnight chain,
  // checked the same way their own single-week versions already were
  // (fwRuleOff for the rule, member for the excess group), against the
  // capstone's own separate artifacts (INC-1069/INC-1070, not Quiet
  // Beacon's or Baseline a Team's). cp-01/02/03/05/07/08 are reasoning or
  // naming steps with no lab-state change, same as tq-06.
  "cp-04": G(
    [{ c: { t: "fwRuleOff", name: "PurveX Update Helper Service" }, label: "The capstone's outbound rule is disabled or removed" }],
    { tickets: ["INC-1069"] }
  ),
  "cp-06": G(
    [{ c: { t: "member", sam: "ezra.lund", group: "Server Admins", want: false }, label: "ezra.lund is not in Server Admins" }],
    { users: ["ezra.lund"] }
  ),
  // The wire-capture capstone: the burned service account is contained by
  // disabling it, which the snapshot reports. Kept, not deleted, so the review
  // still has it.
  "cap-06": G(
    [{ c: { t: "enabled", sam: "svc-settlements", want: false }, label: "svc-settlements is disabled" }],
    { users: ["svc-settlements"] }
  ),
  // The integrity capstone: the unsigned mirror is moved to Quarantine, which
  // infra.files reports by path. Same shape as tq-19.
  "cry-06": G(
    [
      { c: { t: "file", path: "Shares\\IT\\vpn-client-2.4.1-mirror-b.txt", want: false }, label: "The unsigned mirror is gone from the IT share" },
      { c: { t: "file", path: "Quarantine\\vpn-client-2.4.1-mirror-b.txt", want: true }, label: "It is kept in C:\\PurveX\\Quarantine" },
    ],
    { tickets: ["INC-1058"] }
  ),
  // Week 4's effective-access challenge: a Help Desk account is pulled out of
  // Compliance Users, the access-level group an audit found it never needed.
  // Same member check tq-05/bt-03/cp-06 already use.
  "ea-03": G(
    [{ c: { t: "member", sam: "noor.ahmadi", group: "Compliance Users", want: false }, label: "noor.ahmadi is not in Compliance Users" }],
    { users: ["noor.ahmadi"] }
  ),
  // The sign-in log challenge's capstone: the account the real lockout event
  // pointed to is unlocked, the same flag check tq-02 already uses.
  "sl-03": G(
    [{ c: { t: "flag", sam: "petra.lindqvist", flag: "lockedOut", want: false }, label: "petra.lindqvist is not locked out" }],
    { users: ["petra.lindqvist"] }
  ),
  // The phishing chain's Installation/C2 capstone: same fwRuleOff check the
  // first intrusion's beacons already use, a different rule name.
  "pi-02": G(
    [{ c: { t: "fwRuleOff", name: "Office Telemetry Upload" }, label: "The Office Telemetry Upload rule is disabled or removed" }],
    { tickets: ["INC-1075"] }
  ),
  // The phishing chain's Actions on Objectives capstone: the staged file is
  // moved to Quarantine, the same file-pair check cry-06 already uses.
  "ao-02": G(
    [
      { c: { t: "file", path: "Shares\\IT\\staged-export.zip", want: false }, label: "The staged file is gone from the IT share" },
      { c: { t: "file", path: "Quarantine\\staged-export.zip", want: true }, label: "It is kept in C:\\PurveX\\Quarantine" },
    ],
    { tickets: ["INC-1076"] }
  ),
  // The client data review reads the synthetic records the lab plants on its
  // shares. Every task needs them on the share before it can be answered; the
  // last one also needs the least-privilege group the student builds.
  "cd-01": G([], { tickets: ["DATA-SAMPLE"] }),
  "cd-02": G([], { tickets: ["DATA-SAMPLE"] }),
  "cd-03": G([], { tickets: ["DATA-SAMPLE"] }),
  "cd-04": G([], { tickets: ["DATA-SAMPLE"] }),
  "cd-05": G([], { tickets: ["DATA-SAMPLE"] }),
  "cd-06": G([], { tickets: ["DATA-SAMPLE"] }),
  "cd-07": G(
    [
      { c: { t: "group", name: "Client Data Readers", category: "Security", container: "OU=AccessLevels" }, label: "Client Data Readers is a security group in AccessLevels" },
      { c: { t: "member", sam: "sam.whitfield", group: "Client Data Readers", want: true }, label: "sam.whitfield is in it" },
      { c: { t: "member", sam: "jamie.torres", group: "Client Data Readers", want: true }, label: "jamie.torres is in it" },
      { c: { t: "member", sam: "devon.brooks", group: "Client Data Readers", want: true }, label: "devon.brooks is in it" },
      { c: { t: "member", sam: "morgan.lee", group: "Client Data Readers", want: true }, label: "morgan.lee is in it" },
      // Least privilege: every other staff account stays out.
      { c: { t: "member", sam: "alex.rivera", group: "Client Data Readers", want: false }, label: "alex.rivera is not in it" },
      { c: { t: "member", sam: "priya.nair", group: "Client Data Readers", want: false }, label: "priya.nair is not in it" },
      { c: { t: "member", sam: "taylor.osei", group: "Client Data Readers", want: false }, label: "taylor.osei is not in it" },
      { c: { t: "member", sam: "riley.kwan", group: "Client Data Readers", want: false }, label: "riley.kwan is not in it" },
      { c: { t: "member", sam: "jordan.ellis", group: "Client Data Readers", want: false }, label: "jordan.ellis is not in it" },
    ],
    { tickets: ["DATA-SAMPLE"] }
  ),
} as const;

type Gate = { checks: { c: Check; label: string }[]; needs?: Needs };

export function missionGate(id: string) {
  return (MISSION_LAB as Record<string, Gate>)[id] ?? null;
}

/** True when the snapshot holds every object this ticket was planted with. */
export function hasMissionObjects(id: string, s: LabSnapshot) {
  const needs = missionGate(id)?.needs;
  if (!needs) return true;
  const has = (list: string[] | undefined, names: string[]) => (list ?? []).every((n) => names.includes(n.toLowerCase()));
  return (
    has(needs.users, s.users.map((u) => u.sam.toLowerCase())) &&
    has(needs.groups, s.groups.map((g) => g.name.toLowerCase())) &&
    has(needs.ous, s.ous.map((o) => o.path.toLowerCase())) &&
    has(needs.computers, s.computers.map((c) => c.name.toLowerCase())) &&
    has(needs.tickets, (s.infra?.planted ?? []).map((t) => t.toLowerCase()))
  );
}

/** True when the lab was built with the Ticket Queue objects. Without them there is nothing to check. */
export function hasTicketObjects(s: LabSnapshot) {
  const users = new Set(s.users.map((u) => u.sam.toLowerCase()));
  return (
    s.groups.some((g) => g.name.toLowerCase() === "all employees") ||
    users.has("old.intern") ||
    users.has("svc-backup-job") ||
    s.computers.some((c) => ["wm-wks07", "ops-wks03"].includes(c.name.toLowerCase()))
  );
}

/** What a check is about, so a lab finding and a ticket that fix the same thing compare equal. */
function checkKey(c: Check): string {
  const r = c as Record<string, unknown>;
  if (c.t === "policy") return `policy:${String(r.key).startsWith("lockout") ? "lockout" : String(r.key)}`;
  if (c.t === "member") return `member:${String(r.sam).toLowerCase()}:${String(r.group).toLowerCase()}`;
  const subject = r.sam ?? r.name ?? r.sub ?? r.path ?? "";
  return `${c.t}:${String(subject).toLowerCase()}`;
}

const TICKET_KEYS: [string, Set<string>][] = Object.entries(MISSION_LAB as Record<string, Gate>)
  .filter(([id]) => /^(tq|cap|cry)-/.test(id))
  .map(([id, g]) => [id, new Set(g.checks.map(({ c }) => checkKey(c)))]);

/** The ticket whose fix is this change, if any. A finding it covers is that ticket's work, not a separate job. */
export function ticketFor(checks: Check[]): string | null {
  const keys = checks.filter((c) => !(c.t === "enabled" && c.want)).map(checkKey);
  return TICKET_KEYS.find(([, set]) => keys.some((k) => set.has(k)))?.[0] ?? null;
}

export function checkMission(id: string, snapshot: LabSnapshot) {
  const gate = missionGate(id);
  if (!gate) return null;
  const results = gate.checks.map(({ c, label }) => ({ label, ok: evalCheck(snapshot, c) }));
  return { results, passed: results.every((r) => r.ok) };
}
