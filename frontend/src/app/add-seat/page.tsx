"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { getCurrentUser, signOut } from "@/lib/portal-auth";
import { Users, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const STRIPE_ADD_SEAT_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_ADD_SEAT_LINK_URL || "";

function AddSeatContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  // Same reasoning as login/signup/pricing: the disabled prop on the button
  // below only takes effect on the next render, too late for a fast
  // double-click to be safe against on something that charges a real card.
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (cancelled) return;
      if (!u) {
        router.replace(`/account/login?next=${encodeURIComponent("/add-seat")}`);
        return;
      }
      setUser(u);
    });
    return () => { cancelled = true; };
  }, [router]);

  function handleAddSeat() {
    if (!user || busyRef.current) return;
    if (!STRIPE_ADD_SEAT_LINK_URL) {
      window.alert("Seat add-on checkout isn't configured yet -- set NEXT_PUBLIC_STRIPE_ADD_SEAT_LINK_URL.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    const url = new URL(STRIPE_ADD_SEAT_LINK_URL);
    url.searchParams.set("client_reference_id", user.id);
    if (user.email) url.searchParams.set("prefilled_email", user.email);
    window.location.href = url.toString();
  }

  if (user === undefined) {
    return (
      <AuthShell theme="light" width="sm" bare>
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell theme="light" width="sm" bare hideHeader>
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(106,92,255,0.1)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6a5cff]">
          <Users className="h-3 w-3" strokeWidth={3} />
          Add a seat
        </span>
        <p className="mt-3 text-3xl font-display font-semibold tracking-tight text-slate-900">
          $49<span className="text-base font-medium text-slate-500"> / additional user / mo</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">Billed monthly via Stripe, same as your existing plan.</p>
        <p className="mt-5 text-sm leading-relaxed text-slate-600">
          If your team hit the seat limit on your current license, this adds one more. We&apos;ll email you a
          new license key within one business day of payment -- paste it into <strong>Settings &rarr; License</strong>{" "}
          in your PurveX instance, no restart needed.
        </p>
        <Button
          onClick={handleAddSeat}
          disabled={busy}
          size="lg"
          className="mt-6 h-11 w-full rounded-2xl border-0 bg-[#6a5cff] text-white shadow-[0_10px_30px_rgba(106,92,255,0.3)] hover:bg-[#5546e0]"
        >
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout...</> : "Pay for an additional seat"}
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        Not sure how many seats you need? <Link href="https://calendly.com/purvex-llc/30min" className="text-[#6a5cff] hover:text-[#5546e0]">Book a 30-minute call</Link> instead.
      </p>
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
    </AuthShell>
  );
}

export default function AddSeatPage() {
  return (
    <Suspense fallback={<AuthShell theme="light" width="sm" bare><div className="min-h-[200px]" /></AuthShell>}>
      <AddSeatContent />
    </Suspense>
  );
}
