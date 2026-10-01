import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

// A tiny ledger so once-only emails (milestones) are never sent twice. Each
// (user, key) can be claimed once. markEmailOnce returns true the first time and
// false after, so the caller sends only on true.

const memory = new Set<string>();

export async function markEmailOnce(userId: string, key: string): Promise<boolean> {
  const mk = `${userId}:${key}`;
  if (!supabaseAdmin) {
    if (memory.has(mk)) return false;
    memory.add(mk);
    return true;
  }
  const { error } = await supabaseAdmin.from("academy_email_log").insert({ user_id: userId, key });
  if (!error) return true;
  if (/duplicate|unique/i.test(error.message)) return false;
  // On an unexpected error, do not send, so a flaky database never spams.
  console.error("academy_email_log insert failed", error.message);
  return false;
}
