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
  /** "dark" (default) matches the original account-flow treatment, used by
   * forgot/reset-password. "light" matches the rest of the marketing site
   * (white background, --pvrx-accent blue) -- used by the newer portal
   * account pages (/account/*, /pricing, /get-purvex) so navigating from
   * /platform's pricing cards doesn't jump to a different color scheme. */
  theme?: "dark" | "light";
  /** "lg" (default) is the original wide layout (pricing's 2-card grid).
   * "md" fits a content page (a command block, a short numbered list) --
   * wider than a login form so a terminal command doesn't wrap awkwardly.
   * "sm" caps everything at a normal login-form width. */
  width?: "sm" | "md" | "lg";
  /** When true, drop the bordered/shadowed card entirely -- title and form
   * sit directly on the page background instead of inside a panel. */
  bare?: boolean;
}

const WIDTH_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "max-w-[440px]",
  md: "max-w-[640px]",
  lg: "max-w-5xl",
};

export function AuthShell({ title, subtitle, children, className, hideHeader = false, theme = "dark", width = "lg", bare = false }: AuthShellProps) {
  const isLight = theme === "light";
  const maxWidthClass = WIDTH_CLASSES[width];

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-10",
        isLight ? "bg-white text-slate-900" : "bg-[#060810] text-slate-100"
      )}
    >
      {/* Orbs - same as landing */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className={cn("absolute -left-24 top-0 h-[600px] w-[600px] rounded-full blur-[100px]", isLight ? "bg-[rgba(37,99,235,0.08)]" : "bg-[rgba(72,99,255,0.13)]")}
          style={{ animation: "ct-orbit 22s ease-in-out infinite" }}
        />
        <div
          className={cn("absolute right-[-5rem] bottom-[5%] h-[500px] w-[500px] rounded-full blur-[100px]", isLight ? "bg-[rgba(37,99,235,0.06)]" : "bg-[rgba(72,99,255,0.10)]")}
          style={{ animation: "ct-orbit 28s ease-in-out infinite reverse" }}
        />
      </div>

      {!hideHeader && (
        // Pinned to the page's top-left corner, independent of the form's
        // own width -- a persistent brand mark, not something that shifts
        // around depending on which width the content below uses.
        <div className="relative z-20">
          <Link href="/" className={cn("inline-flex items-center gap-2.5 no-underline transition hover:opacity-80", isLight ? "text-slate-900" : "text-white")}>
            <Image src="/logo.png" alt="PurveX" width={32} height={32} className="rounded-[8px]" />
            <span className="font-display text-[1.05rem] font-bold tracking-[-0.04em]">PurveX</span>
          </Link>
        </div>
      )}

      <div className={cn("relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full items-center justify-center", maxWidthClass)}>
        <div
          className={cn(
            hideHeader || bare
              ? "mx-auto w-full px-0 py-0"
              : isLight
                ? "w-full rounded-[36px] border border-[var(--pvrx-border-light)] bg-white px-4 py-8 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10"
                : "w-full rounded-[36px] border border-white/8 bg-[rgba(10,17,31,0.6)] px-4 py-8 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-8 sm:py-10",
            className
          )}
        >
          {!hideHeader && (
            <div className={cn("flex flex-col items-center text-center", bare ? "mb-6" : "mb-10")}>
              <div className={cn("mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] border shadow-[0_18px_48px_-22px_rgba(15,23,42,0.25)]", isLight ? "border-[var(--pvrx-border-light)] bg-white" : "border-white/10 bg-white/95")}>
                <Image src="/logo.png" alt="" width={42} height={42} />
              </div>
              {title ? (
                <h1 className={cn("font-display font-semibold tracking-tight", bare ? "text-2xl" : "text-3xl sm:text-[2.125rem]", isLight ? "text-slate-900" : "text-white")}>
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className={cn("mt-2.5 max-w-sm text-sm leading-6", isLight ? "text-slate-500" : "text-slate-400")}>
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
