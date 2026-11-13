import "server-only";
import { randomUUID } from "crypto";
import { CHALLENGE_PATHS, MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import type { Results } from "@/lib/academy-score";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CLIP_MAX_BYTES, CLIP_MAX_SECONDS } from "@/lib/academy-clip-limits";

// Verified challenge clips. A student records a challenge in the browser and,
// once every question in it is solved, may add the recording to their Proof
// Profile. Solves are written by the server alone (mission-answer), so the
// verification here cannot be faked from the page. The video goes straight
// from the browser to the private proof-clips bucket through a signed upload
// URL: it is far larger than the 4.5 MB a Vercel request can carry.

export type ChallengeKey = MissionCatalogEntry["challenge"];
export type ChallengeClip = {
  id: string;
  challenge: ChallengeKey;
  path: string;
  sizeBytes: number;
  durationSec: number;
  recordedAt: string | null;
  solvedAt: string | null;
  status: "pending" | "ready";
  /** The still frame shown before the clip plays, once it has arrived. */
  posterPath: string | null;
  createdAt: string;
};

const BUCKET = "proof-clips";
const TABLE = "academy_challenge_clips";
/** How long a playback link works. Long enough to watch and scrub a 15-minute clip. */
const PLAY_SECONDS = 4 * 60 * 60;

export const isChallengeKey = (v: unknown): v is ChallengeKey => typeof v === "string" && Object.hasOwn(CHALLENGE_PATHS, v);

/** When the student finished the challenge: the latest solve among its questions. Null while any is open. */
export function challengeSolvedAt(results: Results, challenge: ChallengeKey): string | null {
  const ids = Object.values(MISSION_CATALOG).filter((m) => m.challenge === challenge).map((m) => m.id);
  if (!ids.length || !ids.every((id) => results[id]?.solved)) return null;
  const times = ids.map((id) => results[id]?.at ?? "").filter(Boolean).sort();
  return times[times.length - 1] ?? new Date().toISOString();
}

/** How many of the challenge's questions are still open, and how many it has in all. */
export function challengeRemaining(results: Results, challenge: ChallengeKey): { left: number; total: number } {
  const ids = Object.values(MISSION_CATALOG).filter((m) => m.challenge === challenge).map((m) => m.id);
  return { left: ids.filter((id) => !results[id]?.solved).length, total: ids.length };
}

function fromRow(r: Record<string, unknown>): ChallengeClip {
  return {
    id: String(r.id),
    challenge: String(r.challenge) as ChallengeKey,
    path: String(r.path),
    sizeBytes: Number(r.size_bytes) || 0,
    durationSec: Number(r.duration_sec) || 0,
    recordedAt: typeof r.recorded_at === "string" ? r.recorded_at : null,
    solvedAt: typeof r.solved_at === "string" ? r.solved_at : null,
    status: r.status === "ready" ? "ready" : "pending",
    posterPath: typeof r.poster_path === "string" ? r.poster_path : null,
    createdAt: String(r.created_at ?? ""),
  };
}

const posterPathFor = (videoPath: string) => videoPath.replace(/\.webm$/, ".jpg");

export const clipsAvailable = () => Boolean(supabaseAdmin);

export async function listClips(userId: string, readyOnly = false): Promise<ChallengeClip[]> {
  if (!supabaseAdmin) return [];
  let q = supabaseAdmin.from(TABLE).select("*").eq("user_id", userId).order("created_at", { ascending: true });
  if (readyOnly) q = q.eq("status", "ready");
  const { data, error } = await q;
  if (error) {
    // Before academy.sql adds the table, a profile simply has no clips.
    if (!/does not exist|schema cache/i.test(error.message)) console.error(`${TABLE} read failed`, error.message);
    return [];
  }
  return (data ?? []).map(fromRow);
}

/** Reserves a clip and returns where the browser uploads it. */
export async function startClip(
  userId: string,
  challenge: ChallengeKey,
  sizeBytes: number,
  durationSec: number,
  recordedAt: string | null,
  solvedAt: string
): Promise<{ id: string; uploadUrl: string; posterUploadUrl: string | null } | null> {
  if (!supabaseAdmin) return null;
  const id = randomUUID();
  const path = `${userId}/${challenge}-${id}.webm`;
  const { error } = await supabaseAdmin.from(TABLE).insert({
    id,
    user_id: userId,
    challenge,
    path,
    size_bytes: Math.min(sizeBytes, CLIP_MAX_BYTES),
    duration_sec: Math.max(0, Math.min(Math.round(durationSec), CLIP_MAX_SECONDS)),
    recorded_at: recordedAt,
    solved_at: solvedAt,
    status: "pending",
  });
  if (error) {
    console.error(`${TABLE} insert failed`, error.message);
    return null;
  }
  const signed = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (signed.error || !signed.data) {
    console.error("proof clip upload URL failed", signed.error?.message);
    await supabaseAdmin.from(TABLE).delete().eq("id", id);
    return null;
  }
  // The still frame is optional: a clip without one shows a plain dark frame.
  const poster = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(posterPathFor(path));
  return { id, uploadUrl: signed.data.signedUrl, posterUploadUrl: poster.data?.signedUrl ?? null };
}

/** Marks an uploaded clip live once the file is really there, and retires the challenge's older clip. */
export async function confirmClip(userId: string, id: string): Promise<ChallengeClip | null> {
  if (!supabaseAdmin) return null;
  const clips = await listClips(userId);
  const clip = clips.find((c) => c.id === id);
  if (!clip) return null;
  const name = clip.path.split("/").pop() ?? "";
  const { data: found } = await supabaseAdmin.storage.from(BUCKET).list(userId, { search: name, limit: 5 });
  const file = (found ?? []).find((f) => f.name === name);
  const size = Number((file?.metadata as { size?: number } | null)?.size ?? 0);
  if (!file || size <= 0 || size > CLIP_MAX_BYTES) return null;
  const posterName = posterPathFor(clip.path).split("/").pop() ?? "";
  const { data: posters } = await supabaseAdmin.storage.from(BUCKET).list(userId, { search: posterName, limit: 5 });
  const posterPath = (posters ?? []).some((f) => f.name === posterName) ? posterPathFor(clip.path) : null;
  const { error } = await supabaseAdmin.from(TABLE).update({ status: "ready", size_bytes: size, poster_path: posterPath }).eq("id", id).eq("user_id", userId);
  if (error) {
    console.error(`${TABLE} confirm failed`, error.message);
    return null;
  }
  for (const old of clips.filter((c) => c.challenge === clip.challenge && c.id !== id)) await removeClip(userId, old);
  return { ...clip, status: "ready", sizeBytes: size, posterPath };
}

async function removeClip(userId: string, clip: ChallengeClip) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from(TABLE).delete().eq("id", clip.id).eq("user_id", userId);
  await supabaseAdmin.storage.from(BUCKET).remove([clip.path, posterPathFor(clip.path)]);
}

export async function deleteClip(userId: string, id: string): Promise<boolean> {
  const clip = (await listClips(userId)).find((c) => c.id === id);
  if (!clip) return false;
  await removeClip(userId, clip);
  return true;
}

/** A short-lived link the video player can stream from, with seeking. */
export async function clipPlayUrl(clip: ChallengeClip, poster = false): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const path = poster ? clip.posterPath : clip.path;
  if (!path) return null;
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, PLAY_SECONDS);
  return error || !data ? null : data.signedUrl;
}
