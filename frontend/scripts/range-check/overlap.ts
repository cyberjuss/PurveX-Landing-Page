// Live-shift incidents practice the same skills as the challenges but never
// ask the same question or carry the same fix.
// Run: npm run check:range:overlap   (no database, no network)

import fs from "fs";
import path from "path";
import { INCIDENTS, effectiveIncident, incidentDef, newShiftRun, questionsFor } from "@/lib/academy-shift";
import { ticketFor } from "@/lib/academy-mission-lab";
import { MISSION_CATALOG } from "@/lib/academy-missions";

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${name}${ok || !detail ? "" : `\n          ${detail}`}`);
};
const verbose = process.argv.includes("--list");

// Words that carry meaning. Short words and the vocabulary every ticket shares do not.
const STOP = new Set("which what when where does have that this with from your their into the they them were been will would could should about after before account accounts event report type name give lab".split(" "));
const words = (s: string) => new Set(s.toLowerCase().replace(/<[^>]+>/g, " ").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)));
function alike(a: string, b: string) {
  const x = words(a);
  const y = words(b);
  if (!x.size || !y.size) return 0;
  let shared = 0;
  for (const w of x) if (y.has(w)) shared++;
  return shared / (x.size + y.size - shared);
}

// ── Every challenge question, read from the lessons themselves ──
const root = path.join(process.cwd(), "src/content/academy");
const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".md") ? [path.join(d, e.name)] : []));
type ChallengeQ = { id: string; title: string; text: string };
const challenge: ChallengeQ[] = [];
for (const f of walk(root)) {
  const md = fs.readFileSync(f, "utf8");
  for (const block of md.split(/<div class="ad-mission"/).slice(1)) {
    const id = /data-id="([^"]+)"/.exec(block)?.[1];
    if (!id) continue;
    const title = /<h4>([^<]+)<\/h4>/.exec(block)?.[1] ?? "";
    const task = /<strong>Task:<\/strong>([\s\S]*?)<\/p>/.exec(block)?.[1] ?? "";
    const q = /<strong>(?:Situation|Question):<\/strong>([\s\S]*?)<\/p>/.exec(block)?.[1] ?? "";
    challenge.push({ id, title, text: `${task} ${q}` });
  }
}
for (const [id, m] of Object.entries(MISSION_CATALOG)) {
  if (!challenge.some((c) => c.id === id)) challenge.push({ id, title: m.title.replace(/\s*\([A-Z]+-\d+\)\s*$/, ""), text: (m as { prompt?: string }).prompt ?? "" });
}
console.log(`\n${challenge.length} challenge questions · ${INCIDENTS.length} shift incidents`);

// ── 1. No shift question or title reads like a challenge one ──
console.log("\nQuestions");
const QUESTION_BAR = 0.5;
const TITLE_BAR = 0.6;
const echoes: string[] = [];
for (const def of INCIDENTS) {
  for (const q of questionsFor(def)) {
    for (const c of challenge) {
      const s = alike(q.prompt, c.text);
      if (s >= QUESTION_BAR) echoes.push(`${def.id} "${q.prompt}" ~ ${c.id} (${s.toFixed(2)})`);
    }
  }
  for (const c of challenge) {
    const s = alike(def.title, c.title);
    if (s >= TITLE_BAR) echoes.push(`${def.id} title "${def.title}" ~ ${c.id} "${c.title}" (${s.toFixed(2)})`);
  }
}
check("no shift question or title reads like a challenge question", echoes.length === 0, echoes.slice(0, 12).join("\n          "));

// ── 2. No shift fix is a challenge's own fix ──
// Built across many real shifts, since incidents pick a different victim each time.
console.log("\nFixes");
const clash = new Map<string, Set<string>>();
let built = 0;
for (let seed = 0; seed < 100; seed++) {
  for (const [phase, level] of [[1, 1], [1, 3], [2, 2], [2, 4]] as const) {
    const run = newShiftRun(`overlap:${seed}`, phase, level, [], Date.UTC(2026, 0, 1), undefined);
    for (const inc of run.incidents) {
      built++;
      const def = incidentDef(inc.defId);
      if (!def) continue;
      const ticket = ticketFor(effectiveIncident(def, inc).resolve.map((r) => r.c));
      if (ticket) {
        const who = inc.bind?.args ? Object.values(inc.bind.args).join(",") : "default";
        if (!clash.has(def.id)) clash.set(def.id, new Set());
        clash.get(def.id)!.add(`${ticket} via ${who}`);
      }
    }
  }
}
const fixes = [...clash].map(([id, s]) => `${id}: ${[...s].slice(0, 4).join(" | ")}`);
check(`no shift incident's fix is a challenge's fix (${built} incidents across 400 shifts)`, fixes.length === 0, fixes.join("\n          "));

if (verbose) {
  console.log("\nClosest questions per incident:");
  for (const def of INCIDENTS) {
    let best = { s: 0, c: "" };
    for (const q of questionsFor(def)) for (const c of challenge) {
      const s = alike(q.prompt, c.text);
      if (s > best.s) best = { s, c: `${c.id} "${q.prompt}"` };
    }
    console.log(`  ${def.id.padEnd(20)} ${best.s.toFixed(2)} ${best.c}`);
  }
}

console.log(failures ? `\n${failures} overlap check(s) failed.` : "\nAll overlap checks passed.");
process.exit(failures ? 1 : 0);
