import "server-only";
import { createHash, randomBytes } from "crypto";
import { sanitizeActivityPlace, type ActivityPlace, type StudentActivity } from "@/lib/academy-activity";
import type { ShiftRun } from "@/lib/academy-shift";
import { sanitizeProfile, type RoleBrief, type RoleId, type StudentProfile } from "@/lib/academy-certs";
import type { DrillEntry, EntryMode } from "@/lib/academy-drills";
import { sanitizeLabSnapshot, type LabSnapshot } from "@/lib/academy-lab";
import { sanitizeResults, type Results } from "@/lib/academy-score";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Supabase when the service role is configured; per-process memory
// otherwise, so local dev works before academy.sql has been run.
const memoryProgress = new Map<string, Results>();
const memoryUsage = new Map<string, { day: string; count: number }>();
const memoryLabCoach = new Map<string, { day: string; count: number }>();
const memoryKeys = new Map<string, { userId: string; createdAt: string; lastUsedAt: string | null }>();
const memoryDaily = new Map<string, string>();
const memoryDrills = new Map<string, DrillEntry[]>();
const memoryLab = new Map<string, { snapshot: LabSnapshot; uploadedAt: string }>();
const memoryProfiles = new Map<string, StudentProfile>();
const memoryRoleBriefs = new Map<string, RoleBrief>();
const memoryActivity = new Map<string, StudentActivity>();

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

// A Postgres function this code calls that the database has not got yet,
// because academy.sql has not been run against it.
const missingFunction = (code?: string) => code === "PGRST202" || code === "42883";

export async function loadProgress(userId: string): Promise<Results> {
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("academy_progress").select("results").eq("user_id", userId).maybeSingle();
    return sanitizeResults(data?.results, true);
  }
  return memoryProgress.get(userId) || {};
}

export async function saveProgress(userId: string, email: string | null, results: Results) {
  memoryProgress.set(userId, results);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_progress").upsert({
    user_id: userId,
    email,
    results,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("academy_progress upsert failed", error.message);
}

export async function readUsage(userId: string, day = todayStamp()): Promise<number> {
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("academy_coach_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle();
    if (typeof data?.count === "number") return data.count;
  }
  const row = memoryUsage.get(userId);
  return row && row.day === day ? row.count : 0;
}

export async function resetUsage(userId: string, day = todayStamp()) {
  memoryUsage.set(userId, { day, count: 0 });
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_coach_usage").upsert({
    user_id: userId,
    day,
    count: 0,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("academy_coach_usage reset failed", error.message);
}

/**
 * Claim one Coach question for today, or null when the student is at the cap.
 *
 * The cap has to be decided in the same statement that spends the question.
 * Read-check-call-write left the model call inside the window, so a handful of
 * requests fired together all read the same count, all passed, and all wrote
 * the same total: the daily limit held for one request at a time and for
 * nothing else. Postgres decides it now, under a row lock.
 *
 * `limit` is the base allowance plus today's drill bonus, so it is passed in.
 */
/**
 * Spends one unit of a daily counter, atomically, without a stored function.
 *
 * The atomic claim is a Postgres function that has to be run by hand, and
 * until it is this is the path every request takes -- so "read it, check it,
 * write it" would have been the rate limit having a hole in it rather than a
 * rate limit. Each write here is a single conditional statement instead: the
 * update only matches while the count is still what was read, so of two
 * requests arriving together exactly one lands and the loser reads again.
 *
 * The insert is the same bet on the primary key. Both are bounded, and
 * running out of tries refuses rather than spends, because the limit is the
 * thing being protected.
 */
async function claimCounter(
  table: "academy_coach_usage" | "academy_lab_coach_usage",
  match: Record<string, string>,
  limit: number
): Promise<number | null | "unavailable"> {
  if (!supabaseAdmin) return "unavailable";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let read = supabaseAdmin.from(table).select("count");
    for (const [k, v] of Object.entries(match)) read = read.eq(k, v);
    const { data: row, error } = await read.maybeSingle();
    if (error) {
      console.error(`${table} read failed`, error.message);
      return "unavailable";
    }
    const used = typeof row?.count === "number" ? row.count : null;
    if (used !== null && used >= limit) return null;
    const next = (used ?? 0) + 1;
    const updated_at = new Date().toISOString();
    if (used === null) {
      const { error: insErr } = await supabaseAdmin.from(table).insert({ ...match, count: 1, updated_at });
      if (!insErr) return 1;
      // Somebody inserted first. Read again and take the update path.
      continue;
    }
    let write = supabaseAdmin.from(table).update({ count: next, updated_at });
    for (const [k, v] of Object.entries(match)) write = write.eq(k, v);
    // The condition. Nothing matches if the count moved under us.
    const { data: won, error: upErr } = await write.eq("count", used).select("count");
    if (upErr) {
      console.error(`${table} claim write failed`, upErr.message);
      return "unavailable";
    }
    if ((won ?? []).length) return next;
  }
  console.error(`${table} claim gave up after five attempts`);
  return null;
}

/**
 * Hands one unit back, atomically, the same way.
 */
async function releaseCounter(table: "academy_coach_usage" | "academy_lab_coach_usage", match: Record<string, string>): Promise<void> {
  if (!supabaseAdmin) return;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let read = supabaseAdmin.from(table).select("count");
    for (const [k, v] of Object.entries(match)) read = read.eq(k, v);
    const { data: row, error } = await read.maybeSingle();
    if (error || typeof row?.count !== "number") return;
    if (row.count <= 0) return;
    let write = supabaseAdmin.from(table).update({ count: row.count - 1, updated_at: new Date().toISOString() });
    for (const [k, v] of Object.entries(match)) write = write.eq(k, v);
    const { data: won, error: upErr } = await write.eq("count", row.count).select("count");
    if (upErr) return;
    if ((won ?? []).length) return;
  }
}

export async function claimCoachQuestion(userId: string, limit: number, day = todayStamp()): Promise<number | null> {
  if (limit <= 0) return null;
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc("academy_claim_coach_question", { p_user: userId, p_day: day, p_limit: limit });
    if (!error) {
      // null is the cap, not a failure: the conflict update was skipped.
      if (data === null) return null;
      if (typeof data === "number") {
        memoryUsage.set(userId, { day, count: data });
        return data;
      }
    }
    if (error && !missingFunction(error.code)) {
      console.error("academy_coach_usage claim failed", error.code, error.message);
      // Refusing would close Coach on a database hiccup.
    }
    // The function is not there yet, so this is the path every request takes.
    // Compare-and-set rather than read-check-write: the limit is the thing
    // being protected and a hole in it is not a fallback.
    const claimed = await claimCounter("academy_coach_usage", { user_id: userId, day }, limit);
    if (claimed !== "unavailable") {
      if (typeof claimed === "number") memoryUsage.set(userId, { day, count: claimed });
      return claimed;
    }
  }
  // No database at all. One process, one counter: it goes when the process
  // does, which is why it is the last resort rather than the fallback.
  const row = memoryUsage.get(userId);
  const used = row && row.day === day ? row.count : 0;
  if (used >= limit) return null;
  memoryUsage.set(userId, { day, count: used + 1 });
  return used + 1;
}

/** Hand a claimed question back after a failed model call. */
export async function releaseCoachQuestion(userId: string, day = todayStamp()): Promise<void> {
  const row = memoryUsage.get(userId);
  if (row && row.day === day) memoryUsage.set(userId, { day, count: Math.max(0, row.count - 1) });
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.rpc("academy_release_coach_question", { p_user: userId, p_day: day });
  if (!error) return;
  if (!missingFunction(error.code)) console.error("academy_coach_usage release failed", error.code, error.message);
  // Without the function, hand it back the same conditional way, or a failed
  // turn would keep costing a question it never spent -- and two releases
  // landing together would both write the same lower number.
  await releaseCounter("academy_coach_usage", { user_id: userId, day });
}

/** The same claim for the per-lab cap, so one browser lab cannot spend the day. */
export async function claimLabCoachQuestion(userId: string, lab: string, limit: number, day = todayStamp()): Promise<number | null> {
  if (limit <= 0) return null;
  const key = `${userId}|${lab}`;
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc("academy_claim_lab_coach_question", { p_user: userId, p_day: day, p_lab: lab, p_limit: limit });
    if (!error) {
      if (data === null) return null;
      if (typeof data === "number") {
        memoryLabCoach.set(key, { day, count: data });
        return data;
      }
    }
    if (error && !missingFunction(error.code)) {
      console.error("academy_lab_coach_usage claim failed", error.code, error.message);
    }
    // Same compare-and-set as the daily claim while the function is missing.
    const claimed = await claimCounter("academy_lab_coach_usage", { user_id: userId, day, lab }, limit);
    if (claimed !== "unavailable") {
      if (typeof claimed === "number") memoryLabCoach.set(key, { day, count: claimed });
      return claimed;
    }
  }
  const row = memoryLabCoach.get(key);
  const used = row && row.day === day ? row.count : 0;
  if (used >= limit) return null;
  memoryLabCoach.set(key, { day, count: used + 1 });
  return used + 1;
}

export async function releaseLabCoachQuestion(userId: string, lab: string, day = todayStamp()): Promise<void> {
  const key = `${userId}|${lab}`;
  const row = memoryLabCoach.get(key);
  if (row && row.day === day) memoryLabCoach.set(key, { day, count: Math.max(0, row.count - 1) });
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.rpc("academy_release_lab_coach_question", { p_user: userId, p_day: day, p_lab: lab });
  if (!error) return;
  if (!missingFunction(error.code)) console.error("academy_lab_coach_usage release failed", error.code, error.message);
  await releaseCounter("academy_lab_coach_usage", { user_id: userId, day, lab });
}

export async function loadLabState(userId: string): Promise<{ snapshot: LabSnapshot; uploadedAt: string } | null> {
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("academy_lab_state")
      .select("snapshot, uploaded_at")
      .eq("user_id", userId)
      .maybeSingle();
    const snapshot = sanitizeLabSnapshot(data?.snapshot);
    return snapshot && data ? { snapshot, uploadedAt: data.uploaded_at } : null;
  }
  return memoryLab.get(userId) ?? null;
}

export async function saveLabState(userId: string, snapshot: LabSnapshot) {
  const uploadedAt = new Date().toISOString();
  memoryLab.set(userId, { snapshot, uploadedAt });
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_lab_state").upsert({
    user_id: userId,
    snapshot,
    captured_at: snapshot.capturedAt,
    uploaded_at: uploadedAt,
  });
  if (error) throw new Error(error.message);
}

// Live lab verification. The lab script syncs every few minutes while `liveUntil`
// is in the future, and a planted challenge code proves the lab is live.
export type LabLive = { liveUntil: string | null; challengeCode: string | null; challengeAt: string | null; verifiedAt: string | null };
const memoryLive = new Map<string, LabLive>();
const NO_LIVE: LabLive = { liveUntil: null, challengeCode: null, challengeAt: null, verifiedAt: null };

export async function loadLabLive(userId: string): Promise<LabLive> {
  const mem = memoryLive.get(userId) ?? NO_LIVE;
  if (!supabaseAdmin) return mem;
  const { data, error } = await supabaseAdmin
    .from("academy_lab_state")
    .select("live_until, challenge_code, challenge_at, verified_at")
    .eq("user_id", userId)
    .maybeSingle();
  // Before the migration runs, fall back to what this server instance remembers.
  if (error || !data) return mem;
  return { liveUntil: data.live_until ?? null, challengeCode: data.challenge_code ?? null, challengeAt: data.challenge_at ?? null, verifiedAt: data.verified_at ?? null };
}

export async function saveLabLive(userId: string, patch: Partial<LabLive>) {
  const next = { ...(memoryLive.get(userId) ?? NO_LIVE), ...patch };
  memoryLive.set(userId, next);
  if (!supabaseAdmin) return;
  const cols: Record<string, string | null> = {};
  if ("liveUntil" in patch) cols.live_until = patch.liveUntil ?? null;
  if ("challengeCode" in patch) cols.challenge_code = patch.challengeCode ?? null;
  if ("challengeAt" in patch) cols.challenge_at = patch.challengeAt ?? null;
  if ("verifiedAt" in patch) cols.verified_at = patch.verifiedAt ?? null;
  const { error } = await supabaseAdmin.from("academy_lab_state").update(cols).eq("user_id", userId);
  if (error) console.error("academy_lab_state live update failed", error.message);
}

/** Keep the lab syncing every few minutes for a while. Never shortens an existing window. */
export async function touchLabLive(userId: string, minutes: number) {
  const until = Date.now() + minutes * 60_000;
  const cur = await loadLabLive(userId);
  if (cur.liveUntil && Date.parse(cur.liveUntil) >= until) return;
  await saveLabLive(userId, { liveUntil: new Date(until).toISOString() });
}

// MCP connection keys. Only the SHA-256 of a key is stored; the key itself
// is shown to the student once, when it is created.
const KEY_PREFIX = "pvx_";

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export type McpKeyInfo = { createdAt: string; lastUsedAt: string | null } | null;

export async function getMcpKeyInfo(userId: string): Promise<McpKeyInfo> {
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("academy_mcp_keys")
      .select("created_at, last_used_at")
      .eq("user_id", userId)
      .maybeSingle();
    return data ? { createdAt: data.created_at, lastUsedAt: data.last_used_at } : null;
  }
  for (const row of memoryKeys.values()) {
    if (row.userId === userId) return { createdAt: row.createdAt, lastUsedAt: row.lastUsedAt };
  }
  return null;
}

export async function revokeMcpKey(userId: string) {
  for (const [hash, row] of memoryKeys) if (row.userId === userId) memoryKeys.delete(hash);
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("academy_mcp_keys").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
  }
}

// One key per student: creating a new key replaces the old one.
export async function createMcpKey(userId: string): Promise<string> {
  await revokeMcpKey(userId);
  const key = KEY_PREFIX + randomBytes(32).toString("base64url");
  const createdAt = new Date().toISOString();
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("academy_mcp_keys")
      .insert({ user_id: userId, key_hash: hashKey(key), created_at: createdAt });
    if (error) throw new Error(error.message);
  } else {
    memoryKeys.set(hashKey(key), { userId, createdAt, lastUsedAt: null });
  }
  return key;
}

export async function resolveMcpKey(key: string): Promise<string | null> {
  if (!key.startsWith(KEY_PREFIX)) return null;
  const hash = hashKey(key);
  const now = new Date().toISOString();
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("academy_mcp_keys").select("user_id").eq("key_hash", hash).maybeSingle();
    if (!data) return null;
    await supabaseAdmin.from("academy_mcp_keys").update({ last_used_at: now }).eq("key_hash", hash);
    return data.user_id as string;
  }
  const row = memoryKeys.get(hash);
  if (!row) return null;
  row.lastUsedAt = now;
  return row.userId;
}

// Hosted-lab keys. Separate from the MCP key so a hosted lab never revokes the
// student's Claude connection. A lab key can only upload lab snapshots.
const LAB_KEY_PREFIX = "pvl_";
const memoryLabKeys = new Map<string, string>();

export async function createLabKey(userId: string): Promise<string> {
  const key = LAB_KEY_PREFIX + randomBytes(32).toString("base64url");
  for (const [hash, id] of memoryLabKeys) if (id === userId) memoryLabKeys.delete(hash);
  memoryLabKeys.set(hashKey(key), userId);
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("academy_lab_keys")
      .upsert({ user_id: userId, key_hash: hashKey(key), created_at: new Date().toISOString(), last_used_at: null });
    if (error) throw new Error(error.message);
  }
  return key;
}

/** The student a lab-sync key belongs to: a hosted-lab key, or the MCP key a self-hosted lab uses. */
export async function resolveLabKey(key: string): Promise<string | null> {
  if (!key.startsWith(LAB_KEY_PREFIX)) return resolveMcpKey(key);
  const hash = hashKey(key);
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("academy_lab_keys").select("user_id").eq("key_hash", hash).maybeSingle();
    if (data) {
      await supabaseAdmin.from("academy_lab_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", hash);
      return data.user_id as string;
    }
  }
  return memoryLabKeys.get(hash) ?? null;
}

// Each student's hosted lab pod: the domain controller, the Ubuntu server beside
// it, their encrypted sign-in passwords, the pod slot that decides which
// security group isolates them, and when the pod stops on its own.
//
// linuxInstanceId is null for a pod built before the Ubuntu server existed, and
// for one whose Ubuntu machine failed to launch. Everything that touches it
// checks first, so a pod with only a domain controller keeps working.
export type HostedLabRow = {
  instanceId: string;
  passwordEnc: string;
  stopAt: string | null;
  createdAt: string;
  /** Last write to this row, which is when the session in hand began: a start
   *  and an extend both write it, and nothing else touches the row until the
   *  lab stops. Lab hours are counted from it. */
  updatedAt: string;
  linuxInstanceId: string | null;
  linuxPasswordEnc: string | null;
  podSlot: number | null;
};
const memoryHosted = new Map<string, HostedLabRow>();

/** One place that turns a database row into a HostedLabRow, so a new column does
 *  not have to be remembered in each of the four reads below. */
function hostedRow(d: Record<string, unknown>): HostedLabRow {
  return {
    instanceId: d.instance_id as string,
    passwordEnc: d.password_enc as string,
    stopAt: (d.stop_at as string | null) ?? null,
    createdAt: d.created_at as string,
    updatedAt: (d.updated_at as string | null) ?? (d.created_at as string),
    linuxInstanceId: (d.linux_instance_id as string | null) ?? null,
    linuxPasswordEnc: (d.linux_password_enc as string | null) ?? null,
    podSlot: d.pod_slot === null || d.pod_slot === undefined ? null : Number(d.pod_slot),
  };
}

export async function loadHostedLab(userId: string): Promise<HostedLabRow | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_hosted_labs").select("*").eq("user_id", userId).maybeSingle();
    if (!error && data) return hostedRow(data);
    if (error) console.error("academy_hosted_labs read failed", error.message);
  }
  return memoryHosted.get(userId) ?? null;
}

export async function saveHostedLab(userId: string, row: HostedLabRow) {
  memoryHosted.set(userId, row);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_hosted_labs").upsert({
    user_id: userId,
    instance_id: row.instanceId,
    password_enc: row.passwordEnc,
    stop_at: row.stopAt,
    created_at: row.createdAt,
    linux_instance_id: row.linuxInstanceId,
    linux_password_enc: row.linuxPasswordEnc,
    pod_slot: row.podSlot,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

/**
 * Ends the session by clearing its stop time, and only if that time is still
 * the one the caller read. Returns whether this call is the one that cleared
 * it, which is what gives it the right to hand the unused hours back.
 *
 * The refund has to ride on a claim like this. Two stops fired together both
 * read the same stop time and both refunded what was left of it, so a student
 * could give themselves back more hours than the session ever cost.
 */
export async function claimLabSessionEnd(userId: string, stopAt: string | null): Promise<boolean> {
  if (!stopAt) return false;
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_hosted_labs")
      .update({ stop_at: null, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("stop_at", stopAt)
      .select("user_id");
    // No refund on a failed claim: losing one is a student's hours back late,
    // paying one twice is a month of lab nobody is charged for.
    if (error) {
      console.error("academy_hosted_labs session end failed", error.code, error.message);
      return false;
    }
    if (!(data ?? []).length) return false;
    const cached = memoryHosted.get(userId);
    if (cached) memoryHosted.set(userId, { ...cached, stopAt: null });
    return true;
  }
  const row = memoryHosted.get(userId);
  if (!row || row.stopAt !== stopAt) return false;
  memoryHosted.set(userId, { ...row, stopAt: null });
  return true;
}

export async function deleteHostedLab(userId: string) {
  memoryHosted.delete(userId);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_hosted_labs").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
}

/** Labs whose stop time has passed, for the auto-stop job. */
export async function hostedLabsDueToStop(now = new Date()): Promise<{ userId: string; row: HostedLabRow }[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_hosted_labs").select("*").lte("stop_at", now.toISOString());
    if (!error && data) return data.map((d) => ({ userId: d.user_id, row: hostedRow(d) }));
    if (error) console.error("academy_hosted_labs due read failed", error.message);
  }
  return [...memoryHosted.entries()].filter(([, r]) => r.stopAt && Date.parse(r.stopAt) <= now.getTime()).map(([userId, row]) => ({ userId, row }));
}

/** Labs nobody has touched since `before`, for the idle-reclaim job. The memory
 *  fallback keeps no timestamp, so it never reports one -- reclaiming is a cost
 *  job, and skipping it without a database is safer than guessing. */
export async function hostedLabsIdleSince(before: Date): Promise<{ userId: string; row: HostedLabRow }[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("academy_hosted_labs").select("*").lt("updated_at", before.toISOString());
  if (error) {
    console.error("academy_hosted_labs idle read failed", error.message);
    return [];
  }
  return (data ?? []).map((d) => ({ userId: d.user_id, row: hostedRow(d) }));
}

/**
 * Labs with no session running against them.
 *
 * stopAt is the end of the session a student paid for, and it is null once a
 * lab has been stopped. Both safety nets key off it -- the idle stop refuses
 * a row without one, and the due sweep asks for stop_at <= now, which a NULL
 * never matches. So a machine that is somehow up with no session is invisible
 * to both and runs until somebody notices the bill. That happens when a stop
 * half fails, or when a pod is started outside the app.
 */
export async function hostedLabsWithNoSession(): Promise<{ userId: string; row: HostedLabRow }[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("academy_hosted_labs").select("*").is("stop_at", null);
  if (error) {
    console.error("academy_hosted_labs orphan read failed", error.message);
    return [];
  }
  return (data ?? []).map((d) => ({ userId: d.user_id, row: hostedRow(d) }));
}

/** Marks a reserved-but-not-yet-built pod. Overwritten seconds later with the
 *  real instance ids; if the launch dies first, the next Start reuses the slot. */
export const POD_RESERVED = "reserved";

/**
 * Takes the lowest free pod slot for a student and holds it.
 *
 * The slot decides which security group the student's two machines share, and
 * two students must never land in the same one -- that would let each reach the
 * other's domain controller. A unique index on pod_slot is what actually
 * guarantees it: two students pressing Start at the same moment both compute the
 * same lowest free slot, the second insert is rejected, and it tries the next.
 *
 * Returns null when every slot is taken; the caller turns that into "no room
 * right now" rather than putting two students in one group. Without a database
 * (local development) the student's own row is the only one, so slot 0 is safe.
 */
/** The slot table could not be read at all, which is a fault on our side and
 *  not a full pool. Most often academy.sql has not been run since pods landed. */
export class PodSlotsUnreadableError extends Error {
  constructor(detail: string) {
    super("Range is missing a database update and cannot build a lab right now. Email support@purvex.io.");
    this.name = "PodSlotsUnreadableError";
    this.cause = detail;
  }
}

export async function claimPodSlot(userId: string, slots: number): Promise<number | null> {
  if (slots <= 0) return null;
  if (!supabaseAdmin) return 0;

  for (let attempt = 0; attempt < 5; attempt++) {
    // Holding the claim takes a row, and this student may already have one. Read
    // the two not-null columns along with the slots so the claim can put them
    // back unchanged: reading them from the in-memory copy instead would wipe a
    // real instance id on any server that had not handled this student yet.
    const { data, error } = await supabaseAdmin.from("academy_hosted_labs").select("user_id, pod_slot, instance_id, password_enc");
    // Returning null here used to be indistinguishable from "every slot is
    // taken", so an unrun migration told students to wait for a free slot that
    // was never coming. 42703 is the column not existing.
    if (error) {
      console.error("pod slot read failed", error.code, error.message);
      throw new PodSlotsUnreadableError(error.message);
    }
    const mine = (data ?? []).find((d) => d.user_id === userId);
    // Already holding one: keep it, so a reset lands the student back in the
    // same group instead of leaking a slot every time they rebuild.
    if (mine?.pod_slot !== null && mine?.pod_slot !== undefined) return Number(mine.pod_slot);

    const taken = new Set((data ?? []).map((d) => d.pod_slot).filter((v) => v !== null).map(Number));
    let slot = -1;
    for (let i = 0; i < slots; i++) {
      if (!taken.has(i)) {
        slot = i;
        break;
      }
    }
    if (slot < 0) return null;

    const { error: claimError } = await supabaseAdmin.from("academy_hosted_labs").upsert({
      user_id: userId,
      instance_id: mine?.instance_id ?? POD_RESERVED,
      password_enc: mine?.password_enc ?? POD_RESERVED,
      pod_slot: slot,
      updated_at: new Date().toISOString(),
    });
    // A unique-violation means someone else took this slot in the meantime.
    if (!claimError) return slot;
    if (claimError.code !== "23505") {
      console.error("pod slot claim failed", claimError.message);
      return null;
    }
  }
  console.error("pod slot claim gave up after five collisions");
  return null;
}

// Lab minutes used this calendar month, so one student cannot run the cloud
// bill up without limit. Its own table rather than another row in
// academy_coach_usage, whose `day` is a real date -- a month key written there
// would collide with the coach's own count on the first of every month.
const memoryLabMinutes = new Map<string, { month: string; minutes: number }>();

/**
 * The window lab hours are counted in: an ISO week, UTC, so it turns over at
 * midnight UTC on Monday. The usage table's key column is still called `month`
 * from when this was a calendar month; the value is what changed, and a row
 * from the old scheme simply stops being read.
 */
export const usageWindow = (d = new Date()) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // ISO weeks belong to the year holding their Thursday.
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7) + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
  const week = 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

/** Midnight UTC on the Monday that refills the week. */
export const usageResetsAt = (d = new Date()) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + (7 - ((t.getUTCDay() + 6) % 7)));
  return t.toISOString();
};

/** The month's lab minutes could not be read. Charging a session against a
 *  number we do not have either bills a student twice or hands out free hours,
 *  so every caller stops here rather than carrying on with a guess. */
export class LabUsageUnreadableError extends Error {
  constructor(detail: string) {
    super("Range cannot read your lab hours right now. Try again in a minute, or email support@purvex.io.");
    this.name = "LabUsageUnreadableError";
    this.cause = detail;
  }
}

/** PostgREST cannot find the function, or Postgres does not have it: academy.sql
 *  has not been run on this database yet. */
export async function readLabMinutes(userId: string, month = usageWindow()): Promise<number> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_lab_usage")
      .select("minutes")
      .eq("user_id", userId)
      .eq("month", month)
      .maybeSingle();
    // A failed read used to answer 0, and the write behind it then stored
    // 0 + the new charge: one blip erased everything the student had spent
    // this month. The month is now either read or not answered at all.
    if (error) {
      console.error("academy_lab_usage read failed", error.code, error.message);
      throw new LabUsageUnreadableError(error.message);
    }
    return typeof data?.minutes === "number" ? data.minutes : 0;
  }
  const row = memoryLabMinutes.get(userId);
  return row && row.month === month ? row.minutes : 0;
}

export async function addLabMinutes(userId: string, minutes: number, month = usageWindow()): Promise<number> {
  // Negative minutes give a session back when the start it paid for failed, or
  // hand back the part of one that was never used.
  const delta = Math.round(minutes);
  if (supabaseAdmin) {
    // Postgres does the arithmetic in one statement, so a charge and a refund
    // landing together cannot overwrite each other. Read-add-write from here
    // lost whichever of the two wrote first.
    const { data, error } = await supabaseAdmin.rpc("academy_add_lab_minutes", { p_user: userId, p_month: month, p_minutes: delta });
    if (!error && typeof data === "number") {
      memoryLabMinutes.set(userId, { month, minutes: data });
      return data;
    }
    if (error && !missingFunction(error.code)) {
      console.error("academy_lab_usage add failed", error.code, error.message);
      throw new LabUsageUnreadableError(error.message);
    }
    // The function is not there yet. Falling back keeps starts working on a
    // database that has not had academy.sql run, which is the lesser problem:
    // this is the racy path, not the one to stay on.
    console.error("academy_add_lab_minutes is missing -- run academy.sql");
  }
  // Clamped so a refund can never leave a student with a negative month.
  const next = Math.max(0, (await readLabMinutes(userId, month)) + delta);
  memoryLabMinutes.set(userId, { month, minutes: next });
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("academy_lab_usage").upsert({
      user_id: userId,
      month,
      minutes: next,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("academy_lab_usage upsert failed", error.code, error.message);
      throw new LabUsageUnreadableError(error.message);
    }
  }
  return next;
}

// The student's running Shift, while it is on. One row per student, replaced
// each shift. Cleared when the shift is graded (the result lands in the drill log).
const memoryShift = new Map<string, ShiftRun>();

export async function loadShift(userId: string): Promise<ShiftRun | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_shift").select("run").eq("user_id", userId).maybeSingle();
    if (!error && data?.run) return data.run as ShiftRun;
    if (error) console.error("academy_shift read failed", error.message);
  }
  return memoryShift.get(userId) ?? null;
}

export async function saveShift(userId: string, run: ShiftRun) {
  memoryShift.set(userId, run);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_shift").upsert({ user_id: userId, run, updated_at: new Date().toISOString() });
  if (error) console.error("academy_shift upsert failed", error.message);
}

export async function clearShift(userId: string) {
  memoryShift.delete(userId);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_shift").delete().eq("user_id", userId);
  if (error) console.error("academy_shift delete failed", error.message);
}

// Drill history: one row per finished drill, newest last. The daily drill
// keeps its first result for the day; a timed run is always its own row.
// Every value EntryMode allows. A mode missing from this list does not fail
// loudly, it falls through to "daily" below -- and "shift" was missing, so
// every shift a student finished came back out of the database as that day's
// daily drill. It took their drill, titled itself after its first incident,
// joined their streak, and because buildWorkItems asks for mode === "shift"
// to credit shift work, no incident resolved in a shift has ever reached a
// portfolio. The six jobs the portfolio locks behind a live shift could not
// be earned at all.
const MODES = ["daily", "timed", "ctf", "coach", "shift"] as const;
// And the compiler now says so. Without this the list and the type drift in
// silence: the type is what the code believes, the list is what survives a
// round trip through the database, and only the second one is load bearing.
const MODE_COVERAGE: Record<EntryMode, true> = { daily: true, timed: true, ctf: true, coach: true, shift: true };
void MODE_COVERAGE;

// Databases that have not run the level/detail migration keep the question
// detail inside the misses column, so missed questions are never lost.
type Packed = { skills: DrillEntry["misses"]; level: number; detail: DrillEntry["detail"] };

function toEntry(r: Record<string, unknown>): DrillEntry {
  const mode = MODES.find((m) => m === r.mode) ?? "daily";
  const packed =
    r.misses && typeof r.misses === "object" && !Array.isArray(r.misses) ? (r.misses as unknown as Packed) : null;
  return {
    id: String(r.drill_id),
    day: String(r.day),
    mode,
    correct: Number(r.correct) || 0,
    total: Number(r.total) || 0,
    seconds: Number(r.seconds) || 0,
    misses: Array.isArray(r.misses) ? (r.misses as DrillEntry["misses"]) : packed?.skills ?? [],
    at: String(r.created_at),
    level: Math.min(4, Math.max(1, Number(r.level) || packed?.level || 1)),
    detail: Array.isArray(r.detail) && r.detail.length ? (r.detail as DrillEntry["detail"]) : packed?.detail ?? [],
  };
}

export async function loadDrills(userId: string): Promise<DrillEntry[]> {
  if (supabaseAdmin) {
    const base = "drill_id, day, mode, correct, total, seconds, misses, created_at";
    const read = (cols: string) =>
      supabaseAdmin!
        .from("academy_drill_log")
        .select(cols)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200);
    let res = await read(`${base}, level, detail`);
    // Older databases have not run the level/detail migration yet.
    if (res.error) res = await read(base);
    if (!res.error && res.data) return (res.data as unknown as Record<string, unknown>[]).map(toEntry);
    if (res.error) console.error("academy_drill_log read failed", res.error.message);
  }
  return memoryDrills.get(userId) ?? [];
}

export async function saveDrill(userId: string, entry: DrillEntry) {
  const rows = memoryDrills.get(userId) ?? [];
  if (!rows.some((r) => r.id === entry.id)) memoryDrills.set(userId, [...rows, entry]);
  if (!supabaseAdmin) return;
  const row = {
    user_id: userId,
    drill_id: entry.id,
    day: entry.day,
    mode: entry.mode,
    correct: entry.correct,
    total: entry.total,
    seconds: entry.seconds,
    misses: entry.misses,
    created_at: entry.at,
  };
  const opts = { onConflict: "user_id,drill_id", ignoreDuplicates: true };
  let { error } = await supabaseAdmin.from("academy_drill_log").upsert({ ...row, level: entry.level, detail: entry.detail }, opts);
  if (error) {
    const packed: Packed = { skills: entry.misses, level: entry.level, detail: entry.detail };
    ({ error } = await supabaseAdmin.from("academy_drill_log").upsert({ ...row, misses: packed }, opts));
  }
  if (error) console.error("academy_drill_log upsert failed", error.message);
}

// A saved AI-written scenario (today's daily, or this week's CTF), kept as
// the sealed drill token so the same question comes back on reload and
// answers never sit in plain text.
export async function loadDailyDrill(userId: string, day: string, kind: "daily" | "ctf" = "daily"): Promise<string | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_drill_daily")
      .select("token")
      .eq("user_id", userId)
      .eq("day", day)
      .eq("kind", kind)
      .maybeSingle();
    if (!error && data?.token) return data.token as string;
  }
  return memoryDaily.get(`${userId}:${kind}:${day}`) ?? null;
}

export async function saveDailyDrill(userId: string, day: string, token: string, kind: "daily" | "ctf" = "daily", overwrite = false) {
  memoryDaily.set(`${userId}:${kind}:${day}`, token);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from("academy_drill_daily")
    .upsert({ user_id: userId, day, kind, token }, { onConflict: "user_id,day,kind", ignoreDuplicates: !overwrite });
  if (error) console.error("academy_drill_daily upsert failed", error.message);
}

// The student's goals from the intake: certifications, target roles, and
// where they are starting from.
export async function loadProfile(userId: string): Promise<StudentProfile | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_profiles")
      .select("certs, other_certs, roles, start_level, background, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (!error && data) {
      return sanitizeProfile({
        certs: data.certs,
        otherCerts: data.other_certs,
        roles: data.roles,
        start: data.start_level,
        background: data.background,
        updatedAt: data.updated_at,
      });
    }
    if (error) console.error("academy_profiles read failed", error.message);
  }
  return memoryProfiles.get(userId) ?? null;
}

export async function saveProfile(userId: string, profile: StudentProfile): Promise<boolean> {
  memoryProfiles.set(userId, profile);
  if (!supabaseAdmin) return true;
  const { error } = await supabaseAdmin.from("academy_profiles").upsert({
    user_id: userId,
    certs: profile.certs,
    other_certs: profile.otherCerts,
    roles: profile.roles,
    start_level: profile.start,
    background: profile.background,
    updated_at: profile.updatedAt,
  });
  if (error) console.error("academy_profiles upsert failed", error.message);
  return !error;
}

// Where the student is in the Academy right now. One row per student, overwritten on each report.
export async function loadActivity(userId: string): Promise<StudentActivity | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_activity").select("place, updated_at").eq("user_id", userId).maybeSingle();
    const place = sanitizeActivityPlace(data?.place);
    if (!error && data && place) return { place, updatedAt: data.updated_at };
    // Until academy.sql adds the table, what this server instance saw stands in.
  }
  return memoryActivity.get(userId) ?? null;
}

export async function saveActivity(userId: string, place: ActivityPlace) {
  const updatedAt = new Date().toISOString();
  memoryActivity.set(userId, { place, updatedAt });
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_activity").upsert({ user_id: userId, place, updated_at: updatedAt });
  if (error) console.error("academy_activity upsert failed", error.message);
}

// One researched summary per target role, shared by every student.
export async function loadRoleBrief(role: RoleId): Promise<RoleBrief | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_role_briefs").select("brief").eq("role", role).maybeSingle();
    if (!error && data?.brief) return data.brief as RoleBrief;
    if (error) console.error("academy_role_briefs read failed", error.message);
  }
  return memoryRoleBriefs.get(role) ?? null;
}

export async function saveRoleBrief(brief: RoleBrief) {
  memoryRoleBriefs.set(brief.role, brief);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from("academy_role_briefs")
    .upsert({ role: brief.role, brief, researched_at: brief.researchedAt });
  if (error) console.error("academy_role_briefs upsert failed", error.message);
}

// Help requests sent from Range. Stored before the email goes out, so a failed
// send still leaves a record, and counted to keep one student from flooding the inbox.
export type HelpRequest = { topic: string; message: string; context: Record<string, unknown>; emailed: boolean };
const memoryHelp = new Map<string, string[]>();

export async function countHelpRequestsSince(userId: string, since: Date): Promise<number> {
  if (supabaseAdmin) {
    const { count, error } = await supabaseAdmin
      .from("academy_help_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since.toISOString());
    if (!error && count !== null) return count;
  }
  return (memoryHelp.get(userId) ?? []).filter((at) => Date.parse(at) >= since.getTime()).length;
}

export async function saveHelpRequest(userId: string, req: HelpRequest) {
  const at = new Date().toISOString();
  memoryHelp.set(userId, [...(memoryHelp.get(userId) ?? []), at].slice(-20));
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from("academy_help_requests")
    .insert({ user_id: userId, topic: req.topic, message: req.message, context: req.context, emailed: req.emailed, created_at: at });
  if (error) console.error("academy_help_requests insert failed", error.message);
}
