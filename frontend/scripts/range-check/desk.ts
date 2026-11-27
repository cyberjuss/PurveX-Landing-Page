// The Desk: every "Read up" link lands on a real lesson tab, and every job has one.
// Run: npm run check:range:desk   (no database, no network)

import { findEntry } from "@/lib/academy-content";
import { JOBS } from "@/lib/academy-drills";
import { SKILLS, type Skill } from "@/lib/academy-score";
import { JOB_LESSON_IDS, lessonFor } from "@/lib/academy-job-lessons";
import { echoesChallenge } from "@/lib/academy-scenario";
import { MISSION_CATALOG } from "@/lib/academy-missions";

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

console.log("\nDesk cases stay apart from the challenges");
const titles = Object.values(MISSION_CATALOG).map((m) => m.title);
const echoed = titles.filter((t) => !echoesChallenge({ title: t, prompt: "" }));
check("a case titled like any challenge ticket is caught", echoed.length === 0, echoed.slice(0, 5).join(" | "));
check(
  "a case about the same job but a new situation passes",
  !echoesChallenge({ title: "Contractor Badge Still Opens the Vault", prompt: "Which change closes this without losing the audit trail?" })
);
check("a reworded challenge title is caught", echoesChallenge({ title: "The Locked Out Account", prompt: "" }) || echoesChallenge({ title: "Locked Out", prompt: "" }));

console.log(failures ? `\n${failures} desk check(s) failed.` : "\nAll desk checks passed.");
process.exit(failures ? 1 : 0);
