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
import { signUpWithPassword, signInWithGoogle, markPortalAccount } from "@/lib/portal-auth";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}


// Only ever a relative in-app path -- never follow an absolute/external
// "next" value, which would be an open redirect. Same guard as the login
// page's.
function safeNext(raw: string | null | undefined): string | null {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return null;
}

function PortalSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan") === "paid" ? "paid" : searchParams?.get("plan") === "free" ? "free" : null;
  // Where to land once the account exists. /pricing is the $99 self-hosted
  // Platform picker, which is only the right answer when nothing else was
  // asked for -- a Range Pro buyer arriving from /range/upgrade was being
  // dropped into the wrong product's checkout entirely.
  const next = safeNext(searchParams?.get("next"));
  const destination = next ?? (plan ? `/pricing?plan=${plan}` : "/pricing");
  // Two products share this screen. Someone on their way to Range should not
  // be handed a form that only says PurveX, then land somewhere branded
  // differently again.
  const product = destination.startsWith("/range") ? "Range" : "";
  useEffect(() => {
    router.prefetch(destination);
  }, [router, destination]);

  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phase, setPhase] = useState<"form" | "submitting" | "google" | "sent">("form");
  // The account is made before the email goes out, so these can disagree.
  const [emailed, setEmailed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const strength = passwordStrength(password);
  const busyRef = useRef(false);
  // Bouncing to sign-in and back must not lose where they were going.
  // ?signin=1 is what stops the login page sending them straight back here:
  // it opens on signup for any browser that has never signed in, which is
  // exactly the browser clicking this link.
  const signInHref = next || plan
    ? `/account/login?signin=1&next=${encodeURIComponent(destination)}`
    : "/account/login?signin=1";

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
      const redirectTo = `${window.location.origin}${destination}`;
      // From here on this browser has an account, so the login page can greet
      // them with "Welcome back" instead of offering to make a second one.
      markPortalAccount();
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
      const emailRedirectTo = `${window.location.origin}${destination}`;
      const { session, emailed } = await signUpWithPassword(email.trim(), password, emailRedirectTo);
      markPortalAccount();
      if (session) {
        router.push(destination);
        return;
      }
      busyRef.current = false;
      setEmailed(emailed);
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
    // The account exists either way. Only the email is in doubt, and saying
    // "check your inbox" when nothing was sent leaves them waiting on mail
    // that is never coming.
    if (!emailed) {
      return (
        <AuthMinimal product={product}>
          <AuthHeading
            sub={
              <>
                Your account for <strong className="text-[#10192e]">{email}</strong> was created, but we
                could not send the confirmation email. Go to sign in and ask for a new confirmation
                link, or email support@purvex.io and we will confirm it for you.
              </>
            }
          >
            Account created
          </AuthHeading>
          <Link href={signInHref} className="am-secondary mt-8">
            Go to sign in
          </Link>
        </AuthMinimal>
      );
    }
    return (
      <AuthMinimal product={product}>
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
      <AuthMinimal product={product}>
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
    <AuthMinimal product={product}>
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
        // No product name here: this renders before the search params are
        // read, so it cannot know yet which one this visit is for.
        <AuthMinimal>
          <div className="min-h-[200px]" />
        </AuthMinimal>
      }
    >
      <PortalSignupContent />
    </Suspense>
  );
}
