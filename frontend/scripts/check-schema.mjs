/**
 * Does production have every table and function the code expects?
 *
 * Three migrations shipped in the code and sat unrun in the database on the
 * same day, and each was found by noticing a feature behaving oddly: hours
 * reading as zero, a lab that would not link, feedback vanishing. That is a
 * terrible way to find out. This reads the names straight out of the source,
 * asks the database for each one, and says which are missing and which file
 * defines them.
 *
 *   npm run check:schema
 *
 * Read-only. It never writes a row: tables are probed with a zero-row select,
 * and the one function with a foreign key is probed with an id that cannot
 * exist, so the constraint refuses it before anything is stored.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("No Supabase URL or service-role key in frontend/.env.local.");
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(p) ? [p] : [];
  });

// What the code asks for, read from the code.
const tables = new Set();
const functions = new Set();
for (const file of walk(join(root, "src"))) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/\.from\(\s*["'`]([a-z0-9_]+)["'`]/gi)) tables.add(m[1]);
  for (const m of src.matchAll(/\.rpc\(\s*["'`]([a-z0-9_]+)["'`]/gi)) functions.add(m[1]);
}

// Which file would define each one, so a miss comes with its fix.
const sqlFiles = readdirSync(join(root, "supabase")).filter((f) => f.endsWith(".sql"));
const sqlText = (file) => readFileSync(join(root, "supabase", file), "utf8");
const definedIn = (name) => sqlFiles.find((f) => sqlText(f).includes(name)) ?? null;

// A value that cannot match a real row for each PL/pgSQL type PostgREST needs
// named in the probe body. Every function here either has a uuid parameter
// that a foreign key refuses, or guards a non-positive cap itself (see
// academy_claim_coach_question), so nothing is ever stored.
const PROBE_VALUE = {
  uuid: "00000000-0000-0000-0000-000000000000",
  date: "1970-01-01",
  text: "__check_schema_probe__",
  integer: 0,
  boolean: false,
};

// The real body to probe with, read off the function's own declared
// parameters rather than one guess shared by every function -- PostgREST
// resolves an RPC call by matching argument names to a signature, so a probe
// built for a different function's parameters returns PGRST202 even when the
// one being checked exists and works.
const signatureOf = (name) => {
  for (const file of sqlFiles) {
    const m = sqlText(file).match(
      new RegExp(`create (?:or replace )?function public\\.${name}\\s*\\(([^)]*)\\)`, "i"),
    );
    if (!m) continue;
    const params = {};
    for (const part of m[1].split(",")) {
      const [, pname, ptype] = part.trim().match(/^(\S+)\s+(\S+)/) ?? [];
      if (pname) params[pname] = PROBE_VALUE[ptype] ?? PROBE_VALUE.text;
    }
    return params;
  }
  return { p_user: PROBE_VALUE.uuid, p_month: "1970-01", p_minutes: 0 };
};

const missing = [];

for (const t of [...tables].sort()) {
  const res = await fetch(`${url}/rest/v1/${t}?select=*&limit=0`, { headers });
  if (res.ok) continue;
  // 404 is "no such table". Anything else is a permission or network problem,
  // which is worth seeing but is not a missing migration.
  const why = res.status === 404 ? "missing" : `HTTP ${res.status}`;
  missing.push({ kind: "table", name: t, why, sql: definedIn(t) });
}

for (const f of [...functions].sort()) {
  // A row that cannot exist: the foreign key refuses it, which proves the
  // function ran without storing anything. PGRST202 means it is not there.
  const res = await fetch(`${url}/rest/v1/rpc/${f}`, {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify(signatureOf(f)),
  });
  const body = await res.json().catch(() => ({}));
  if (body?.code !== "PGRST202") continue;
  missing.push({ kind: "function", name: f, why: "missing", sql: definedIn(f) });
}

console.log(`Checked ${tables.size} tables and ${functions.size} functions against ${new URL(url).host}\n`);
if (!missing.length) {
  console.log("Production has everything the code asks for.");
  process.exit(0);
}
for (const m of missing) {
  console.log(`MISSING  ${m.kind} ${m.name}  (${m.why})${m.sql ? `  -> defined in supabase/${m.sql}` : "  -> no definition found in supabase/"}`);
}
console.log(`\n${missing.length} to run in the Supabase SQL editor.`);
process.exit(1);
