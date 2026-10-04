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
  AuthTerms,
  TERMS_ERROR,
} from "@/components/auth/auth-minimal";
import { signInWithPassword, signInWithGoogle, hasPortalAccount, markPortalAccount } from "@/lib/portal-auth";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// Only ever a relative in-app path (e.g. "/pricing?plan=paid") -- never
// follow an absolute/external "next" value, which would be an open redirect.
function safeNext(raw: string | null | undefined): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/pricing";
}

function PortalLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams?.get("next"));
  // Set by every link that means "I already have an account" -- the Create an
  // account page's own Sign in link, and the password-reset screens. Without
  // it those links would bounce straight back to signup and the two pages
  // would volley a first-time visitor between them.
  const forceSignIn = searchParams?.get("signin") === "1";
  // Most people reaching the portal have never made an account, so open on
  // Create your account unless this browser has signed in before. Undefined
  // means the answer is not in yet; localStorage cannot be read during the
  // server render, so the form stays hidden for that one frame rather than
  // flashing "Welcome back" at someone who is about to be sent elsewhere.
  const [bounce, setBounce] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    const send = !forceSignIn && !hasPortalAccount();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBounce(send);
    if (send) router.replace(`/account/signup?next=${encodeURIComponent(next)}`);
  }, [router, next, forceSignIn]);
  // Warms the next route's code before the user submits, so router.push(next)
  // lands instantly instead of stalling on a route-segment fetch.
  useEffect(() => {
    router.prefetch(next);
  }, [router, next]);
  // "Create an account" below forwards `next` whole, which carries any plan
  // inside it -- so the plan no longer needs pulling out and re-attaching
  // separately the way it used to.
  const product = next.startsWith("/range") ? "Range" : "";
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<"form" | "submitting" | "google">("form");
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  // A ref is checked and set synchronously, so a fast double-click cannot
  // send two sign-in requests before the disabled state renders.
  const busyRef = useRef(false);

  async function handleGoogle() {
    if (busyRef.current) return;
    if (!agreed) {
      setError(TERMS_ERROR);
      return;
    }
    busyRef.current = true;
    setError(null);
    setPhase("google");
    try {
      const redirectTo = `${window.location.origin}${next}`;
      // Recorded before the redirect leaves the page: whatever Google says
      // next, this browser has now been through sign-in once.
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
    if (!agreed) {
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
    if (!password) {
      setError("Enter your password.");
      return;
    }
    busyRef.current = true;
    setPhase("submitting");
    try {
      await signInWithPassword(email.trim(), password);
      markPortalAccount();
      router.push(next);
    } catch (err) {
      busyRef.current = false;
      setPhase("form");
      setError(getErrorMessage(err, "Unable to sign in. Check your email and password."));
    }
  }

  function back() {
    setStep("email");
    setPassword("");
    setError(null);
  }

  const isLoading = phase === "submitting" || phase === "google";

  // Either the answer is still coming or we are on our way to signup.
  if (bounce !== false) {
    return (
      <AuthMinimal product={product}>
        <div className="min-h-[260px]" />
      </AuthMinimal>
    );
  }

  if (step === "email") {
    return (
      <AuthMinimal product={product}>
        <div key="email" className="am-step">
          <AuthHeading sub="Sign in with the email for your PurveX account.">Welcome back</AuthHeading>
          <form onSubmit={handleEmail} className="mt-7" noValidate>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="am-input"
              aria-label="Email"
              aria-invalid={Boolean(error) && error !== TERMS_ERROR}
              disabled={isLoading}
            />
            <AuthTerms
              checked={agreed}
              onChange={(v) => {
                setAgreed(v);
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
            New to PurveX?{" "}
            {/* Carries the whole destination, not just the plan: someone who
                came here for Range Pro and clicks through to sign up was
                landing back on the Platform pricing page afterwards. */}
            <Link href={`/account/signup?next=${encodeURIComponent(next)}`} className="am-link">
              Create an account
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
          Enter your password
        </AuthHeading>

        <form onSubmit={handleSubmit} className="mt-7" noValidate>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="Password"
            autoComplete="current-password"
            autoFocus
            invalid={Boolean(error)}
            disabled={isLoading}
            label="Password"
          />
          <AuthError>{error}</AuthError>
          <button type="submit" className="am-primary mt-4" disabled={isLoading}>
            {phase === "submitting" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm">
          <Link href="/forgot-password" className="am-link">
            Forgot password?
          </Link>
        </p>
      </div>
    </AuthMinimal>
  );
}

export default function PortalLoginPage() {
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
      <PortalLoginContent />
    </Suspense>
  );
}
