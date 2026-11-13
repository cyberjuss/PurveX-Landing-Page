import "server-only";
import { MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import type { Results } from "@/lib/academy-score";

// The PurveX Discord, from Range's side: a post in #wins when a student
// finishes a whole challenge. Only for students who switched it on in Goals,
// and only ever their first name and the challenge's title, nothing else
// about them or their answers.
//
// DISCORD_WINS_WEBHOOK_URL is the #wins channel's webhook, made by
// scripts/discord/setup.ts. It is a secret: anyone holding it can post in
// that channel, so it lives in the server's environment and never in the
// browser. Unset, nothing is posted and nothing breaks.

type ChallengeKey = MissionCatalogEntry["challenge"];

/** What #wins calls each challenge. Anything missing reads from its id. */
const CHALLENGE_TITLES: Partial<Record<ChallengeKey, string>> = {
  "day-one": "Operation Day One",
  "ticket-queue": "the Ticket Queue",
  "client-data": "The Client Data Review",
  "build-out-directory": "Build Out the Directory",
  "new-hire-week": "A New Hire's First Week",
  "weekend-incident-report": "The Weekend Incident Report",
  "tuesday-after-breach": "Tuesday After the Breach",
  "network-change": "The Network Change That Went Wrong",
  "access-review": "The Quarterly Access Review",
};

export function challengeTitle(key: ChallengeKey): string {
  return CHALLENGE_TITLES[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const missionsOf = (key: ChallengeKey) => Object.values(MISSION_CATALOG).filter((m) => m.challenge === key).map((m) => m.id);

/**
 * The challenge this solve completed, if it did: every mission in it solved
 * now, and not before. A challenge with a mission still open, or one that was
 * already complete, returns null, so a student is announced once per
 * challenge, on the solve that finished it.
 */
export function finishedChallenge(before: Results, after: Results, missionId: string): ChallengeKey | null {
  const key = MISSION_CATALOG[missionId]?.challenge;
  if (!key) return null;
  const ids = missionsOf(key);
  if (!ids.length) return null;
  const done = (r: Results) => ids.every((id) => r[id]?.solved);
  return done(after) && !done(before) ? key : null;
}

/** Every challenge this student has finished, each mission in it solved. */
export function finishedChallenges(r: Results): ChallengeKey[] {
  const keys = [...new Set(Object.values(MISSION_CATALOG).map((m) => m.challenge))];
  return keys.filter((k) => {
    const ids = missionsOf(k);
    return ids.length > 0 && ids.every((id) => r[id]?.solved);
  });
}

/**
 * A first name that is safe to post: letters, spaces, hyphens and
 * apostrophes, at most 24 characters. A student types this, so nothing that
 * Discord would read as markdown or a mention gets through.
 */
export function winName(raw: string | null | undefined): string {
  const first = (raw ?? "").trim().split(/\s+/)[0] ?? "";
  const clean = first.normalize("NFKC").replace(/[^\p{L}' -]/gu, "").slice(0, 24).trim();
  return clean || "A Range student";
}

export function winMessage(name: string, key: ChallengeKey): string {
  return `🎉 **${winName(name)}** just finished **${challengeTitle(key)}** in Range.`;
}

export const discordWinsConfigured = () => /^https:\/\/(?:\w+\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(process.env.DISCORD_WINS_WEBHOOK_URL ?? "");

/**
 * Posts one win. Never throws: a Discord outage must not turn a correct
 * answer into an error, so a failure is logged and dropped.
 */
export async function postWin(name: string, key: ChallengeKey): Promise<boolean> {
  if (!discordWinsConfigured()) return false;
  try {
    const res = await fetch(process.env.DISCORD_WINS_WEBHOOK_URL!, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(5_000),
      // No mentions of any kind, whatever the text holds.
      body: JSON.stringify({ content: winMessage(name, key), allowed_mentions: { parse: [] } }),
    });
    if (!res.ok) console.error("discord: win post failed", res.status);
    return res.ok;
  } catch (err) {
    console.error("discord: win post failed", err instanceof Error ? err.message : err);
    return false;
  }
}
