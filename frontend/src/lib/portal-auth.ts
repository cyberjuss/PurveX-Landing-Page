"use client";

// Portal identity, backed directly by Supabase Auth. This account is scoped
// to purvex-llc.com only (plan selection, billing, install access) — it is
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

export async function signUpWithPassword(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
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
  const client = requireSupabase();
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
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
