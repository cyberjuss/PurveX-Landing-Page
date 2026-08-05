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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  // Set by pricing/page.tsx's handlePaid() before the redirect to Stripe --
  // the Supabase auth user id of whoever paid.
  const userId = session.client_reference_id;
  const customerEmail = session.customer_details?.email || session.customer_email || "";

  if (!userId) {
    console.error("[stripe-webhook] checkout.session.completed with no client_reference_id:", session.id);
    return NextResponse.json({ received: true });
  }

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from("portal_profiles")
      .update({
        plan: "paid",
        stripe_payment_confirmed: true,
        stripe_session_id: session.id,
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
        <pre>python backend/scripts/issue_license.py issue --seats &lt;seats&gt; --runners &lt;runners&gt; --days 365</pre>
        <p>Then email the printed token to ${customerEmail || "their address"} -- they'll paste it into
        Settings &rarr; License in their PurveX instance.</p>
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
        <p>Questions in the meantime? Just reply to this email.</p>
      `
    );
  }

  return NextResponse.json({ received: true });
}
