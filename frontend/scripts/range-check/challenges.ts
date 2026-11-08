// Challenges check: nothing a student can see in a challenge is missing
// behind the scenes. Every question on a page is in the catalog, scored, has
// an answer key, an answer box and an explanation; every challenge tab is
// registered so it gets a checkmark; every registered challenge has a tab;
// and no page links to a file or page that is not there.
// Run: npm run check:range:challenges   (no database, no network)
import fs from "fs";
import path from "path";
import { loadLesson, phases } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { CHALLENGE_PATHS, HANDS_ON_CHALLENGES, MISSION_CATALOG } from "@/lib/academy-missions";
import { MISSION_SKILLS } from "@/lib/academy-score";
import { hasMissionKey, missionTickets, needsLabForAnswer } from "@/lib/academy-answers";
import { missionGate, PLANTED_TICKETS } from "@/lib/academy-mission-lab";

const slug = (l: string) => l.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const out: Record<string, string[]> = {};
const add = (k: string, v: string) => (out[k] ??= []).push(v);

type Tab = { phase: string; entry: string; label: string; file: string; md: string | null };
const tabs: Tab[] = [];
for (const p of phases) for (const e of entriesOf(p)) for (const s of e.sections) tabs.push({ phase: p.slug, entry: e.slug, label: s.label, file: s.file, md: loadLesson(s.file) });
const href = (t: Tab) => `/range/${t.phase}/${t.entry}`;

// A. files
for (const t of tabs) {
  if (t.md === null) add("A. Section file missing", `${href(t)} "${t.label}" -> ${t.file}`);
  else if (t.md.trim().length < 80) add("A. Section nearly empty", `${href(t)} "${t.label}" (${t.md.trim().length} chars)`);
}
// B/C. challenge tabs <-> CHALLENGE_PATHS
const chTabs = tabs.filter((t) => /^Challenge:/.test(t.label));
const tabKey = (t: Tab) => (Object.entries(CHALLENGE_PATHS) as [string, { href: string; tab: string }][]).find(([, p]) => p.href === href(t) && p.tab === slug(t.label.replace(/^Challenge:\s*/, "")))?.[0];
for (const t of chTabs) {
  const ids = [...(t.md ?? "").matchAll(/class="ad-mission[^"]*" data-id="([^"]+)"/g)].map((m) => m[1]);
  // A recap written as a challenge, with nothing to answer, needs no checkmark.
  if (!tabKey(t) && ids.length > 0) add("B. Challenge tab not registered (no progress/checkmark)", `${href(t)} "${t.label}" (${ids.length} questions)`);
}
for (const [k, p] of Object.entries(CHALLENGE_PATHS)) {
  if (!chTabs.some((t) => href(t) === p.href && slug(t.label.replace(/^Challenge:\s*/, "")) === p.tab)) add("C. Registered challenge has no tab", `${k} -> ${p.href}#${p.tab}`);
}
// D/E. missions
const onPage = new Map<string, Tab>();
for (const t of chTabs) {
  const md = t.md ?? "";
  for (const m of md.matchAll(/class="ad-mission[^"]*" data-id="([^"]+)"/g)) {
    const id = m[1];
    if (onPage.has(id)) add("D. Question id used twice", `${id} in ${href(onPage.get(id)!)} and ${href(t)} "${t.label}"`);
    onPage.set(id, t);
    if (!MISSION_CATALOG[id]) add("D. Question on page but not in catalog (not scored)", `${id} ${href(t)} "${t.label}"`);
    else if (tabKey(t) && MISSION_CATALOG[id].challenge !== tabKey(t)) add("D. Question filed under a different challenge", `${id}: catalog says ${MISSION_CATALOG[id].challenge}, page is ${tabKey(t)}`);
    if (!hasMissionKey(id)) add("E. Question has no answer key (can't be solved)", `${id} ${href(t)} "${t.label}"`);
  }
  // inputs and reveal boxes per mission block
  const blocks = md.split(/(?=<div class="ad-mission)/).slice(1);
  for (const b of blocks) {
    const id = b.match(/data-id="([^"]+)"/)?.[1] ?? "?";
    if (!/ad-guess/.test(b) && !/data-answer/.test(b)) continue;
    if (/data-answer/.test(b) && !/ad-guess/.test(b)) add("E. Question has no answer box", `${id} ${href(t)}`);
    if (!/class="ad-flag"/.test(b)) add("E. Question has no explanation box", `${id} ${href(t)}`);
  }
}
for (const [id, m] of Object.entries(MISSION_CATALOG)) if (!onPage.has(id)) add("D. Catalog question not on any page (counts against Readiness, can't be done)", `${id} (${m.challenge}) ${m.title}`);
for (const id of Object.keys(MISSION_SKILLS)) if (!MISSION_CATALOG[id]) add("F. Scored id with no catalog entry", id);
for (const id of Object.keys(MISSION_CATALOG)) if (!(id in MISSION_SKILLS)) add("F. Catalog question not scored", id);
// G. unreferenced challenge files
const used = new Set(tabs.map((t) => t.file));
const root = "src/content/academy";
const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) => (x.isDirectory() ? walk(path.join(d, x.name)) : [path.join(d, x.name)]));
for (const f of walk(root)) {
  // path.relative uses the OS separator (backslashes on Windows), but every
  // file path in academy-content.ts is written with forward slashes.
  const rel = path.relative(root, f).split(path.sep).join("/");
  if (rel.endsWith(".md") && !used.has(rel) && !/GUIDE/.test(rel)) add("G. Content file not in the course", rel);
}
// H/I. assets and links
const pages = new Map<string, Set<string>>();
for (const t of tabs) (pages.get(href(t)) ?? pages.set(href(t), new Set()).get(href(t))!).add(slug(t.label.replace(/^(Challenge|Lab):\s*/, "")));
for (const t of tabs) {
  const md = t.md ?? "";
  for (const m of md.matchAll(/(?:src|href)="(\/[^"#?]+\.(?:png|jpe?g|gif|svg|webp|mp4|ps1|zip|pdf|txt|csv|json|evtx|pcap))"/g)) if (!fs.existsSync(path.join("public", m[1])) && !m[1].includes("PLACEHOLDER")) add("H. Missing file", `${m[1]} in ${t.file}`);
  for (const m of md.matchAll(/\]\((\/[^)\s#?]+\.(?:png|jpe?g|gif|svg|webp|ps1|pdf|csv))\)/g)) if (!fs.existsSync(path.join("public", m[1])) && !m[1].includes("PLACEHOLDER")) add("H. Missing file", `${m[1]} in ${t.file}`);
  for (const m of md.matchAll(/(?:href="|\]\()(\/range\/[^")#\s]+)(?:#([^")\s]+))?/g)) {
    const page = m[1].replace(/\/$/, "");
    if (!pages.has(page)) add("I. Link to a page that doesn't exist", `${m[0]} in ${t.file}`);
  }
}
// J. The server's list of planted tickets matches what the build script plants,
// so a lab missing one is repaired and a question naming one waits for it.
const script = fs.readFileSync("public/lab-scripts/Build-Environment.ps1", "utf8");
const scriptMarks = new Set([...script.matchAll(/Test-PurvexTicketMark "([^"]+)"/g)].map((m) => m[1]));
for (const t of scriptMarks) if (!(PLANTED_TICKETS as readonly string[]).includes(t)) add("J. Ticket the build plants but the server does not expect", t);
for (const t of PLANTED_TICKETS) if (!scriptMarks.has(t)) add("J. Ticket the server expects but the build never plants", t);
const waiting = [...onPage.keys()].filter((id) => missionTickets(id).some((t) => scriptMarks.has(t)));

// K. A home lab is two Windows machines, with no Ubuntu server. A challenge
// worked on the Ubuntu box has to say it needs the hosted lab, or a home-lab
// student goes looking for a machine they were never told to build. The
// installer check is the exception: it shows the PowerShell route as well.
const UBUNTU_OK = new Set<string>([]);
for (const t of chTabs) {
  const md = t.md ?? "";
  if (!/Ubuntu/.test(md) || UBUNTU_OK.has(t.file)) continue;
  if (!/hosted lab required|needs the cloud lab|cloud lab required/i.test(md)) add("K. Ubuntu challenge with no hosted-lab note", `${href(t)} "${t.label}"`);
}

// L. HANDS_ON_CHALLENGES (academy-missions.ts) decides whether Record Your
// Challenge shows up, and it is a hand-kept literal because the client
// bundle that reads it cannot import the server-only grading rules that
// actually decide hands-on-ness. Recomputed here from those rules, so a new
// mission that needs the lab is not silently left off the list, and the
// recorder does not stay offered on a challenge that no longer needs one.
const actuallyHandsOn = new Set(
  Object.entries(MISSION_CATALOG)
    .filter(([id]) => missionGate(id) || needsLabForAnswer(id))
    .map(([, m]) => m.challenge)
);
for (const ch of actuallyHandsOn) if (!HANDS_ON_CHALLENGES.has(ch)) add("L. HANDS_ON_CHALLENGES is missing a challenge with lab-gated work", ch);
for (const ch of HANDS_ON_CHALLENGES) if (!actuallyHandsOn.has(ch)) add("L. HANDS_ON_CHALLENGES lists a challenge with no lab-gated work left", ch);

// Screenshots not taken yet are hidden by markdown.tsx, so they are listed, not failed.
const placeholders = tabs.flatMap((t) => [...(t.md ?? "").matchAll(/src="([^"]*PLACEHOLDER[^"]*)"/g)].map((m) => `${m[1]} (${t.file})`));
for (const [k, v] of Object.entries(out).sort()) {
  console.log(`\n  FAIL  ${k} (${v.length})`);
  for (const x of v.slice(0, 40)) console.log("          " + x);
}
console.log(`\n${tabs.length} tabs, ${chTabs.length} challenge tabs, ${onPage.size} questions on pages, ${Object.keys(MISSION_CATALOG).length} in the catalog.`);
console.log(`${waiting.length} questions wait for a planted ticket before they can be answered.`);
if (placeholders.length) console.log(`${placeholders.length} screenshots still to add (hidden from students until they exist).`);
const failed = Object.values(out).reduce((n, v) => n + v.length, 0);
console.log(failed ? `\n${failed} challenge problem(s) found.` : "\nAll challenge checks passed.");
process.exit(failed ? 1 : 0);
