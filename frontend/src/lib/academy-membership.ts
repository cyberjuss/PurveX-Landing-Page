import "server-only";
import { isAcademyAdmin } from "@/lib/academy-classes";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Who may use Range, and how much of it.
//
// Anyone can create an account and start: a membership row is made the first
// time they open Range, and 'free' covers the lessons, the challenges and the
// browser labs, which cost nothing to run. 'pro' adds the two things that do
// cost money per student, the hosted AWS lab and the AI Coach. Stripe sets pro
// through the webhook. The class passcode and cohort links still work and are
// unaffected by any of this.

export type Plan = "free" | "pro";
export type Membership = { plan: Plan; proUntil: string | null; stripeCustomerId: string | null };

const FREE: Membership = { plan: "free", proUntil: null, stripeCustomerId: null };

/** Emails that get pro without paying: the owner, pilot students, instructors. */
function compedEmails(): string[] {
  return (process.env.ACADEMY_PRO_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function rowToMembership(row: { plan?: string | null; pro_until?: string | null; stripe_customer_id?: string | null } | null): Membership {
  if (!row) return FREE;
  return {
    plan: row.plan === "pro" ? "pro" : "free",
    proUntil: row.pro_until ?? null,
    stripeCustomerId: row.stripe_customer_id ?? null,
  };
}

/** The membership as stored. Free when there is no row yet. */
export async function getMembership(userId: string): Promise<Membership> {
  if (!supabaseAdmin) return FREE;
  const { data } = await supabaseAdmin.from("academy_members").select("plan, pro_until, stripe_customer_id").eq("user_id", userId).maybeSingle();
  return rowToMembership(data);
}

/** Make sure this account has a membership row, then return it. Called when a
 *  student opens Range, so signing up is the whole of signing up. */
export async function ensureMembership(user: { id: string; email: string | null }): Promise<Membership> {
  if (!supabaseAdmin) return FREE;
  const existing = await getMembership(user.id);
  if (existing.plan !== "free" || (await hasRow(user.id))) return existing;
  const { error } = await supabaseAdmin.from("academy_members").insert({ user_id: user.id, email: user.email });
  // A duplicate here just means two tabs raced; the row exists either way.
  if (error && !/duplicate key/i.test(error.message)) console.error("ensureMembership failed", error.message);
  return getMembership(user.id);
}

async function hasRow(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin.from("academy_members").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

/** True while a paid period is still running. */
export function proIsLive(m: Membership): boolean {
  if (m.plan !== "pro") return false;
  return !m.proUntil || Date.parse(m.proUntil) > Date.now();
}

/** May this student use the paid parts: the hosted lab and Coach? The owner,
 *  anyone on ACADEMY_PRO_EMAILS, and paid members. */
export async function hasPro(user: { id: string; email: string | null }): Promise<boolean> {
  if (isAcademyAdmin(user.email)) return true;
  if (user.email && compedEmails().includes(user.email.toLowerCase())) return true;
  return proIsLive(await getMembership(user.id));
}

/** Record a completed Stripe payment. Called from the webhook. */
export async function grantPro(userId: string, opts: { until?: string | null; customerId?: string | null; email?: string | null } = {}): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const { error } = await supabaseAdmin.from("academy_members").upsert(
    {
      user_id: userId,
      ...(opts.email ? { email: opts.email } : {}),
      plan: "pro",
      pro_until: opts.until ?? null,
      ...(opts.customerId ? { stripe_customer_id: opts.customerId } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) console.error("grantPro failed", error.message);
  return !error;
}
