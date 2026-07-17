"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
}

export function AuthShell({ title, subtitle, children, className, hideHeader = false }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060810] px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      {/* Orbs - same as landing */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 top-0 h-[600px] w-[600px] rounded-full bg-[rgba(72,99,255,0.13)] blur-[100px]" style={{ animation: "ct-orbit 22s ease-in-out infinite" }} />
        <div className="absolute right-[-5rem] bottom-[5%] h-[500px] w-[500px] rounded-full bg-[rgba(72,99,255,0.10)] blur-[100px]" style={{ animation: "ct-orbit 28s ease-in-out infinite reverse" }} />
      </div>

      {!hideHeader && (
        <div className="relative z-20 mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2.5 text-white no-underline transition hover:opacity-80">
            <Image src="/logo.png" alt="PurveX" width={32} height={32} className="rounded-[8px]" />
            <span className="font-display text-[1.05rem] font-bold tracking-[-0.04em]">PurveX</span>
          </Link>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center justify-center">
        <div
          className={cn(
            hideHeader
              ? "mx-auto w-full px-0 py-0"
              : "w-full rounded-[36px] border border-white/8 bg-[rgba(10,17,31,0.6)] px-4 py-8 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-8 sm:py-10",
            className
          )}
        >
          {!hideHeader && (
            <div className="mb-10 flex flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/10 bg-white/95 shadow-[0_18px_48px_-22px_rgba(15,23,42,0.55)]">
                <Image src="/logo.png" alt="" width={54} height={54} />
              </div>
              {title ? (
                <h1 className="text-3xl font-display font-semibold tracking-tight text-white sm:text-[2.125rem]">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                  {subtitle}
                </p>
              ) : null}
            </div>
          )}

          {children}
        </div>
      </div>

      <style>{`
        @keyframes ct-orbit {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(60px, -40px) scale(1.08); }
          50% { transform: translate(-30px, 50px) scale(0.95); }
          75% { transform: translate(40px, 20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
