import "server-only";
import { cohortAccessExpiry, isAcademyAdmin } from "@/lib/academy-classes";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AcademyStudent } from "@/lib/academy-student";

// Who gets the Pro column on the pricing page. Every gated route asks this
// and nothing else -- so there is one place to read when the question is
// "why can this account do that".
//
// Three ways to be Pro, matching the three tiers we sell:
//   subscription -- paid $49/month themselves (Pro)
//   class        -- on a class roster, so their school pays per seat (Custom)
//   admin        -- ACADEMY_ADMIN_EMAILS, plus the RANGE_PRO_EMAILS comp list
//
// Explore is everyone else: every lesson, every challenge, the whole Ticket
// Queue and the five browser labs, with no cloud lab, no coach and no Proof
// Profile.

export type RangePlan = "free" | "pro";
export type PlanSource = "subscription" | "class" | "admin" | "none";

export type RangeEntitlement = {
  plan: RangePlan;
  source: PlanSource;
  /** When a paid period runs out. Null for class and admin access, which has no clock. */
  until: string | null;
  /** True once a student cancels but is still inside the period they paid for. */
  canceled: boolean;
};

const FREE: RangeEntitlement = { plan: "free", source: "none", until: null, canceled: false };

const lower = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/** Comped accounts: the owner's own logins, demo seats, support cases. */
function isComped(email: string | null): boolean {
  const list = (process.env.RANGE_PRO_EMAILS ?? "").split(",").map(lower).filter(Boolean);
  if (list.includes("*")) return true;
  return Boolean(email) && list.includes(lower(email));
}

/** Only these two Stripe statuses grant access. past_due and unpaid do not. */
const PAYING = new Set(["active", "trialing"]);

type SubscriptionRow = {
  status?: string | null;
  current_period_end?: string | null;
  canceled_at?: string | null;
};

/**
 * A paid subscription still inside its period. Both halves matter: Stripe
 * can leave a row at 'active' for a few minutes after a final period ends,
 * and a canceled subscription keeps its 'active' status until the period it
 * was paid for actually runs out.
 */
export function subscriptionGrantsPro(row: SubscriptionRow | null): boolean {
  if (!row || !PAYING.has(String(row.status ?? ""))) return false;
  if (!row.current_period_end) return true;
  return new Date(row.current_period_end).getTime() > Date.now();
}

export async function loadSubscription(userId: string): Promise<SubscriptionRow | null> {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from("academy_subscriptions")
    .select("status, current_period_end, canceled_at")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

export async function rangeEntitlement(student: AcademyStudent | null): Promise<RangeEntitlement> {
  if (!student) return FREE;

  // Checked before the database: a comped account should still work when
  // Supabase is unreachable or academy.sql has not been run locally.
  if (isAcademyAdmin(student.email) || isComped(student.email)) {
    return { plan: "pro", source: "admin", until: null, canceled: false };
  }

  const row = await loadSubscription(student.id).catch(() => null);
  if (subscriptionGrantsPro(row)) {
    return {
      plan: "pro",
      source: "subscription",
      until: row?.current_period_end ?? null,
      canceled: Boolean(row?.canceled_at),
    };
  }

  // A cohort seat, which is Pro for 12 weeks from the student's join date, then
  // runs out. until carries when, so the UI can count it down and the student
  // drops to free after. Checked last because it is the only one of the three
  // that always costs a query.
  const cohortEnds = await cohortAccessExpiry(student.id).catch(() => null);
  if (cohortEnds && cohortEnds.getTime() > Date.now()) {
    return { plan: "pro", source: "class", until: cohortEnds.toISOString(), canceled: false };
  }

  return FREE;
}

export async function isRangePro(student: AcademyStudent | null): Promise<boolean> {
  return (await rangeEntitlement(student)).plan === "pro";
}

/** The 403 every gated route returns, so the wording is the same everywhere. */
export function proRequired(feature: string) {
  return { error: `${feature} is part of Range Pro.`, upgrade: "/range/upgrade" };
}
