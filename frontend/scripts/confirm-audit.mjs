// Read-only: how many accounts never confirmed their email, grouped by
// provider, so a delivery problem at one mail host stands out. No secrets.
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("missing supabase config"); process.exit(1); }

const res = await fetch(`${url}/auth/v1/admin/users?per_page=500`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
if (!res.ok) { console.error(`admin API ${res.status}`); process.exit(1); }
const { users = [] } = await res.json();

const byDomain = new Map();
for (const u of users) {
  const domain = (u.email || "?").split("@")[1] || "?";
  const google = (u.app_metadata?.providers || []).includes("google");
  const row = byDomain.get(domain) || { total: 0, unconfirmed: 0, google: 0 };
  row.total += 1;
  if (!u.email_confirmed_at) row.unconfirmed += 1;
  if (google) row.google += 1;
  byDomain.set(domain, row);
}

const total = users.length;
const unconfirmed = users.filter((u) => !u.email_confirmed_at);
console.log(`${total} accounts, ${unconfirmed.length} never confirmed\n`);
console.log("domain                 total  unconfirmed  via google");
for (const [d, r] of [...byDomain].sort((a, b) => b[1].total - a[1].total)) {
  console.log(`${d.padEnd(22)} ${String(r.total).padStart(5)}  ${String(r.unconfirmed).padStart(11)}  ${String(r.google).padStart(10)}`);
}

console.log("\nunconfirmed, newest first:");
for (const u of unconfirmed.sort((a, b) => b.created_at.localeCompare(a.created_at))) {
  console.log(`  ${u.created_at.slice(0, 19)}Z  ${u.email}`);
}
