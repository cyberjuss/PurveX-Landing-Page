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
    path: "/academy",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

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
  store.set(ACADEMY_COOKIE, expected, cookieOptions());
}