"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

/* A focused sign-in layout: a small wordmark, one column, one question at a
   time. No panels, no hero tile, no ambient glow. Shared by every sign-in,
   sign-up, passcode and password-reset screen. */

export function AuthMinimal({ children, product = "" }: { children: ReactNode; product?: string }) {
  return (
    <div className="am-page flex min-h-screen flex-col bg-white text-[#10192e]">
      <header className="flex h-16 items-center px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="PurveX home">
          <Image src="/logo.png" alt="" width={28} height={28} priority />
          <span className="text-[1.05rem] font-bold tracking-tight">
            PurveX{product ? <span className="font-medium text-slate-500"> {product}</span> : null}
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-16 pt-10 sm:items-center sm:pt-0">
        <div className="am-step w-full" style={{ maxWidth: 400 }}>
          {children}
        </div>
      </main>

      <footer className="px-5 pb-8 text-center text-xs text-slate-500 sm:px-8">
        <Link href="/legal/terms" className="hover:text-[#10192e]">Terms</Link>
        <span className="mx-2">·</span>
        <Link href="/legal/privacy" className="hover:text-[#10192e]">Privacy</Link>
      </footer>

      <style>{`
        @keyframes am-in { from { opacity: 0; transform: translateX(14px) } to { opacity: 1; transform: none } }
        .am-step { animation: am-in .32s cubic-bezier(.16,1,.3,1) both }
        .am-input {
          width: 100%; height: 52px; padding: 0 16px; border: 2px solid transparent; border-radius: 10px;
          background: #f2f2f5; color: #10192e; font-size: 16px; outline: none; transition: border-color .15s, background .15s;
        }
        .am-input::placeholder { color: #6b7280 }
        .am-input:focus { border-color: #10192e; background: #fff }
        .am-input:disabled { opacity: .6 }
        .am-input[aria-invalid="true"] { border-color: #d92d20; background: #fff }
        .am-primary, .am-secondary {
          display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 52px; border: 0; border-radius: 10px;
          font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; transition: background .15s, transform .1s;
        }
        .am-primary { background: #10192e; color: #fff }
        .am-primary:hover { background: #222c48 }
        .am-secondary { background: #f2f2f5; color: #10192e }
        .am-secondary:hover { background: #e6e6ec }
        .am-primary:active, .am-secondary:active { transform: scale(.99) }
        .am-primary:disabled, .am-secondary:disabled { opacity: .6; cursor: default }
        .am-primary:focus-visible, .am-secondary:focus-visible, .am-link:focus-visible { outline: 2px solid #6a5cff; outline-offset: 2px }
        .am-link { color: #10192e; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; background: none; border: 0; padding: 0; font-size: inherit }
        .am-link:hover { color: #6a5cff }
        @media (prefers-reduced-motion: reduce) { .am-step { animation: none } }
      `}</style>
    </div>
  );
}

export function AuthHeading({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <h1 className="text-[2rem] font-bold leading-tight tracking-tight">{children}</h1>
      {sub ? <p className="mt-2 text-base text-slate-600">{sub}</p> : null}
    </>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-2 text-sm font-medium text-[#d92d20]" role="alert">
      {children}
    </p>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-slate-500">
      <span className="h-px flex-1 bg-slate-200" />
      or
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="-ml-2 mb-6 grid h-10 w-10 place-items-center rounded-full text-[#10192e] transition hover:bg-slate-100"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
  disabled,
  invalid,
  label,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  autoFocus?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  label: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="am-input"
        style={{ paddingRight: 52 }}
        aria-label={label}
        aria-invalid={invalid}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-slate-500 hover:text-[#10192e]"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[!@#$%^&*(),.?":{}|<>[\]\\/+=~`_-]/.test(pw)) score++;
  return score;
}

export function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const s = passwordStrength(password);
  const label = ["", "Weak", "Fair", "Fair", "Good", "Strong"][s] || "";
  const color = ["", "#e5484d", "#f0883e", "#e8a13a", "#5546e0", "#22a06b"][s] || "#e5484d";
  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full transition-all" style={{ width: `${(s / 5) * 100}%`, background: color }} />
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
