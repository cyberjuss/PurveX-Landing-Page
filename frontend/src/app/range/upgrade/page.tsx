"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { AuthHeading, AuthMinimal } from "@/components/auth/auth-minimal";
import { academyFetch } from "@/lib/academy-client";
import { getCurrentUser } from "@/lib/portal-auth";
import type { User } from "@supabase/supabase-js";

// Deliberately a real route under /range rather than a page under /academy.
// next.config.ts rewrites /range/:path* to /academy/:path*, and everything
// under /academy renders inside AcademyShell, which asks for a class
// passcode before it shows anything. Someone who wants to pay us $29 should
// not have to find an instructor first -- a real route wins over the
// rewrite (same trick as /range/join) and skips that gate entirely.

// Only the build-time copy. /academy/api/plan serves the same link read at
// request time, and that one wins -- see the route for why.
const BUILT_IN_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_RANGE_PRO_LINK_URL || "";

const PERKS = [
  "A cloud lab of your own in a browser tab",
  "A real Windows domain built for one person",
  "An AI coach that reads the lab and never hands over the answer",
  "A Proof Profile any employer can verify",
  "Cancel in one click",
];

type Plan = {
  plan: "free" | "pro";
  source: string;
  until: string | null;
  canceled: boolean;
  checkoutUrl?: string;
};

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set by the Get Pro button on the pricing page, and carried back through
  // signup. It means "this person already read the price and the perks and
  // pressed buy" -- so send them straight to Stripe instead of showing the
  // same offer a second time with another button on it.
  //
  // Links from inside the product (the passcode screen, the Coach lock, the
  // lab setup note) deliberately leave it off: those are text links next to
  // other content, and throwing someone at a payment page from one with no
  // price on screen first would be a nasty surprise.
  const straightToCheckout = searchParams?.get("checkout") === "1";
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
        // Sign-up, not sign-in. "Get Pro" is an acquisition button: most
        // people arriving here have never had an account, and greeting them
        // with "Welcome back" asks for a password they never set. The signup
        // screen carries its own "Sign in" link for everyone else.
        const back = straightToCheckout ? "/range/upgrade?checkout=1" : "/range/upgrade";
        router.replace(`/account/signup?next=${encodeURIComponent(back)}`);
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
  }, [router, straightToCheckout]);

  const linkUrl = plan?.checkoutUrl || BUILT_IN_LINK_URL;

  // Leaves the page, so it sets no state of its own -- which is also what
  // lets the auto-redirect effect below call it without setting state in an
  // effect. Only the button needs a pending look, and it does that itself.
  const goToStripe = useCallback(() => {
    if (!user || busyRef.current || !linkUrl) return;
    busyRef.current = true;
    // client_reference_id is how the Stripe webhook knows which account to
    // grant Pro to -- without it the payment lands with nobody attached.
    const url = new URL(linkUrl);
    url.searchParams.set("client_reference_id", user.id);
    if (user.email) url.searchParams.set("prefilled_email", user.email);
    window.location.href = url.toString();
  }, [user, linkUrl]);

  const checkout = useCallback(() => {
    if (!user || busyRef.current) return;
    if (!linkUrl) {
      setError("Checkout is not configured yet. Email support@purvex.io and we will set you up.");
      return;
    }
    setBusy(true);
    goToStripe();
  }, [user, linkUrl, goToStripe]);

  // Pressed Get Pro, then made an account: carry on to Stripe rather than
  // landing them back on an offer they already accepted. Waits for `plan`
  // so an existing subscriber is never sent to buy a second one, and falls
  // through to the offer screen when checkout is not configured, instead of
  // leaving someone on a spinner that never resolves.
  const autoCheckout = straightToCheckout && Boolean(linkUrl);
  useEffect(() => {
    if (user && plan?.plan === "free" && autoCheckout) goToStripe();
  }, [user, plan, autoCheckout, goToStripe]);

  if (user === undefined || !plan || (plan.plan === "free" && autoCheckout)) {
    return (
      <AuthMinimal product="Range">
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          {plan?.plan === "free" && autoCheckout ? "Taking you to checkout..." : null}
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
      <AuthHeading sub="A cloud lab of your own on a real Windows domain. An AI coach that reads it. A Proof Profile any employer can verify.">
        Get Range Pro
      </AuthHeading>

      {/* Price and what it buys read as one block. Loose on the page they were
          two unrelated lists with nothing holding them together. */}
      <div className="mt-7 rounded-xl border border-[#e6e7ee] bg-[#fbfbfd]">
        <div className="flex items-baseline gap-2 border-b border-[#eceef4] px-5 py-4">
          <span className="text-[2rem] font-bold leading-none tracking-tight text-[#10192e]">$29</span>
          <span className="text-sm font-medium text-slate-500">per month</span>
          <span className="ml-auto text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Range Pro</span>
        </div>
        <ul className="flex flex-col gap-2.5 px-5 py-4">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5 text-[0.93rem] leading-snug text-[#39415a]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6a5cff]" strokeWidth={3} aria-hidden="true" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Which account is about to be charged belongs with the decision, not
          buried in the billing line underneath it. */}
      <p className="mt-6 text-[0.8rem] text-slate-500">
        Signed in as <span className="font-medium text-[#39415a]">{user?.email}</span>
      </p>

      <button type="button" onClick={checkout} disabled={busy} className="am-primary mt-2">
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

      {/* Left aligned like everything above it. .am-legal centres itself, which
          suits the sign-in screens and left this page looking half-justified. */}
      <p className="am-legal !text-left">Billed monthly through Stripe and you can cancel any time.</p>
      <p className="mt-5 border-t border-[#eceef4] pt-4 text-sm text-slate-500">
        Not now?{" "}
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
