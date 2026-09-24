import "server-only";
import { createHash, randomBytes } from "crypto";
import type { DrillEntry } from "@/lib/academy-drills";
import { sanitizeLabSnapshot, type LabSnapshot } from "@/lib/academy-lab";
import { sanitizeResults, type Results } from "@/lib/academy-score";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Supabase when the service role is configured; per-process memory
// otherwise, so local dev works before academy.sql has been run.
const memoryProgress = new Map<string, Results>();
const memoryUsage = new Map<string, { day: string; count: number }>();
const memoryKeys = new Map<string, { userId: string; createdAt: string; lastUsedAt: string | null }>();
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
export async function loadDrills(userId: string): Promise<DrillEntry[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_drill_log")
      .select("drill_id, day, mode, correct, total, seconds, misses, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) {
      return data.map((r) => ({
        id: r.drill_id as string,
        day: String(r.day),
        mode: r.mode === "timed" ? "timed" : "daily",
        correct: Number(r.correct) || 0,
        total: Number(r.total) || 0,
        seconds: Number(r.seconds) || 0,
        misses: Array.isArray(r.misses) ? (r.misses as DrillEntry["misses"]) : [],
        at: String(r.created_at),
      }));
    }
    if (error) console.error("academy_drill_log read failed", error.message);
  }
  return memoryDrills.get(userId) ?? [];
}

export async function saveDrill(userId: string, entry: DrillEntry) {
  const rows = memoryDrills.get(userId) ?? [];
  if (!rows.some((r) => r.id === entry.id)) memoryDrills.set(userId, [...rows, entry]);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("academy_drill_log").upsert(
    {
      user_id: userId,
      drill_id: entry.id,
      day: entry.day,
      mode: entry.mode,
      correct: entry.correct,
      total: entry.total,
      seconds: entry.seconds,
      misses: entry.misses,
      created_at: entry.at,
    },
    { onConflict: "user_id,drill_id", ignoreDuplicates: true }
  );
  if (error) console.error("academy_drill_log upsert failed", error.message);
}
