"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { AuthHeading, AuthMinimal } from "@/components/auth/auth-minimal";
import { academyFetch } from "@/lib/academy-client";
import { getCurrentUser } from "@/lib/portal-auth";
import type { User } from "@supabase/supabase-js";

// Deliberately a real route under /range rather than a page under /academy.
// next.config.ts rewrites /range/:path* to /academy/:path*, and everything
// under /academy renders inside AcademyShell, which asks for a class
// passcode before it shows anything. Someone who wants to pay us $20 should
// not have to find an instructor first -- a real route wins over the
// rewrite (same trick as /range/join) and skips that gate entirely.

const PAYMENT_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_RANGE_PRO_LINK_URL || "";

const PERKS = [
  "Your own cloud lab one click away in a browser tab",
  "A real Windows domain built just for you",
  "An AI coach that reads your own lab and never hands you the answer",
  "A Proof Profile any employer can verify",
  "Cancel the moment you want to",
];

type Plan = { plan: "free" | "pro"; source: string; until: string | null; canceled: boolean };

function UpgradeContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // The disabled prop only lands on the next render, so a fast double-click
  // can fire this twice and open two checkout tabs.
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then(async (u) => {
      if (cancelled) return;
      if (!u) {
        router.replace(`/account/login?next=${encodeURIComponent("/range/upgrade")}`);
        return;
      }
      setUser(u);
      const res = await academyFetch("/academy/api/plan", { cache: "no-store" }).catch(() => null);
      if (!cancelled && res?.ok) setPlan((await res.json()) as Plan);
      else if (!cancelled) setPlan({ plan: "free", source: "none", until: null, canceled: false });
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const checkout = useCallback(() => {
    if (!user || busyRef.current) return;
    if (!PAYMENT_LINK_URL) {
      setError("Checkout is not configured yet. Email support@purvex.io and we will set you up.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    // client_reference_id is how the Stripe webhook knows which account to
    // grant Pro to -- without it the payment lands with nobody attached.
    const url = new URL(PAYMENT_LINK_URL);
    url.searchParams.set("client_reference_id", user.id);
    if (user.email) url.searchParams.set("prefilled_email", user.email);
    window.location.href = url.toString();
  }, [user]);

  if (user === undefined || !plan) {
    return (
      <AuthMinimal product="Range">
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </AuthMinimal>
    );
  }

  if (plan.plan === "pro") {
    const until = plan.until ? new Date(plan.until).toLocaleDateString(undefined, { dateStyle: "long" }) : null;
    return (
      <AuthMinimal product="Range">
        <AuthHeading
          sub={
            plan.source === "class"
              ? "Your school covers your seat. Everything in Pro is already open to you."
              : plan.canceled && until
                ? `You have cancelled, so this will not renew. Pro stays open until ${until}.`
                : until
                  ? `Your next payment is ${until}.`
                  : "Everything in Pro is already open to you."
          }
        >
          You are on Pro
        </AuthHeading>
        <Link href="/range" className="am-primary mt-7">
          Open Range
        </Link>
      </AuthMinimal>
    );
  }

  return (
    <AuthMinimal product="Range">
      <AuthHeading sub="The shortest road from learning this to being hired for it.">Get Range Pro</AuthHeading>

      <p className="mt-6 text-[2.1rem] font-bold leading-none tracking-tight">
        $20<span className="ml-1 align-middle text-base font-medium text-slate-500">/month</span>
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-[0.95rem] leading-snug">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6a5cff]" strokeWidth={3} aria-hidden="true" />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <button type="button" onClick={checkout} disabled={busy} className="am-primary mt-7">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Opening checkout...
          </>
        ) : (
          "Continue to checkout"
        )}
      </button>

      {error ? (
        <p className="mt-2 text-sm font-medium text-[#d92d20]" role="alert">
          {error}
        </p>
      ) : null}

      <p className="am-legal">
        Billed monthly through Stripe. Cancel anytime. Signed in as {user?.email}.
      </p>
      <p className="mt-3 text-center text-sm">
        <Link href="/range" className="am-link">
          Keep using Explore for free
        </Link>
      </p>
    </AuthMinimal>
  );
}

export default function RangeUpgradePage() {
  return (
    <Suspense
      fallback={
        <AuthMinimal product="Range">
          <div className="min-h-[200px]" />
        </AuthMinimal>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}
