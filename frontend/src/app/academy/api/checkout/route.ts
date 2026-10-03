import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getMembership } from "@/lib/academy-membership";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Starts a Stripe Checkout session for the Range plan, which adds the hosted
// lab and Coach to a free account. The student's id rides along as
// client_reference_id, and metadata.product marks it as Range so the shared
// webhook can tell it apart from a product licence.

const KEY = process.env.STRIPE_SECRET_KEY;
const PRICE = process.env.STRIPE_RANGE_PRICE_ID;

export async function POST(request: Request) {
  const me = await getAcademyStudent(request);
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!KEY || !PRICE) {
    return NextResponse.json({ error: "Checkout is not configured yet. Email us and we will set you up." }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const membership = await getMembership(me.id);
  try {
    const stripe = new Stripe(KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE, quantity: 1 }],
      client_reference_id: me.id,
      ...(membership.stripeCustomerId ? { customer: membership.stripeCustomerId } : me.email ? { customer_email: me.email } : {}),
      metadata: { product: "range", user_id: me.id },
      subscription_data: { metadata: { product: "range", user_id: me.id } },
      allow_promotion_codes: true,
      success_url: `${origin}/range?upgraded=1`,
      cancel_url: `${origin}/range/upgrade`,
    });
    if (!session.url) return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("range checkout failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 502 });
  }
}
