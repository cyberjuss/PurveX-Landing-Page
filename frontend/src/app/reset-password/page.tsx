"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchAcrossApiBases } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

const AUTH_INPUT_CLASSNAME =
  "w-full rounded-2xl border border-white/10 bg-[#0c1220] px-10 py-3 text-sm text-white shadow-none transition placeholder:text-slate-500 focus:border-[rgba(72,99,255,0.75)] focus:outline-none focus:ring-4 focus:ring-[rgba(72,99,255,0.12)] disabled:opacity-100";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<"form" | "submitting" | "success" | "error">("form");
  const [error, setError] = useState<string | null>(null);

  // Password strength indicator
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[!@#$%^&*(),.?":{}|<>\[\]\\/+=~`_-]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Fair", "Good", "Strong"][strength] || "";
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][strength] || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain a lowercase letter.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter.");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Password must contain a number.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>\[\]\\/_ +=~`-]/.test(password)) {
      setError("Password must contain a special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setPhase("submitting");

    try {
      const { response: res } = await fetchAcrossApiBases("/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to reset password. The link may have expired.");
      }

      setPhase("success");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "An error occurred. Please try again."));
      setPhase("error");
    }
  }

  if (!token) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 mt-4 px-8 pb-6">
          <div className="rounded-full bg-red-500/20 p-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-center text-sm text-slate-600 dark:text-zinc-300">
            No reset token found. Please use the link from your email, or request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-300"
          >
            Request new reset link
          </Link>
        </div>
      </PageShell>
    );
  }

  if (phase === "success") {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 mt-4 px-8 pb-6">
          <div className="rounded-full bg-emerald-500/12 p-3 dark:bg-emerald-500/18">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 dark:text-emerald-300" />
          </div>
          <p className="text-center text-sm text-slate-600 dark:text-zinc-300">
            Your password has been reset successfully.
          </p>
          <Button asChild variant="default" size="lg" className="mt-2 h-12 w-full rounded-2xl border-slate-950 bg-slate-950 text-white shadow-none hover:border-slate-800 hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:border-zinc-200 dark:hover:bg-zinc-100">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full">
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-zinc-200">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`${AUTH_INPUT_CLASSNAME} pr-12`}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={phase === "submitting"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strengthColor}`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400">{strengthLabel}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                className={AUTH_INPUT_CLASSNAME}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={phase === "submitting"}
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
            disabled={phase === "submitting"}
            className="mt-2 h-12 w-full rounded-2xl border-slate-950 bg-slate-950 text-white shadow-none hover:border-slate-800 hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:border-zinc-200 dark:hover:bg-zinc-100"
          >
            {phase === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset password"
            )}
          </Button>

          <div className="flex justify-center mt-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-300">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthShell title="New password" subtitle="Choose a strong password for your account.">
      {children}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--surface-page)] dark:bg-[#090909]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
