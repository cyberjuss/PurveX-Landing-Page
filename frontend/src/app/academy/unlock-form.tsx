"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { unlockAcademy } from "./actions";
import Link from "next/link";
import { AuthError, AuthHeading, AuthMinimal } from "@/components/auth/auth-minimal";
import { academyFetch } from "@/lib/academy-client";

export function UnlockForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(unlockAcademy, null);
  // Admins, instructors, and enrolled students skip the code. Ask first.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    academyFetch("/academy/api/access", { method: "POST", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { unlocked?: boolean } | null) => {
        if (cancelled) return;
        if (d?.unlocked) router.refresh();
        else setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // The check above runs once, and a subscriber whose turn at it failed lands
  // here and gets told their code is wrong. They do not have a code. Ask again
  // on a rejection, so a transient failure costs them one attempt, not the page.
  useEffect(() => {
    if (!state?.error) return;
    let cancelled = false;
    academyFetch("/academy/api/access", { method: "POST", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { unlocked?: boolean } | null) => {
        if (!cancelled && d?.unlocked) router.refresh();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [state, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <AuthMinimal product="Range">
      {/* Two ways in, and neither is the default. A class was given a code. An
          individual buys Pro and needs no code at all, so this screen cannot
          open by asking who their instructor is. */}
      <AuthHeading sub="Enter the code your class was given. Anyone here on their own needs no code.">
        Open Range
      </AuthHeading>

      <form action={formAction} className="mt-7">
        <input
          id="passcode"
          name="passcode"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          placeholder="Passcode"
          className="am-input"
          aria-label="Passcode"
          aria-invalid={Boolean(state?.error)}
          disabled={isPending}
          required
        />
        <AuthError>{state?.error}</AuthError>
        <button type="submit" className="am-primary mt-4" disabled={isPending}>
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Unlock course"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        No code?{" "}
        <Link href="/range/upgrade" className="am-link">
          Get Pro for $49 a month
        </Link>{" "}
        and start on your own.
      </p>
    </AuthMinimal>
  );
}
