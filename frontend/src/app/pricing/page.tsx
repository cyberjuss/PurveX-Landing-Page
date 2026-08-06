"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, signOut } from "@/lib/portal-auth";
import { Check, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const STRIPE_PAYMENT_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || "";

const FREE_FEATURES = [
  "Full Atomic Red Team test library, mapped to MITRE ATT&CK",
  "Connect Splunk, Elastic, or Microsoft Sentinel",
  "Coverage heatmap across every ATT&CK technique",
  "Up to 3 team members with role-based access",
  "1 test runner, 3 test runs a day",
  "Self-hosted — nothing leaves your network",
];

const PAID_FEATURES = [
  "Everything in Free, fully unlocked",
  "Unlimited team members, runners & daily test runs",
  "Scheduled, automated recurring test runs",
  "Detection-as-Code: sync rules from git",
  "PDF posture reports, unlimited audit history",
  "Priority support",
];

function CheckItem({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span
        className={
          tone === "accent"
            ? "mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6a5cff] to-[#5546e0] text-white"
            : "mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-slate-400 text-white"
        }
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className={tone === "accent" ? "text-slate-700 leading-snug" : "text-slate-600 leading-snug"}>{children}</span>
    </li>
  );
}

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

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set when arriving from /platform's pricing cards (via /account/signup's
  // own ?plan= carry-through) or from a confirmation email link -- means
  // the plan was already picked once, so don't ask again. See
  // account/signup/page.tsx for where this gets set.
  const preselected = searchParams?.get("plan") === "paid" ? "paid" : searchParams?.get("plan") === "free" ? "free" : null;

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [busyPlan, setBusyPlan] = useState<"free" | "paid" | null>(null);
  const autoRanFree = useRef(false);

  // Warm the free-plan destination -- handleFree() below either runs
  // automatically (preselected) or on a single click, both cases benefit
  // from the route already being fetched.
  useEffect(() => {
    router.prefetch("/get-purvex?plan=free");
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (cancelled) return;
      if (!u) {
        const next = preselected ? `/pricing?plan=${preselected}` : "/pricing";
        router.replace(`/account/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setUser(u);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Free was already decided before signup -- nothing left to ask, and no
  // external redirect involved, so just carry it out. (Paid still needs an
  // explicit click below: it's about to hand off to Stripe.)
  useEffect(() => {
    if (user && preselected === "free" && !autoRanFree.current) {
      autoRanFree.current = true;
      void handleFree();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, preselected]);

  // preselected === "free" always shows this screen, never the picker below
  // -- the effect above fires handleFree() the moment `user` is set, and
  // busyPlan briefly resets to null in its `finally` right as router.push
  // fires, which would otherwise flash the full picker for a frame.
  if (user === undefined || preselected === "free") {
    return (
      <AuthShell theme="light" width="md">
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {preselected === "free" ? "Setting up your free plan..." : null}
        </div>
      </AuthShell>
    );
  }

  const signOutRow = (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={() => { void signOut(); router.push("/"); }}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--pvrx-border-light)] bg-white py-1.5 pl-3 pr-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
      >
        {user?.email}
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">Sign out</span>
      </button>
    </div>
  );

  // Already decided on the paid plan before signup -- confirm once, don't
  // re-present the free option as if nothing had been chosen yet.
  if (preselected === "paid") {
    return (
      <AuthShell theme="light" width="sm" bare hideHeader>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(106,92,255,0.1)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6a5cff]">
            <Check className="h-3 w-3" strokeWidth={3} />
            Paid plan selected
          </span>
          <p className="mt-3 text-3xl font-display font-semibold tracking-tight text-slate-900">
            $49<span className="text-base font-medium text-slate-500"> / user / mo</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">Billed monthly via Stripe, cancel anytime</p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {PAID_FEATURES.map((f) => (
              <CheckItem key={f} tone="accent">{f}</CheckItem>
            ))}
          </ul>
          <Button
            onClick={handlePaid}
            disabled={busyPlan !== null}
            size="lg"
            className="mt-6 h-11 w-full rounded-2xl border-0 bg-[#6a5cff] text-white shadow-[0_10px_30px_rgba(106,92,255,0.3)] hover:bg-[#5546e0]"
          >
            {busyPlan === "paid" ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout...</> : "Continue to checkout"}
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Picked the wrong plan? <Link href="/pricing" className="text-[#6a5cff] hover:text-[#5546e0]">Choose again</Link>
        </p>
        {signOutRow}
      </AuthShell>
    );
  }

  return (
    <AuthShell theme="light" width="md" hideHeader>
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="font-display text-[1.7rem] font-semibold tracking-tight text-slate-900">
            Choose how you run PurveX
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Both plans are the same self-hosted software. Paid removes the team and runner limits.
          </p>
        </div>

        <div className="grid gap-5 pt-2 sm:grid-cols-2 sm:items-start">
          <div className="flex flex-col rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Free</p>
            <p className="mt-2 text-[1.9rem] font-display font-semibold tracking-tight text-slate-900">$0</p>
            <p className="mt-0.5 text-sm text-slate-500">Forever, no card required</p>
            <div className="mt-5 h-px bg-[var(--pvrx-border-light)]" />
            <ul className="mt-5 flex flex-1 flex-col gap-3">
              {FREE_FEATURES.map((f) => (
                <CheckItem key={f}>{f}</CheckItem>
              ))}
            </ul>
            <Button
              onClick={handleFree}
              disabled={busyPlan !== null}
              size="lg"
              variant="outline"
              className="mt-6 h-11 w-full rounded-2xl border-[var(--pvrx-border-light)] bg-white text-slate-900 hover:bg-slate-50"
            >
              {busyPlan === "free" ? <><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</> : "Get PurveX free"}
            </Button>
          </div>

          <div className="relative flex flex-col rounded-2xl border border-[rgba(106,92,255,0.32)] bg-gradient-to-b from-[rgba(106,92,255,0.07)] to-white p-6 shadow-[0_24px_48px_-24px_rgba(106,92,255,0.4)] sm:-translate-y-2.5 sm:p-7">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-br from-[#6a5cff] to-[#5546e0] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.07em] text-white shadow-[0_10px_22px_-8px_rgba(106,92,255,0.65)]">
              Most popular
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6a5cff]">Paid</p>
            <p className="mt-2 text-[1.9rem] font-display font-semibold tracking-tight text-slate-900">
              $49<span className="text-base font-medium text-slate-500"> / user / mo</span>
            </p>
            <p className="mt-0.5 text-sm text-slate-500">Billed monthly via Stripe, cancel anytime</p>
            <div className="mt-5 h-px bg-[rgba(106,92,255,0.18)]" />
            <ul className="mt-5 flex flex-1 flex-col gap-3">
              {PAID_FEATURES.map((f) => (
                <CheckItem key={f} tone="accent">{f}</CheckItem>
              ))}
            </ul>
            <Button
              onClick={handlePaid}
              disabled={busyPlan !== null}
              size="lg"
              className="mt-6 h-11 w-full rounded-2xl border-0 bg-[#6a5cff] text-white shadow-[0_10px_30px_rgba(106,92,255,0.3)] hover:bg-[#5546e0]"
            >
              {busyPlan === "paid" ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout...</> : "Continue to checkout"}
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Questions first? <Link href="https://calendly.com/purvex-llc/30min" className="text-[#6a5cff] hover:text-[#5546e0]">Book a 30-minute call</Link> instead.
        </p>
        {signOutRow}
      </div>
    </AuthShell>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<AuthShell theme="light" width="md"><div className="min-h-[240px]" /></AuthShell>}>
      <PricingContent />
    </Suspense>
  );
}
