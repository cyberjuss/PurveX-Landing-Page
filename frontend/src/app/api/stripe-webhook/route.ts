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
// instead of the sale silently going unnoticed.

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const OWNER_NOTIFICATION_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

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

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
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

  if (OWNER_NOTIFICATION_EMAIL) {
    await sendEmail(
      OWNER_NOTIFICATION_EMAIL,
      `New PurveX paid signup: ${customerEmail || "unknown email"}`,
      `
        <p>A customer just paid via Stripe.</p>
        <ul>
          <li><strong>Email:</strong> ${customerEmail || "unknown"}</li>
          <li><strong>Amount:</strong> ${amount} ${currency}</li>
          <li><strong>Stripe checkout session:</strong> ${session.id}</li>
          <li><strong>Portal account id:</strong> ${userId}</li>
        </ul>
        <p>Issue their license and email it to them:</p>
        <pre>python backend/scripts/issue_license.py issue --seats &lt;seats&gt; --runners &lt;runners&gt; --days ${LICENSE_DAYS}</pre>
        <p>Then email the printed token to ${customerEmail || "their address"} -- they'll paste it into
        Settings &rarr; License in their PurveX instance.</p>
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
        <p>We issue license keys by hand right now, so expect a follow-up email with your key within one
        business day. Once it arrives, paste it into <strong>Settings &rarr; License</strong> in your PurveX
        instance -- it takes effect immediately, no restart needed.</p>
        <p>Your key is valid for ${LICENSE_DAYS} days and renews automatically with your subscription -- you'll
        get a fresh one by email each cycle, no action needed on your end as long as you stay subscribed.</p>
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
          <li><strong>Email:</strong> ${customerEmail || "unknown"}</li>
          <li><strong>Amount:</strong> ${amount} ${currency}</li>
          <li><strong>Stripe customer:</strong> ${stripeCustomerId}</li>
          <li><strong>Portal account id:</strong> ${portalUserId || "not found -- look up by email in Supabase"}</li>
        </ul>
        <p>Issue a fresh license and email it to them, same as a new signup:</p>
        <pre>python backend/scripts/issue_license.py issue --seats &lt;seats&gt; --runners &lt;runners&gt; --days ${LICENSE_DAYS}</pre>
        <p>Their old key will expire on its own in a few weeks, so this just needs to go out before then.</p>
      `
    );
  } else {
    console.warn("[stripe-webhook] OWNER_NOTIFICATION_EMAIL not set -- no notification sent for this renewal.");
  }
}
