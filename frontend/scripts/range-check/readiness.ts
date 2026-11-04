// Readiness-only-grows check: a student's Readiness score never goes down for
// something they did not do. New challenges shipping, a mission renamed or
// split, or a hint opened after the solve must all leave it where it was.
// Run: npm run check:range:readiness   (no database, no network)

import { MISSION_SKILLS, READINESS_BEST_ID, READY_BADGE_ID, summarize, type Results } from "@/lib/academy-score";
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

  console.log("\nThe course changing under a student never lowers their score");
  // Ten solved missions renamed or split away: the live points drop, as they
  // do when new challenges ship and the total grows.
  const fewer = { ...solved(10), [READINESS_BEST_ID]: (await loadProgress(ME))[READINESS_BEST_ID] };
  await saveProgress(ME, null, fewer);
  const after = await loadProgress(ME);
  check("the score shown stays at the best", summarize(after).overall === at20, `${summarize(after).overall} vs ${at20}`);
  check("the recorded best is not lowered", after[READINESS_BEST_ID]?.pts === at20);

  console.log("\nIt still climbs with new work");
  await saveProgress(ME, null, { ...after, ...solved(40) });
  const at40 = summarize(await loadProgress(ME)).overall;
  check("solving more raises it past the old best", at40 > at20, `${at40} vs ${at20}`);
  check("and that becomes the new best", (await loadProgress(ME))[READINESS_BEST_ID]?.pts === at40);

  console.log("\nA browser cannot set the best score or the Ready level");
  const forged = await put({ results: { [READINESS_BEST_ID]: { solved: true, wrong: 0, hint: false, pts: 100 }, [READY_BADGE_ID]: { solved: true, wrong: 0, hint: false, pts: 100 } } });
  check("a forged best is ignored", forged.results[READINESS_BEST_ID]?.pts === at40, JSON.stringify(forged.results[READINESS_BEST_ID]));
  check("a forged Ready level is ignored", !forged.results[READY_BADGE_ID]);

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
