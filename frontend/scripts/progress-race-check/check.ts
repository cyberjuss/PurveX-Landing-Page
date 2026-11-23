// Overlapping writes to one student's results must never erase each other.
// Run: npm run check:progress-race
import { loadProgress, saveProgress, updateProgress } from "@/lib/academy-store";
import { MISSION_SKILLS, readinessBest, summarize, type Results } from "@/lib/academy-score";
import { table } from "./fake-supabase";

let failed = 0;
const t = (name: string, ok: boolean, got?: unknown) => {
  if (!ok) failed++;
  console.log(`${ok ? "\x1b[32mok  \x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${got === undefined ? "" : `  (${JSON.stringify(got)})`}`);
};
const ids = Object.keys(MISSION_SKILLS).slice(0, 20);
const solve = (id: string) => (r: Results): Results => ({ ...r, [id]: { ...(r[id] ?? { solved: false, wrong: 0, hint: false }), solved: true } });
const wrong = (id: string) => (r: Results): Results => {
  const cur = r[id] ?? { solved: false, wrong: 0, hint: false };
  return { ...r, [id]: { ...cur, wrong: Math.min(3, cur.wrong + 1) } };
};
const solvedCount = (r: Results) => ids.filter((id) => r[id]?.solved).length;

async function main() {
  console.log("--- the old way loses writes (shows the test can see the bug) ---");
  {
    table.clear();
    await saveProgress("old", null, {});
    await Promise.all(ids.map(async (id) => saveProgress("old", null, solve(id)(await loadProgress("old")))));
    const n = solvedCount(await loadProgress("old"));
    t("read-then-overwrite drops some of 20 overlapping solves", n < ids.length, `${n} of ${ids.length} kept`);
  }

  console.log("\n--- updateProgress keeps every write ---");
  for (let round = 0; round < 5; round++) {
    table.clear();
    await saveProgress("s", null, {});
    await Promise.all(ids.map((id) => updateProgress("s", null, solve(id))));
    t(`round ${round + 1}: all 20 overlapping solves are kept`, solvedCount(await loadProgress("s")) === ids.length, solvedCount(await loadProgress("s")));
  }
  {
    table.clear();
    await Promise.all(ids.slice(0, 6).map((id) => updateProgress("fresh", null, solve(id))));
    t("writers racing to create a brand-new row all land", solvedCount(await loadProgress("fresh")) === 6, solvedCount(await loadProgress("fresh")));
  }
  {
    table.clear();
    const id = ids[0];
    await Promise.all([1, 2].map(() => updateProgress("w", null, wrong(id))));
    t("two overlapping wrong tries both count", (await loadProgress("w"))[id]?.wrong === 2, (await loadProgress("w"))[id]);
    await Promise.all([1, 2, 3, 4].map(() => updateProgress("w", null, wrong(id))));
    t("tries stop at 3", (await loadProgress("w"))[id]?.wrong === 3, (await loadProgress("w"))[id]?.wrong);
  }
  {
    table.clear();
    const id = ids[1];
    // An answer and the browser's sync land together: the sync only adds a hint.
    await Promise.all([
      updateProgress("mix", null, solve(id)),
      updateProgress("mix", null, (r) => ({ ...r, [id]: { ...(r[id] ?? { solved: false, wrong: 0, hint: false }), hint: !r[id]?.solved } })),
    ]);
    const r = (await loadProgress("mix"))[id];
    t("a sync overlapping an answer never erases the solve", r?.solved === true, r);
  }
  {
    table.clear();
    const all = await Promise.all(ids.map((id) => updateProgress("pin", null, solve(id))));
    const stored = await loadProgress("pin");
    t("every write still pins the best score", readinessBest(stored) === summarize(stored).overall, [readinessBest(stored), summarize(stored).overall]);
    t("what each call returns is a version that was stored", all.every((r) => solvedCount(r) >= 1));
  }
  {
    table.clear();
    await saveProgress("noop", null, { [ids[0]]: { solved: true, wrong: 0, hint: false } });
    const before = JSON.stringify(table.get("noop"));
    const got = await updateProgress("noop", null, () => null);
    t("a change that returns null writes nothing", JSON.stringify(table.get("noop")) === before && got[ids[0]]?.solved === true);
  }
  console.log(failed ? `\n\x1b[31m${failed} failed\x1b[0m` : "\n\x1b[32mall passed\x1b[0m");
  process.exit(failed ? 1 : 0);
}
void main();
