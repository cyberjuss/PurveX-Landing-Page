"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  AuthDivider,
  AuthError,
  AuthHeading,
  AuthMinimal,
  BackButton,
  GoogleMark,
  PasswordInput,
} from "@/components/auth/auth-minimal";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/lib/portal-auth";
import { markAcademyWelcome } from "@/components/academy/academy-welcome";

function errorText(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function AcademySignIn({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setError(null);
  }

  if (!configured) {
    return (
      <AuthMinimal product="Academy">
        <AuthHeading sub="Ask your instructor to finish setting up PurveX Academy.">Student accounts are not set up yet</AuthHeading>
      </AuthMinimal>
    );
  }

  if (sentTo) {
    return (
      <AuthMinimal product="Academy">
        <AuthHeading
          sub={
            <>
              We sent a confirmation link to <strong className="text-[#10192e]">{sentTo}</strong>. Confirm your email and you will land back in the Academy, signed in.
            </>
          }
        >
          Check your inbox
        </AuthHeading>
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
      <AuthMinimal product="Academy">
        <div key="email" className="am-step">
          <AuthHeading sub={mode === "signup" ? "Start with your email address." : undefined}>
            {mode === "signin" ? "What is your email?" : "Create your account"}
          </AuthHeading>

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
            <AuthError>{error}</AuthError>
            <button type="submit" className="am-primary mt-4" disabled={busy}>
              Continue
            </button>
          </form>

          <AuthDivider />

          <button type="button" className="am-secondary" onClick={handleGoogle} disabled={busy}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleMark />}
            Continue with Google
          </button>
          <p className="am-legal">
            By continuing you agree to the{" "}
            <Link href="/legal/terms">Terms</Link> and{" "}
            <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>

          <p className="mt-8 text-center text-sm text-slate-600">
            {mode === "signin" ? "New to the Academy? " : "Already have an account? "}
            <button type="button" onClick={switchMode} className="am-link">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </AuthMinimal>
    );
  }

  return (
    <AuthMinimal product="Academy">
      <div key="password" className="am-step">
        <BackButton onClick={back} />
        <AuthHeading
          sub={
            <span className="flex items-center gap-2">
              <span className="truncate">{email}</span>
              <button type="button" onClick={back} className="am-link text-sm">Edit</button>
            </span>
          }
        >
          {mode === "signin" ? "Enter your password" : "Create a password"}
        </AuthHeading>

        <form onSubmit={handleSubmit} className="mt-7" noValidate>
          <PasswordInput
            id="academy-password"
            value={password}
            onChange={setPassword}
            placeholder={mode === "signin" ? "Password" : "At least 8 characters"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            autoFocus
            invalid={Boolean(error)}
            disabled={busy}
            label="Password"
          />
          <AuthError>{error}</AuthError>
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
