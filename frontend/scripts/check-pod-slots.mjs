// Read-only: is the pod_slot column live, and how many slots are actually held?
import { readFileSync } from "node:fs";
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
const h = { apikey: key, Authorization: `Bearer ${key}` };

const r = await fetch(`${url}/rest/v1/academy_hosted_labs?select=pod_slot`, { headers: h });
console.log(`select pod_slot -> HTTP ${r.status}`);
const body = await r.text();
if (!r.ok) {
  console.log("THE COLUMN IS NOT THERE. This is the real cause.");
  console.log(body.slice(0, 300));
  process.exit(0);
}
const rows = JSON.parse(body);
const held = rows.filter((x) => x.pod_slot !== null);
console.log(`lab rows: ${rows.length}, slots held: ${held.length}`);
console.log("slots:", held.map((x) => x.pod_slot).sort((a, b) => a - b).join(", ") || "(none)");
