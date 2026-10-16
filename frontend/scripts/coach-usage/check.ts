/**
 * Does a Coach question stay spent?
 *
 *   npm run check:coach-usage
 *
 * The count is meant to survive the request that spent it. For a day it did
 * not: the atomic claim is a Postgres function that has not been run yet, and
 * the fallback counted in process memory only, so nothing reached the
 * database and a serverless process being replaced put the day's allowance
 * back to full. The panel showed fourteen left, then twenty again an hour
 * later.
 *
 * This runs against the real database in whatever state it is in -- with the
 * function or without it -- and asks the only question that matters: after a
 * claim, does the next reader see it. Uses a day far in the future so no real
 * allowance is touched, and deletes the row afterwards.
 */
import { createHash } from "node:crypto";
import { claimCoachQuestion, readUsage, releaseCoachQuestion } from "@/lib/academy-store";

const DAY = "2099-02-02";
const CAP = 5;
let failures = 0;
const t = (name: string, ok: boolean, detail = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "\x1b[32mok  \x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? `  (${detail})` : ""}`);
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("No Supabase credentials, so there is no persistence to test.");
    process.exit(1);
  }
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const users = await (await fetch(`${url}/auth/v1/admin/users?per_page=1`, { headers })).json();
  const userId: string | undefined = users?.users?.[0]?.id;
  if (!userId) {
    console.error("Could not read a user id to test against.");
    process.exit(1);
  }
  const wipe = () => fetch(`${url}/rest/v1/academy_coach_usage?user_id=eq.${userId}&day=eq.${DAY}`, { method: "DELETE", headers });
  const stored = async () => {
    const r = await fetch(`${url}/rest/v1/academy_coach_usage?select=count&user_id=eq.${userId}&day=eq.${DAY}`, { headers });
    const rows = (await r.json()) as { count: number }[];
    return rows[0]?.count ?? null;
  };

  await wipe();
  try {
    const first = await claimCoachQuestion(userId, CAP, DAY);
    t("a claim returns the running count", first === 1, String(first));
    // The whole bug in one assertion: it has to be in the database, not just
    // in this process, or the next process starts the day over.
    t("and the database has it", (await stored()) === 1, `stored ${await stored()}`);

    await claimCoachQuestion(userId, CAP, DAY);
    await claimCoachQuestion(userId, CAP, DAY);
    t("three claims read back as three", (await stored()) === 3, `stored ${await stored()}`);
    t("readUsage agrees with the database", (await readUsage(userId, DAY)) === 3, String(await readUsage(userId, DAY)));

    await claimCoachQuestion(userId, CAP, DAY);
    await claimCoachQuestion(userId, CAP, DAY);
    const over = await claimCoachQuestion(userId, CAP, DAY);
    t("the cap refuses the sixth", over === null, String(over));
    t("and the count stays at the cap", (await stored()) === CAP, `stored ${await stored()}`);

    await releaseCoachQuestion(userId, DAY);
    t("a release gives one back in the database", (await stored()) === CAP - 1, `stored ${await stored()}`);
    const again = await claimCoachQuestion(userId, CAP, DAY);
    t("and the freed question can be spent", again === CAP, String(again));
    // The one the review was about. Without the stored function this is the
    // path every request takes, so if the cap only holds one request at a
    // time it does not hold. Compare-and-set means of two arriving together
    // exactly one lands.
    await wipe();
    const BURST = 25;
    const burst = await Promise.all(Array.from({ length: BURST }, () => claimCoachQuestion(userId, CAP, DAY)));
    const won = burst.filter((v): v is number => v !== null);
    t(`${BURST} at once against a cap of ${CAP}: exactly ${CAP} win`, won.length === CAP, `${won.length} won`);
    t(
      "and they are numbered 1 to the cap with no repeats",
      JSON.stringify([...won].sort((a, b) => a - b)) === JSON.stringify(Array.from({ length: CAP }, (_, i) => i + 1)),
      won.join(",")
    );
    t("the database agrees", (await stored()) === CAP, `stored ${await stored()}`);

    // Releases racing each other must not each write the same lower number.
    await Promise.all([releaseCoachQuestion(userId, DAY), releaseCoachQuestion(userId, DAY)]);
    t("two releases at once give back two, not one", (await stored()) === CAP - 2, `stored ${await stored()}`);
  } finally {
    await wipe();
  }

  console.log(`\n${failures ? `\x1b[31m${failures} failed\x1b[0m` : "\x1b[32mthe count survives the request\x1b[0m"}`);
  process.exit(failures ? 1 : 0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
