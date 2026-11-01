import "server-only";
import { createHash } from "crypto";
import { cookies } from "next/headers";

// A shared passcode unlocks the course for a cohort. Each student then
// signs in with a Supabase account (see src/lib/academy-student.ts), which
// is what saved scores and coach usage belong to.
export const ACADEMY_COOKIE = "academy_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // Site-wide so the unlock applies at /academy and /range alike, and a
    // returning student stays unlocked instead of being re-asked for the code.
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

// This cookie means "this browser already proved it belongs here," for
// whatever reason that was true: a class passcode, a class code, or (far
// more often now) just being signed in as a Range Pro subscriber or class
// roster member. It must not depend on ACADEMY_PASSCODE being configured --
// that env var is only relevant to the legacy shared-passcode entry form.
// Tying this cookie's token to it meant the cookie silently never set for
// anyone on any path whenever no passcode happened to be configured, which
// locked out paying individuals who had no passcode to enter in the first
// place. The secret here is whatever's actually guaranteed to be set in a
// working deployment, not an optional cohort passcode.
function expectedToken(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ACADEMY_SESSION_SALT || "purvex-academy";
  return createHash("sha256").update(`academy-unlocked:${secret}`).digest("hex");
}

export async function isAcademyUnlocked(): Promise<boolean> {
  const store = await cookies();
  return store.get(ACADEMY_COOKIE)?.value === expectedToken();
}

export function checkPasscode(input: string): boolean {
  const passcode = process.env.ACADEMY_PASSCODE;
  if (!passcode) return false;
  return input.trim() === passcode;
}

export async function setAcademyCookie(): Promise<boolean> {
  const store = await cookies();
  store.set(ACADEMY_COOKIE, expectedToken(), cookieOptions());
  return true;
}

// A class code unlocks the course like the shared passcode, and remembers the
// class until the student signs in and joins it.
export const ACADEMY_CLASS_COOKIE = "academy_class";

export async function setClassCookie(code: string) {
  const store = await cookies();
  store.set(ACADEMY_CLASS_COOKIE, code, { ...cookieOptions(), maxAge: 60 * 60 * 24 * 30 });
}

export async function readClassCookie(): Promise<string | null> {
  return (await cookies()).get(ACADEMY_CLASS_COOKIE)?.value ?? null;
}

export async function clearClassCookie() {
  const store = await cookies();
  store.set(ACADEMY_CLASS_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}