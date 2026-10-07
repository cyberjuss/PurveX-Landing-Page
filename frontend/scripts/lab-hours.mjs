// Read-only: this month's recorded lab minutes per account.
import { readFileSync } from "node:fs";
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
const h = { apikey: key, Authorization: `Bearer ${key}` };
const r = await fetch(`${url}/rest/v1/academy_lab_usage?select=user_id,month,minutes`, { headers: h });
if (!r.ok) { console.error(`HTTP ${r.status}`, await r.text()); process.exit(1); }
const rows = await r.json();
if (!rows.length) { console.log("no usage recorded at all"); process.exit(0); }
for (const x of rows) console.log(`${x.month}  ${x.minutes} min  = ${(x.minutes / 60).toFixed(1)} h  user ${x.user_id.slice(0, 8)}…`);
