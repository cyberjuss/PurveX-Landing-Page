import "server-only";
import { createHash } from "crypto";
import { cookies } from "next/headers";

// A single shared passcode for a training cohort (e.g. a GovTech Academy
// class) -- there are no per-student accounts, so this isn't the portal's
// Supabase auth system (src/lib/portal-auth.ts). The cookie never stores
// the passcode itself: it stores a hash of passcode+salt, so unlocking
// requires knowing ACADEMY_PASSCODE but the cookie alone can't be used to
// recover it.
export const ACADEMY_COOKIE = "academy_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

function expectedToken(): string | null {
  const passcode = process.env.ACADEMY_PASSCODE;
  if (!passcode) return null;
  const salt = process.env.ACADEMY_SESSION_SALT || "purvex-academy";
  return createHash("sha256").update(`${passcode}:${salt}`).digest("hex");
}

export async function isAcademyUnlocked(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const store = await cookies();
  return store.get(ACADEMY_COOKIE)?.value === expected;
}

export function checkPasscode(input: string): boolean {
  const passcode = process.env.ACADEMY_PASSCODE;
  if (!passcode) return false;
  return input.trim() === passcode;
}

export async function setAcademyCookie() {
  const expected = expectedToken();
  if (!expected) return;
  const store = await cookies();
  store.set(ACADEMY_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/academy",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}
