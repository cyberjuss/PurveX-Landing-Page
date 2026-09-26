"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  AuthDivider,
  AuthError,
  AuthHeading,
  AuthMinimal,
  BackButton,
  GoogleMark,
  PasswordInput,
  passwordStrength,
  StrengthBar,
  AuthTerms,
  TERMS_ERROR,
} from "@/components/auth/auth-minimal";
import { signUpWithPassword, signInWithGoogle } from "@/lib/portal-auth";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}


function PortalSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan") === "paid" ? "paid" : searchParams?.get("plan") === "free" ? "free" : null;
  const pricingTarget = plan ? `/pricing?plan=${plan}` : "/pricing";
  useEffect(() => {
    router.prefetch(pricingTarget);
  }, [router, pricingTarget]);

  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phase, setPhase] = useState<"form" | "submitting" | "google" | "sent">("form");
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const strength = passwordStrength(password);
  const busyRef = useRef(false);
  const signInHref = plan ? `/account/login?next=${encodeURIComponent(pricingTarget)}` : "/account/login";

  async function handleGoogle() {
    if (busyRef.current) return;
    if (!agreedToTerms) {
      setError(TERMS_ERROR);
      return;
    }
    busyRef.current = true;
    setError(null);
    setPhase("google");
    try {
      const redirectTo = `${window.location.origin}${pricingTarget}`;
      await signInWithGoogle(redirectTo);
    } catch (err) {
      busyRef.current = false;
      setPhase("form");
      setError(getErrorMessage(err, "Unable to start Google sign-in."));
    }
  }

  function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value || !value.includes("@") || !value.includes(".")) {
      setError("Enter a valid email address.");
      return;
    }
    if (!agreedToTerms) {
      setError(TERMS_ERROR);
      return;
    }
    setEmail(value);
    setError(null);
    setStep("password");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busyRef.current) return;
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter a password.");
      return;
    }
    if (strength < 4) {
      setError("Use at least 8 characters, mixing upper and lowercase letters, a number, and a symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setError(TERMS_ERROR);
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
      busyRef.current = false;
      setPhase("sent");
    } catch (err) {
      busyRef.current = false;
      setPhase("form");
      setError(getErrorMessage(err, "Unable to create your account."));
    }
  }

  function back() {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }

  const isLoading = phase === "submitting" || phase === "google";

  if (phase === "sent") {
    return (
      <AuthMinimal>
        <AuthHeading
          sub={
            <>
              We sent a confirmation link to <strong className="text-[#10192e]">{email}</strong>.{" "}
              {plan
                ? `Confirm your email and you will be taken straight to your ${plan} plan.`
                : "Confirm your email, then come back and sign in to choose a plan."}
            </>
          }
        >
          Check your inbox
        </AuthHeading>
        <Link href={signInHref} className="am-secondary mt-8">
          Back to sign in
        </Link>
      </AuthMinimal>
    );
  }

  if (step === "email") {
    return (
      <AuthMinimal>
        <div key="email" className="am-step">
          <AuthHeading sub="One account to pick a plan and get PurveX running.">Create your account</AuthHeading>

          <form onSubmit={handleEmail} className="mt-7" noValidate>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="am-input"
              aria-label="Work email"
              aria-invalid={Boolean(error) && error !== TERMS_ERROR}
              disabled={isLoading}
            />

            <AuthTerms
              checked={agreedToTerms}
              onChange={(v) => {
                setAgreedToTerms(v);
                if (error) setError(null);
              }}
              disabled={isLoading}
            />

            <AuthError>{error}</AuthError>
            <button type="submit" className="am-primary mt-4" disabled={isLoading}>
              Continue
            </button>
          </form>

          <AuthDivider />

          <button type="button" className="am-secondary" onClick={handleGoogle} disabled={isLoading}>
            {phase === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleMark />}
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={signInHref} className="am-link">
              Sign in
            </Link>
          </p>
        </div>
      </AuthMinimal>
    );
  }

  return (
    <AuthMinimal>
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
          Create a password
        </AuthHeading>

        <form onSubmit={handleSubmit} className="mt-7" noValidate>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            autoFocus
            invalid={Boolean(error)}
            disabled={isLoading}
            label="Password"
          />
          <StrengthBar password={password} />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use upper and lowercase letters, a number, and a symbol.
          </p>

          <div className="mt-4">
            <PasswordInput
              id="confirm"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter password"
              autoComplete="new-password"
              invalid={Boolean(error)}
              disabled={isLoading}
              label="Confirm password"
            />
          </div>

          <AuthError>{error}</AuthError>
          <button type="submit" className="am-primary mt-4" disabled={isLoading}>
            {phase === "submitting" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
          </button>
        </form>
      </div>
    </AuthMinimal>
  );
}

export default function PortalSignupPage() {
  return (
    <Suspense
      fallback={
        <AuthMinimal>
          <div className="min-h-[200px]" />
        </AuthMinimal>
      }
    >
      <PortalSignupContent />
    </Suspense>
  );
}
