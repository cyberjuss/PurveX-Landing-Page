"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, signOut } from "@/lib/portal-auth";
import { Check, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const STRIPE_PAYMENT_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || "";

const FREE_FEATURES = [
  "Full Atomic Red Team test library",
  "Up to 3 team members",
  "1 registered test runner",
  "Self-hosted on your own infrastructure",
];

const PAID_FEATURES = [
  "Everything in Free",
  "Unlimited team members",
  "Unlimited test runners",
  "Priority support",
];

async function recordPlanSelection(user: User, plan: "free" | "paid", reference?: string) {
  if (!supabase) return;
  await supabase.from("portal_profiles").upsert(
    {
      user_id: user.id,
      email: user.email ?? "",
      plan,
      stripe_checkout_reference: reference ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [busyPlan, setBusyPlan] = useState<"free" | "paid" | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (cancelled) return;
      if (!u) {
        router.replace("/account/login?next=/pricing");
        return;
      }
      setUser(u);
    });
    return () => { cancelled = true; };
  }, [router]);

  async function handleFree() {
    if (!user) return;
    setBusyPlan("free");
    try {
      await recordPlanSelection(user, "free");
      router.push("/get-purvex?plan=free");
    } finally {
      setBusyPlan(null);
    }
  }

  async function handlePaid() {
    if (!user) return;
    if (!STRIPE_PAYMENT_LINK_URL) {
      window.alert("Checkout isn't configured yet -- set NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL.");
      return;
    }
    setBusyPlan("paid");
    try {
      await recordPlanSelection(user, "paid", user.id);
      const url = new URL(STRIPE_PAYMENT_LINK_URL);
      url.searchParams.set("client_reference_id", user.id);
      if (user.email) url.searchParams.set("prefilled_email", user.email);
      window.location.href = url.toString();
    } finally {
      setBusyPlan(null);
    }
  }

  if (user === undefined) {
    return <AuthShell theme="light"><div className="min-h-[240px]" /></AuthShell>;
  }

  return (
    <AuthShell theme="light">
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between">
          <div />
          <button
            type="button"
            onClick={() => { void signOut(); router.push("/"); }}
            className="text-xs font-medium text-slate-500 transition hover:text-slate-800"
          >
            Sign out ({user?.email})
          </button>
        </div>

        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.125rem]">
            Choose how you run PurveX
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Both plans are the same self-hosted software, running on your own infrastructure. Paid removes the team
            and runner limits.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col rounded-3xl border border-[var(--pvrx-border-light)] bg-white p-7">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Free</p>
            <p className="mt-2 text-3xl font-display font-semibold text-slate-900">$0</p>
            <p className="mt-1 text-sm text-slate-500">Forever, no card required</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={handleFree}
              disabled={busyPlan !== null}
              size="lg"
              variant="outline"
              className="mt-7 h-12 w-full rounded-2xl border-[var(--pvrx-border-light)] bg-white text-slate-900 hover:bg-slate-50"
            >
              {busyPlan === "free" ? <><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</> : "Get PurveX free"}
            </Button>
          </div>

          <div className="flex flex-col rounded-3xl border border-[rgba(106,92,255,0.3)] bg-[rgba(106,92,255,0.04)] p-7 shadow-[0_20px_60px_-30px_rgba(106,92,255,0.35)]">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6a5cff]">Paid</p>
            <p className="mt-2 text-3xl font-display font-semibold text-slate-900">
              $49<span className="text-base font-medium text-slate-500"> / user / mo</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">Billed monthly via Stripe, cancel anytime</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {PAID_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6a5cff]" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={handlePaid}
              disabled={busyPlan !== null}
              size="lg"
              className="mt-7 h-12 w-full rounded-2xl border-0 bg-[#6a5cff] text-white shadow-[0_10px_30px_rgba(106,92,255,0.3)] hover:bg-[#5546e0]"
            >
              {busyPlan === "paid" ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout...</> : "Continue to checkout"}
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Questions first? <Link href="https://calendly.com/purvex-llc/30min" className="text-[#6a5cff] hover:text-[#5546e0]">Book a 30-minute call</Link> instead.
        </p>
      </div>
    </AuthShell>
  );
}
