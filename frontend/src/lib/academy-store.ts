import "server-only";
import { createHash, randomBytes } from "crypto";
import type { DrillEntry } from "@/lib/academy-drills";
import { weekStart } from "@/lib/academy-drills";
import { sanitizeLabSnapshot, type LabSnapshot } from "@/lib/academy-lab";
import { sanitizeResults, type Results } from "@/lib/academy-score";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Supabase when the service role is configured; per-process memory
// otherwise, so local dev works before academy.sql has been run.
const memoryProgress = new Map<string, Results>();
const memoryUsage = new Map<string, { day: string; count: number }>();
const memoryKeys = new Map<string, { userId: string; createdAt: string; lastUsedAt: string | null }>();
const memoryDaily = new Map<string, string>();
const memoryDrills = new Map<string, DrillEntry[]>();
const memoryLab = new Map<string, { snapshot: LabSnapshot; uploadedAt: string }>();

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function loadProgress(userId: string): Promise<Results> {
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("academy_progress").select("results").eq("user_id", userId).maybeSingle();
    return sanitizeResults(data?.results);
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

export async function readUsage(userId: string): Promise<number> {
  const day = todayStamp();
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

export async function resetUsage(userId: string) {
  const day = todayStamp();
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

export async function bumpUsage(userId: string, current: number): Promise<number> {
  const day = todayStamp();
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

// The one thing the student's own domain controller can pick up: this week's
// live CTF investigation. There is one job per student per week, and a job from
// an earlier week is never handed out. The lab script pulls it; nothing is pushed.
export type LabJobType = "investigation";
export type LabJobStatus = "queued" | "sent" | "done" | "failed";
export type InvestigationAccount = { sam: string; name: string; dept: string; groups: string[]; failures: number; success: boolean };
export type LabJob = {
  id: string;
  type: LabJobType;
  /** Monday of the CTF week this job belongs to. */
  week: string;
  params: { accounts: InvestigationAccount[] };
  status: LabJobStatus;
  createdAt: string;
  result?: string;
};

const memoryJobs = new Map<string, LabJob[]>();
const JOB_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function toJob(r: Record<string, unknown>): LabJob {
  return {
    id: String(r.id),
    type: "investigation",
    week: String(r.week ?? ""),
    params: (r.params as LabJob["params"]) ?? { accounts: [] },
    status: (["queued", "sent", "done", "failed"] as const).find((x) => x === r.status) ?? "queued",
    createdAt: String(r.created_at),
    result: typeof r.result === "string" ? r.result : undefined,
  };
}

/** Queue this week's investigation. Returns null if the database refused it, so the caller can fall back. */
export async function queueLabJob(
  userId: string,
  job: { id: string; type: LabJobType; week: string; params: LabJob["params"] }
): Promise<LabJob | null> {
  const row: LabJob = { ...job, status: "queued", createdAt: new Date().toISOString() };
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("academy_lab_jobs")
      .insert({ id: job.id, user_id: userId, type: job.type, week: job.week, params: job.params, status: "queued", created_at: row.createdAt });
    if (error) {
      console.error("academy_lab_jobs insert failed", error.message);
      return null;
    }
  }
  memoryJobs.set(userId, [...(memoryJobs.get(userId) ?? []), row]);
  return row;
}

export async function getLabJob(userId: string, id: string): Promise<LabJob | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_lab_jobs")
      .select("id, type, week, params, status, result, created_at")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();
    if (!error && data) return toJob(data as Record<string, unknown>);
  }
  return (memoryJobs.get(userId) ?? []).find((j) => j.id === id) ?? null;
}

/** Hand this week's queued investigation to the student's lab script, once. Older jobs are dropped. */
export async function claimLabJobs(userId: string): Promise<LabJob[]> {
  const fresh = new Date(Date.now() - JOB_MAX_AGE_MS).toISOString();
  const week = weekStart(new Date().toISOString().slice(0, 10));
  let claimed: LabJob[] = [];
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_lab_jobs")
      .select("id, type, week, params, status, result, created_at")
      .eq("user_id", userId)
      .eq("status", "queued")
      .eq("week", week)
      .gte("created_at", fresh)
      .order("created_at", { ascending: true })
      .limit(3);
    if (!error && data?.length) {
      claimed = data.map((r) => toJob(r as Record<string, unknown>));
      await supabaseAdmin.from("academy_lab_jobs").update({ status: "sent", sent_at: new Date().toISOString() }).in("id", claimed.map((j) => j.id));
    }
  }
  const mem = memoryJobs.get(userId) ?? [];
  const local = mem.filter((j) => j.status === "queued" && j.week === week && j.createdAt >= fresh).slice(0, 3);
  for (const j of local) j.status = "sent";
  const seen = new Set(claimed.map((j) => j.id));
  return [...claimed, ...local.filter((j) => !seen.has(j.id))].slice(0, 3);
}

export async function finishLabJob(userId: string, id: string, status: "done" | "failed", result: string) {
  const text = result.slice(0, 300);
  for (const j of memoryJobs.get(userId) ?? []) if (j.id === id) Object.assign(j, { status, result: text });
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from("academy_lab_jobs")
    .update({ status, result: text, done_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", id);
  if (error) console.error("academy_lab_jobs update failed", error.message);
}
