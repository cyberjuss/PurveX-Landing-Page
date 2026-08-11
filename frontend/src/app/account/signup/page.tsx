"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { signUpWithPassword, signInWithGoogle } from "@/lib/portal-auth";
import { Loader2, Lock, Mail, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

const AUTH_INPUT_CLASSNAME =
  "w-full rounded-2xl border border-[var(--pvrx-border-light)] bg-white px-10 py-3.5 text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 focus:border-[rgba(106,92,255,0.6)] focus:outline-none focus:ring-4 focus:ring-[rgba(106,92,255,0.12)] disabled:opacity-60";

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[!@#$%^&*(),.?":{}|<>[\]\\/+=~`_-]/.test(pw)) score++;
  return score;
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function PortalSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Carries the plan picked on /platform's pricing cards through the whole
  // signup -> confirm-email -> /pricing round trip, so /pricing can act on
  // it immediately instead of asking again -- see /pricing's own handling.
  const plan = searchParams?.get("plan") === "paid" ? "paid" : searchParams?.get("plan") === "free" ? "free" : null;
  const pricingTarget = plan ? `/pricing?plan=${plan}` : "/pricing";
  // Same reasoning as the login page: warm the route before it's needed.
  useEffect(() => {
    router.prefetch(pricingTarget);
  }, [router, pricingTarget]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phase, setPhase] = useState<"form" | "submitting" | "google" | "sent">("form");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Fair", "Good", "Strong"][strength] || "";
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][strength] || "";

  // The disabled prop on the buttons below only takes effect on the next
  // render -- a fast double-click (or a double-tap on mobile) can fire the
  // handler twice before that render happens, sending two signup requests.
  // A ref is checked and set synchronously, so it closes that gap regardless
  // of render timing.
  const busyRef = useRef(false);

  async function handleGoogle() {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);
    setPhase("google");
    try {
      const redirectTo = `${window.location.origin}${pricingTarget}`;
      await signInWithGoogle(redirectTo);
      // Browser is redirected to Google by Supabase; nothing else to do here.
    } catch (err) {
      busyRef.current = false;
      setPhase("form");
      setError(getErrorMessage(err, "Unable to start Google sign-in."));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busyRef.current) return;
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (strength < 4) {
      setError("Use at least 8 characters, mixing upper/lowercase, a number, and a symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    busyRef.current = true;
    setPhase("submitting");
    try {
      const emailRedirectTo = `${window.location.origin}${pricingTarget}`;
      const { session } = await signUpWithPassword(email.trim(), password, emailRedirectTo);
      if (session) {
        router.push(pricingTarget);
        return;
      }
      // Email confirmation is required before a session exists.
      busyRef.current = false;
      setPhase("sent");
    } catch (err) {
      busyRef.current = false;
      setPhase("form");
      setError(getErrorMessage(err, "Unable to create your account."));
    }
  }

  const isLoading = phase === "submitting" || phase === "google";

  if (phase === "sent") {
    return (
      <AuthShell theme="light" width="sm" bare title="Check your inbox" subtitle={`We sent a confirmation link to ${email}.`}>
        <div className="mt-4 flex flex-col items-center gap-4 px-8 pb-6">
          <div className="rounded-full bg-emerald-50 p-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-center text-sm leading-relaxed text-slate-600">
            {plan
              ? `Confirm your email and you'll be taken straight to your ${plan === "paid" ? "paid" : "free"} plan — no need to choose again.`
              : "Confirm your email, then come back and sign in to choose a plan."}
          </p>
          <Link
            href={plan ? `/account/login?next=${encodeURIComponent(pricingTarget)}` : "/account/login"}
            className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#6a5cff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell theme="light" width="sm" bare title="Create your account" subtitle="One account to pick a plan and get PurveX running.">
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isLoading}
          className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[var(--pvrx-border-light)] bg-white text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[var(--pvrx-border-light)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">or</span>
          <span className="h-px flex-1 bg-[var(--pvrx-border-light)]" />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Work email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={AUTH_INPUT_CLASSNAME}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${AUTH_INPUT_CLASSNAME} pr-11`}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${(strength / 5) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-500">{strengthLabel}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700">Confirm password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              id="confirm"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${AUTH_INPUT_CLASSNAME} pr-11`}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-700"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="mt-2 h-12 w-full rounded-2xl border-0 bg-[#6a5cff] text-white shadow-[0_10px_30px_rgba(106,92,255,0.3)] hover:bg-[#5546e0]"
        >
          {phase === "submitting" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href={plan ? `/account/login?next=${encodeURIComponent(pricingTarget)}` : "/account/login"}
            className="font-medium text-[#6a5cff] hover:text-[#5546e0]"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function PortalSignupPage() {
  return (
    <Suspense fallback={<AuthShell theme="light" width="sm" bare><div className="min-h-[200px]" /></AuthShell>}>
      <PortalSignupContent />
    </Suspense>
  );
}
