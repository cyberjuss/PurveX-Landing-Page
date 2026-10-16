import "server-only";
import { rangeEntitlement } from "@/lib/range-plan";
import { supabaseAdmin } from "@/lib/supabase-admin";

// A snapshot of every individual account, for the owner's own view. The
// class roster already answers "how is this class doing" -- nothing answered
// "is anyone signing up on their own, and are any of them converting", which
// is the number that actually moves when an outside post or a channel push
// works. Counted fresh on each load rather than cached, since the owner is
// the only one who ever sees it.

const DAY = 86_400_000;

export type IndividualsSummary = {
  total: number;
  free: number;
  proTrialing: number;
  proSubscription: number;
  /** Comped through a class seat or an admin/comp-list email. Counted
   *  separately because neither reflects the self-serve funnel -- a class
   *  seat means a school already paid, an admin account is never a sale. */
  proClass: number;
  proAdmin: number;
  newLast7Days: number;
};

type AuthUser = { id: string; email?: string | null; created_at: string };

/** Every auth user, a page at a time. The guard stops a bad cursor looping. */
async function allAuthUsers(): Promise<AuthUser[]> {
  if (!supabaseAdmin) return [];
  const perPage = 1000;
  const out: AuthUser[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("[owner-metrics] listUsers failed:", error.message);
      break;
    }
    const users = (data?.users ?? []) as unknown as AuthUser[];
    out.push(...users);
    if (users.length < perPage) break;
  }
  return out;
}

export async function individualsSummary(): Promise<IndividualsSummary> {
  const users = await allAuthUsers();
  const since = Date.now() - 7 * DAY;

  // One bulk read instead of one query per user. rangeEntitlement answers
  // "is this account Pro", not which Stripe status -- this is only for
  // telling trialing and paying apart in the subscription bucket.
  const statusByUser = new Map<string, string>();
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_subscriptions").select("user_id, status");
    if (error) console.error("[owner-metrics] academy_subscriptions read failed:", error.message);
    for (const row of (data ?? []) as { user_id: string; status: string }[]) statusByUser.set(row.user_id, row.status);
  }

  const summary: IndividualsSummary = {
    total: users.length,
    free: 0,
    proTrialing: 0,
    proSubscription: 0,
    proClass: 0,
    proAdmin: 0,
    newLast7Days: 0,
  };

  // rangeEntitlement is the one place this is decided -- reusing it here
  // instead of re-deriving the same three-way check keeps this count honest
  // with what the account can actually do, not a second opinion of it.
  await Promise.all(
    users.map(async (u) => {
      if (Date.parse(u.created_at) >= since) summary.newLast7Days++;
      const entitlement = await rangeEntitlement({ id: u.id, email: u.email ?? null, name: null }).catch(() => null);
      if (!entitlement || entitlement.plan !== "pro") {
        summary.free++;
        return;
      }
      if (entitlement.source === "admin") summary.proAdmin++;
      else if (entitlement.source === "class") summary.proClass++;
      else if (statusByUser.get(u.id) === "trialing") summary.proTrialing++;
      else summary.proSubscription++;
    })
  );

  return summary;
}
