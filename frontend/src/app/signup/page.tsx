"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { registerUser } from "@/lib/auth";

const SSO_BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8001";
const STRIPE_PAYMENT_LINK_URL =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || "";

const PASSWORD_REQUIREMENTS = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    key: "lowercase",
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    key: "number",
    label: "One number",
    test: (value: string) => /\d/.test(value),
  },
  {
    key: "special",
    label: "One special character",
    test: (value: string) => /[!@#$%^&*(),.?":{}|<>\[\]\\/_ +=~`-]/.test(value),
  },
] as const;

function SignupPageContent() {
  const searchParams = useSearchParams();
  const ssoCheckout = searchParams?.get("sso") === "checkout";
  const billingStatus = searchParams?.get("billing");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"identity" | "credentials">("identity");
  const [phase, setPhase] = useState<"idle" | "submitting" | "checkout" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const passwordChecks = PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    passed: requirement.test(password),
  }));
  const passwordErrors = passwordChecks
    .filter((requirement) => !requirement.passed)
    .map((requirement) => requirement.label);
  const showPasswordRequirements =
    step === "credentials" && (password.length > 0 || confirmPassword.length > 0);
  const confirmPasswordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  function redirectToStripeLink() {
    if (!STRIPE_PAYMENT_LINK_URL) {
      throw new Error("Stripe payment link is not configured.");
    }
    window.location.replace(STRIPE_PAYMENT_LINK_URL);
  }

  useEffect(() => {
    if (!ssoCheckout) return;
    let cancelled = false;
    async function startCheckout() {
      setError(null);
      setNotice(null);
      setPhase("checkout");
      try {
        const checkout = await apiFetch("/billing/checkout-session", {
          method: "POST",
          body: "{}",
        });
        if (typeof checkout?.url === "string" && checkout.url) {
          window.location.replace(checkout.url);
          return;
        }
        throw new Error("Billing checkout did not return a valid URL.");
      } catch (err) {
        if (cancelled) return;
        setPhase("idle");
        setError(err instanceof Error ? err.message : "Unable to start billing.");
      }
    }
    void startCheckout();
    return () => { cancelled = true; };
  }, [ssoCheckout]);

  useEffect(() => {
    if (billingStatus === "success") {
      setNotice("Billing setup complete.");
      setError(null);
      setPhase("success");
      return;
    }
    if (billingStatus === "canceled") {
      setNotice("Billing setup was canceled. You can try again when ready.");
      setError(null);
      setPhase("idle");
    }
  }, [billingStatus]);

  function handleIdentityContinue(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Work email is required.");
      return;
    }
    setStep("credentials");
  }

  async function handleSsoClick() {
    setError(null);
    setNotice(null);
    try {
      const statusRes = await fetch(`${SSO_BACKEND_BASE}/auth/sso/status`, {
        credentials: "include",
      });
      if (statusRes.ok) {
        const data = await statusRes.json();
        const providers: { name: string; enabled: boolean }[] = data?.providers ?? [];
        const match = providers.find((p) => p.name === "google" && p.enabled);
        if (!match) {
          setNotice("Google sign-in is not configured yet. Use your work email to continue.");
          return;
        }
      }
    } catch {
      // fallthrough
    }
    const next = "/signup?sso=checkout";
    const ssoUrl = `${SSO_BACKEND_BASE}/auth/sso/start?provider=google&next=${encodeURIComponent(next)}`;
    window.location.href = ssoUrl;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (passwordErrors.length > 0) {
      setError(`Password must include: ${passwordErrors.join(", ")}.`);
      return;
    }
    if (confirmPasswordMismatch) {
      setError("Passwords do not match.");
      return;
    }
    setPhase("submitting");
    try {
      const signup = await registerUser(email, password);
      if (!signup.user?.id) {
        throw new Error("Registration did not return a valid user.");
      }

      setPhase("checkout");
      redirectToStripeLink();
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
      setPhase("idle");
    }
  }

  const isLoading = phase === "submitting" || phase === "checkout";

  return (
    <div className="su">
      <div className="su-bg" />

      <div className="su-center">
        <div className="su-card">
          {/* logo + heading */}
          <div className="su-card__header">
            <div className="su-card__logo">
              <Image src="/logo.png" alt="PurveX" width={32} height={32} style={{ borderRadius: 8 }} />
            </div>
            <h1 className="su-card__title">
              {step === "identity" ? "Get started with PurveX" : "Create your password"}
            </h1>
            <p className="su-card__sub">
              {step === "identity"
                ? "Start validating detections in minutes."
                : `Setting up account for ${email}`}
            </p>
          </div>

          {step === "identity" ? (
            <form onSubmit={handleIdentityContinue} className="su-form" noValidate>
              {/* Google SSO */}
              <button type="button" onClick={handleSsoClick} className="su-google">
                <svg className="su-google__icon" viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="su-divider">
                <span />
                <span className="su-divider__text">or</span>
                <span />
              </div>

              {/* email */}
              <div className="su-field">
                <label htmlFor="email" className="su-label">Work email</label>
                <div className="su-input-wrap">
                  <Mail className="su-input-icon" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="su-input"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="su-submit" disabled={isLoading}>
                Continue with Email <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="su-form" noValidate>
              <div className="su-field">
                <label htmlFor="email-ro" className="su-label">Email</label>
                <div className="su-input-wrap">
                  <Mail className="su-input-icon" />
                  <input id="email-ro" type="email" value={email} className="su-input" readOnly />
                </div>
              </div>

              <div className="su-field">
                <label htmlFor="password" className="su-label">Password</label>
                <div className="su-input-wrap">
                  <Lock className="su-input-icon" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimum 8 chars, uppercase, lowercase, number, special"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="su-input"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="su-password-help" aria-live="polite">
                  {passwordChecks.map((requirement) => (
                    <p
                      key={requirement.key}
                      className={`su-password-help__item ${
                        showPasswordRequirements
                          ? requirement.passed
                            ? "su-password-help__item--pass"
                            : "su-password-help__item--fail"
                          : ""
                      }`}
                    >
                      {requirement.label}
                    </p>
                  ))}
                </div>
              </div>

              <div className="su-field">
                <label htmlFor="confirm" className="su-label">Confirm password</label>
                <div className="su-input-wrap">
                  <Lock className="su-input-icon" />
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="su-input"
                    disabled={isLoading}
                    required
                  />
                </div>
                {confirmPasswordMismatch ? (
                  <p className="su-password-help__item su-password-help__item--fail">
                    Passwords must match.
                  </p>
                ) : null}
              </div>

              <button type="submit" disabled={isLoading} className="su-submit">
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
                ) : phase === "success" ? (
                  <><CheckCircle2 className="h-4 w-4" /> Account ready</>
                ) : (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <button type="button" onClick={() => { setError(null); setStep("identity"); }} className="su-back">
                Back
              </button>
            </form>
          )}

          {/* notices */}
          {error && (
            <div className="su-alert su-alert--error">{error}</div>
          )}
          {notice && (
            <div className="su-alert su-alert--info">{notice}</div>
          )}
          {phase === "success" && (
            <div className="su-alert su-alert--success">Account created. Opening billing setup.</div>
          )}

        </div>

        {/* bottom links */}
        <div className="su-links">
          <Link href="/">Home</Link>
          <span className="su-links__dot" />
          <Link href="/legal/privacy">Privacy</Link>
          <span className="su-links__dot" />
          <Link href="/legal/terms">Terms</Link>
        </div>
      </div>

      <style>{`
/* ─── page ─── */
.su{
  --ink:#f7f8fc;
  --muted:rgba(148,163,184,.85);
  --muted2:rgba(148,163,184,.5);
  --line:rgba(160,177,255,.1);
  --blue:#667cff;
  min-height:100vh;
  display:flex;flex-direction:column;
  background:#050810;
  color:var(--ink);
  font-family:var(--font-inter),system-ui,sans-serif;
}
.su-bg{
  position:fixed;inset:0;pointer-events:none;
  background:
    radial-gradient(ellipse 60% 40% at 50% 0%,rgba(102,124,255,.08),transparent 60%),
    radial-gradient(ellipse 50% 50% at 80% 80%,rgba(102,124,255,.04),transparent);
}

/* ─── nav ─── */

/* ─── center ─── */
.su-center{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  position:relative;z-index:1;padding:0 20px 48px;
}

/* ─── card ─── */
.su-card{
  width:100%;max-width:420px;
  border-radius:20px;
  border:1px solid var(--line);
  background:rgba(10,14,28,.85);
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  padding:40px 36px 32px;
  box-shadow:0 32px 80px -24px rgba(0,0,0,.6);
}

/* ─── card header ─── */
.su-card__header{
  display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:28px;
}
.su-card__logo{
  width:52px;height:52px;display:flex;align-items:center;justify-content:center;
  border-radius:14px;border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.95);
  box-shadow:0 8px 24px -8px rgba(0,0,0,.3);
}
.su-card__title{
  margin:16px 0 0;
  font-family:var(--font-space-grotesk),var(--font-inter),sans-serif;
  font-size:1.35rem;font-weight:700;letter-spacing:-.04em;color:#fff;
}
.su-card__sub{
  margin:6px 0 0;font-size:.84rem;color:var(--muted);line-height:1.5;max-width:280px;
}

/* ─── form ─── */
.su-form{display:flex;flex-direction:column;gap:16px}

/* ─── google btn ─── */
.su-google{
  display:flex;align-items:center;justify-content:center;gap:10px;
  height:46px;border-radius:10px;
  border:1px solid var(--line);
  background:rgba(255,255,255,.03);
  color:#fff;font-size:.88rem;font-weight:600;cursor:pointer;
  transition:background .2s,border-color .2s,transform .15s;
}
.su-google:hover{
  background:rgba(255,255,255,.06);border-color:rgba(160,177,255,.22);
  transform:translateY(-1px);
}
.su-google__icon{flex-shrink:0}

/* ─── divider ─── */
.su-divider{display:flex;align-items:center;gap:12px}
.su-divider > span:first-child,.su-divider > span:last-child{flex:1;height:1px;background:var(--line)}
.su-divider__text{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2)}

/* ─── fields ─── */
.su-field{display:flex;flex-direction:column;gap:5px}
.su-label{font-size:.78rem;font-weight:600;color:rgba(226,232,240,.8)}
.su-input-wrap{position:relative}
.su-input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--muted2);pointer-events:none}
.su-input{
  width:100%;height:44px;
  border-radius:10px;
  border:1px solid var(--line);
  background:rgba(0,0,0,.3);
  padding:0 14px 0 38px;
  font-size:.88rem;color:#fff;outline:none;
  transition:border-color .2s,box-shadow .2s;
}
.su-input::placeholder{color:var(--muted2)}
.su-input:focus{border-color:rgba(102,124,255,.5);box-shadow:0 0 0 3px rgba(102,124,255,.08)}
.su-input:disabled,.su-input[readonly]{opacity:.6;cursor:not-allowed}
.su-password-help{display:grid;gap:4px;margin-top:8px}
.su-password-help__item{font-size:.74rem;line-height:1.4;color:var(--muted2)}
.su-password-help__item--pass{color:rgba(167,243,208,.9)}
.su-password-help__item--fail{color:rgba(252,165,165,.92)}

/* ─── submit ─── */
.su-submit{
  display:flex;align-items:center;justify-content:center;gap:8px;
  height:46px;margin-top:4px;
  border-radius:10px;border:0;
  background:#fff;color:#0a0f1e;
  font-size:.88rem;font-weight:700;cursor:pointer;
  transition:transform .15s,box-shadow .15s;
}
.su-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 16px rgba(255,255,255,.12)}
.su-submit:disabled{opacity:.7;cursor:not-allowed}

/* ─── back ─── */
.su-back{
  background:none;border:0;color:var(--muted);font-size:.82rem;font-weight:600;
  cursor:pointer;align-self:center;padding:4px 0;transition:color .2s;
}
.su-back:hover{color:#fff}

/* ─── alerts ─── */
.su-alert{
  margin-top:14px;padding:10px 14px;border-radius:10px;
  font-size:.8rem;line-height:1.5;
}
.su-alert--error{border:1px solid rgba(248,113,113,.15);background:rgba(248,113,113,.06);color:rgba(252,165,165,.9)}
.su-alert--info{border:1px solid rgba(135,191,212,.15);background:rgba(102,124,255,.05);color:rgba(186,200,230,.9)}
.su-alert--success{border:1px solid rgba(52,211,153,.15);background:rgba(52,211,153,.05);color:rgba(167,243,208,.9)}

/* ─── trust ─── */
.su-trust{
  display:flex;align-items:center;justify-content:center;gap:6px;
  margin-top:20px;padding-top:16px;border-top:1px solid var(--line);
  font-size:.72rem;color:var(--muted2);
}
.su-trust svg{color:rgba(102,124,255,.6)}

/* ─── links ─── */
.su-links{
  display:flex;align-items:center;gap:8px;margin-top:24px;
}
.su-links a{font-size:.78rem;color:var(--muted2);text-decoration:none;transition:color .2s}
.su-links a:hover{color:#fff}
.su-links__dot{width:3px;height:3px;border-radius:50%;background:var(--muted2);opacity:.5}

/* ─── responsive ─── */
@media(max-width:480px){
  .su-card{padding:32px 24px 28px;border-radius:16px}
  .su-card__title{font-size:1.2rem}
}
      `}</style>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#050810" }} />}>
      <SignupPageContent />
    </Suspense>
  );
}
