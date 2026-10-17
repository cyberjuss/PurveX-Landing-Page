import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAcademyStudent } from "@/lib/academy-student";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Where a member manages the subscription they bought: change the card, read a
// receipt, or cancel. Stripe hosts all of it, so there is no billing UI here to
// keep correct, and cancelling is the member's own action rather than an email
// to support. The upgrade page promises "cancel in one click"; this is it.
//
// Cancellation lands back here as customer.subscription.updated, which the
// webhook already handles: the row keeps its period end, the student keeps Pro
// until the period they paid for runs out, and the upgrade page says so.

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

const RETURN_URL = "https://purvex.io/range/upgrade";

export async function POST(request: Request) {
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!stripe) {
    console.error("[billing-portal] STRIPE_SECRET_KEY not configured.");
    return NextResponse.json({ error: "Billing is not set up. Email support@purvex.io." }, { status: 503 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Billing is not set up. Email support@purvex.io." }, { status: 503 });
  }

  const { data } = await supabaseAdmin
    .from("academy_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", student.id)
    .maybeSingle();
  const customerId = (data as { stripe_customer_id?: string } | null)?.stripe_customer_id;

  // Pro without a Stripe customer is a comped account or a class seat. Neither
  // pays us directly, so there is nothing for them to manage and no bill to
  // cancel. Saying which is kinder than a portal that cannot open.
  if (!customerId) {
    return NextResponse.json(
      { error: "No subscription on this account. A seat from a school or a comped account is managed by whoever set it up." },
      { status: 404 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: RETURN_URL });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing-portal] Could not open a portal session:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not open billing right now. Try again, or email support@purvex.io." }, { status: 502 });
  }
}
