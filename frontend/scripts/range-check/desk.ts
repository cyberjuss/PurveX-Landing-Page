// The Desk: every "Read up" link lands on a real lesson tab, and every job has one.
// Run: npm run check:range:desk   (no database, no network)

import { findEntry } from "@/lib/academy-content";
import { JOBS, standardSnapshot } from "@/lib/academy-drills";
import { auditLab, pickFinding } from "@/lib/academy-audit";
import { SKILLS, type Skill } from "@/lib/academy-score";
import { INCIDENT_LESSON_IDS, JOB_LESSON_IDS, lessonFor } from "@/lib/academy-job-lessons";
import { INCIDENTS } from "@/lib/academy-shift";
import { echoesChallenge } from "@/lib/academy-scenario";
import { MISSION_CATALOG } from "@/lib/academy-missions";
import { triage } from "@/lib/academy-shift-desk";
import type { IncidentRun } from "@/lib/academy-shift";

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${name}${ok || !detail ? "" : `\n          ${detail}`}`);
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function resolves(href: string): string | null {
  const [path, tab] = href.split("#");
  const [, , phase, week] = path.split("/");
  const entry = findEntry(phase, week);
  if (!entry) return `no page ${path}`;
  if (tab && !entry.sections.some((s) => slug(s.label) === tab)) return `no tab #${tab} on ${path}`;
  return null;
}

console.log("\nRead up links");
const bad = [
  ...JOBS.map((j) => [j.id, lessonFor(j.id, j.skill).href] as const),
  ...(Object.keys(SKILLS) as Skill[]).map((k) => [k, lessonFor(undefined, k).href] as const),
].flatMap(([id, href]) => {
  const why = resolves(href);
  return why ? [`${id}: ${why}`] : [];
});
check("every job and skill links to a lesson tab that exists", bad.length === 0, bad.join("; "));
const missing = JOBS.filter((j) => !JOB_LESSON_IDS.includes(j.id)).map((j) => j.id);
check("every job has its own lesson, not just its skill's", missing.length === 0, missing.join(", "));
const noLesson = INCIDENTS.filter((i) => !INCIDENT_LESSON_IDS.includes(i.id)).map((i) => i.id);
check("every live-shift incident has a lesson to read up on", noLesson.length === 0, noLesson.join(", "));

console.log("\nDesk cases stay apart from the challenges");
const titles = Object.values(MISSION_CATALOG).map((m) => m.title);
const echoed = titles.filter((t) => !echoesChallenge({ title: t, prompt: "" }));
check("a case titled like any challenge ticket is caught", echoed.length === 0, echoed.slice(0, 5).join(" | "));
check(
  "a case about the same job but a new situation passes",
  !echoesChallenge({ title: "Contractor Badge Still Opens the Vault", prompt: "Which change closes this without losing the audit trail?" })
);
check("a reworded challenge title is caught", echoesChallenge({ title: "The Locked Out Account", prompt: "" }) || echoesChallenge({ title: "Locked Out", prompt: "" }));

console.log("\nDaily lab tasks never hand out a challenge's own fix");
{
  // A New Hire's First Week plants maya.okafor in the Operations folder. A
  // daily "make the change" case built from that would be the challenge's answer.
  const base = standardSnapshot();
  // Built from a real Operations user, so the folder path is in the lab's own format.
  const ops = base.users.find((u) => /OU=Operations,/i.test(u.container) && u.enabled) ?? base.users[0];
  const wm = base.users.find((u) => /OU=WealthManagement,/i.test(u.container));
  const misfiled = (sam: string, name: string) => ({ ...ops, sam, name, department: wm?.department ?? "Wealth Management", memberOf: ["Operations Users"], enabled: true });
  const planted = {
    ...base,
    // The lab reports its department folders; the misfiled rule reads them.
    ous: ["IT", "Compliance", "Operations", "WealthManagement", "FinanceAccounting"].map((d) => ({ path: `OU=${d},OU=Departments`, description: "" })),
    users: [...base.users, misfiled("maya.okafor", "Maya Okafor"), misfiled("pat.control", "Pat Control")],
  };
  const daily = auditLab(planted).filter((f) => f.task && !f.ticket);
  check("Maya's misfiled account never becomes a daily lab task", !daily.some((f) => /maya\.okafor/i.test(f.facts)), daily.map((f) => f.id).join(", "));
  // The control: the same problem on an account no challenge uses still does, so the check above is not passing by accident.
  check("the same problem on an account no challenge uses still does", daily.some((f) => f.id === "misplaced-account:pat.control"), daily.map((f) => f.id).join(", "));
  const pick = pickFinding({ snapshot: planted, seed: "x", level: 1, avoid: [] });
  check("and the daily pick never lands on Maya", !pick || !/maya\.okafor/i.test(pick.facts), pick?.facts ?? "");
}

console.log("\nShift report: severity order is earned, not given");
{
  const inc = (uid: string, severity: string, over: Partial<IncidentRun> = {}) =>
    ({ uid, severity, arriveSec: 0, deadlineSec: 600, ackedAtSec: null, resolvedAtSec: null, escalatedAtSec: null, ...over }) as IncidentRun;
  const idle = triage([inc("a", "P2", { ackedAtSec: 0 }), inc("b", "P3"), inc("c", "P3")]);
  check("a shift with nothing closed earns no severity-order points", idle.score === 0 && idle.worked === false, JSON.stringify(idle));
  const clean = triage([inc("a", "P2", { ackedAtSec: 5, resolvedAtSec: 200 }), inc("b", "P3", { ackedAtSec: 210, resolvedAtSec: 400 })]);
  check("working the highest first earns the full points", clean.score === clean.max && clean.worked, JSON.stringify(clean));
  const wrong = triage([inc("a", "P2", { ackedAtSec: 300, resolvedAtSec: 500 }), inc("b", "P3", { ackedAtSec: 5, resolvedAtSec: 200 })]);
  check("opening the P3 while the P2 waits costs points", wrong.score < wrong.max, JSON.stringify(wrong));
}

console.log(failures ? `\n${failures} desk check(s) failed.` : "\nAll desk checks passed.");
process.exit(failures ? 1 : 0);
