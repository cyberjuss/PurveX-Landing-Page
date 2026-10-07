// One-off: zero lab hours billed for starts that never produced a lab.
// Safe only while academy_hosted_labs is empty, which it verifies first.
import { readFileSync } from "node:fs";
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
const h = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const month = process.argv[2];
if (!/^\d{4}-\d{2}$/.test(month || "")) { console.error("usage: node scripts/clear-phantom-hours.mjs YYYY-MM"); process.exit(1); }

// Refuse if any lab exists: then the hours may be real and this is not a refund.
const labs = await (await fetch(`${url}/rest/v1/academy_hosted_labs?select=user_id`, { headers: h })).json();
if (labs.length) { console.error(`REFUSING: ${labs.length} lab row(s) exist, so these hours may be genuine.`); process.exit(1); }

const before = await (await fetch(`${url}/rest/v1/academy_lab_usage?select=user_id,minutes&month=eq.${month}`, { headers: h })).json();
console.log("before:", before.map((r) => `${r.user_id.slice(0, 8)}…=${r.minutes}min`).join("  ") || "(nothing)");

const res = await fetch(`${url}/rest/v1/academy_lab_usage?month=eq.${month}`, {
  method: "PATCH",
  headers: { ...h, Prefer: "return=representation" },
  body: JSON.stringify({ minutes: 0, updated_at: new Date().toISOString() }),
});
if (!res.ok) { console.error(`PATCH ${res.status}`, await res.text()); process.exit(1); }
const after = await res.json();
console.log("after :", after.map((r) => `${r.user_id.slice(0, 8)}…=${r.minutes}min`).join("  "));
