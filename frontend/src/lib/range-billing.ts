import "server-only";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

// The Stripe side of Range Pro ($49/month). Writes academy_subscriptions,
// which lib/range-plan.ts reads on every gated request. Nothing else in the
// app may write that table -- see range_pro.sql for why.
//
// The account sells two different subscriptions: the $99/month self-hosted
// Platform plan (portal_profiles + a signed license key) and this one. Both
// arrive on the same webhook endpoint, so every handler here starts by
// deciding whether the event is even ours -- otherwise a $49 Range renewal
// would trip the Platform's "issue them a license" email, and a $99 Platform
// sale would hand out a Range Pro seat.

const RANGE_PRO_PRICE_ID = (process.env.STRIPE_RANGE_PRO_PRICE_ID ?? "").trim();
const RANGE_PRO_PRODUCT_ID = (process.env.STRIPE_RANGE_PRO_PRODUCT_ID ?? "").trim();

/** Set on the product, the price and the payment link's subscription_data. */
const RANGE_MARKER = "range_pro";

function hasRangeMarker(metadata: Stripe.Metadata | null | undefined): boolean {
  return metadata?.purvex_product === RANGE_MARKER;
}

/**
 * Price id first, metadata as the backstop. The marker means a price created
 * later (an annual plan, a student rate) is recognised without a redeploy,
 * and a forgotten STRIPE_RANGE_PRO_PRICE_ID does not silently sell Pro that
 * never gets granted.
 */
function isRangePrice(price: Stripe.Price | null | undefined): boolean {
  if (!price) return false;
  if (RANGE_PRO_PRICE_ID && price.id === RANGE_PRO_PRICE_ID) return true;
  if (hasRangeMarker(price.metadata)) return true;
  const product = price.product;
  return typeof product === "object" && product !== null && !("deleted" in product && product.deleted)
    ? hasRangeMarker((product as Stripe.Product).metadata)
    : false;
}

/** Line items are not on the webhook's session object, so they need fetching. */
export async function checkoutIsRangePro(stripe: Stripe, session: Stripe.Checkout.Session): Promise<boolean> {
  if (hasRangeMarker(session.metadata)) return true;
  try {
    const items = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 10,
      expand: ["data.price.product"],
    });
    return items.data.some((item) => isRangePrice(item.price));
  } catch (err) {
    console.error("[range-billing] Could not read checkout line items:", err);
    // Rethrown as "not Range" would hand the session to the Platform
    // handler and mark a $49 buyer as a $99 licensee. Throwing instead
    // makes the webhook return 500 and Stripe retry, which is recoverable.
    throw err;
  }
}

export function subscriptionIsRangePro(subscription: Stripe.Subscription): boolean {
  if (hasRangeMarker(subscription.metadata)) return true;
  return subscription.items.data.some((item) => isRangePrice(item.price));
}

/**
 * Invoice lines carry ids, not expanded objects, so this matches on the
 * price or product id rather than metadata. Used only to keep Range
 * renewals out of the Platform's invoice handler.
 */
export function invoiceIsRangePro(invoice: Stripe.Invoice): boolean {
  return invoice.lines.data.some((line) => {
    const details = line.pricing?.price_details;
    if (!details) return false;
    const priceId = typeof details.price === "string" ? details.price : details.price?.id;
    if (RANGE_PRO_PRICE_ID && priceId === RANGE_PRO_PRICE_ID) return true;
    if (RANGE_PRO_PRODUCT_ID && details.product === RANGE_PRO_PRODUCT_ID) return true;
    return typeof details.price === "object" && isRangePrice(details.price);
  });
}

const iso = (seconds: number | null | undefined) =>
  typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;

/**
 * On API version 2026-07-29.dahlia the billing period moved off Subscription
 * and onto its items, so reading subscription.current_period_end gives
 * undefined -- which range-plan.ts would read as "no expiry, Pro forever".
 * The latest item end is the one the whole subscription is paid through.
 */
export function periodEnd(subscription: Stripe.Subscription): string | null {
  const ends = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((v): v is number => typeof v === "number");
  return ends.length ? iso(Math.max(...ends)) : null;
}

type Upsert = {
  userId: string;
  email?: string | null;
  status: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  startedAt?: string | null;
};

/** Returns false when the write failed, which makes the webhook return 500 and Stripe retry. */
async function writeSubscription(row: Upsert): Promise<boolean> {
  if (!supabaseAdmin) {
    console.error("[range-billing] SUPABASE_SERVICE_ROLE_KEY not configured -- Range Pro not granted.");
    return false;
  }
  const { error } = await supabaseAdmin.from("academy_subscriptions").upsert(
    {
      user_id: row.userId,
      ...(row.email !== undefined ? { email: row.email } : {}),
      status: row.status,
      ...(row.customerId !== undefined ? { stripe_customer_id: row.customerId } : {}),
      ...(row.subscriptionId !== undefined ? { stripe_subscription_id: row.subscriptionId } : {}),
      ...(row.currentPeriodEnd !== undefined ? { current_period_end: row.currentPeriodEnd } : {}),
      ...(row.canceledAt !== undefined ? { canceled_at: row.canceledAt } : {}),
      ...(row.startedAt !== undefined ? { started_at: row.startedAt } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) {
    console.error("[range-billing] Failed to write academy_subscriptions:", error);
    return false;
  }
  return true;
}

/** Later events carry a customer id but no client_reference_id, so they map back through this. */
async function userIdForCustomer(customerId: string): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("academy_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) {
    console.error("[range-billing] Failed to look up academy_subscriptions by customer:", error);
    return null;
  }
  return (data?.user_id as string | undefined) ?? null;
}

/** A student just paid for the first time. */
export async function handleRangeCheckout(stripe: Stripe, session: Stripe.Checkout.Session): Promise<boolean> {
  // Set by the upgrade page before the redirect -- the Supabase auth user id
  // of whoever is paying.
  const userId = session.client_reference_id;
  if (!userId) {
    console.error("[range-billing] Range Pro checkout with no client_reference_id:", session.id);
    // Not retryable: the id was never on the session and never will be. The
    // money is taken and the seat is not granted, so this needs a human.
    return true;
  }

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

  // The session says a payment succeeded; the subscription says what it
  // bought and how long it lasts. Without this, the first period end would
  // be unknown and the row would read as Pro with no expiry.
  let status = "active";
  let end: string | null = null;
  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      status = subscription.status;
      end = periodEnd(subscription);
    } catch (err) {
      console.error("[range-billing] Could not retrieve subscription after checkout:", err);
      return false;
    }
  }

  return writeSubscription({
    userId,
    email: session.customer_details?.email || session.customer_email || null,
    status,
    customerId,
    subscriptionId,
    currentPeriodEnd: end,
    canceledAt: null,
    startedAt: new Date().toISOString(),
  });
}

/** Renewals, cancellations, failed payments and reactivations all land here. */
export async function handleRangeSubscriptionChange(subscription: Stripe.Subscription): Promise<boolean> {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  if (!customerId) {
    console.error("[range-billing] Range subscription event with no customer:", subscription.id);
    return true;
  }

  const userId = await userIdForCustomer(customerId);
  if (!userId) {
    // The checkout handler writes the row that this lookup needs, and Stripe
    // does not guarantee event ordering -- a subscription.created can arrive
    // first. Retrying is right: the row usually exists by the next attempt.
    console.error("[range-billing] No academy_subscriptions row yet for customer:", customerId);
    return false;
  }

  return writeSubscription({
    userId,
    status: subscription.status,
    subscriptionId: subscription.id,
    currentPeriodEnd: periodEnd(subscription),
    // cancel_at_period_end is the "cancelled but still paid up" case: keep
    // the seat until current_period_end passes, which range-plan.ts checks.
    canceledAt: subscription.canceled_at
      ? iso(subscription.canceled_at)
      : subscription.cancel_at_period_end
        ? new Date().toISOString()
        : null,
  });
}
