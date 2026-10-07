// Read-only: accounts whose address contains a fragment. Prints no secrets.
import { readFileSync } from "node:fs";
const frag = (process.argv[2] || "").trim().toLowerCase();
if (!frag) { console.error("usage: node scripts/find-user.mjs <fragment>"); process.exit(1); }
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
const h = { apikey: key, Authorization: `Bearer ${key}` };
const { users = [] } = await (await fetch(`${url}/auth/v1/admin/users?per_page=500`, { headers: h })).json();
const hits = users.filter((u) => (u.email || "").toLowerCase().includes(frag));
if (!hits.length) { console.log(`no account matches "${frag}" out of ${users.length}`); process.exit(0); }
for (const u of hits) {
  console.log(`${u.email}`);
  console.log(`  id         ${u.id}`);
  console.log(`  created    ${u.created_at}`);
  console.log(`  confirmed  ${u.email_confirmed_at || "no"}`);
  console.log(`  last sign  ${u.last_sign_in_at || "never"}`);
  console.log(`  providers  ${(u.app_metadata?.providers || []).join(", ")}`);
}
