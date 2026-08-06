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
  "30-day audit log retention",
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
  // Explicit escape hatch from the "Choose again" link below -- without
  // this, a returning user with a plan already on file could never get
  // back to the full picker, since a bare /pricing would just look up
  // storage and land them right back on the same confirm screen.
  const forceChoose = searchParams?.get("plan") === "choose";

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [busyPlan, setBusyPlan] = useState<"free" | "paid" | null>(null);
  // A plan already on file from a previous visit (recordPlanSelection below
  // writes this) -- someone who chose once and comes back later, with no
  // ?plan= in the URL this time, shouldn't have to choose again either.
  const [storedPlan, setStoredPlan] = useState<"free" | "paid" | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const autoRanFree = useRef(false);
  const autoRanPaid = useRef(false);

  // Whichever says a plan was already decided: an explicit ?plan= on this
  // visit, or one saved from a previous visit. Everything below acts on
  // this instead of the raw `preselected`. forceChoose overrides both, so
  // "Choose again" always reaches the full picker.
  const effectivePlan = forceChoose ? null : preselected ?? storedPlan;

  // Warm the free-plan destination -- handleFree() below either runs
  // automatically (preselected) or on a single click, both cases benefit
  // from the route already being fetched.
  useEffect(() => {
    router.prefetch("/get-purvex?plan=free");
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then(async (u) => {
      if (cancelled) return;
      if (!u) {
        const next = preselected ? `/pricing?plan=${preselected}` : "/pricing";
        router.replace(`/account/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setUser(u);

      // Only worth checking storage if this visit didn't already say what
      // plan to use -- an explicit ?plan= always wins, no network round
      // trip needed to render the right thing.
      if (!preselected && !forceChoose && supabase) {
        const { data } = await supabase
          .from("portal_profiles")
          .select("plan")
          .eq("user_id", u.id)
          .maybeSingle();
        if (!cancelled && (data?.plan === "free" || data?.plan === "paid")) {
          setStoredPlan(data.plan);
        }
      }
      if (!cancelled) setProfileChecked(true);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // The disabled prop on the buttons below only takes effect on the next
  // render -- a fast double-click can fire the handler twice before that
  // render happens (double-charging risk on the paid path, a duplicate
  // portal_profiles write on free). Shared across both handlers and the
  // auto-run effect below, so a manual click racing an auto-run can't slip
  // through either.
  const busyRef = useRef(false);

  async function handleFree() {
    if (!user || busyRef.current) return;
    busyRef.current = true;
    setBusyPlan("free");
    try {
      await recordPlanSelection(user, "free");
      router.push("/get-purvex?plan=free");
    } finally {
      busyRef.current = false;
      setBusyPlan(null);
    }
  }

  async function handlePaid() {
    if (!user || busyRef.current) return;
    if (!STRIPE_PAYMENT_LINK_URL) {
      window.alert("Checkout isn't configured yet -- set NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL.");
      return;
    }
    busyRef.current = true;
    setBusyPlan("paid");
    try {
      await recordPlanSelection(user, "paid", user.id);
      const url = new URL(STRIPE_PAYMENT_LINK_URL);
      url.searchParams.set("client_reference_id", user.id);
      if (user.email) url.searchParams.set("prefilled_email", user.email);
      window.location.href = url.toString();
    } finally {
      busyRef.current = false;
      setBusyPlan(null);
    }
  }

  // A plan already decided -- either this visit or a previous one -- means
  // nothing left to ask, so carry it out immediately instead of making
  // someone who already chose click through a confirm screen. Paid only
  // auto-runs when checkout is actually configured; if it isn't, this
  // silently falls through to the fallback confirm screen below instead of
  // leaving someone stuck on a spinner that never resolves.
  useEffect(() => {
    if (user && effectivePlan === "free" && !autoRanFree.current) {
      autoRanFree.current = true;
      void handleFree();
    }
    if (user && effectivePlan === "paid" && STRIPE_PAYMENT_LINK_URL && !autoRanPaid.current) {
      autoRanPaid.current = true;
      void handlePaid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, effectivePlan]);

  // Waiting on either the session check or (when there's no ?plan= on the
  // URL) the stored-plan lookup -- both need to resolve before it's safe to
  // decide whether the full picker should render at all, or this would
  // flash it for a frame even for someone who already chose a plan. Once
  // effectivePlan resolves, the effect above fires handleFree()/handlePaid()
  // immediately, and busyPlan briefly resets to null in its `finally` right
  // as the redirect fires, which is the other case this screen absorbs.
  const autoRedirecting = effectivePlan === "free" || (effectivePlan === "paid" && Boolean(STRIPE_PAYMENT_LINK_URL));
  if (user === undefined || !profileChecked || autoRedirecting) {
    return (
      <AuthShell theme="light" width="md" bare>
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {effectivePlan === "free" ? "Setting up your free plan..." : null}
          {effectivePlan === "paid" ? "Redirecting to checkout..." : null}
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

  // Only reached when checkout isn't configured -- the effect above already
  // auto-redirects straight to Stripe when STRIPE_PAYMENT_LINK_URL is set,
  // so this is the fallback for a broken/missing env var, not a normal
  // step in the flow. Gives handlePaid's "not configured" alert a screen
  // to alert on top of, and a retry button, instead of a dead end.
  if (effectivePlan === "paid") {
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
          Picked the wrong plan? <Link href="/pricing?plan=choose" className="text-[#6a5cff] hover:text-[#5546e0]">Choose again</Link>
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
    <Suspense fallback={<AuthShell theme="light" width="md" bare><div className="min-h-[240px]" /></AuthShell>}>
      <PricingContent />
    </Suspense>
  );
}
