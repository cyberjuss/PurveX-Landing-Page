"use client";

// Portal identity, backed directly by Supabase Auth. This account is scoped
// to purvex.io only (plan selection, billing, install access) — it is
// never used to authenticate against a customer's own PurveX instance. Each
// self-hosted instance keeps its own separate admin/user accounts, created
// via its own /setup bootstrap wizard, unrelated to this login entirely.

import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Sign-in is not configured yet. Try again shortly.");
  }
  return supabase;
}

// Whether this browser has ever had a PurveX account on it. The portal opens
// on "Create your account" until it has, so a first-time visitor is never
// greeted with "Welcome back" and a password field for an account they have
// not made yet. Same question AcademySignIn asks before picking its mode.
const ACCOUNT_SEEN_KEY = "purvex-portal-seen";

export function markPortalAccount(): void {
  try {
    localStorage.setItem(ACCOUNT_SEEN_KEY, "1");
  } catch {}
}

export function hasPortalAccount(): boolean {
  try {
    return localStorage.getItem(ACCOUNT_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export async function signUpWithPassword(email: string, password: string, emailRedirectTo: string): Promise<{ user: User | null; session: Session | null }> {
  // Sent by our own branded route (see app/api/signup), not Supabase's default
  // template. The user confirms via the emailed link, so there is no session yet.
  const res = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, redirectTo: emailRedirectTo }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Unable to create your account.");
  return { user: null, session: null };
}

export async function signInWithPassword(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithGoogle(redirectTo: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw new Error(error.message);
}

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  // Sent by our own branded route (see app/api/reset-password), not Supabase's
  // default template. The route always answers ok so it never reveals whether an
  // account exists for that email.
  const res = await fetch("/api/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirectTo }),
  });
  if (!res.ok) throw new Error("Unable to send reset email right now. Please try again.");
}

/**
 * Records what to call the student, on the account rather than in a table of
 * our own. getAcademyStudent already reads user_metadata on every request, so
 * the name reaches the greeting, the initials and the emails with no extra
 * read and no column to migrate. Best effort: a student who finished the
 * intake should not be told their answers failed to save over a display name.
 */
export async function updateDisplayName(fullName: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  if (error) console.error("display name not saved", error.message);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  const client = requireSupabase();
  await client.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function hasRecoverySession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}
