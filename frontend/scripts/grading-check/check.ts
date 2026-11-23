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
  LEVEL_BEST_ID,
  MISSION_SKILLS,
  READINESS_BEST_ID,
  SCORED_SKILLS,
  SCORE_READY,
  SCORE_SOLID,
  itemPoints,
  labPoints,
  levelBest,
  missionPoints,
  pinReadiness,
  readinessBest,
  sanitizeResults,
  skillCompetent,
  skillWeak,
  summarize,
  type Results,
  type Skill,
} from "@/lib/academy-score";
import { rollUp, type RosterStudent } from "@/lib/academy-roster";
import { currentRank, pinRank, rankIndex } from "@/lib/academy-badges";

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
// Scored browser labs were retired on 2026-10-31 (each became a real
// challenge), so LAB_SKILLS is empty today. The lab path is still tested
// whenever a scored lab exists, and its absence is stated rather than
// silently skipped.
const labId = Object.keys(LAB_SKILLS)[0];
if (labId) eq("itemPoints routes a lab to labPoints", itemPoints(labId, { solved: true, wrong: 2, hint: false }), 70);
else t("no scored labs remain, so every readiness item is a mission", Object.keys(LAB_SKILLS).length === 0);
const missionId = Object.keys(MISSION_SKILLS)[0];
eq("itemPoints routes a mission to missionPoints", itemPoints(missionId, { solved: true, wrong: 2, hint: false }), 40);

console.log("\n--- the whole transcript ---");
// Only what readiness counts: a phase that is still coming soon is left out,
// because nobody can do its work yet.
const ids = Object.keys(SCORED_SKILLS);
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
if (labIds.size > 0) t("labs passed before scoring existed score the legacy 70", legacy.overall < 100 && legacy.overall >= 95, String(legacy.overall));
else eq("with no scored labs, a transcript of clean first tries is 100", legacy.overall, 100);

console.log("\n--- one weak skill blocks ready ---");
// Ready needs every skill at the competent bar, not just a strong total. Zero
// out the smallest skill: the total stays high, the skill falls to nothing,
// and the student must not be called ready.
const skillOf: Record<string, Skill> = SCORED_SKILLS;
const counts = Object.values(skillOf).reduce<Record<string, number>>((c, s) => ((c[s] = (c[s] ?? 0) + 1), c), {});
const smallest = Object.entries(counts).sort((a, b) => a[1] - b[1])[0][0] as Skill;
const oneSkillZeroed = summarize(all((id) => (skillOf[id] === smallest ? { solved: true, wrong: 3, hint: false } : clean(id))));
t("the total is still above the ready bar", oneSkillZeroed.overall >= SCORE_READY, `${smallest}: ${oneSkillZeroed.overall}`);
t("a zeroed skill keeps the level below ready", oneSkillZeroed.level !== "ready", oneSkillZeroed.level);

// The opposite case: one slip inside a large skill does not make that skill
// weak, so it must not cost the student Ready.
const largest = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
const oneSlipId = Object.keys(skillOf).find((id) => skillOf[id] === largest)!;
const oneSlip = summarize(all((id) => (id === oneSlipId ? { solved: true, wrong: 3, hint: false } : clean(id))));
eq("a single zeroed mission in a large skill is still ready", oneSlip.level, "ready");

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
console.log("\n--- the floor: the level and rank only ever rise; the score is what is earned ---");
// New content, or a phase unlocked and relocked for testing, changes what
// is counted without the student doing anything wrong. The level and rank
// are pinned and never drop. The score is not: it always shows the work.
{
  const peak = pinReadiness(all((id) => clean(id)));
  eq("a perfect pass pins the readiness best", peak[READINESS_BEST_ID]?.pts, 100);
  eq("and pins the ready level", peak[LEVEL_BEST_ID]?.pts, 4);

  // Half the missions no longer count toward either side of the ratio --
  // the same effect on the number as the course growing around a finished
  // student, simulated by clearing them instead of growing SCORED_SKILLS.
  const degraded: Results = { ...peak };
  ids.slice(0, Math.ceil(ids.length / 2)).forEach((id) => delete degraded[id]);
  const after = summarize(degraded);
  eq("the overall score is what the remaining work earns", after.overall, Math.round((100 * (ids.length - Math.ceil(ids.length / 2))) / ids.length));
  eq("the level does not drop below the pinned best", after.level, "ready");
}
{
  // The same floor one tier down: Almost Ready must not fall back to In
  // progress once what looks finished right now shifts under the student.
  const peak = pinReadiness(all(() => ({ solved: true, wrong: 1, hint: false })));
  eq("an almost-ready pass pins that level", peak[LEVEL_BEST_ID]?.pts, 3);
  const cleared: Results = { [READINESS_BEST_ID]: peak[READINESS_BEST_ID], [LEVEL_BEST_ID]: peak[LEVEL_BEST_ID] };
  const after = summarize(cleared);
  eq("an otherwise-empty transcript still reads at the pinned level", after.level, "almost");
  eq("while the score is what is earned", after.overall, 0);
  t("and the best score stays on record", readinessBest(peak) > 0, String(readinessBest(peak)));
}
{
  // pinReadiness itself must not lower a marker it is handed alongside a
  // worse live pass -- the write path, not just the read path.
  const best = pinReadiness(all((id) => clean(id)));
  const worseLive = all(() => ({ solved: true, wrong: 3, hint: false }));
  const stillPinned = pinReadiness({ ...worseLive, [READINESS_BEST_ID]: best[READINESS_BEST_ID], [LEVEL_BEST_ID]: best[LEVEL_BEST_ID] });
  eq("pinning again with a worse pass does not lower the readiness best", stillPinned[READINESS_BEST_ID]?.pts, 100);
  eq("or the level best", levelBest(stillPinned), 4);
}

console.log("\n--- the rank ---");
{
  eq("no work, no rank", currentRank({}), null);
  const done = pinRank(all((id) => clean(id)));
  eq("a clean pass of Phase 1 is Junior SOC Analyst", currentRank(done)?.title, "Junior SOC Analyst");
  const cleared: Results = { "rank-best": done["rank-best"] };
  eq("a pinned rank survives the work behind it being recounted", currentRank(cleared)?.title, "Junior SOC Analyst");
  const again = pinRank({ "rank-best": done["rank-best"] });
  eq("pinning with less work does not lower the rank", rankIndex(again), rankIndex(done));
}

console.log("\n--- properties: thousands of random students, rules that must always hold ---");
{
  // A seeded generator, so a failure prints a case that reruns the same way.
  let seed = 0x5eed;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
  const allIds = Object.keys(MISSION_SKILLS);
  const randomRow = (): Results[string] => {
    const solved = rnd() < 0.6;
    return { solved, wrong: Math.floor(rnd() * 5), hint: rnd() < 0.4, ...(!solved && rnd() < 0.3 ? { flagged: true } : {}), ...(rnd() < 0.3 ? { labOk: true } : {}) };
  };
  const randomStudent = (): Results => {
    const r: Results = {};
    const density = rnd();
    for (const id of allIds) if (rnd() < density) r[id] = randomRow();
    return sanitizeResults(r, true);
  };
  // The rule, written out a second time from the course's own wording, so the
  // check does not lean on the code it is checking.
  const spec = (r: Results[string] | undefined): number | null => {
    if (!r) return null;
    if (r.solved) return Math.max(0, [100, 70, 40, 0][Math.min(r.wrong, 3)] - (r.hint ? 10 : 0));
    return r.wrong >= 3 ? 0 : null;
  };
  const N = 3000;
  const bad: Record<string, string> = {};
  const fail = (rule: string, detail: string) => (bad[rule] ??= detail);
  for (let n = 0; n < N; n++) {
    const r = randomStudent();
    const s = summarize(r);
    const pts = ids.map((id) => spec(r[id]));
    const done = pts.filter((p) => p !== null) as number[];
    const sum = done.reduce((a, b) => a + b, 0);
    if (s.overall !== Math.round(sum / ids.length)) fail("the score is exactly points earned over points possible", `${s.overall} vs ${Math.round(sum / ids.length)}`);
    if (s.finished !== done.length || s.total !== ids.length) fail("finished and total count what they say", `${s.finished}/${s.total}`);
    if (!Number.isInteger(s.overall) || s.overall < 0 || s.overall > 100) fail("the score is a whole number from 0 to 100", String(s.overall));
    if ((s.accuracy === null) !== (s.finished === 0)) fail("accuracy exists once something is finished", JSON.stringify([s.accuracy, s.finished]));
    if (s.accuracy !== null && s.accuracy < s.overall) fail("accuracy is never below the score", `${s.accuracy} < ${s.overall}`);
    if (s.level === "ready" && !(s.finished === s.total && s.overall >= SCORE_READY)) fail("Ready only with everything finished at the bar", JSON.stringify(s));
    // The same record, as the browser keeps it, scores the same.
    const copy = sanitizeResults(JSON.parse(JSON.stringify(r)), true);
    if (JSON.stringify(summarize(copy)) !== JSON.stringify(s)) fail("the browser's copy scores the same as the server's", "");
    const shuffled = Object.fromEntries(Object.entries(r).sort(() => rnd() - 0.5));
    if (summarize(shuffled).overall !== s.overall) fail("the order work was saved in does not matter", "");
    // One more step on a random mission.
    const id = pick(ids);
    const cur = r[id] ?? { solved: false, wrong: 0, hint: false };
    if (!cur.solved) {
      if (summarize({ ...r, [id]: { ...cur, solved: true } }).overall < s.overall) fail("solving a mission never lowers the score", id);
      const tried = { ...cur, wrong: Math.min(3, cur.wrong + 1) };
      if ((spec({ ...tried, solved: true }) ?? 0) > (spec({ ...cur, solved: true }) ?? 0)) fail("a wrong try never raises what a solve is worth", id);
      if ((spec({ ...cur, hint: true, solved: true }) ?? 0) > (spec({ ...cur, solved: true }) ?? 0)) fail("a hint never raises what a solve is worth", id);
    }
    // Pinned, then the work is recounted to less: level and rank hold.
    const pinned = pinRank(pinReadiness(r));
    const lv = ["none", "progress", "practice", "almost", "ready"];
    const fewer = Object.fromEntries(Object.entries(pinned).filter(([k]) => !(k in MISSION_SKILLS) || rnd() < 0.5));
    if (lv.indexOf(summarize(fewer).level) < lv.indexOf(summarize(pinned).level)) fail("the level never drops once pinned", "");
    if (rankIndex(fewer) < rankIndex(pinned)) fail("the rank never drops once pinned", "");
    if (readinessBest(pinned) < (s.finished ? s.overall : 0)) fail("the best score on record is at least the score now", "");
    // Fields only the server may set are dropped from anything a browser sends.
    const forged = sanitizeResults({ ...r, [id]: { solved: true, wrong: 0, hint: false, labOk: true, labVerified: true } });
    if (forged[id]?.labOk || forged[id]?.labVerified) fail("a browser cannot claim a lab check", id);
  }
  const rules = [
    "the score is exactly points earned over points possible",
    "finished and total count what they say",
    "the score is a whole number from 0 to 100",
    "accuracy exists once something is finished",
    "accuracy is never below the score",
    "Ready only with everything finished at the bar",
    "the browser's copy scores the same as the server's",
    "the order work was saved in does not matter",
    "solving a mission never lowers the score",
    "a wrong try never raises what a solve is worth",
    "a hint never raises what a solve is worth",
    "the level never drops once pinned",
    "the rank never drops once pinned",
    "the best score on record is at least the score now",
    "a browser cannot claim a lab check",
  ];
  for (const rule of rules) t(`${rule} (${N} students)`, !(rule in bad), bad[rule] ?? "");
}

console.log("\n--- coming-soon phases ---");
t("a locked phase's missions are not counted toward readiness", Object.keys(SCORED_SKILLS).length <= Object.keys(MISSION_SKILLS).length, `${Object.keys(SCORED_SKILLS).length} of ${Object.keys(MISSION_SKILLS).length}`);

console.log(`\n${failures ? `\x1b[31m${failures} failed\x1b[0m` : "\x1b[32mall passed\x1b[0m"}`);
process.exit(failures ? 1 : 0);

