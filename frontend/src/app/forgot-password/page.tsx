"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchAcrossApiBases } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const AUTH_INPUT_CLASSNAME =
  "w-full rounded-2xl border border-white/10 bg-[#0c1220] px-10 py-3 text-sm text-white shadow-none transition placeholder:text-slate-500 focus:border-[rgba(72,99,255,0.75)] focus:outline-none focus:ring-4 focus:ring-[rgba(72,99,255,0.12)] disabled:opacity-100";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"form" | "sending" | "sent">("form");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError(null);
    setPhase("sending");

    try {
      const { response: res } = await fetchAcrossApiBases("/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.status === 429) {
        setError("Too many requests. Please wait a few minutes and try again.");
        setPhase("form");
        return;
      }

      if (!res.ok && res.status >= 500) {
        setError("Unable to send reset email right now. Please try again.");
        setPhase("form");
        return;
      }

      setPhase("sent");
    } catch {
      setError("Unable to connect to the server. Please try again.");
      setPhase("form");
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle={
        phase === "sent"
          ? "Check your inbox for a reset link."
          : "Enter the email associated with your account."
      }
    >
      <div className="w-full">
                {phase === "sent" ? (
                    <div className="mt-4 flex flex-col items-center gap-4">
                      <div className="rounded-full bg-emerald-500/12 p-3 dark:bg-emerald-500/18">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 dark:text-emerald-300" />
                      </div>
                    <p className="text-center text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                      If an account exists for <strong className="text-slate-900 dark:text-white">{email}</strong>,
                      you&apos;ll receive a password reset link shortly.
                    </p>
                    <Link
                      href="/"
                      className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-300"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back home
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-zinc-200">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <input
                          id="email"
                          type="email"
                          className={AUTH_INPUT_CLASSNAME}
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                          disabled={phase === "sending"}
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200" role="alert">{error}</p>
                    )}

                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      disabled={phase === "sending"}
                      className="mt-2 h-12 w-full rounded-2xl border-0 bg-[rgb(72,99,255)] text-white shadow-[0_10px_30px_rgba(72,99,255,0.35)] hover:bg-[rgb(86,111,255)]"
                    >
                      {phase === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send reset link"
                      )}
                    </Button>

                    <div className="flex justify-center mt-4">
                      <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-300">
                        <ArrowLeft className="h-4 w-4" />
                        Back home
                      </Link>
                    </div>
                  </form>
                )}
      </div>
    </AuthShell>
  );
}
