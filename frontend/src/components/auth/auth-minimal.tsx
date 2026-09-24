"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/* A focused sign-in layout: a small wordmark, one column, one question at a
   time. No panels, no hero tile, no ambient glow. Used by the Academy sign-in. */

export function AuthMinimal({ children, product = "Academy" }: { children: ReactNode; product?: string }) {
  return (
    <div className="am-page flex min-h-screen flex-col bg-white text-[#10192e]">
      <header className="flex h-16 items-center px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="PurveX home">
          <Image src="/logo.png" alt="" width={28} height={28} priority />
          <span className="text-[1.05rem] font-bold tracking-tight">
            PurveX <span className="font-medium text-slate-500">{product}</span>
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
          font-size: 16px; font-weight: 600; cursor: pointer; transition: background .15s, transform .1s;
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
