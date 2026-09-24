"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { hasRecoverySession, updatePassword } from "@/lib/portal-auth";
import { AuthError, AuthHeading, AuthMinimal, PasswordInput, passwordStrength, StrengthBar } from "@/components/auth/auth-minimal";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function ResetPasswordContent() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phase, setPhase] = useState<"form" | "submitting" | "success" | "error">("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase's reset-password link establishes a "recovery" session via
    // the URL hash automatically on load (detectSessionInUrl) -- there is no
    // separate token query param to read here.
    let cancelled = false;
    hasRecoverySession().then((ok) => {
      if (!cancelled) setHasSession(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const strength = passwordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!hasSession) {
      setError("Your reset link has expired. Please request a new one.");
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
    if (!/[!@#$%^&*(),.?":{}|<>[\]\\/_ +=~`-]/.test(password)) {
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
      await updatePassword(password);
      setPhase("success");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "An error occurred. Please try again."));
      setPhase("error");
    }
  }

  if (hasSession === null) {
    return (
      <AuthMinimal>
        <div className="min-h-[160px]" />
      </AuthMinimal>
    );
  }

  if (!hasSession) {
    return (
      <AuthMinimal>
        <AuthHeading sub="Use the link from your email, or request a new one.">This reset link is not valid</AuthHeading>
        <Link href="/forgot-password" className="am-primary mt-8">
          Request a new link
        </Link>
      </AuthMinimal>
    );
  }

  if (phase === "success") {
    return (
      <AuthMinimal>
        <AuthHeading sub="Your password has been reset. You can sign in with it now.">Password updated</AuthHeading>
        <Link href="/account/login" className="am-primary mt-8">
          Continue to sign in
        </Link>
      </AuthMinimal>
    );
  }

  const busy = phase === "submitting";

  return (
    <AuthMinimal>
      <AuthHeading sub="Choose a strong password for your account.">Choose a new password</AuthHeading>
      <form onSubmit={handleSubmit} className="mt-7" noValidate>
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          autoFocus
          invalid={Boolean(error)}
          disabled={busy}
          label="New password"
        />
        <StrengthBar password={password} />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {strength < 5 ? "Use upper and lowercase letters, a number, and a symbol." : "That is a strong password."}
        </p>

        <div className="mt-4">
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm your password"
            autoComplete="new-password"
            invalid={Boolean(error)}
            disabled={busy}
            label="Confirm password"
          />
        </div>

        <AuthError>{error}</AuthError>
        <button type="submit" className="am-primary mt-4" disabled={busy}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset password"}
        </button>
      </form>
    </AuthMinimal>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthMinimal>
          <div className="min-h-[160px]" />
        </AuthMinimal>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
