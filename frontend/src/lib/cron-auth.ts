import "server-only";
import { createHash, timingSafeEqual } from "crypto";

/**
 * True when the request carries the cron secret as a Bearer token.
 *
 * Vercel Cron sends it, and the owner-only routes reuse it. Compared in
 * constant time, over hashes so the two sides are always the same length: a
 * plain === stops at the first differing character, and the time that takes
 * says how much of a guess was right. Without the secret set, nothing passes.
 */
export function hasCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const sent = createHash("sha256").update(request.headers.get("authorization") ?? "").digest();
  const want = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(sent, want);
}
