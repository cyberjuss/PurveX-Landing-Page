// The Desk: every "Read up" link lands on a real lesson tab, and every job has one.
// Run: npm run check:range:desk   (no database, no network)

import { findEntry } from "@/lib/academy-content";
import { JOBS, standardSnapshot } from "@/lib/academy-drills";
import { auditLab, pickFinding } from "@/lib/academy-audit";
import { SKILLS, type Skill } from "@/lib/academy-score";
import { INCIDENT_LESSON_IDS, JOB_LESSON_IDS, lessonFor } from "@/lib/academy-job-lessons";
import { INCIDENTS, newShiftRun } from "@/lib/academy-shift";
import { echoesChallenge } from "@/lib/academy-scenario";
import { MISSION_CATALOG } from "@/lib/academy-missions";
import { triage } from "@/lib/academy-shift-desk";
import { labFeed } from "@/lib/academy-lab-feed";
import { CALL_POINTS, callPoints, sameShiftWeek } from "@/lib/academy-shift-run";
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

console.log("\nThe Desk's live feed");
{
  const feed = labFeed({
    windowDays: 7,
    failures: [{ account: "devon.brooks", count: 6, last: "2026-11-27T14:14:00Z" }, { account: "never.seen", count: 1, last: null }],
    lockouts: [{ account: "devon.brooks", count: 1, last: "2026-11-27T14:15:00Z" }],
    created: [],
    disabled: [{ account: "kai.mendes", at: "2026-11-27T13:00:00Z", by: "alex.rivera" }],
    groupAdds: [{ member: "sam.whitfield", group: "Domain Admins", at: "2026-11-27T14:20:00Z", by: "alex.rivera" }],
    accountChanges: [],
    policyChanges: [],
    auditChanges: [],
  });
  check("newest event first", feed[0]?.id === 4728 && feed[1]?.id === 4740, feed.map((r) => r.id).join(" "));
  check("a failure with no time is left out rather than dated wrong", !feed.some((r) => r.who === "never.seen"));
  check("an admin group add is flagged red", feed[0]?.tone === "bad");
  check("a failure shows how many", feed.find((r) => r.id === 4625)?.count === 6);
  check("who did it is named when it was someone else", feed.find((r) => r.id === 4725)?.who === "kai.mendes by alex.rivera");
}

console.log("\nSelf-triage: the priority call is scored");
check("the right priority earns the full points", callPoints("P2", "P2") === CALL_POINTS);
check("one level off earns some", callPoints("P3", "P2") === 4 && callPoints("P1", "P2") === 4);
check("two levels off earns none", callPoints("P3", "P1") === 0);
check("never triaged earns none", callPoints(undefined, "P1") === 0);

console.log("\nEvery shift is new, and there is one a week");
{
  // A student's run of shifts, each drawn knowing the one before, at every Phase 1 level.
  for (const level of [1, 2, 3, 4]) {
    let prev = newShiftRun(`u:0`, 1, level, [], Date.UTC(2026, 0, 1));
    let repeats = 0;
    let typeRepeats = 0;
    let n = 0;
    for (let k = 1; k < 120; k++) {
      const last = { defIds: prev.incidents.map((i) => i.defId), prompts: prev.incidents.map((i) => i.question?.prompt ?? "") };
      const run = newShiftRun(`u:${k}`, 1, level, [], Date.UTC(2026, 0, 1), undefined, last);
      const before = new Set(prev.incidents.map((i) => `${i.defId}|${i.question?.prompt}`));
      for (const i of run.incidents) {
        n++;
        if (before.has(`${i.defId}|${i.question?.prompt}`)) repeats++;
        // The false-alarm slot is exempt: Phase 1 has one false-alarm type, so it recurs with a new question.
        if (last.defIds.includes(i.defId) && !INCIDENTS.find((d) => d.id === i.defId)?.falseAlarm) typeRepeats++;
      }
      prev = run;
    }
    check(`level ${level}: no incident comes back with the same question as last shift`, repeats === 0, `${repeats} of ${n}`);
    if (level > 1) check(`level ${level}: no incident type comes back from last shift`, typeRepeats === 0, `${typeRepeats} of ${n}`);
  }
  // The week starts Monday, the same as the weekly investigation.
  const sun = Date.UTC(2026, 10, 29, 22); // Sunday 29 November
  const mon = Date.UTC(2026, 10, 30, 1); // Monday 30 November
  check("a shift on Sunday blocks another that Sunday", sameShiftWeek(new Date(Date.UTC(2026, 10, 23, 9)).toISOString(), sun));
  check("and opens again on Monday", !sameShiftWeek(new Date(Date.UTC(2026, 10, 29, 9)).toISOString(), mon));
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
