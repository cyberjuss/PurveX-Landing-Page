// Read-only: report an account's confirmation state. Prints no secrets.
// Usage: node scripts/check-user.mjs someone@example.com
import { readFileSync } from "node:fs";

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("usage: node scripts/check-user.mjs <email>");
  process.exit(1);
}

// Pull config the same way Next does locally, without echoing any of it.
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
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const res = await fetch(
  `${url}/auth/v1/admin/users?per_page=200`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
if (!res.ok) {
  console.error(`Supabase admin API said ${res.status}`);
  process.exit(1);
}
const { users = [] } = await res.json();
const u = users.find((x) => (x.email || "").toLowerCase() === email);

if (!u) {
  console.log(`NOT FOUND: no account for ${email} (searched ${users.length} users)`);
  process.exit(0);
}

console.log(`account      ${u.email}`);
console.log(`id           ${u.id}`);
console.log(`created      ${u.created_at}`);
console.log(`confirmed    ${u.email_confirmed_at || "NO - this is why sign-in fails"}`);
console.log(`last sign in ${u.last_sign_in_at || "never"}`);
console.log(`providers    ${(u.app_metadata?.providers || []).join(", ") || "unknown"}`);
