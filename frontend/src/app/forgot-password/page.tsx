"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/lib/portal-auth";
import { AuthError, AuthHeading, AuthMinimal } from "@/components/auth/auth-minimal";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"form" | "sending" | "sent">("form");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setError(null);
    setPhase("sending");

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      await requestPasswordReset(email.trim(), redirectTo);
      setPhase("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email right now. Please try again.");
      setPhase("form");
    }
  }

  if (phase === "sent") {
    return (
      <AuthMinimal>
        <AuthHeading
          sub={
            <>
              If an account exists for <strong className="text-[#10192e]">{email}</strong>, you will receive a password reset link shortly.
            </>
          }
        >
          Check your inbox
        </AuthHeading>
        <Link href="/account/login" className="am-secondary mt-8">
          Back to sign in
        </Link>
      </AuthMinimal>
    );
  }

  return (
    <AuthMinimal>
      <AuthHeading sub="Enter the email for your account and we will send you a reset link.">Reset your password</AuthHeading>
      <form onSubmit={handleSubmit} className="mt-7" noValidate>
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
          aria-invalid={Boolean(error)}
          disabled={phase === "sending"}
        />
        <AuthError>{error}</AuthError>
        <button type="submit" className="am-primary mt-4" disabled={phase === "sending"}>
          {phase === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-sm">
        <Link href="/account/login" className="am-link">
          Back to sign in
        </Link>
      </p>
    </AuthMinimal>
  );
}
