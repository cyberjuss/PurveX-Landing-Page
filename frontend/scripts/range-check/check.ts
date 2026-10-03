// Range Pro split check: the decisions that, if wrong, either give Pro away
// for free or withhold something a student paid for.
// Run: npm run check:range   (no API keys, no database, no network)
//
// Everything here is the pure logic. The HTTP side -- which routes answer
// 401/403 to an unentitled caller -- is checked by routes.mjs against a real
// production build, since that is where middleware and env differ from dev.

import type Stripe from "stripe";
import { rangeEntitlement, subscriptionGrantsPro } from "@/lib/range-plan";
import { invoiceIsRangePro, periodEnd, subscriptionIsRangePro } from "@/lib/range-billing";

let failures = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${name}${ok ? "" : `\n          expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

const future = new Date(Date.now() + 7 * 864e5).toISOString();
const past = new Date(Date.now() - 7 * 864e5).toISOString();

console.log("\nWho the subscription row grants Pro to");
check("active, period still running", subscriptionGrantsPro({ status: "active", current_period_end: future }), true);
check("trialing, period still running", subscriptionGrantsPro({ status: "trialing", current_period_end: future }), true);
// The one that matters most: Stripe can leave a row at 'active' for a while
// after the final period ends, so status alone is not enough.
check("active but period already ended", subscriptionGrantsPro({ status: "active", current_period_end: past }), false);
// Cancelled and still inside the paid period -- the pricing page promises
// "cancel the moment you want to", not "lose access the moment you cancel".
check("cancelled mid-period, still paid up", subscriptionGrantsPro({ status: "active", current_period_end: future, canceled_at: past }), true);
check("past_due", subscriptionGrantsPro({ status: "past_due", current_period_end: future }), false);
check("unpaid", subscriptionGrantsPro({ status: "unpaid", current_period_end: future }), false);
check("incomplete", subscriptionGrantsPro({ status: "incomplete", current_period_end: future }), false);
check("canceled", subscriptionGrantsPro({ status: "canceled", current_period_end: past }), false);
check("no row at all", subscriptionGrantsPro(null), false);
check("row with no status", subscriptionGrantsPro({}), false);

console.log("\nWhere the billing period is read from");
// Stripe API 2026-07-29.dahlia moved current_period_end off Subscription and
// onto its items. Reading the old place returns undefined, which the check
// above would read as "no expiry" -- Pro forever, free.
const subscription = (over: Partial<Stripe.Subscription> = {}, itemEnds: number[] = []) =>
  ({
    id: "sub_test",
    status: "active",
    customer: "cus_test",
    metadata: {},
    cancel_at_period_end: false,
    canceled_at: null,
    items: { data: itemEnds.map((current_period_end) => ({ current_period_end, price: { id: "price_x", metadata: {} } })) },
    ...over,
  }) as unknown as Stripe.Subscription;

const endsAt = Math.floor(Date.parse("2027-01-01T00:00:00Z") / 1000);
check("period comes off the subscription item", periodEnd(subscription({}, [endsAt])), "2027-01-01T00:00:00.000Z");
check("several items take the latest", periodEnd(subscription({}, [endsAt, endsAt + 864e2])), "2027-01-02T00:00:00.000Z");
check("no items means no expiry claimed", periodEnd(subscription({}, [])), null);

console.log("\nTelling a $20 Range sale from a $99 Platform sale");
const RANGE = { purvex_product: "range_pro" };
const priced = (id: string, metadata: Record<string, string> = {}) =>
  ({
    ...subscription({}, []),
    items: { data: [{ current_period_end: endsAt, price: { id, metadata } }] },
  }) as unknown as Stripe.Subscription;

check("subscription metadata marks it Range", subscriptionIsRangePro(subscription({ metadata: RANGE as Stripe.Metadata }, [endsAt])), true);
check("price metadata marks it Range", subscriptionIsRangePro(priced("price_anything", RANGE)), true);
check("the Platform's own price is not Range", subscriptionIsRangePro(priced("price_1U1udq6n6ab71JZ1o0bENRx2")), false);
check("an unmarked price is not Range", subscriptionIsRangePro(priced("price_unknown")), false);

const invoice = (lines: { price?: string; product?: string }[]) =>
  ({
    lines: { data: lines.map((l) => ({ pricing: { price_details: { price: l.price, product: l.product } } })) },
  }) as unknown as Stripe.Invoice;

// Only true with the env var set -- which is the point of checking it here,
// since an unset STRIPE_RANGE_PRO_PRICE_ID is what would send a $20 renewal
// into the Platform's license-issuance email.
const configured = Boolean(process.env.STRIPE_RANGE_PRO_PRICE_ID);
if (configured) {
  check("invoice for the Range price", invoiceIsRangePro(invoice([{ price: process.env.STRIPE_RANGE_PRO_PRICE_ID }])), true);
}
check("invoice for the Platform price", invoiceIsRangePro(invoice([{ price: "price_1U1udq6n6ab71JZ1o0bENRx2" }])), false);
check("invoice with no pricing details", invoiceIsRangePro(invoice([{}])), false);
if (!configured) {
  console.log("  note  STRIPE_RANGE_PRO_PRICE_ID is unset, so the Range-invoice case was skipped.");
}

// Runs with no Supabase keys, so the subscription and class lookups both
// come back empty -- which is the point: these two paths have to work when
// the database is unreachable, or an outage locks every paying student out.
async function planResolution() {
  console.log("\nResolving an account to a plan");
  const student = (email: string | null) => ({ id: "00000000-0000-0000-0000-000000000000", email, name: null });

  process.env.RANGE_PRO_EMAILS = "comped@example.com";
  process.env.ACADEMY_ADMIN_EMAILS = "owner@example.com";
  check("a comped email is Pro", (await rangeEntitlement(student("comped@example.com"))).source, "admin");
  check("case does not matter", (await rangeEntitlement(student("Comped@Example.com"))).source, "admin");
  check("an admin is Pro", (await rangeEntitlement(student("owner@example.com"))).source, "admin");
  check("anyone else is free", (await rangeEntitlement(student("student@example.com"))).plan, "free");
  check("no account is free", (await rangeEntitlement(null)).plan, "free");

  process.env.RANGE_PRO_EMAILS = "";
  check("an empty comp list comps nobody", (await rangeEntitlement(student("comped@example.com"))).plan, "free");
  // "*" is the local-dev switch. Worth asserting it only works when asked
  // for, since a stray "*" in production gives the whole product away.
  process.env.RANGE_PRO_EMAILS = "*";
  check('"*" comps everyone', (await rangeEntitlement(student("anyone@example.com"))).plan, "pro");
  process.env.RANGE_PRO_EMAILS = "";
}

planResolution().then(() => {
  console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
});
