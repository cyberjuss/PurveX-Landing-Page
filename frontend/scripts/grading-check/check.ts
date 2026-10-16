/**
 * Does the grading say what it means?
 *
 *   npm run check:grading
 *
 * Readiness is the number a student is judged by and the number an employer
 * is eventually shown, and it is assembled from five places: the points for
 * one mission, the average across a skill, the overall out of everything,
 * the level that names it, and the class roll-up an instructor reads. None
 * of it was covered by a test.
 *
 * Pure arithmetic, no database and no lab.
 */
import {
  LAB_SKILLS,
  MISSION_SKILLS,
  SCORE_READY,
  SCORE_SOLID,
  itemPoints,
  labPoints,
  missionPoints,
  sanitizeResults,
  skillCompetent,
  skillWeak,
  summarize,
  type Results,
  type Skill,
} from "@/lib/academy-score";
import { rollUp, type RosterStudent } from "@/lib/academy-roster";

let failures = 0;
function t(name: string, ok: boolean, detail = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "\x1b[32mok  \x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? `  (${detail})` : ""}`);
}
const eq = (name: string, got: unknown, want: unknown) => t(name, Object.is(got, want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

console.log("--- one mission ---");
eq("not attempted is in progress, not zero", missionPoints(undefined), null);
eq("solved first try", missionPoints({ solved: true, wrong: 0, hint: false }), 100);
eq("solved after one wrong", missionPoints({ solved: true, wrong: 1, hint: false }), 70);
eq("solved after two wrong", missionPoints({ solved: true, wrong: 2, hint: false }), 40);
eq("solved after three wrong", missionPoints({ solved: true, wrong: 3, hint: false }), 0);
eq("solved after ten wrong is still zero, not negative", missionPoints({ solved: true, wrong: 10, hint: false }), 0);
eq("a hint costs ten", missionPoints({ solved: true, wrong: 0, hint: true }), 90);
eq("a hint cannot push a score below zero", missionPoints({ solved: true, wrong: 3, hint: true }), 0);
eq("two wrong with a hint", missionPoints({ solved: true, wrong: 2, hint: true }), 30);
eq("unsolved and still trying is in progress", missionPoints({ solved: false, wrong: 1, hint: false }), null);
eq("unsolved after three wrong is a zero", missionPoints({ solved: false, wrong: 3, hint: false }), 0);

console.log("\n--- a scored lab ---");
eq("a lab with points reports them", labPoints({ solved: true, wrong: 0, hint: false, pts: 55 }), 55);
eq("a lab with zero points is finished, not unstarted", labPoints({ solved: true, wrong: 0, hint: false, pts: 0 }), 0);
eq("an older lab pass scores the legacy figure", labPoints({ solved: true, wrong: 0, hint: false }), 70);
eq("an unfinished lab is in progress", labPoints({ solved: false, wrong: 0, hint: false }), null);
const labId = Object.keys(LAB_SKILLS)[0];
eq("itemPoints routes a lab to labPoints", itemPoints(labId, { solved: true, wrong: 2, hint: false }), 70);
const missionId = Object.keys(MISSION_SKILLS)[0];
eq("itemPoints routes a mission to missionPoints", itemPoints(missionId, { solved: true, wrong: 2, hint: false }), 40);

console.log("\n--- the whole transcript ---");
const ids = Object.keys({ ...MISSION_SKILLS, ...LAB_SKILLS });
const labIds = new Set(Object.keys(LAB_SKILLS));
// A browser lab records its own points, so a clean pass on one is 100. The
// 70 above is the legacy figure for a lab finished before labs were scored,
// and modelling a fresh pass that way made a perfect transcript read 98.
const clean = (id: string): Results[string] =>
  labIds.has(id) ? { solved: true, wrong: 0, hint: false, pts: 100 } : { solved: true, wrong: 0, hint: false };
const all = (r: (id: string, i: number) => Results[string] | null): Results =>
  Object.fromEntries(ids.map((id, i) => [id, r(id, i)]).filter(([, v]) => v !== null) as [string, Results[string]][]);

const perfect = summarize(all((id) => clean(id)));
eq("everything perfect is 100", perfect.overall, 100);
eq("everything perfect is finished", perfect.finished, perfect.total);
eq("everything perfect is ready", perfect.level, "ready");

const nothing = summarize({});
eq("nothing done is 0 overall", nothing.overall, 0);
eq("nothing done has no accuracy", nothing.accuracy, null);
eq("nothing done is level none", nothing.level, "none");

// Half done, all perfect: readiness counts the unfinished as zero, accuracy does not.
const half = summarize(all((id, i) => (i % 2 === 0 ? clean(id) : null)));
const halfDone = Math.ceil(ids.length / 2);
eq("half perfect scores accuracy 100", half.accuracy, 100);
eq("half perfect scores readiness by the whole course", half.overall, Math.round((halfDone * 100) / ids.length));
t("readiness is below accuracy while work is outstanding", half.overall < (half.accuracy ?? 0), `${half.overall} vs ${half.accuracy}`);
eq("half done is level progress", half.level, "progress");

const sloppy = summarize(all(() => ({ solved: true, wrong: 1, hint: false })));
eq("everything at 70 is finished", sloppy.finished, sloppy.total);
eq("everything at 70 is 70 overall", sloppy.overall, 70);
eq("everything at 70 is almost, not ready", sloppy.level, "almost");
t("70 is above the competent bar and below the ready bar", SCORE_SOLID <= 70 && 70 < SCORE_READY, `${SCORE_SOLID}/${SCORE_READY}`);

const poor = summarize(all(() => ({ solved: true, wrong: 3, hint: false })));
eq("everything at zero is still finished", poor.finished, poor.total);
eq("everything at zero is practice", poor.level, "practice");

// A transcript of labs finished before scoring existed cannot reach 100,
// which is correct and worth stating once rather than rediscovering.
const legacy = summarize(all(() => ({ solved: true, wrong: 0, hint: false })));
t("labs passed before scoring existed score the legacy 70", legacy.overall < 100 && legacy.overall >= 95, String(legacy.overall));

console.log("\n--- one weak skill blocks ready ---");
const weakest = Object.entries({ ...MISSION_SKILLS, ...LAB_SKILLS }).find(([, s]) => s === "logs")?.[0];
const nearlyPerfect = summarize(
  all((id) => (id === weakest ? { solved: true, wrong: 3, hint: false } : clean(id)))
);
t("a single zeroed mission keeps the level below ready", nearlyPerfect.level !== "ready", nearlyPerfect.level);
t("and the overall is still high", nearlyPerfect.overall >= SCORE_READY, String(nearlyPerfect.overall));

console.log("\n--- judging a skill ---");
t("a skill nobody has touched is neither competent nor weak", !skillCompetent({ score: null, rated: false }) && !skillWeak({ score: null, rated: false }));
t("a rated skill at the bar is competent", skillCompetent({ score: SCORE_SOLID, rated: true }));
t("a rated skill under the bar is weak", skillWeak({ score: SCORE_SOLID - 1, rated: true }));
t("an unrated skill is never called weak", !skillWeak({ score: 0, rated: false }), "too few finished to judge");

console.log("\n--- what a browser may claim ---");
const forged = sanitizeResults({ [missionId]: { solved: true, wrong: 0, hint: false, labOk: true } });
eq("a browser cannot claim its lab passed", forged[missionId]?.labOk, undefined);
const fromServer = sanitizeResults({ [missionId]: { solved: true, wrong: 0, hint: false, labOk: true } }, true);
eq("the server's own record keeps it", fromServer[missionId]?.labOk, true);
eq("an unknown mission id is dropped", Object.keys(sanitizeResults({ "not-a-mission": { solved: true, wrong: 0 } })).length, 0);

console.log("\n--- a whole class ---");
const DAY = 86_400_000;
const NOW = Date.parse("2026-06-15T12:00:00Z");
const student = (over: Partial<RosterStudent> & { skills?: { key: string; label: string; score: number | null }[] }): RosterStudent =>
  ({
    userId: "u", name: "N", email: "n@x", joinedAt: new Date(NOW - 30 * DAY).toISOString(),
    readiness: { overall: 50, accuracy: 50, level: "In progress", finished: 5, total: 38 },
    skills: [], stuck: [], lastActive: new Date(NOW - DAY).toISOString(), place: null,
    labSynced: null, drillsThisWeek: 0, labsPassed: 0, portfolio: null,
    ...over,
  }) as RosterStudent;

const unstarted = student({ readiness: { overall: null, accuracy: null, level: "Not started", finished: 0, total: 38 }, lastActive: null });

{
  const r = rollUp([student({ readiness: { overall: 80, accuracy: 80, level: "x", finished: 10, total: 38 } }), unstarted], NOW);
  t("a student who has started nothing is left out of the average", r.avgReadiness === 80, String(r.avgReadiness));
  t("but is still counted in the class size", r.students === 2, String(r.students));
}
{
  const r = rollUp([unstarted, unstarted], NOW);
  t("a class where nobody has started has no average, not zero", r.avgReadiness === null, String(r.avgReadiness));
}
{
  const r = rollUp(
    [
      student({ readiness: { overall: 60, accuracy: 60, level: "x", finished: 1, total: 38 } }),
      student({ readiness: { overall: 90, accuracy: 90, level: "x", finished: 1, total: 38 } }),
    ],
    NOW
  );
  t("the average is the mean of those who have started", r.avgReadiness === 75, String(r.avgReadiness));
}
{
  const skills = (logs: number, sec: number) => [
    { key: "logs", label: "Logs", score: logs },
    { key: "security", label: "Security", score: sec },
    { key: "risk", label: "Risk", score: null },
  ];
  const r = rollUp([student({ skills: skills(30, 90) }), student({ skills: skills(50, 80) })], NOW);
  t("the weakest skill is the lowest class average", r.weakest[0]?.label === "Logs" && r.weakest[0]?.avg === 40, JSON.stringify(r.weakest));
  t("a skill nobody has a score in is not named weakest", !r.weakest.some((w) => w.label === "Risk"), JSON.stringify(r.weakest));
  t("at most two are named", r.weakest.length <= 2, String(r.weakest.length));
}
{
  const r = rollUp(
    [
      student({ lastActive: new Date(NOW - 2 * DAY).toISOString() }),
      student({ lastActive: new Date(NOW - 8 * DAY).toISOString() }),
      student({ lastActive: null }),
    ],
    NOW
  );
  t("active this week counts only the last seven days", r.activeThisWeek === 1, String(r.activeThisWeek));
}
{
  const r = rollUp([student({ stuck: [{ title: "A", wrong: 3, skipped: false }] }), student({ stuck: [] })], NOW);
  t("stuck counts students, not stuck missions", r.stuck === 1, String(r.stuck));
}
{
  const r = rollUp([], NOW);
  t("an empty class does not divide by zero", r.avgReadiness === null && r.students === 0 && r.weakest.length === 0);
}
console.log(`\n${failures ? `\x1b[31m${failures} failed\x1b[0m` : "\x1b[32mall passed\x1b[0m"}`);
process.exit(failures ? 1 : 0);
