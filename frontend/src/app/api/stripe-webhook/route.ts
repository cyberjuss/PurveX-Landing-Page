import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

// Closes the loop the pricing page's static Stripe Payment Link otherwise
// leaves open: today, paying customer -> silence. Nobody is notified a sale
// happened, and there's no automated path to a license key. This doesn't
// fully automate license issuance (that still needs an operator to run
// backend/scripts/issue_license.py -- the ed25519 signing key isn't
// something this server should hold), but it makes sure a payment is
// recorded and BOTH the owner and the customer are emailed immediately
// instead of the sale silently going unnoticed. Issuance is still by hand,
// but delivery doesn't have to be: issue_license.py --deliver-to pushes the
// token straight into this same Supabase project, so the customer can grab
// it themselves at /my-license instead of waiting on (and possibly losing
// track of) an email.

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const OWNER_NOTIFICATION_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL;
// The Payment Link id (looks like "plink_...", found on the link's own page
// in the Stripe Dashboard) for the separate "+1 seat" purchase -- distinct
// from the main plan Payment Link, so the webhook can tell "new customer"
// and "existing customer buying another seat" apart even though both fire
// the same checkout.session.completed event type.
const STRIPE_ADD_SEAT_PAYMENT_LINK_ID = process.env.STRIPE_ADD_SEAT_PAYMENT_LINK_ID;

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
  // Recording the event id first and bailing on a duplicate is what keeps a
  // redelivery from sending the owner/customer the same email twice.
  // Fails open (skips the check, still processes) if Supabase isn't
  // configured -- consistent with the rest of this handler's posture.
  if (supabaseAdmin) {
    const { error: dedupeError } = await supabaseAdmin
      .from("processed_stripe_events")
      .insert({ id: event.id });
    if (dedupeError) {
      // Postgres unique_violation -- this event id was already processed.
      if (dedupeError.code === "23505") {
        return NextResponse.json({ received: true, duplicate: true });
      }
      console.error("[stripe-webhook] Failed to record event id for idempotency:", dedupeError);
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentLinkId = typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id;
    if (STRIPE_ADD_SEAT_PAYMENT_LINK_ID && paymentLinkId === STRIPE_ADD_SEAT_PAYMENT_LINK_ID) {
      await handleSeatAddOn(session);
    } else {
      await handleCheckoutCompleted(session);
    }
  } else if (event.type === "invoice.paid") {
    await handleInvoicePaid(event.data.object as Stripe.Invoice);
  }

  return NextResponse.json({ received: true });
}

// License keys are short-lived (35 days) on purpose -- see handleInvoicePaid
// below. That's what makes "customer stops paying -> access actually lapses"
// true for self-hosted software with no phone-home check, without ever
// putting the ed25519 signing key anywhere but the owner's own machine.
const LICENSE_DAYS = 35;

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Set by pricing/page.tsx's handlePaid() before the redirect to Stripe --
  // the Supabase auth user id of whoever paid.
  const userId = session.client_reference_id;
  const customerEmail = session.customer_details?.email || session.customer_email || "";
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (!userId) {
    console.error("[stripe-webhook] checkout.session.completed with no client_reference_id:", session.id);
    return;
  }

  if (supabaseAdmin) {
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
    }
  } else {
    console.error("[stripe-webhook] SUPABASE_SERVICE_ROLE_KEY not configured -- payment not recorded anywhere.");
  }

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
        <pre>python backend/scripts/issue_license.py issue --seats &lt;seats&gt; --runners &lt;runners&gt; --days ${LICENSE_DAYS} --deliver-to ${safeUserId}</pre>
        <p>Requires <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> set in your shell (same
        service-role key already in this project's Vercel env). If delivery fails for any reason, the token is
        still printed above -- fall back to emailing it to ${safeCustomerEmail || "their address"} and they can
        paste it into Settings &rarr; License themselves.</p>
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
        <strong>purvex-llc.com/my-license</strong>. Paste it into <strong>Settings &rarr; License</strong> in
        your PurveX instance -- it takes effect immediately, no restart needed.</p>
        <p>Your key is valid for ${LICENSE_DAYS} days and renews automatically with your subscription -- check
        back at that same page each cycle for the current one, no action needed on your end as long as you
        stay subscribed.</p>
        <p>Questions in the meantime? Just reply to this email.</p>
      `
    );
  }
}

// A customer who's already paying hits their license's specific seat cap
// and buys one more seat via the separate add-seat Payment Link (see
// /add-seat/page.tsx). Notify-only, same as everything else here: there's
// no record anywhere of what seat count their current license has (that
// only ever existed inside the signed token itself), so the owner reissues
// by hand at whatever their current count plus one is, same as always.
async function handleSeatAddOn(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  const customerEmail = session.customer_details?.email || session.customer_email || "";

  if (!userId) {
    console.error("[stripe-webhook] add-seat checkout.session.completed with no client_reference_id:", session.id);
    return;
  }

  const amount = session.amount_total != null ? (session.amount_total / 100).toFixed(2) : "unknown";
  const currency = (session.currency || "usd").toUpperCase();
  const safeCustomerEmail = customerEmail ? escapeHtml(customerEmail) : "";
  const safeUserId = escapeHtml(userId);

  if (OWNER_NOTIFICATION_EMAIL) {
    await sendEmail(
      OWNER_NOTIFICATION_EMAIL,
      `PurveX seat add-on paid: ${customerEmail || "unknown email"}`,
      `
        <p>An existing customer just paid for one additional seat.</p>
        <ul>
          <li><strong>Email:</strong> ${safeCustomerEmail || "unknown"}</li>
          <li><strong>Amount:</strong> ${amount} ${currency}</li>
          <li><strong>Stripe checkout session:</strong> ${escapeHtml(session.id)}</li>
          <li><strong>Portal account id:</strong> ${safeUserId}</li>
        </ul>
        <p>Reissue their license with <strong>one more seat than whatever they currently have</strong>
        (there's no record of the current count here -- it only ever lived inside the signed token),
        same expiry window as usual -- this delivers it straight to their portal account:</p>
        <pre>python backend/scripts/issue_license.py issue --seats &lt;current+1&gt; --runners &lt;runners&gt; --days ${LICENSE_DAYS} --deliver-to ${safeUserId}</pre>
        <p>If delivery fails, the token is still printed above -- fall back to emailing it to
        ${safeCustomerEmail || "their address"}.</p>
      `
    );
  } else {
    console.warn("[stripe-webhook] OWNER_NOTIFICATION_EMAIL not set -- no notification sent for this seat add-on.");
  }

  if (customerEmail) {
    await sendEmail(
      customerEmail,
      "Thanks -- your new PurveX seat is on its way",
      `
        <p>We've received your payment for an additional seat.</p>
        <p>We issue updated license keys by hand right now, so expect it within one business day. You don't
        need to wait on an email though -- once it's ready, you'll find it at
        <strong>purvex-llc.com/my-license</strong>. Paste it into <strong>Settings &rarr; License</strong> in
        your PurveX instance -- it takes effect immediately, no restart needed.</p>
        <p>Questions in the meantime? Just reply to this email.</p>
      `
    );
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Stripe fires invoice.paid for the FIRST invoice on a new subscription
  // too (billing_reason "subscription_create"), which checkout.session.completed
  // already handles above -- only act on real recurring renewals here, or
  // the owner gets two emails for one sale.
  if (invoice.billing_reason !== "subscription_cycle") {
    return;
  }

  const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!stripeCustomerId) {
    console.error("[stripe-webhook] invoice.paid renewal with no customer id:", invoice.id);
    return;
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
      console.error("[stripe-webhook] Failed to look up portal_profiles by stripe_customer_id:", error);
    } else if (data) {
      portalUserId = data.user_id;
      customerEmail = customerEmail || data.email;
    }
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
        <pre>python backend/scripts/issue_license.py issue --seats &lt;seats&gt; --runners &lt;runners&gt; --days ${LICENSE_DAYS}${portalUserId ? ` --deliver-to ${escapeHtml(portalUserId)}` : ""}</pre>
        <p>${portalUserId
          ? "--deliver-to sends it straight to their portal account (they'll see it at /my-license, nothing to email)."
          : "No portal account id on file for this customer -- email the printed token to them directly."}</p>
        <p>Their old key will expire on its own in a few weeks, so this just needs to go out before then.</p>
      `
    );
  } else {
    console.warn("[stripe-webhook] OWNER_NOTIFICATION_EMAIL not set -- no notification sent for this renewal.");
  }
}
