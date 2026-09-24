"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { unlockAcademy } from "./actions";
import { AuthError, AuthHeading, AuthMinimal } from "@/components/auth/auth-minimal";

export function UnlockForm() {
  const [state, formAction, isPending] = useActionState(unlockAcademy, null);

  return (
    <AuthMinimal product="Academy">
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
