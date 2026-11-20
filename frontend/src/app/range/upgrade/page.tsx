"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Bot, CalendarClock, Cloud, Loader2, MessagesSquare, RotateCcw, ShieldCheck, type LucideIcon } from "lucide-react";
import { AuthHeading, AuthMinimal } from "@/components/auth/auth-minimal";
import { academyFetch } from "@/lib/academy-client";
import { getCurrentUser } from "@/lib/portal-auth";
import type { User } from "@supabase/supabase-js";

// Deliberately a real route under /range rather than a page under /academy.
// next.config.ts rewrites /range/:path* to /academy/:path*, and everything
// under /academy renders inside AcademyShell, which asks for a class
// passcode before it shows anything. Someone who wants to pay us $49 should
// not have to find an instructor first -- a real route wins over the
// rewrite (same trick as /range/join) and skips that gate entirely.

// Only the build-time copy. /academy/api/plan serves the same links read at
// request time, and those win -- see the route for why. Two links, same
// price: one carries a 3-day trial, the other charges right away for anyone
// who already decided and would rather not wait three days to know the card
// works.
const BUILT_IN_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_RANGE_PRO_LINK_URL || "";
const BUILT_IN_DIRECT_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_RANGE_PRO_LINK_URL_DIRECT || "";

// What Pro adds over the free plan, each with one line of what it means.
// Keep in step with the training page's pricing card and the #go-pro post.
const PERKS: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: Cloud, title: "Your own cloud lab", body: "A real Windows domain built just for you, open in a browser tab. Nothing to install." },
  { Icon: Bot, title: "An AI coach that reads your lab", body: "Stuck on a ticket? It looks at your directory and gives you the next step, never the answer." },
  { Icon: BadgeCheck, title: "Your portfolio", body: "Your verified work, screenshots and recorded solves on one page, with a credential ID employers can check." },
  { Icon: MessagesSquare, title: "Private Pro channels", body: "A Pro lounge, cloud lab help and portfolio reviews in the Range Discord." },
];

const ASSURANCES: { Icon: LucideIcon; text: string }[] = [
  { Icon: CalendarClock, text: "No charge for 3 days" },
  { Icon: RotateCcw, text: "Cancel in one click" },
  { Icon: ShieldCheck, text: "Secure checkout by Stripe" },
];

type Plan = {
  plan: "free" | "pro";
  source: string;
  until: string | null;
  canceled: boolean;
  checkoutUrl?: string;
  directCheckoutUrl?: string;
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
  // Carried the same way as checkout=1: a click from the pricing page's
  // smaller "skip the trial" link, saying which Payment Link to send a
  // decisive buyer straight to. Both buttons below offer the same choice to
  // anyone who lands here without it.
  const skipTrial = searchParams?.get("trial") === "0";
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [plan, setPlan] = useState<Plan | null>(null);
  // Which button is mid-click, so only the one actually pressed shows the
  // spinner -- a shared busy flag would freeze both at once from one click.
  const [pending, setPending] = useState<"trial" | "direct" | null>(null);
  const [error, setError] = useState("");
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState("");
  // The disabled prop only lands on the next render, so a fast double-click
  // can fire this twice and open two checkout tabs.
  const busyRef = useRef(false);

  // Stripe hosts the whole thing: change the card, read a receipt, cancel. The
  // session is single use and short lived, so it is minted per click rather
  // than held in state.
  const openBilling = useCallback(async () => {
    setBillingBusy(true);
    setBillingError("");
    try {
      const res = await academyFetch("/academy/api/billing-portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Could not open billing.");
      window.location.href = data.url;
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : "Could not open billing.");
      setBillingBusy(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then(async (u) => {
      if (cancelled) return;
      if (!u) {
        // Sign-up, not sign-in. "Get Pro" is an acquisition button: most
        // people arriving here have never had an account, and greeting them
        // with "Welcome back" asks for a password they never set. The signup
        // screen carries its own "Sign in" link for everyone else.
        const back = straightToCheckout ? `/range/upgrade?checkout=1${skipTrial ? "&trial=0" : ""}` : "/range/upgrade";
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
  }, [router, straightToCheckout, skipTrial]);

  const trialLinkUrl = plan?.checkoutUrl || BUILT_IN_LINK_URL;
  const directLinkUrl = plan?.directCheckoutUrl || BUILT_IN_DIRECT_LINK_URL;

  // Leaves the page, so it sets no state of its own -- which is also what
  // lets the auto-redirect effect below call it without setting state in an
  // effect. Only the button needs a pending look, and it does that itself.
  const goToStripe = useCallback(
    (linkUrl: string) => {
      if (!user || busyRef.current || !linkUrl) return;
      busyRef.current = true;
      // client_reference_id is how the Stripe webhook knows which account to
      // grant Pro to -- without it the payment lands with nobody attached.
      const url = new URL(linkUrl);
      url.searchParams.set("client_reference_id", user.id);
      if (user.email) url.searchParams.set("prefilled_email", user.email);
      window.location.href = url.toString();
    },
    [user]
  );

  const checkout = useCallback(
    (which: "trial" | "direct") => {
      if (!user || busyRef.current) return;
      const linkUrl = which === "trial" ? trialLinkUrl : directLinkUrl;
      if (!linkUrl) {
        setError("Checkout is not configured yet. Email support@purvex.io and we will set you up.");
        return;
      }
      setPending(which);
      goToStripe(linkUrl);
    },
    [user, trialLinkUrl, directLinkUrl, goToStripe]
  );

  // Pressed Get Pro (or its skip-the-trial twin), then made an account:
  // carry on to Stripe rather than landing them back on an offer they
  // already accepted. Waits for `plan` so an existing subscriber is never
  // sent to buy a second one, and falls through to the offer screen when
  // checkout is not configured, instead of leaving someone on a spinner that
  // never resolves.
  const autoLinkUrl = skipTrial ? directLinkUrl : trialLinkUrl;
  const autoCheckout = straightToCheckout && Boolean(autoLinkUrl);
  useEffect(() => {
    if (user && plan?.plan === "free" && autoCheckout) goToStripe(autoLinkUrl);
  }, [user, plan, autoCheckout, autoLinkUrl, goToStripe]);

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
        {/* Only for a subscription they pay for themselves. A class seat and a
            comped account have no bill of their own to manage, and offering a
            portal that cannot open is worse than not offering one. */}
        {plan.source === "subscription" && (
          <>
            <button type="button" className="am-legal mt-4 underline underline-offset-4" onClick={openBilling} disabled={billingBusy}>
              {billingBusy ? "Opening billing…" : "Manage billing or cancel"}
            </button>
            {billingError && <p className="am-legal !text-left mt-2 text-red-600">{billingError}</p>}
          </>
        )}
      </AuthMinimal>
    );
  }

  return (
    <AuthMinimal product="Range">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5546e0]">Range Pro</p>
      <AuthHeading sub="Every lesson in the Range stays free. Pro is for when you want the job.">Get Range Pro</AuthHeading>

      {/* Price, trial and what it buys, as one card. Each perk gets a title
          and one line of what it means, rather than a list of fragments. */}
      <div className="mt-7 overflow-hidden rounded-2xl border border-[#e6e7ee] bg-white shadow-[0_1px_2px_rgba(16,25,46,0.04),0_18px_40px_-30px_rgba(16,25,46,0.25)]">
        <div className="px-6 pb-5 pt-6">
          <div className="flex items-end gap-2">
            <span className="text-[2.6rem] font-bold leading-none tracking-tight text-[#10192e]">$49</span>
            <span className="pb-1 text-sm font-medium text-slate-500">per month</span>
            <span className="mb-1 ml-auto rounded-full bg-[#efecff] px-2.5 py-1 text-xs font-semibold text-[#5546e0]">3 days free</span>
          </div>
          <p className="mt-2 text-[0.85rem] leading-snug text-slate-500">Billed monthly after your trial. Cancel in one click.</p>
        </div>
        <ul className="divide-y divide-[#eef0f5] border-t border-[#eef0f5]">
          {PERKS.map(({ Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3.5 px-6 py-4">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f0ff] text-[#5546e0]">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <strong className="block text-[0.95rem] font-semibold text-[#10192e]">{title}</strong>
                <span className="mt-0.5 block text-[0.84rem] leading-snug text-slate-500">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button type="button" onClick={() => checkout("trial")} disabled={pending !== null} className="am-primary mt-6">
        {pending === "trial" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Opening checkout...
          </>
        ) : (
          "Start your 3-day free trial"
        )}
      </button>

      {/* The same purchase, for someone who already decided and would rather
          not wait three days to know the card works. Only shown when the
          second link actually exists, so a misconfigured env never offers a
          button that 503s. */}
      {directLinkUrl && (
        <p className="mt-3 text-center text-sm text-slate-500">
          Already sure?{" "}
          <button
            type="button"
            onClick={() => checkout("direct")}
            disabled={pending !== null}
            className="font-medium text-[#39415a] underline underline-offset-4 hover:text-[#10192e]"
          >
            {pending === "direct" ? "Opening checkout…" : "Skip the trial and pay $49 now"}
          </button>
        </p>
      )}

      {error ? (
        <p className="mt-3 text-sm font-medium text-[#d92d20]" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="mt-6 grid grid-cols-1 gap-2.5 text-[0.8rem] text-slate-500 sm:grid-cols-3 sm:gap-3">
        {ASSURANCES.map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-2 sm:flex-col sm:gap-1.5 sm:text-center">
            <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {/* Which account is about to be charged belongs with the decision, and
          the way out sits beside it. */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[#eceef4] pt-4 text-[0.82rem] text-slate-500">
        <span>
          Signed in as <span className="font-medium text-[#39415a]">{user?.email}</span>
        </span>
        <Link href="/range" className="am-link">
          Keep using the Range free
        </Link>
      </div>
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
