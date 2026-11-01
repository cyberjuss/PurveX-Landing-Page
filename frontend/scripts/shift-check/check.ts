/**
 * The Shift engine, checked without a lab.
 *
 * A shift fires real incidents into a student's domain controller over SSM,
 * downloading each script from the site at the moment it fires. Most of what
 * can go wrong on a student's first shift can be caught from here: an incident
 * whose script is not published, a script that will not parse on the pod, an
 * argument the script does not take, a diagnosis nobody can answer, a bind that
 * throws while the shift is being built.
 *
 *   npm run check:shift
 *
 * It fires nothing and needs no lab. The published-script check asks the live
 * site with HEAD requests; pass a different origin as the first argument to
 * check somewhere else.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { INCIDENTS } from "@/lib/academy-shift";
import type { IncidentDef } from "@/lib/academy-shift";

const root = join(__dirname, "..", "..");
const scriptDir = join(root, "public", "lab-scripts", "incidents");
const origin = (process.argv[2] || "https://purvex.io").replace(/\/+$/, "");

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.log(`FAIL  ${msg}`);
};

// ---- the library itself ----------------------------------------------------

const ids = new Set<string>();
const scripts = new Set<string>();
for (const inc of INCIDENTS) {
  const at = `${inc.id || "<no id>"}`;
  if (!inc.id) fail("an incident has no id");
  if (ids.has(inc.id)) fail(`${at}: duplicate id`);
  ids.add(inc.id);
  if (!inc.script || !/^Incident-[A-Za-z]+\.ps1$/.test(inc.script)) fail(`${at}: bad script name ${inc.script}`);
  scripts.add(inc.script);
  if (!inc.title || !inc.brief || !inc.from) fail(`${at}: missing title, brief or from`);
  if (!(inc.points > 0)) fail(`${at}: points must be above zero`);
  if (!inc.resolve?.length) fail(`${at}: no resolve checks, so it can never be closed`);
  for (const r of inc.resolve ?? []) if (!r.label) fail(`${at}: a resolve check has no label`);
  if (!inc.diagnosis?.prompt) fail(`${at}: no diagnosis prompt`);
  if (!inc.diagnosis?.accept?.length) fail(`${at}: no accepted answers, so the question cannot be answered`);
  if ((inc.hints?.length ?? 0) !== 3) fail(`${at}: ${inc.hints?.length ?? 0} hints, expected 3`);
  if (!inc.rubric?.length) fail(`${at}: no rubric for the write-up`);
  if (!inc.roles?.length) fail(`${at}: no roles, so it is never weighted for anyone`);
  if (!inc.why) fail(`${at}: no "why it matters" line`);
  if (!(inc.minPhase >= 1) || !(inc.minLevel >= 1 && inc.minLevel <= 4)) fail(`${at}: minPhase/minLevel out of range`);
}
console.log(`${INCIDENTS.length} incidents, ${scripts.size} distinct scripts`);

// ---- a shift binds a victim before it fires --------------------------------

// Deterministic stand-in for the shift's own picker.
const pick = <T,>(arr: T[]): T => arr[0];
let bound = 0;
for (const inc of INCIDENTS as IncidentDef[]) {
  if (!inc.bind) continue;
  bound++;
  try {
    const b = inc.bind(pick);
    if (!b.resolve?.length) fail(`${inc.id}: bind returned no resolve checks`);
    if (!b.diagnosis?.accept?.length) fail(`${inc.id}: bind returned no accepted answers`);
    if (!b.brief) fail(`${inc.id}: bind returned no brief`);
    for (const [k, v] of Object.entries(b.args ?? {})) {
      // academy-hosted drops any arg that does not match these, so a value the
      // filter rejects reaches the pod as a missing parameter.
      if (!/^[A-Za-z]+$/.test(k)) fail(`${inc.id}: arg name ${k} would be dropped before the pod`);
      if (!/^[A-Za-z0-9._, -]+$/.test(v)) fail(`${inc.id}: arg ${k}="${v}" would be dropped before the pod`);
    }
  } catch (err) {
    fail(`${inc.id}: bind threw while building a shift: ${err instanceof Error ? err.message : err}`);
  }
}
console.log(`${bound} incidents rotate their victim, all bound without throwing`);

// ---- the scripts those incidents name --------------------------------------

const onDisk = new Set(readdirSync(scriptDir));
for (const s of [...scripts].sort()) {
  if (!onDisk.has(s)) {
    fail(`${s} is named by an incident but is not in public/lab-scripts/incidents`);
    continue;
  }
  const text = readFileSync(join(scriptDir, s), "utf8");
  // Every script is run with -Undo for cleanup, so one that does not take it
  // leaves the lab dirty for the next shift and for missions.
  if (!/\[switch\]\$Undo/.test(text)) fail(`${s}: no -Undo switch, so cleanup cannot run`);
  // Only the scripts that call its helpers need it. Several plant their
  // incident with plain AD cmdlets and are right not to load it.
  if (/\b(Confirm-User|Invoke-BadSignIn|Invoke-GoodSignIn)\b/.test(text) && !/Incident-Common\.ps1/.test(text)) {
    fail(`${s}: calls a Common helper without loading Incident-Common.ps1`);
  }
}
if (!existsSync(join(scriptDir, "Incident-Common.ps1"))) fail("Incident-Common.ps1 is missing, and every script loads it");

// Every argument an incident passes has to be a parameter its script declares.
for (const inc of INCIDENTS as IncidentDef[]) {
  const args = inc.bind ? (inc.bind(pick).args ?? {}) : {};
  if (!Object.keys(args).length || !onDisk.has(inc.script)) continue;
  const text = readFileSync(join(scriptDir, inc.script), "utf8");
  // Read to the matching close paren: a default like @("a", "b") carries one of
  // its own, and stopping at the first ended the block early.
  const open = text.indexOf("param(");
  let depth = 0;
  let end = text.length;
  for (let i = open + 5; open >= 0 && i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")" && --depth === 0) {
      end = i;
      break;
    }
  }
  const params = open >= 0 ? text.slice(open, end) : "";
  for (const k of Object.keys(args)) {
    if (!new RegExp(`\\$${k}\\b`, "i").test(params)) fail(`${inc.id}: passes -${k} but ${inc.script} does not declare it`);
  }
}

// ---- and whether the pod could actually download them ----------------------

async function published() {
  console.log(`\nAsking ${origin} for each script the pod would fetch:`);
  const names = [...scripts, "Incident-Common.ps1"].sort();
  const results = await Promise.all(
    names.map(async (name) => {
      try {
        const res = await fetch(`${origin}/lab-scripts/incidents/${name}`, { method: "HEAD" });
        return { name, status: res.status };
      } catch (err) {
        return { name, status: 0, why: err instanceof Error ? err.message : String(err) };
      }
    })
  );
  const bad = results.filter((r) => r.status !== 200);
  for (const b of bad) fail(`${b.name} is not published: ${b.status || b.why}`);
  console.log(`  ${results.length - bad.length} of ${results.length} served`);
}

published()
  .catch((err) => fail(`could not reach ${origin}: ${err instanceof Error ? err.message : err}`))
  .finally(() => {
    console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
    process.exit(failures === 0 ? 0 : 1);
  });
