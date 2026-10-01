"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { unlockAcademy } from "./actions";
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

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <AuthMinimal product="Range">
      <AuthHeading sub="Your instructor gave you this code to open Think Like a SOC Analyst.">
        Enter your class passcode
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
    </AuthMinimal>
  );
}
