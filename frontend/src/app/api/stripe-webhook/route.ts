import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

// Closes the loop the pricing page's static Stripe Payment Link otherwise
// leaves open: today, paying customer -> silence. Nobody is notified a sale
// happened, and there's no automated path to a license key. This doesn't
// sign anything itself -- the ed25519 signing key isn't something this
// server should hold, and only ever lives on the owner's own machine.
// Issuance is manual (the owner reads the notification email below and
// runs issue_license.py by hand) -- delivery isn't: --deliver-to pushes
// the signed token straight into the customer's portal account, so they
// grab it at /my-license instead of waiting on (and possibly losing track
// of) an email.
//
// enqueueLicenseIssuance below also drops a row in license_issuance_queue
// for a not-yet-activated automated path (scripts/poll_license_issuance.py)
// -- built and tested, but the table doesn't exist in Supabase yet and
// nothing runs it, so today that insert just fails harmlessly (logged, not
// thrown). Manual issuance via the notification email is the only live
// path right now.

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const OWNER_NOTIFICATION_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Every string that ends up inside an HTML email body and didn't originate
// as a literal in this file gets run through this first -- Stripe validates
// its own checkout email field loosely enough that defense-in-depth here is
// cheap, and this project has already had one HTML-injection fix elsewhere
// (inviter_name in the product's invite email) for exactly this bug class.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET not configured.");
    // 200, not 500: an unconfigured webhook shouldn't make Stripe retry
    // forever. The real fix is setting the env vars, not a retry storm.
    return NextResponse.json({ error: "Webhook not configured" }, { status: 200 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing stripe-signature header");
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: Stripe guarantees at-least-once delivery, so the same
  // event can arrive twice (a slow response, an occasional duplicate).
  // This row is only written AFTER the critical step below succeeds (see
  // the bottom of this function) -- it means "fully processed," not "we
  // saw this once." That distinction matters: if it meant the latter, a
  // delivery that failed partway through would look identical to one that
  // succeeded, and a retry would skip real work that never actually
  // happened. Fails open (skips the check, still processes) if Supabase
  // isn't configured -- consistent with the rest of this handler's posture.
  if (supabaseAdmin) {
    const { data: already } = await supabaseAdmin
      .from("processed_stripe_events")
      .select("id")
      .eq("id", event.id)
      .maybeSingle();
    if (already) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  let processed = true;
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    processed = await handleCheckoutCompleted(session, event.id);
  } else if (event.type === "invoice.paid") {
    processed = await handleInvoicePaid(event.data.object as Stripe.Invoice, event.id);
  }

  if (!processed) {
    // A non-2xx here makes Stripe retry this delivery automatically (with
    // backoff, for several days) and marks it failed in the Stripe
    // dashboard's webhook log. Stripe also emails the account owner
    // directly when an endpoint's deliveries keep failing -- a channel
    // that doesn't depend on this app's own email sending (Resend) or on
    // anyone reading Vercel logs, so a Supabase outage doesn't also take
    // down the only way of finding out about it.
    return NextResponse.json({ received: false }, { status: 500 });
  }

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("processed_stripe_events").insert({ id: event.id });
    // 23505 (unique_violation) here means a concurrent retry of this same
    // event already recorded it first -- both did the real work (which is
    // safe to double-run, see handleCheckoutCompleted/handleInvoicePaid),
    // so this is a benign race, not a failure worth retrying over.
    if (error && error.code !== "23505") {
      console.error("[stripe-webhook] Failed to record event id after successful processing:", error);
    }
  }

  return NextResponse.json({ received: true });
}

// License keys are short-lived (35 days) on purpose -- see handleInvoicePaid
// below. That's what makes "customer stops paying -> access actually lapses"
// true for self-hosted software with no phone-home check, without ever
// putting the ed25519 signing key anywhere but the owner's own machine.
const LICENSE_DAYS = 35;

// Drops a row for scripts/poll_license_issuance.py to pick up. Failure here
// is logged but never thrown -- the owner notification email below still
// carries the exact command to run by hand, so a queue-insert failure
// degrades to the original manual flow instead of losing the sale.
async function enqueueLicenseIssuance(params: {
  portalUserId: string;
  kind: "new" | "renewal";
  stripeEventId: string;
}) {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("license_issuance_queue").insert({
    portal_user_id: params.portalUserId,
    kind: params.kind,
    days: LICENSE_DAYS,
    seats: 0,
    runners: 0,
    stripe_event_id: params.stripeEventId,
  });
  if (error) {
    console.error("[stripe-webhook] Failed to enqueue license issuance:", error);
  }
}

// Returns whether the *critical* step (recording that this payment
// happened) succeeded. Email delivery is best-effort and never affects
// this -- a Resend outage shouldn't make Stripe think the payment itself
// wasn't recorded and retry into a duplicate-email loop once Resend
// recovers, when the actual record was already fine on the first attempt.
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripeEventId: string): Promise<boolean> {
  // Set by pricing/page.tsx's handlePaid() before the redirect to Stripe --
  // the Supabase auth user id of whoever paid.
  const userId = session.client_reference_id;
  const customerEmail = session.customer_details?.email || session.customer_email || "";
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (!userId) {
    console.error("[stripe-webhook] checkout.session.completed with no client_reference_id:", session.id);
    // Not retryable -- there's no missing id waiting to show up on a
    // retry, the session was created without one and always will be.
    return true;
  }

  if (!supabaseAdmin) {
    console.error("[stripe-webhook] SUPABASE_SERVICE_ROLE_KEY not configured -- payment not recorded anywhere.");
    return false;
  }

  const { error } = await supabaseAdmin
    .from("portal_profiles")
    .update({
      plan: "paid",
      stripe_payment_confirmed: true,
      stripe_session_id: session.id,
      stripe_customer_id: stripeCustomerId || null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) {
    console.error("[stripe-webhook] Failed to update portal_profiles:", error);
    return false;
  }

  // Best-effort from here down -- an issuance-queue or email hiccup
  // shouldn't undo the fact that the payment itself is now durably
  // recorded above.
  await enqueueLicenseIssuance({ portalUserId: userId, kind: "new", stripeEventId });

  const amount = session.amount_total != null ? (session.amount_total / 100).toFixed(2) : "unknown";
  const currency = (session.currency || "usd").toUpperCase();
  const safeCustomerEmail = customerEmail ? escapeHtml(customerEmail) : "";
  const safeUserId = escapeHtml(userId);

  if (OWNER_NOTIFICATION_EMAIL) {
    await sendEmail(
      OWNER_NOTIFICATION_EMAIL,
      `New PurveX paid signup: ${customerEmail || "unknown email"}`,
      `
        <p>A customer just paid via Stripe.</p>
        <ul>
          <li><strong>Email:</strong> ${safeCustomerEmail || "unknown"}</li>
          <li><strong>Amount:</strong> ${amount} ${currency}</li>
          <li><strong>Stripe checkout session:</strong> ${escapeHtml(session.id)}</li>
          <li><strong>Portal account id:</strong> ${safeUserId}</li>
        </ul>
        <p>Issue their license -- this delivers it straight to their portal account (they'll see it at
        <strong>/my-license</strong> immediately, nothing to email):</p>
        <pre>python backend/scripts/issue_license.py issue --seats 0 --runners 0 --days ${LICENSE_DAYS} --deliver-to ${safeUserId}</pre>
        <p>Requires <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> set in your shell (same
        service-role key already in this project's Vercel env). If delivery fails for any reason, the token is
        still printed above -- fall back to emailing it to ${safeCustomerEmail || "their address"} and they can
        upload it as a file in Settings &rarr; License themselves.</p>
        <p>This key expires in ${LICENSE_DAYS} days. As long as their subscription stays active, Stripe will
        auto-renew it and you'll get a follow-up "renewed" email like this one telling you to reissue. If they
        cancel, just don't reissue -- the key lapses on its own, no revocation step needed.</p>
      `
    );
  } else {
    console.warn("[stripe-webhook] OWNER_NOTIFICATION_EMAIL not set -- no notification sent for this payment.");
  }

  if (customerEmail) {
    await sendEmail(
      customerEmail,
      "Thanks for upgrading to PurveX Paid",
      `
        <p>Thanks for upgrading to PurveX Paid!</p>
        <p>We issue license keys by hand right now, so expect it within one business day. You don't need to
        wait on an email for it though -- once it's ready, you'll find it any time at
        <strong>purvex-llc.com/my-license</strong>. Download it there and upload it in
        <strong>Settings &rarr; License</strong> in your PurveX instance -- it takes effect immediately, no
        restart needed.</p>
        <p>Your key is valid for ${LICENSE_DAYS} days and renews automatically with your subscription -- check
        back at that same page each cycle for the current one, no action needed on your end as long as you
        stay subscribed.</p>
        <p>Questions in the meantime? Just reply to this email.</p>
      `
    );
  }

  return true;
}

// See handleCheckoutCompleted's comment above -- same contract: return
// value reflects whether the critical step (looking up who to notify)
// succeeded, not whether the notification itself went out.
async function handleInvoicePaid(invoice: Stripe.Invoice, stripeEventId: string): Promise<boolean> {
  // Stripe fires invoice.paid for the FIRST invoice on a new subscription
  // too (billing_reason "subscription_create"), which checkout.session.completed
  // already handles above -- only act on real recurring renewals here, or
  // the owner gets two emails for one sale.
  if (invoice.billing_reason !== "subscription_cycle") {
    return true;
  }

  const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!stripeCustomerId) {
    console.error("[stripe-webhook] invoice.paid renewal with no customer id:", invoice.id);
    return true;
  }

  let customerEmail = invoice.customer_email || "";
  let portalUserId: string | null = null;

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("portal_profiles")
      .select("user_id, email")
      .eq("stripe_customer_id", stripeCustomerId)
      .maybeSingle();
    if (error) {
      // A real query failure (not just "no matching row," which `data`
      // being null already covers below) -- worth retrying since we
      // genuinely don't know yet whether we can find this customer.
      console.error("[stripe-webhook] Failed to look up portal_profiles by stripe_customer_id:", error);
      return false;
    }
    if (data) {
      portalUserId = data.user_id;
      customerEmail = customerEmail || data.email;
    }
  }

  if (portalUserId) {
    await enqueueLicenseIssuance({ portalUserId, kind: "renewal", stripeEventId });
  }

  const amount = invoice.amount_paid != null ? (invoice.amount_paid / 100).toFixed(2) : "unknown";
  const currency = (invoice.currency || "usd").toUpperCase();

  if (OWNER_NOTIFICATION_EMAIL) {
    await sendEmail(
      OWNER_NOTIFICATION_EMAIL,
      `PurveX subscription renewed: ${customerEmail || "unknown email"}`,
      `
        <p>A customer's subscription just renewed via Stripe.</p>
        <ul>
          <li><strong>Email:</strong> ${customerEmail ? escapeHtml(customerEmail) : "unknown"}</li>
          <li><strong>Amount:</strong> ${amount} ${currency}</li>
          <li><strong>Stripe customer:</strong> ${escapeHtml(stripeCustomerId)}</li>
          <li><strong>Portal account id:</strong> ${portalUserId ? escapeHtml(portalUserId) : "not found -- look up by email in Supabase"}</li>
        </ul>
        <p>Issue a fresh license, same as a new signup:</p>
        <pre>python backend/scripts/issue_license.py issue --seats 0 --runners 0 --days ${LICENSE_DAYS}${portalUserId ? ` --deliver-to ${escapeHtml(portalUserId)}` : ""}</pre>
        <p>${portalUserId
          ? "--deliver-to sends it straight to their portal account (they'll see it at /my-license, nothing to email)."
          : "No portal account id on file for this customer -- email the printed token to them directly."}</p>
        <p>Their old key will expire on its own in a few weeks, so this just needs to go out before then.</p>
      `
    );
  } else {
    console.warn("[stripe-webhook] OWNER_NOTIFICATION_EMAIL not set -- no notification sent for this renewal.");
  }

  return true;
}
