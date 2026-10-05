import "server-only";
import { createHash, randomBytes } from "crypto";
import { sanitizeActivityPlace, type ActivityPlace, type StudentActivity } from "@/lib/academy-activity";
import type { ShiftRun } from "@/lib/academy-shift";
import { sanitizeProfile, type RoleBrief, type RoleId, type StudentProfile } from "@/lib/academy-certs";
import type { DrillEntry } from "@/lib/academy-drills";
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

export async function bumpUsage(userId: string, current: number, day = todayStamp()): Promise<number> {
  const next = current + 1;
  memoryUsage.set(userId, { day, count: next });
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("academy_coach_usage").upsert({
      user_id: userId,
      day,
      count: next,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("academy_coach_usage upsert failed", error.message);
  }
  return next;
}

/** Coach questions asked inside one browser lab today. */
export async function readLabCoachUsage(userId: string, lab: string, day = todayStamp()): Promise<number> {
  const key = `${userId}|${lab}`;
  const row = memoryLabCoach.get(key);
  const local = row && row.day === day ? row.count : 0;
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_lab_coach_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("day", day)
      .eq("lab", lab)
      .maybeSingle();
    // Until academy.sql adds the table, the per-process count stands in.
    if (!error && typeof data?.count === "number") return Math.max(data.count, local);
  }
  return local;
}

export async function bumpLabCoachUsage(userId: string, lab: string, current: number, day = todayStamp()): Promise<number> {
  const next = current + 1;
  memoryLabCoach.set(`${userId}|${lab}`, { day, count: next });
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("academy_lab_coach_usage")
      .upsert({ user_id: userId, day, lab, count: next, updated_at: new Date().toISOString() });
    if (error) console.error("academy_lab_coach_usage upsert failed", error.message);
  }
  return next;
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
export async function claimPodSlot(userId: string, slots: number): Promise<number | null> {
  if (slots <= 0) return null;
  if (!supabaseAdmin) return 0;

  for (let attempt = 0; attempt < 5; attempt++) {
    // Holding the claim takes a row, and this student may already have one. Read
    // the two not-null columns along with the slots so the claim can put them
    // back unchanged: reading them from the in-memory copy instead would wipe a
    // real instance id on any server that had not handled this student yet.
    const { data, error } = await supabaseAdmin.from("academy_hosted_labs").select("user_id, pod_slot, instance_id, password_enc");
    if (error) {
      console.error("pod slot read failed", error.message);
      return null;
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

export const monthStamp = (d = new Date()) => d.toISOString().slice(0, 7);

export async function readLabMinutes(userId: string, month = monthStamp()): Promise<number> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_lab_usage")
      .select("minutes")
      .eq("user_id", userId)
      .eq("month", month)
      .maybeSingle();
    if (!error && typeof data?.minutes === "number") return data.minutes;
    if (error) console.error("academy_lab_usage read failed", error.message);
  }
  const row = memoryLabMinutes.get(userId);
  return row && row.month === month ? row.minutes : 0;
}

export async function addLabMinutes(userId: string, minutes: number, month = monthStamp()): Promise<number> {
  const next = (await readLabMinutes(userId, month)) + minutes;
  memoryLabMinutes.set(userId, { month, minutes: next });
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("academy_lab_usage").upsert({
      user_id: userId,
      month,
      minutes: next,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("academy_lab_usage upsert failed", error.message);
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
const MODES = ["daily", "timed", "ctf", "coach"] as const;

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
