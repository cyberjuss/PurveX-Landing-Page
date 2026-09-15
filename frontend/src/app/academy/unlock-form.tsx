"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Loader2, Lock } from "lucide-react";
import { unlockAcademy } from "./actions";
import { Button } from "@/components/ui/button";

export function UnlockForm() {
  const [state, formAction, isPending] = useActionState(unlockAcademy, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] border border-[var(--pvrx-border-light)] bg-white shadow-[0_18px_48px_-22px_rgba(15,23,42,0.25)]">
            <Image src="/logo.png" alt="" width={42} height={42} priority />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
            Think Like a SOC Analyst
          </h1>
          <p className="mt-2.5 max-w-sm text-sm leading-6 text-slate-500">
            Enter the class passcode your instructor gave you to reach the course material.
          </p>
        </div>

        <form action={formAction} className="mt-8 flex flex-col gap-5">
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
                className="w-full rounded-2xl border border-[var(--pvrx-border-light)] bg-white px-10 py-4 text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 focus:border-[rgba(106,92,255,0.6)] focus:outline-none focus:ring-4 focus:ring-[rgba(106,92,255,0.12)] disabled:opacity-60"
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
      </div>
    </div>
  );
}
