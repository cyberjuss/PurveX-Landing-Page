import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { splitLessonIntoDeck, isDeckable } from "@/lib/lesson-deck";

const root = "src/content/academy";
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith(".md") ? [join(d, f)] : []));
let n = 0;
for (const f of walk(root)) {
  const md = readFileSync(f, "utf8");
  if (!isDeckable(md)) continue;
  const r = splitLessonIntoDeck(md, f).find((s) => s.recap)?.recap;
  if (!r) continue;
  console.log(`\n## ${relative(root, f).split("\\").join("/")}`);
  for (const i of r) {
    n++;
    console.log(`- ${i.term} :: ${i.sentence}`);
  }
}
console.log("\ntotal", n);
