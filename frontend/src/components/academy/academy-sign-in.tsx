"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthMinimal } from "@/components/auth/auth-minimal";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/lib/portal-auth";
import { markAcademyWelcome } from "@/components/academy/academy-welcome";

function errorText(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function AcademySignIn({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const busyRef = useRef(false);

  const returnTo = () => `${window.location.origin}${window.location.pathname}`;

  async function handleGoogle() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      markAcademyWelcome();
      await signInWithGoogle(returnTo());
    } catch (err) {
      busyRef.current = false;
      setBusy(false);
      setError(errorText(err, "Unable to start Google sign-in."));
    }
  }

  function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value || !value.includes("@") || !value.includes(".")) {
      setError("Enter a valid email address.");
      return;
    }
    setEmail(value);
    setError(null);
    setStep("password");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busyRef.current) return;
    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") {
        markAcademyWelcome();
        await signInWithPassword(email.trim(), password);
      } else {
        const { session } = await signUpWithPassword(email.trim(), password, returnTo());
        if (session) markAcademyWelcome();
        if (!session) setSentTo(email.trim());
      }
    } catch (err) {
      setError(errorText(err, mode === "signin" ? "Unable to sign in." : "Unable to create your account."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
  }

  function back() {
    setStep("email");
    setPassword("");
    setShowPassword(false);
    setError(null);
  }

  if (!configured) {
    return (
      <AuthMinimal>
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">Student accounts are not set up yet</h1>
        <p className="mt-3 text-base text-slate-600">Ask your instructor to finish setting up PurveX Academy.</p>
      </AuthMinimal>
    );
  }

  if (sentTo) {
    return (
      <AuthMinimal>
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">Check your inbox</h1>
        <p className="mt-3 text-base text-slate-600">
          We sent a confirmation link to <strong className="text-[#10192e]">{sentTo}</strong>. Confirm your email and you will land back in the Academy, signed in.
        </p>
        <button
          type="button"
          className="am-secondary mt-8"
          onClick={() => {
            setSentTo(null);
            setMode("signin");
            back();
          }}
        >
          Back to sign in
        </button>
      </AuthMinimal>
    );
  }

  if (step === "email") {
    return (
      <AuthMinimal>
        <div key="email" className="am-step">
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight">
            {mode === "signin" ? "What is your email?" : "Create your account"}
          </h1>
          {mode === "signup" && <p className="mt-2 text-base text-slate-600">Start with your email address.</p>}

          <form onSubmit={handleEmail} className="mt-7" noValidate>
            <input
              id="academy-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="am-input"
              aria-label="Email"
              aria-invalid={Boolean(error)}
              disabled={busy}
            />
            {error && (
              <p className="mt-2 text-sm font-medium text-[#d92d20]" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="am-primary mt-4" disabled={busy}>
              Continue
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-sm text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button type="button" className="am-secondary" onClick={handleGoogle} disabled={busy}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleMark />}
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-600">
            {mode === "signin" ? "New to the Academy? " : "Already have an account? "}
            <button type="button" onClick={switchMode} className="am-link">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="mt-6 text-xs leading-5 text-slate-500">
            By continuing you agree to the{" "}
            <Link href="/legal/terms" className="underline underline-offset-2 hover:text-[#10192e]">Terms</Link> and{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-[#10192e]">Privacy Policy</Link>.
          </p>
        </div>
      </AuthMinimal>
    );
  }

  return (
    <AuthMinimal>
      <div key="password" className="am-step">
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className="-ml-2 mb-6 grid h-10 w-10 place-items-center rounded-full text-[#10192e] transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">
          {mode === "signin" ? "Enter your password" : "Create a password"}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-base text-slate-600">
          <span className="truncate">{email}</span>
          <button type="button" onClick={back} className="am-link text-sm">Edit</button>
        </p>

        <form onSubmit={handleSubmit} className="mt-7" noValidate>
          <div className="relative">
            <input
              id="academy-password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              autoFocus
              placeholder={mode === "signin" ? "Password" : "At least 8 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="am-input"
              style={{ paddingRight: 52 }}
              aria-label="Password"
              aria-invalid={Boolean(error)}
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-slate-500 hover:text-[#10192e]"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm font-medium text-[#d92d20]" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="am-primary mt-4" disabled={busy}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "signin" && (
          <p className="mt-6 text-sm">
            <Link href="/forgot-password" className="am-link">
              Forgot password?
            </Link>
          </p>
        )}
      </div>
    </AuthMinimal>
  );
}
