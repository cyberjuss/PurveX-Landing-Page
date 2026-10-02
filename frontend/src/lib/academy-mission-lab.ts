import "server-only";
import { evalCheck, type Check } from "@/lib/academy-drills";
import type { LabSnapshot } from "@/lib/academy-lab";

// Ticket Queue tickets that ask for a real change. The student cannot submit
// the answer until their own lab shows the change.

/** Objects a ticket needs in the snapshot. A lab built before the ticket existed lacks them. */
type Needs = { users?: string[]; groups?: string[]; ous?: string[]; tickets?: string[] };

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
    { c: { t: "member", sam: "old.intern", group: "IT Users", want: false }, label: "old.intern is no longer in IT Users" },
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
  "tq-16": G([{ c: { t: "dnsToDc", name: "files" }, label: "files resolves to the domain controller" }], { tickets: ["INC-1052"] }),
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

export function checkMission(id: string, snapshot: LabSnapshot) {
  const gate = missionGate(id);
  if (!gate) return null;
  const results = gate.checks.map(({ c, label }) => ({ label, ok: evalCheck(snapshot, c) }));
  return { results, passed: results.every((r) => r.ok) };
}
