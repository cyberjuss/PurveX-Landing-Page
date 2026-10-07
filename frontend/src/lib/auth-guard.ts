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
 * Three limits, because any one of them alone is either useless or a weapon.
 *
 * Every per-recipient limit is also a way to lock that recipient out: anyone can
 * name someone else's address, so whatever allowance it has can be spent by a
 * stranger. A generous per-address window therefore cuts both ways, and a long
 * one is worse than the flooding it prevents -- somebody locked out of their
 * account cannot wait a quarter of an hour for the reset mail they need. So the
 * per-address rule is a short cooldown and nothing more: the worst an attacker
 * can do with it is make a real user press the button again a minute later.
 *
 * The bulk protection sits where the attacker cannot aim it at a victim. The
 * caller limit stops one source sending in volume, and the global limit is what
 * actually protects the Resend quota and the domain's reputation, since it holds
 * however many addresses or sources a flood is spread across.
 */
export function mailGuard(request: Request, email: string): boolean {
  return (
    // However it is distributed, we will not send more than this in a quarter of
    // an hour. Far above any real signup rate, far below a reputation problem.
    throttle("all", 200, 15 * 60_000) &&
    throttle(`ip:${clientKey(request)}`, 10, 15 * 60_000) &&
    // One per minute per address. A cooldown, deliberately not a lockout.
    throttle(`em:${email}`, 1, 60_000)
  );
}
