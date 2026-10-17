/**
 * Submit and check, played against a modeled lab.
 *
 * check:shift:live fires each incident at a real domain controller and runs the
 * right fix. This covers what it cannot reach without a pod, and what it never
 * tried: the student who does nothing, the student who does the wrong thing,
 * and the lab whose attack never fired. For every incident and every victim it
 * can bind, it builds a lab the way the incident's script leaves it (see
 * public/lab-scripts/incidents), then grades it with the real grader:
 *
 *   1. Attacked, untouched     -> must not be resolved (or the student is
 *                                 handed it solved). The false alarm is the
 *                                 one exception: leaving it alone is the fix.
 *   2. Fixed, attack logged    -> must be resolved, with no collateral.
 *   3. Fixed, nothing logged   -> must not be resolved where the incident
 *                                 proves itself from the Security log.
 *   4. Wrong fixes             -> deleting the account on a group alert is
 *                                 collateral, the usual reset with "must change
 *                                 at next logon" does not close the expired
 *                                 password ticket (its brief says so).
 *
 *   npm run check:shift
 */
import { INCIDENTS, effectiveIncident, gradeIncidentLab, ROSTER, VICTIMS, type Bind, type IncidentDef } from "@/lib/academy-shift";
import type { Check } from "@/lib/academy-drills";
import type { LabEvents, LabSnapshot, LabUser } from "@/lib/academy-lab";

let fail = 0;
const ok = (c: boolean, m: string) => {
  if (!c) {
    fail++;
    console.log("FAIL", m);
  }
};

const DEPT_OU: Record<string, string> = { IT: "IT", Compliance: "Compliance", "Wealth Management": "WealthManagement", Operations: "Operations", "Finance and Accounting": "FinanceAccounting" };
const DEPT_GROUP: Record<string, string> = { IT: "IT Users", Compliance: "Compliance Users", "Wealth Management": "Wealth Management Users", Operations: "Operations Users", "Finance and Accounting": "Finance Accounting Users" };
const ouOf = (dept: string) => `OU=Users,OU=${DEPT_OU[dept]},OU=Departments`;
const byName = new Map(ROSTER.map((r) => [r.sam, r]));

/** The lab as Build-Environment.ps1 leaves it, before any shift. */
function baseline(): LabSnapshot {
  const users: LabUser[] = ROSTER.map((r) => ({
    sam: r.sam, name: r.name, title: "", department: r.dept, description: "",
    container: ouOf(r.dept), enabled: r.sam !== "riley.kwan", lockedOut: false, badLogonCount: 0,
    passwordNeverExpires: false, passwordExpired: false, lastLogon: null, memberOf: [DEPT_GROUP[r.dept]],
    pwdNotRequired: false, noPreAuth: false, delegation: false, spns: 0,
  }));
  const groups = [...Object.values(DEPT_GROUP), "IT Admins", "Domain Admins"].map((name) => ({
    name, scope: "Global", category: "Security", description: "", container: "OU=Groups",
    members: name === "IT Admins" ? ["Alex Rivera"] : ROSTER.filter((r) => DEPT_GROUP[r.dept] === name).map((r) => r.name),
  }));
  users.find((u) => u.sam === "alex.rivera")!.memberOf.push("IT Admins");
  return {
    capturedAt: new Date().toISOString(),
    domain: { dnsRoot: "purvex.local", netbios: "PURVEX" },
    ous: [], users, groups, computers: [],
    security: {
      passwordPolicy: { minLength: 12, complexity: true, history: 24, maxAgeDays: 90, lockoutThreshold: 0, lockoutDurationMin: 0, lockoutWindowMin: 0, reversible: false },
      audit: { "Special Logon": "Success" },
      psos: [],
    } as LabSnapshot["security"],
  };
}

const emptyEvents = (): LabEvents => ({ windowDays: 7, v: 3, failures: [], lockouts: [], created: [], disabled: [], groupAdds: [], accountChanges: [], policyChanges: [], auditChanges: [] });

// ---- the lab, edited the way PowerShell would ----
const user = (s: LabSnapshot, sam: string) => s.users.find((u) => u.sam === sam);
function addUser(s: LabSnapshot, sam: string, container: string, enabled: boolean) {
  if (!user(s, sam)) s.users.push({ sam, name: sam, title: "", department: "", description: "", container, enabled, lockedOut: false, badLogonCount: 0, passwordNeverExpires: false, passwordExpired: false, lastLogon: null, memberOf: [], pwdNotRequired: false, noPreAuth: false, delegation: false, spns: 0 });
}
function setMember(s: LabSnapshot, sam: string, group: string, on: boolean) {
  const u = user(s, sam);
  const g = s.groups.find((x) => x.name === group)!;
  if (!u) return;
  u.memberOf = u.memberOf.filter((m) => m !== group).concat(on ? [group] : []);
  g.members = g.members.filter((m) => m !== u.name).concat(on ? [u.name] : []);
}
function deleteUser(s: LabSnapshot, sam: string) {
  const u = user(s, sam);
  if (!u) return;
  for (const g of s.groups) g.members = g.members.filter((m) => m !== u.name);
  s.users = s.users.filter((x) => x !== u);
}

/** What each incident's script does to the lab, and what it writes to the Security log. */
function attack(def: IncidentDef, b: Bind | undefined, s: LabSnapshot, e: LabEvents) {
  const a = b?.args ?? {};
  const sam = a.Sam;
  const changed = (x: string) => e.accountChanges.push({ account: x, at: "", by: "attacker" });
  const policyIfNone = () => {
    if (s.security!.passwordPolicy!.lockoutThreshold === 0) s.security!.passwordPolicy!.lockoutThreshold = 5;
  };
  switch (def.script) {
    case "Incident-Lockout.ps1": {
      const x = sam ?? "riley.kwan";
      policyIfNone();
      user(s, x)!.lockedOut = true;
      e.failures.push({ account: x, count: 6, last: null });
      e.lockouts.push({ account: x, count: 1, last: null });
      return;
    }
    case "Incident-Spray.ps1": {
      policyIfNone();
      const targets = (a.Targets ?? "priya.nair,jordan.ellis").split(",");
      for (const t of (a.Sprayed ?? "").split(",").filter(Boolean)) e.failures.push({ account: t, count: 2, last: null });
      for (const t of targets) {
        user(s, t)!.lockedOut = true;
        e.lockouts.push({ account: t, count: 1, last: null });
      }
      return;
    }
    case "Incident-BruteForce.ps1":
      policyIfNone();
      user(s, sam ?? "sam.whitfield")!.lockedOut = true;
      e.failures.push({ account: sam ?? "sam.whitfield", count: 8, last: null });
      e.lockouts.push({ account: sam ?? "sam.whitfield", count: 1, last: null });
      return;
    case "Incident-RogueAdmin.ps1":
      addUser(s, "svc.helpdesk", ouOf("IT"), false);
      setMember(s, "svc.helpdesk", "IT Admins", true);
      e.groupAdds.push({ member: "svc.helpdesk", group: "IT Admins", at: "", by: "attacker" });
      return;
    case "Incident-DomainAdmins.ps1": {
      const x = sam ?? "taylor.osei";
      setMember(s, x, "Domain Admins", true);
      e.groupAdds.push({ member: byName.get(x)!.name, group: "Domain Admins", at: "", by: "attacker" });
      return;
    }
    case "Incident-ApprovedChange.ps1":
      setMember(s, "morgan.lee", "Compliance Users", true);
      e.groupAdds.push({ member: "Morgan Lee", group: "Compliance Users", at: "", by: "it.change" });
      return;
    case "Incident-Compromise.ps1":
      e.failures.push({ account: sam ?? "jamie.torres", count: 4, last: null });
      return;
    case "Incident-WeakPolicy.ps1":
      Object.assign(s.security!.passwordPolicy!, { minLength: 4, complexity: false, lockoutThreshold: 0 });
      e.policyChanges.push({ at: "", by: "attacker" });
      return;
    case "Incident-Reversible.ps1":
      s.security!.passwordPolicy!.reversible = true;
      e.policyChanges.push({ at: "", by: "attacker" });
      return;
    case "Incident-Disable.ps1":
      user(s, sam ?? "taylor.osei")!.enabled = false;
      e.disabled.push({ account: sam ?? "taylor.osei", at: "", by: "attacker" });
      return;
    case "Incident-Offboarding.ps1":
      user(s, sam ?? "jordan.ellis")!.enabled = true;
      return;
    case "Incident-AccessRequest.ps1":
      setMember(s, sam ?? "priya.nair", a.Group ?? "Compliance Users", false);
      return;
    case "Incident-DeptTransfer.ps1": {
      const x = sam ?? "devon.brooks";
      const from = Object.entries(DEPT_OU).find(([, v]) => v === (a.From ?? "Compliance"))![0];
      const to = Object.entries(DEPT_OU).find(([, v]) => v === (a.To ?? "Operations"))![0];
      setMember(s, x, DEPT_GROUP[from], true);
      setMember(s, x, DEPT_GROUP[to], false);
      return;
    }
    case "Incident-PreAuth.ps1":
      user(s, sam ?? "priya.nair")!.noPreAuth = true;
      changed(sam ?? "priya.nair");
      return;
    case "Incident-PwdNotReq.ps1":
      user(s, sam ?? "priya.nair")!.pwdNotRequired = true;
      changed(sam ?? "priya.nair");
      return;
    case "Incident-Delegation.ps1":
      user(s, sam ?? "priya.nair")!.delegation = true;
      changed(sam ?? "priya.nair");
      return;
    case "Incident-NoExpire.ps1":
      user(s, sam ?? "sam.whitfield")!.passwordNeverExpires = true;
      changed(sam ?? "sam.whitfield");
      return;
    case "Incident-PwdExpired.ps1":
      user(s, sam ?? "jordan.ellis")!.passwordExpired = true;
      changed(sam ?? "jordan.ellis");
      return;
    case "Incident-Kerberoast.ps1":
      user(s, sam ?? "morgan.lee")!.spns = 1;
      changed(sam ?? "morgan.lee");
      return;
    case "Incident-WrongOU.ps1":
      user(s, sam ?? "devon.brooks")!.container = "OU=Departments";
      changed(sam ?? "devon.brooks");
      return;
    case "Incident-RogueComputer.ps1":
      s.computers.push({ name: "WKS-TEMP7", description: "Unregistered machine account. No matching asset record.", container: "OU=Workstations,OU=IT,OU=Departments", enabled: true, lastLogon: null });
      return;
    case "Incident-BackdoorAccount.ps1":
      addUser(s, "svc.update", ouOf("IT"), true);
      e.created.push({ account: "svc.update", at: "", by: "attacker" });
      return;
    case "Incident-DisableAudit.ps1":
      s.security!.audit!["Special Logon"] = "No Auditing";
      e.auditChanges.push({ at: "", by: "attacker" });
      return;
    case "Incident-AdminPSO.ps1":
      s.security!.psos = [];
      return;
  }
  throw new Error(`no model for ${def.script}`);
}

/** The student's fix: make each resolve check true, the way the GUI or PowerShell would. */
function fix(c: Check, s: LabSnapshot) {
  if (c.t === "member") return setMember(s, c.sam, c.group, c.want);
  if (c.t === "enabled") return void (user(s, c.sam)!.enabled = c.want);
  if (c.t === "flag") return void ((user(s, c.sam) as unknown as Record<string, boolean>)[c.flag] = c.want);
  if (c.t === "noexpire") return void (user(s, c.sam)!.passwordNeverExpires = c.want);
  if (c.t === "spn") return void (user(s, c.sam)!.spns = c.want ? 1 : 0);
  if (c.t === "container") return void (user(s, c.sam)!.container = c.ou);
  if (c.t === "computer") return void (s.computers.find((x) => x.name === c.name)!.enabled = c.enabled);
  if (c.t === "audit") return void (s.security!.audit![c.sub] = "Success");
  if (c.t === "policy") {
    const p = s.security!.passwordPolicy! as unknown as Record<string, number | boolean>;
    p[c.key] = c.bool !== undefined ? c.bool : c.max !== undefined ? Math.min(c.max, Math.max(c.min ?? 0, 5)) : Math.max(c.min ?? 0, 14);
    return;
  }
  if (c.t === "pso") {
    s.security!.psos = [{ name: "Admins", precedence: 1, minLength: c.minLength, appliesTo: [c.appliesTo], lockoutThreshold: 5 }] as never;
    return;
  }
  throw new Error(`no fix for ${c.t}`);
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
let cases = 0;

for (const def of INCIDENTS) {
  // Every victim the incident can bind, not just one.
  const binds: (Bind | undefined)[] = [];
  if (def.bind) {
    for (let k = 0; k < VICTIMS.length * 3; k++) {
      let n = k;
      const b = def.bind(<T,>(arr: T[]) => arr[n++ % arr.length]);
      if (!binds.some((x) => JSON.stringify(x?.args) === JSON.stringify(b.args))) binds.push(b);
    }
  } else binds.push(undefined);

  for (const b of binds) {
    cases++;
    const eff = effectiveIncident(def, { bind: b });
    const who = b?.args ? ` (${Object.values(b.args).join(", ")})` : "";
    const s = baseline();
    const e = emptyEvents();
    attack(def, b, s, e);
    s.events = e;

    // 1. Untouched.
    const before = gradeIncidentLab(eff, s, "");
    if (def.falseAlarm) ok(before.resolved, `${def.id}${who}: leaving the approved change alone should read as handled`);
    else ok(!before.resolved, `${def.id}${who}: handed to the student already solved`);

    // 2. Fixed, attack logged.
    const fixed = clone(s);
    for (const r of eff.resolve) fix(r.c, fixed);
    const after = gradeIncidentLab(eff, fixed, eff.diagnosis.accept[0]);
    ok(after.resolved, `${def.id}${who}: the right fix does not close it: ${after.results.filter((r) => !r.ok).map((r) => r.label).join("; ")}`);
    ok(after.noHarm, `${def.id}${who}: the right fix is marked as collateral`);
    ok(after.diagnosisRight, `${def.id}${who}: its own first accepted answer is marked wrong`);

    // 3. Fixed, but the attack never reached the log.
    if (eff.evidence) {
      const blind = clone(fixed);
      blind.events = emptyEvents();
      ok(!gradeIncidentLab(eff, blind, eff.diagnosis.accept[0]).resolved, `${def.id}${who}: closes with no attack in the log`);
    }

    // 4. Wrong fixes.
    if (def.id === "rogue-admin" || def.id === "domain-admins") {
      const target = def.id === "rogue-admin" ? "svc.helpdesk" : (b?.args?.Sam ?? "taylor.osei");
      const deleted = clone(s);
      deleteUser(deleted, target);
      const g = gradeIncidentLab(eff, deleted, eff.diagnosis.accept[0]);
      ok(!g.noHarm, `${def.id}${who}: deleting ${target} is not marked as collateral`);
    }
    if (def.id === "pwd-expired") {
      // ADUC's reset with "must change at next logon" leaves pwdLastSet at 0.
      ok(!gradeIncidentLab(eff, s, eff.diagnosis.accept[0]).resolved, `${def.id}${who}: a reset that leaves it expired closes it`);
      ok(/must change password at next logon/i.test(eff.brief), `${def.id}${who}: the brief does not say to clear "must change at next logon"`);
    }
    if (def.id === "spray" || def.id === "targeted-bruteforce") {
      const weakened = clone(fixed);
      weakened.security!.passwordPolicy!.lockoutThreshold = 0;
      ok(!gradeIncidentLab(eff, weakened, eff.diagnosis.accept[0]).noHarm, `${def.id}${who}: turning lockout off is not marked as collateral`);
    }
  }
}

console.log(`${INCIDENTS.length} incidents, ${cases} bound cases played against a modeled lab`);
console.log(fail ? `${fail} failed` : "all passed");
process.exit(fail ? 1 : 0);
