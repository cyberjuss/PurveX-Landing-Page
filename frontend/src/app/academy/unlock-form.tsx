"use client";

import { useActionState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
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
      <div className="mb-2 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(106,92,255,0.25)] bg-[rgba(106,92,255,0.07)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5546e0]">
          <ShieldCheck className="h-3.5 w-3.5" /> Instructor-issued access
        </span>
      </div>

      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <div className="space-y-2">
          <label htmlFor="passcode" className="block text-sm font-semibold text-slate-700">
            Passcode
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              id="passcode"
              name="passcode"
              type="password"
              autoComplete="off"
              placeholder="Enter passcode"
              className={AUTH_INPUT_CLASSNAME_LIGHT}
              disabled={isPending}
              required
            />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending} size="lg" className="h-12 w-full rounded-2xl border-0 bg-[#6a5cff] text-white shadow-[0_10px_30px_rgba(106,92,255,0.3)] hover:bg-[#5546e0]">
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
