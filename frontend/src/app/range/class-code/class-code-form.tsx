"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { unlockAcademy } from "@/app/academy/actions";
import { AuthError, AuthHeading, AuthMinimal } from "@/components/auth/auth-minimal";

export function ClassCodeForm() {
  const [state, formAction, isPending] = useActionState(unlockAcademy, null);

  return (
    <AuthMinimal product="Range">
      <AuthHeading sub="Enter the code your instructor gave you. It adds you to the class, and your seat includes everything in Pro.">
        Join your class
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
          placeholder="Class code"
          className="am-input"
          aria-label="Class code"
          aria-invalid={Boolean(state?.error)}
          disabled={isPending}
          required
        />
        <AuthError>{state?.error}</AuthError>
        <button type="submit" className="am-primary mt-4" disabled={isPending}>
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Join class"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        No code?{" "}
        <Link href="/range" className="am-link">
          Keep going on Explore
        </Link>
        , free.
      </p>
    </AuthMinimal>
  );
}
