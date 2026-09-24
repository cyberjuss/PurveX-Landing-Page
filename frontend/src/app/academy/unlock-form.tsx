"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { unlockAcademy } from "./actions";
import { Button } from "@/components/ui/button";
import { AuthShell, AUTH_INPUT_CLASSNAME_LIGHT } from "@/components/auth/auth-shell";

export function UnlockForm() {
  const [state, formAction, isPending] = useActionState(unlockAcademy, null);

  return (
    <AuthShell
      theme="light"
      width="sm"
      bare
      title="Think Like a SOC Analyst"
      subtitle="Enter the class passcode your instructor gave you to reach the course material."
    >
      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <div className="space-y-2">
          <label htmlFor="passcode" className="block text-sm font-semibold text-slate-700">
            Passcode
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="passcode"
              name="passcode"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Enter passcode"
              className={`${AUTH_INPUT_CLASSNAME_LIGHT} h-16 pl-12 text-lg md:text-lg`}
              disabled={isPending}
              required
            />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-none border-0 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending} size="lg" className="h-12 w-full rounded-full border-0 bg-[#5546e0] text-white shadow-none hover:bg-[#4a3bd4]">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Checking...
            </>
          ) : (
            "Unlock course"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
