import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Thumbs up or down on a Coach reply, and what we do with it.
//
// Three jobs, in order of how directly they pay off:
//  1. The student's next turns get corrected. Recent thumbs-down reasons turn
//     into one line of instruction on the system prompt, so the Coach stops
//     repeating the thing this student just marked wrong.
//  2. Every rated turn is kept with the exchange that earned it, so a bad
//     answer becomes a test case instead of disappearing.
//  3. The counts say whether a prompt or model change helped.
//
// SECURITY: the reason tags are a closed set and only their fixed `fix` text
// ever reaches the model. The free-text note is stored for a human to read and
// is never put in a prompt. A student types that box, so treating it as
// instructions would hand them the system prompt.

const DAY = 86_400_000;
/** How far back the correction line looks. Older misses are a different coach. */
const RECENT_DAYS = 14;
/** How many recent ratings feed the correction line. */
const RECENT_LIMIT = 40;
/** At most this many reasons go into one turn. More reads as noise. */
const MAX_NOTES = 3;

export type Rating = "up" | "down";

/** Why a reply was marked wrong. A closed set: the student picks, never types. */
export const FEEDBACK_TAGS = {
  long: { label: "Too long", fix: "Keep it short. Lead with the answer, then stop." },
  answer: { label: "Gave away the answer", fix: "Do not state the answer. Ask one question that gets them to it." },
  wrong: { label: "Wrong or made up", fix: "Say only what a tool returned. If you do not know, say so." },
  lab: { label: "Ignored my lab", fix: "Read their own lab with the tools before you answer." },
  missed: { label: "Missed what I asked", fix: "Answer the question they actually asked, first." },
  vague: { label: "Too vague", fix: "Be concrete. Name the screen, the field and the value to look at." },
} as const;

export type FeedbackTag = keyof typeof FEEDBACK_TAGS;
export const FEEDBACK_TAG_KEYS = Object.keys(FEEDBACK_TAGS) as FeedbackTag[];
const isTag = (v: unknown): v is FeedbackTag => typeof v === "string" && (FEEDBACK_TAG_KEYS as string[]).includes(v);

export type CoachFeedback = {
  turnId: string;
  rating: Rating;
  tags: FeedbackTag[];
  note: string | null;
  question: string;
  reply: string;
  model: string | null;
  mode: string | null;
  lab: string | null;
  at: string;
};

// ---- the receipt ----------------------------------------------------------
// What the Coach replied is sealed into a token the client holds and sends back
// with the rating. The alternative is writing a row for every turn on the
// chance it gets rated, or trusting the browser's copy of the exchange. This
// costs one round trip of extra payload and the text cannot be edited.

type Receipt = { u: string; q: string; a: string; m: string; mo: string; l: string; t: number };

function key() {
  const base = process.env.ACADEMY_DRILL_SECRET || `${process.env.ACADEMY_PASSCODE || "dev"}:${process.env.ACADEMY_SESSION_SALT || "purvex-academy"}`;
  return createHash("sha256").update(`coach-feedback:${base}`).digest();
}

export function sealReceipt(r: {
  userId: string;
  question: string;
  reply: string;
  model?: string | null;
  mode?: string | null;
  lab?: string | null;
}): string {
  const payload: Receipt = {
    u: r.userId,
    q: r.question.slice(0, 2000),
    a: r.reply.slice(0, 4000),
    m: (r.model ?? "").slice(0, 60),
    mo: (r.mode ?? "").slice(0, 40),
    l: (r.lab ?? "").slice(0, 40),
    t: Date.now(),
  };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export function openReceipt(token: string): Receipt | null {
  try {
    const raw = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const text = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    const r = JSON.parse(text) as Receipt;
    return typeof r?.u === "string" && typeof r.a === "string" ? r : null;
  } catch {
    return null;
  }
}

// ---- storage --------------------------------------------------------------

const memory = new Map<string, CoachFeedback[]>();

/** Records a rating. Rating the same turn again replaces the first one. */
export async function saveFeedback(
  userId: string,
  input: { receipt: unknown; rating: unknown; tags: unknown; note: unknown; turnId: unknown }
): Promise<CoachFeedback | null> {
  const r = openReceipt(String(input.receipt ?? ""));
  // A receipt that will not open, or belongs to another student, is the only
  // case worth refusing. Everything else is cleaned up and kept.
  if (!r || r.u !== userId) return null;
  const rating: Rating = input.rating === "down" ? "down" : "up";
  const tags = Array.isArray(input.tags) ? [...new Set(input.tags.filter(isTag))].slice(0, FEEDBACK_TAG_KEYS.length) : [];
  const note = typeof input.note === "string" && input.note.trim() ? input.note.replace(/\s+/g, " ").trim().slice(0, 400) : null;
  const turnId = typeof input.turnId === "string" && input.turnId.length > 0 && input.turnId.length <= 64 ? input.turnId : String(r.t);

  const row: CoachFeedback = {
    turnId,
    rating,
    // Tags only ever describe what went wrong, so a thumbs up carries none.
    tags: rating === "down" ? tags : [],
    note,
    question: r.q,
    reply: r.a,
    model: r.m || null,
    mode: r.mo || null,
    lab: r.l || null,
    at: new Date().toISOString(),
  };

  const mine = (memory.get(userId) ?? []).filter((f) => f.turnId !== turnId);
  memory.set(userId, [...mine, row].slice(-200));
  if (!supabaseAdmin) return row;

  const { error } = await supabaseAdmin.from("academy_coach_feedback").upsert(
    {
      user_id: userId,
      turn_id: row.turnId,
      rating: row.rating,
      tags: row.tags,
      note: row.note,
      question: row.question,
      reply: row.reply,
      model: row.model,
      mode: row.mode,
      lab: row.lab,
      created_at: row.at,
    },
    { onConflict: "user_id,turn_id" }
  );
  if (error) console.error("academy_coach_feedback upsert failed", error.message);
  return row;
}

type RecentRow = { rating: Rating; tags: FeedbackTag[]; at: string };

async function recentFeedback(userId: string): Promise<RecentRow[]> {
  const since = new Date(Date.now() - RECENT_DAYS * DAY).toISOString();
  if (!supabaseAdmin) {
    return (memory.get(userId) ?? [])
      .filter((f) => f.at >= since)
      .slice(-RECENT_LIMIT)
      .map((f) => ({ rating: f.rating, tags: f.tags, at: f.at }));
  }
  const { data, error } = await supabaseAdmin
    .from("academy_coach_feedback")
    .select("rating, tags, created_at")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT);
  if (error) {
    // Feedback is a nicety. A read that fails must never cost the student a turn.
    console.error("academy_coach_feedback read failed", error.message);
    return [];
  }
  return (data ?? []).map((d) => ({
    rating: d.rating === "down" ? ("down" as const) : ("up" as const),
    tags: Array.isArray(d.tags) ? d.tags.filter(isTag) : [],
    at: d.created_at,
  }));
}

/**
 * One line of system prompt built from what this student marked wrong lately,
 * or "" when there is nothing to correct. Only the fixed `fix` strings above
 * go in, never anything the student typed.
 */
export async function correctionLine(userId: string): Promise<string> {
  const recent = await recentFeedback(userId).catch(() => []);
  const downs = recent.filter((f) => f.rating === "down");
  if (!downs.length) return "";

  const counts = new Map<FeedbackTag, number>();
  for (const f of downs) for (const t of f.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_NOTES);
  // Marked wrong with no reason picked: still worth saying, without inventing one.
  if (!ranked.length) {
    return `This student marked ${downs.length} recent ${downs.length === 1 ? "reply" : "replies"} unhelpful. Be more concrete than usual, and check you answered what they asked.`;
  }
  const fixes = ranked.map(([tag, n]) => `- ${FEEDBACK_TAGS[tag].fix}${n > 1 ? ` (marked ${n} times)` : ""}`);
  return `What this student has marked wrong in your recent replies, worst first. Correct for it:\n${fixes.join("\n")}`;
}

/** Rated turns for review, newest first. The owner's eval corpus. */
export async function listFeedback(opts: { rating?: Rating; limit?: number } = {}): Promise<(CoachFeedback & { userId: string })[]> {
  const limit = Math.min(500, Math.max(1, opts.limit ?? 100));
  if (!supabaseAdmin) {
    return [...memory.entries()]
      .flatMap(([userId, rows]) => rows.map((r) => ({ ...r, userId })))
      .filter((r) => !opts.rating || r.rating === opts.rating)
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, limit);
  }
  let q = supabaseAdmin.from("academy_coach_feedback").select("*").order("created_at", { ascending: false }).limit(limit);
  if (opts.rating) q = q.eq("rating", opts.rating);
  const { data, error } = await q;
  if (error) {
    console.error("academy_coach_feedback list failed", error.message);
    return [];
  }
  return (data ?? []).map((d) => ({
    userId: d.user_id,
    turnId: d.turn_id,
    rating: d.rating === "down" ? ("down" as const) : ("up" as const),
    tags: Array.isArray(d.tags) ? d.tags.filter(isTag) : [],
    note: d.note ?? null,
    question: d.question ?? "",
    reply: d.reply ?? "",
    model: d.model ?? null,
    mode: d.mode ?? null,
    lab: d.lab ?? null,
    at: d.created_at,
  }));
}
