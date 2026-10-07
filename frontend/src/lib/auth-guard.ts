import type { NextRequest } from "next/server";

// Guards for the three endpoints that send mail without a session: sign-up,
// password reset and resend-confirmation. All three take an email and a
// redirect from an unauthenticated request body, so both have to be checked
// here rather than trusted because our own pages happen to send sane values.

/**
 * A redirect we are willing to put inside an auth link.
 *
 * The Supabase action link carries the session in its URL, so whoever the link
 * redirects to afterwards receives it. Left open, anyone could ask us to mail a
 * real reset link for someone else's address with the redirect pointed at their
 * own site: the victim clicks a genuine PurveX email and hands over the session.
 *
 * Supabase keeps its own allow-list of redirect URLs, but that is configuration
 * we cannot see from here and a single permissive entry undoes it, so the rule
 * is enforced in our own code too: same host as the request that asked, which
 * holds on production, on a preview deployment and on localhost without any of
 * them needing to be listed.
 */
export function safeRedirect(request: Request, value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const host = request.headers.get("host");
  if (!host) return undefined;
  try {
    const target = new URL(value);
    if (target.protocol !== "https:" && target.protocol !== "http:") return undefined;
    return target.host === host ? target.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * A sliding window, per process.
 *
 * These endpoints reach Supabase through the service role, which skips the rate
 * limits Supabase applies to its own auth endpoints, and then send through
 * Resend. Without a limit of our own, one loop mails an address as often as it
 * likes: it fills an inbox, spends the Resend quota and teaches the big mail
 * providers that purvex.io sends unsolicited mail, which is the one thing the
 * domain cannot afford.
 *
 * Per process, so several serverless instances each get their own allowance.
 * That is worth saying plainly: it turns a trivial flood into a slow one rather
 * than stopping it. A durable limit belongs in Postgres, keyed the same way.
 */
const hits = new Map<string, number[]>();

export function throttle(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // The map would otherwise grow for the lifetime of the process, one entry per
  // address anyone ever typed.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    }
  }
  return true;
}

/** The caller, as far as the proxy will say. Only ever used as a throttle key. */
export function clientKey(request: Request | NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || "unknown";
}

/**
 * One call per email and one per caller, so neither a single address nor a
 * single source can be used to send in bulk. Three an address in fifteen
 * minutes covers a genuine retry; ten a caller covers a shared office.
 */
export function mailGuard(request: Request, email: string): boolean {
  return throttle(`ip:${clientKey(request)}`, 10, 15 * 60_000) && throttle(`em:${email}`, 3, 15 * 60_000);
}
