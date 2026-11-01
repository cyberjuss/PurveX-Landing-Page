/**
 * Does the Coach daily limit actually hold under concurrency?
 *
 *   npm run test:coach-limit
 *
 * It held for one request at a time and for nothing else. The route read the
 * day's count, compared it to the cap, spent several seconds on the model, and
 * then wrote count + 1. Requests fired together all read the same number, all
 * passed the cap, and all wrote the same total back, so the counter barely
 * moved while the bill did.
 *
 * This fires the claim concurrently against production and asserts that
 * exactly `cap` of them win. It writes to a day far in the future under the
 * signed-in owner's own account, then deletes that row, so no real usage is
 * touched. Read `npm run check:schema` first if it fails: the functions live
 * in supabase/academy.sql and have to be run by hand.
 */
import { readFileSync } from "node:fs";
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
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

// Far enough out that it can never collide with a real day's usage.
const DAY = "2099-01-01";
const LAB = "test-coach-limit";
const CAP = 5;
const BURST = 40;

const rpc = async (fn, body) => {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${text}`);
  return text === "" ? null : JSON.parse(text);
};
const del = (table, qs) => fetch(`${url}/rest/v1/${table}?${qs}`, { method: "DELETE", headers });

let fails = 0;
const T = (name, ok, detail) => {
  if (!ok) fails += 1;
  console.log(`${ok ? "\x1b[32mok  \x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? ` (${detail})` : ""}`);
};

// Whose account to bill the test to. The functions have a foreign key to
// auth.users, so this needs a real id, and the owner's own is the honest one.
const usersRes = await fetch(`${url}/auth/v1/admin/users?per_page=1`, { headers });
const users = await usersRes.json();
const userId = users?.users?.[0]?.id;
if (!userId) {
  console.error("Could not read a user id to run the test against.");
  process.exit(1);
}

await del("academy_coach_usage", `user_id=eq.${userId}&day=eq.${DAY}`);
await del("academy_lab_coach_usage", `user_id=eq.${userId}&day=eq.${DAY}&lab=eq.${LAB}`);

try {
  // The whole point: all at once, not one after another.
  const burst = await Promise.all(
    Array.from({ length: BURST }, () => rpc("academy_claim_coach_question", { p_user: userId, p_day: DAY, p_limit: CAP }))
  );
  const won = burst.filter((v) => v !== null);
  const refused = burst.filter((v) => v === null);
  T(`${BURST} concurrent claims against a cap of ${CAP}: exactly ${CAP} win`, won.length === CAP, `${won.length} won, ${refused.length} refused`);
  T("the winners are numbered 1..cap with no repeats", JSON.stringify([...won].sort((a, b) => a - b)) === JSON.stringify(Array.from({ length: CAP }, (_, i) => i + 1)), won.join(","));

  const after = await rpc("academy_claim_coach_question", { p_user: userId, p_day: DAY, p_limit: CAP });
  T("one more claim at the cap is refused", after === null, String(after));

  const released = await rpc("academy_release_coach_question", { p_user: userId, p_day: DAY });
  T("a release gives one back", released === CAP - 1, String(released));
  const reclaimed = await rpc("academy_claim_coach_question", { p_user: userId, p_day: DAY, p_limit: CAP });
  T("and the freed question can be claimed", reclaimed === CAP, String(reclaimed));

  // A release can only ever reach zero, however many times it is called.
  for (let i = 0; i < CAP + 3; i += 1) await rpc("academy_release_coach_question", { p_user: userId, p_day: DAY });
  const floor = await rpc("academy_release_coach_question", { p_user: userId, p_day: DAY });
  T("releases cannot push the count below zero", floor === 0, String(floor));

  const zeroCap = await rpc("academy_claim_coach_question", { p_user: userId, p_day: DAY, p_limit: 0 });
  T("a cap of zero refuses", zeroCap === null, String(zeroCap));

  // The per-lab cap, same shape.
  const labBurst = await Promise.all(
    Array.from({ length: BURST }, () => rpc("academy_claim_lab_coach_question", { p_user: userId, p_day: DAY, p_lab: LAB, p_limit: CAP }))
  );
  const labWon = labBurst.filter((v) => v !== null);
  T(`the per-lab cap holds under ${BURST} concurrent claims`, labWon.length === CAP, `${labWon.length} won`);
  const labReleased = await rpc("academy_release_lab_coach_question", { p_user: userId, p_day: DAY, p_lab: LAB });
  T("a per-lab release gives one back", labReleased === CAP - 1, String(labReleased));
} finally {
  await del("academy_coach_usage", `user_id=eq.${userId}&day=eq.${DAY}`);
  await del("academy_lab_coach_usage", `user_id=eq.${userId}&day=eq.${DAY}&lab=eq.${LAB}`);
  console.log("\ntest rows removed.");
}

if (fails) {
  console.error(`${fails} failed.`);
  process.exit(1);
}
console.log("The cap holds.");
