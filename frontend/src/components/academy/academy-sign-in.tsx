"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Mail } from "lucide-react";
import { AuthShell, AUTH_INPUT_CLASSNAME_LIGHT } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/lib/portal-auth";

function errorText(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function AcademySignIn({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
      await signInWithGoogle(returnTo());
    } catch (err) {
      busyRef.current = false;
      setBusy(false);
      setError(errorText(err, "Unable to start Google sign-in."));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busyRef.current) return;
    if (!email.trim() || !password) {
      setError("Email and password are required.");
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
        await signInWithPassword(email.trim(), password);
      } else {
        const { session } = await signUpWithPassword(email.trim(), password, returnTo());
        if (!session) setSentTo(email.trim());
      }
    } catch (err) {
      setError(errorText(err, mode === "signin" ? "Unable to sign in." : "Unable to create your account."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <AuthShell theme="light" width="sm" bare title="Student sign-in" subtitle="Student accounts are not set up yet.">
        <p className="mt-6 text-center text-sm text-slate-500">Ask your instructor to finish setting up PurveX Academy.</p>
      </AuthShell>
    );
  }

  if (sentTo) {
    return (
      <AuthShell theme="light" width="sm" bare title="Check your inbox" subtitle={`We sent a confirmation link to ${sentTo}.`}>
        <p className="mt-6 text-center text-sm text-slate-500">
          Confirm your email and you will land back in the Academy, signed in.
        </p>
        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            setMode("signin");
          }}
          className="mt-6 w-full text-center text-sm font-medium text-[#6a5cff] hover:text-[#5546e0]"
        >
          Back to sign in
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      theme="light"
      width="sm"
      bare
      title={mode === "signin" ? "Student sign-in" : "Create your student account"}
      subtitle="Prepare yourself for the job."
    >
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[var(--pvrx-border-light)] bg-white text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--pvrx-border-light)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">or</span>
          <span className="h-px flex-1 bg-[var(--pvrx-border-light)]" />
        </div>

        <div className="space-y-2">
          <label htmlFor="academy-email" className="block text-sm font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              id="academy-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={AUTH_INPUT_CLASSNAME_LIGHT}
              disabled={busy}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="academy-password" className="block text-sm font-semibold text-slate-700">Password</label>
            {mode === "signin" && (
              <Link href="/forgot-password" className="text-xs font-medium text-slate-500 hover:text-[#6a5cff]">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              id="academy-password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder={mode === "signin" ? "Your password" : "At least 8 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={AUTH_INPUT_CLASSNAME_LIGHT}
              disabled={busy}
              required
            />
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={busy}
          size="lg"
          className="h-12 w-full rounded-2xl border-0 bg-[#6a5cff] text-white shadow-[0_10px_30px_rgba(106,92,255,0.3)] hover:bg-[#5546e0]"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
        </Button>

        <p className="text-center text-sm text-slate-500">
          {mode === "signin" ? "New to the Academy? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="font-medium text-[#6a5cff] hover:text-[#5546e0]"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </form>
    </AuthShell>
  );
}
