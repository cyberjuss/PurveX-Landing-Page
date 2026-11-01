// A first pass over the lessons' prose against CONTENT_STYLE_GUIDE.md:
// semicolons and em dashes in running text, sentences past 40 words, three
// or more commas, a doubled word, "a" before a vowel sound. It points at
// lines to read; it does not judge them.
//
//   npx tsx scripts/review-check/prose.ts [path-filter]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = "src/content/academy";
const only = process.argv[2] ?? "";
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith(".md") ? [join(d, f)] : []));

const prose = (md: string) =>
  md
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/<details[\s\S]*?<\/details>/g, (m) => m.replace(/[^\n]/g, " "))
    .split("\n");

let total = 0;
for (const f of walk(root)) {
  const rel = relative(root, f).split("\\").join("/");
  if (/STYLE_GUIDE|EDITING_GUIDE/.test(rel) || !rel.includes(only)) continue;
  const out: string[] = [];
  prose(readFileSync(f, "utf8")).forEach((raw, i) => {
    if (/^\s*(\||#|<|!\[|`)/.test(raw) || !raw.trim()) return;
    const line = raw.replace(/`[^`]*`/g, "CODE").replace(/<[^>]+>/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    const flags: string[] = [];
    if (/;/.test(line) && !/&\w+;/.test(line)) flags.push("semicolon");
    if (/—|--/.test(line)) flags.push("em dash");
    if (/\b(\w+) \1\b/i.test(line.replace(/\*\*/g, ""))) flags.push("doubled word");
    if (/\ba (?=[aeio][a-z])/i.test(line) && !/\ba (one|use|user|uni|eu)/i.test(line)) flags.push("a/an");
    for (const s of line.match(/[^.!?]+[.!?]+/g) ?? []) {
      const words = s.replace(/\*\*/g, "").trim().split(/\s+/).length;
      const commas = (s.match(/,/g) ?? []).length;
      if (words > 40) flags.push(`long (${words}w)`);
      else if (commas >= 3 && !/^\s*[-*\d]/.test(raw)) flags.push(`${commas} commas`);
    }
    if (flags.length) out.push(`  ${i + 1}: [${[...new Set(flags)].join(", ")}] ${raw.trim().slice(0, 140)}`);
  });
  if (out.length) {
    total += out.length;
    console.log(`\n${rel}\n${out.join("\n")}`);
  }
}
console.log(`\n${total} lines to read`);
