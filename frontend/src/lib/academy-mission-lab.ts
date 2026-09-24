import "server-only";
import { evalCheck, type Check } from "@/lib/academy-drills";
import type { LabSnapshot } from "@/lib/academy-lab";

// Ticket Queue tickets that ask for a real change. The student cannot submit
// the answer until their own lab shows the change.

const G = (checks: { c: Check; label: string }[]) => ({ checks });

const MISSION_LAB = {
  "tq-01": G([{ c: { t: "member", sam: "jamie.torres", group: "All Employees", want: true }, label: "Jamie Torres is a member of All Employees" }]),
  "tq-02": G([
    { c: { t: "enabled", sam: "riley.kwan", want: true }, label: "riley.kwan is enabled" },
    { c: { t: "flag", sam: "riley.kwan", flag: "lockedOut", want: false }, label: "riley.kwan is not locked out" },
  ]),
  "tq-03": G([
    { c: { t: "member", sam: "casey.reed", group: "IT Users", want: true }, label: "casey.reed exists and is a member of IT Users" },
    { c: { t: "member", sam: "old.intern", group: "IT Users", want: false }, label: "old.intern is no longer in IT Users" },
  ]),
  "tq-04": G([{ c: { t: "desc", sam: "svc-backup-job", text: "01:00-03:00" }, label: "svc-backup-job's Description records the 01:00-03:00 window" }]),
  "tq-05": G([
    { c: { t: "container", sam: "taylor.osei", ou: "OU=Users,OU=Compliance,OU=Departments" }, label: "taylor.osei is in the Compliance Users folder" },
    { c: { t: "member", sam: "taylor.osei", group: "Compliance Users", want: true }, label: "taylor.osei is in Compliance Users" },
    { c: { t: "member", sam: "taylor.osei", group: "Operations Users", want: false }, label: "taylor.osei is no longer in Operations Users" },
  ]),
} as const;

export function missionGate(id: string) {
  return (MISSION_LAB as Record<string, { checks: { c: Check; label: string }[] }>)[id] ?? null;
}

export function checkMission(id: string, snapshot: LabSnapshot) {
  const gate = missionGate(id);
  if (!gate) return null;
  const results = gate.checks.map(({ c, label }) => ({ label, ok: evalCheck(snapshot, c) }));
  return { results, passed: results.every((r) => r.ok) };
}
