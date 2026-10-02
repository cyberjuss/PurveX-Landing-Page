/* Seeded generator for SIEM case datasets.
 *
 * Run: npx tsx scripts/siem/generate.ts
 *
 * Writes, under src/content/scenarios/<id>/:
 *   SecurityEvent.ndjson, DeviceProcessEvents.ndjson, DeviceFileEvents.ndjson,
 *   DeviceNetworkEvents.ndjson, EmailEvents.ndjson   (one row per line)
 *   case.json   (story, schema, example queries, alerts, answer key, proofs)
 *
 * Nothing here is an attack tool. It writes rows of text that look like the
 * logs a benign attack simulation leaves behind. Attacker addresses come from
 * the ranges reserved for documentation (RFC 5737), so none is a real host.
 *
 * The output is deterministic: the same seed gives byte-identical files, which
 * the proof-query test depends on.
 */
import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { buildRansomwareCase } from "./cases/ransomware-01";
import type { BuiltCase } from "./kit";

const OUT_ROOT = join(__dirname, "..", "..", "src", "content", "scenarios");

function write(built: BuiltCase) {
  const dir = join(OUT_ROOT, built.id);
  mkdirSync(dir, { recursive: true });
  let digest = "";
  for (const [table, rows] of Object.entries(built.tables)) {
    const body = rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
    writeFileSync(join(dir, `${table}.ndjson`), body);
    digest += `${table}:${rows.length}:${createHash("sha256").update(body).digest("hex").slice(0, 12)}\n`;
  }
  writeFileSync(join(dir, "case.json"), JSON.stringify(built.caseFile, null, 2) + "\n");
  console.log(`\n${built.id}  (${built.caseFile.public.title})`);
  for (const [t, rows] of Object.entries(built.tables)) console.log(`  ${t.padEnd(22)} ${rows.length} rows`);
  console.log(digest.split("\n").filter(Boolean).map((l) => "  " + l).join("\n"));
}

const cases = [buildRansomwareCase()];
for (const c of cases) write(c);
console.log(`\nWrote ${cases.length} case(s) to ${OUT_ROOT}`);
