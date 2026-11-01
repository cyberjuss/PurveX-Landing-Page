import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Accounts that have gone quiet in the portal, for the daily nudge cron
// (api/cron/dormant). Class students are nudged by the weekly class job
// instead, so the caller filters those out.
//
// "Quiet" means neither a sign-in nor a trace of portal use for N days. A
// sign-in alone is not enough to measure: a session refreshes for weeks
// without ever touching last_sign_in_at, so someone training daily would
// still look dormant. So we take the latest of the sign-in and the portal's
// own heartbeats (the page they were on, saved progress, a lab sync, a drill).

const DAY = 86_400_000;

export type DormantAccount = {
  userId: string;
  email: string;
  name: string | null;
  /** Latest sign-in or portal activity. */
  lastSeen: string;
  /** Whole days since lastSeen. */
  days: number;
  /** False when the account has signed up and never trained. */
  started: boolean;
};

type AuthUser = {
  id: string;
  email?: string | null;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  user_metadata?: Record<string, unknown> | null;
};

const metaName = (meta: Record<string, unknown> | null | undefined): string | null => {
  const v = [meta?.full_name, meta?.name, meta?.given_name].find((x) => typeof x === "string" && x.trim());
  return typeof v === "string" ? v.trim() : null;
};

const newer = (a: string | null, b: string | null | undefined) =>
  b && (!a || b > a) && !Number.isNaN(Date.parse(b)) ? b : a;

/** Every auth user, a page at a time. The guard stops a bad cursor looping. */
async function allAuthUsers(): Promise<AuthUser[]> {
  if (!supabaseAdmin) return [];
  const perPage = 1000;
  const out: AuthUser[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("listUsers failed", error.message);
      break;
    }
    const users = (data?.users ?? []) as unknown as AuthUser[];
    out.push(...users);
    if (users.length < perPage) break;
  }
  return out;
}

/** The newest timestamp per user in one table, only rows at or after `since`. */
async function heartbeat(table: string, col: string, since: string): Promise<Map<string, string>> {
  const seen = new Map<string, string>();
  if (!supabaseAdmin) return seen;
  const { data, error } = await supabaseAdmin.from(table).select(`user_id, ${col}`).gte(col, since);
  // A table that is not there yet reads as empty, same as the roster does.
  if (error) {
    console.error(`${table} dormancy read failed`, error.message);
    return seen;
  }
  for (const row of (data ?? []) as unknown as Record<string, string>[]) {
    const id = row.user_id;
    const at = newer(seen.get(id) ?? null, row[col]);
    if (id && at) seen.set(id, at);
  }
  return seen;
}

/** Which of these users have ever saved progress, so the copy can tell a
 *  lapsed student apart from a signup who never began. */
async function everStarted(ids: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  if (!supabaseAdmin || !ids.length) return out;
  const { data, error } = await supabaseAdmin.from("academy_progress").select("user_id").in("user_id", ids);
  if (error) {
    console.error("academy_progress dormancy read failed", error.message);
    return out;
  }
  for (const row of (data ?? []) as { user_id: string }[]) out.add(row.user_id);
  return out;
}

/**
 * Accounts quiet for `minDays` to `maxDays`. The upper bound matters: without
 * it the first run would mail every account that ever lapsed, and someone who
 * left months ago does not want chasing.
 */
export async function dormantAccounts(minDays = 7, maxDays = 28): Promise<DormantAccount[]> {
  if (!supabaseAdmin) return [];
  const now = Date.now();
  // Anything older than the window cannot change the verdict, so bound the
  // heartbeat reads to it and keep the queries small as the tables grow.
  const since = new Date(now - (maxDays + 1) * DAY).toISOString();
  const [users, activity, progress, lab, drills] = await Promise.all([
    allAuthUsers(),
    heartbeat("academy_activity", "updated_at", since),
    heartbeat("academy_progress", "updated_at", since),
    heartbeat("academy_lab_state", "uploaded_at", since),
    heartbeat("academy_drill_log", "created_at", since),
  ]);

  const quiet: DormantAccount[] = [];
  for (const u of users) {
    const email = u.email?.trim();
    // No address to write to, or they never confirmed the one they gave. An
    // unconfirmed signup needs the confirmation email resent, not a nudge.
    if (!email || !(u.email_confirmed_at ?? u.confirmed_at)) continue;
    // Never signed in at all: nothing to come back to yet.
    if (!u.last_sign_in_at) continue;

    let lastSeen = newer(null, u.last_sign_in_at);
    for (const map of [activity, progress, lab, drills]) lastSeen = newer(lastSeen, map.get(u.id));
    if (!lastSeen) continue;

    const days = Math.floor((now - Date.parse(lastSeen)) / DAY);
    if (days < minDays || days > maxDays) continue;
    quiet.push({ userId: u.id, email, name: metaName(u.user_metadata), lastSeen, days, started: false });
  }

  const started = await everStarted(quiet.map((q) => q.userId));
  return quiet.map((q) => ({ ...q, started: started.has(q.userId) }));
}
