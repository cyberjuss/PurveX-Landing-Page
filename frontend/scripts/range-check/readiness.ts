// Readiness-only-grows check: the number on record and the level/rank tier
// never go down for something a student did not do. The live percentage is
// allowed to drop when the course changes under them -- that is "what the
// work earns now" by design (see academy-score.ts's summarize/pinReadiness
// and check:grading's "the floor" section) -- but the best score ever
// recorded, and the level and rank that floor on it, must only ever rise.
// A hint opened after the solve must also leave the score where it was.
// Run: npm run check:range:readiness   (no database, no network)

import { LEVEL_BEST_ID, MISSION_SKILLS, RANK_BEST_ID, READINESS_BEST_ID, READY_BADGE_ID, summarize, type Results } from "@/lib/academy-score";
import { loadProgress, saveProgress } from "@/lib/academy-store";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${name}${ok || !detail ? "" : `\n          ${detail}`}`);
}

const ME = "00000000-0000-0000-0000-0000000000aa";
const ids = Object.keys(MISSION_SKILLS);
const solved = (n: number): Results => Object.fromEntries(ids.slice(0, n).map((id) => [id, { solved: true, wrong: 0, hint: false }]));

async function main() {
  process.env.STUB_STUDENT_EMAIL = "aa@example.com";
  process.env.STUB_STUDENT_ID = ME;
  const route = await import("@/app/academy/api/progress/route");
  const put = async (body: unknown) => (await route.PUT(new Request("https://purvex.io/academy/api/progress", { method: "PUT", body: JSON.stringify(body) }))).json();

  console.log("\nThe best score is recorded on every save");
  await saveProgress(ME, null, solved(20));
  const at20 = summarize(await loadProgress(ME)).overall;
  check("a save records the score as the best", (await loadProgress(ME))[READINESS_BEST_ID]?.pts === at20 && at20 > 0, String((await loadProgress(ME))[READINESS_BEST_ID]?.pts));

  console.log("\nThe course changing under a student never lowers their recorded best");
  // Ten solved missions renamed or split away: the live points drop, as they
  // do when new challenges ship and the total grows. The live percentage is
  // allowed to fall with them -- it is what the remaining work earns now --
  // but the recorded best from the stronger pass must survive it.
  const fewer = { ...solved(10), [READINESS_BEST_ID]: (await loadProgress(ME))[READINESS_BEST_ID] };
  await saveProgress(ME, null, fewer);
  const after = await loadProgress(ME);
  check("the live score is allowed to drop with the course", summarize(after).overall < at20, `${summarize(after).overall} vs ${at20}`);
  check("the recorded best is not lowered", after[READINESS_BEST_ID]?.pts === at20);

  console.log("\nIt still climbs with new work");
  await saveProgress(ME, null, { ...after, ...solved(40) });
  const beforeForgery = await loadProgress(ME);
  const at40 = summarize(beforeForgery).overall;
  check("solving more raises it past the old best", at40 > at20, `${at40} vs ${at20}`);
  check("and that becomes the new best", beforeForgery[READINESS_BEST_ID]?.pts === at40);
  // saveProgress pins the level and rank on every save (see academy-store.ts),
  // so by now both already hold whatever this 40-mission pass legitimately
  // earned. The forgery check below must compare against that real value, not
  // assume the fields start out empty.
  const legitLevel = beforeForgery[LEVEL_BEST_ID]?.pts;
  const legitRank = beforeForgery[RANK_BEST_ID]?.pts;

  console.log("\nA browser cannot set the best score, the level, the rank, or the Ready badge");
  const forged = await put({
    results: {
      [READINESS_BEST_ID]: { solved: true, wrong: 0, hint: false, pts: 100 },
      [READY_BADGE_ID]: { solved: true, wrong: 0, hint: false, pts: 100 },
      [LEVEL_BEST_ID]: { solved: true, wrong: 0, hint: false, pts: 4 },
      [RANK_BEST_ID]: { solved: true, wrong: 0, hint: false, pts: 5 },
    },
  });
  check("a forged best is ignored", forged.results[READINESS_BEST_ID]?.pts === at40, JSON.stringify(forged.results[READINESS_BEST_ID]));
  check("a forged Ready level is ignored", !forged.results[READY_BADGE_ID]);
  check("a forged level floor keeps its real, legitimately-earned value, not the attacker's", forged.results[LEVEL_BEST_ID]?.pts === legitLevel, `${forged.results[LEVEL_BEST_ID]?.pts} vs ${legitLevel}`);
  check("a forged rank floor keeps its real, legitimately-earned value, not the attacker's", forged.results[RANK_BEST_ID]?.pts === legitRank, `${forged.results[RANK_BEST_ID]?.pts} vs ${legitRank}`);

  console.log("\nA hint opened after the solve costs nothing");
  const first = ids[0];
  const hinted = await put({ results: { [first]: { solved: true, wrong: 0, hint: true } } });
  check("the solved mission keeps full points", hinted.results[first]?.hint === false, JSON.stringify(hinted.results[first]));
  const open = ids[ids.length - 1];
  const before = await put({ results: { [open]: { solved: false, wrong: 0, hint: true } } });
  check("a hint before the solve still counts", before.results[open]?.hint === true);

  console.log("\nStarting over is the one thing that clears it");
  const reset = await put({ results: {}, reset: "all" });
  check("reset all clears the best score", !reset.results[READINESS_BEST_ID] && summarize(reset.results).overall === 0, JSON.stringify(reset.results[READINESS_BEST_ID]));

  console.log(failures ? `\n${failures} readiness check(s) failed.` : "\nAll readiness checks passed.");
  process.exit(failures ? 1 : 0);
}

void main();
