"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { Home as HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
  /** "light" (default) matches the marketing site and the Academy portal:
   * white, the dot grid, one purple accent. Every account page uses it,
   * forgot/reset-password included. "dark" is the original account-flow
   * treatment, kept for any caller that still asks for it. */
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

// Plain px values via inline style, not Tailwind arbitrary-value classes
// (`max-w-[440px]`) picked from a lookup object -- Tailwind's build-time
// class scanner isn't reliable about generating CSS for classes assembled
// that way instead of appearing directly in a className. Inline style has
// no such dependency.
const WIDTH_PX: Record<"sm" | "md" | "lg", number | undefined> = {
  sm: 440,
  md: 640,
  lg: undefined, // falls back to the max-w-5xl Tailwind class below
};

// Shared by every AuthShell-based form so inputs stay pixel-identical by
// construction instead of by each page independently copying the same
// string. Two variants, matching AuthShell's own "theme" prop: LIGHT for
// login/signup (theme="light"), DARK for forgot/reset-password
// (theme="dark", the original account-flow treatment).
// text-base (16px) on mobile, dropping to text-sm (14px) from md up --
// anything smaller than 16px makes iOS Safari zoom the page in on focus,
// which is what breaks typing on a phone.
// pl-10 makes room for the leading icon every one of these fields has;
// pr-4 is the plain default since only the password fields have a
// trailing eye-toggle button, and they already append their own larger
// pr-* to make room for it. A symmetric px-10 was wasting 40px of the
// input's width on the side with nothing in it -- felt fine on a wide
// desktop field, but visibly cramped the typing area on a phone.
export const AUTH_INPUT_CLASSNAME_LIGHT =
  "w-full rounded-full border border-[var(--pvrx-border-light)] bg-white pl-10 pr-4 py-4 text-base md:text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 focus:border-[#5546e0] focus:outline-none focus:ring-4 focus:ring-[rgba(85,70,224,0.12)] disabled:opacity-60";
export const AUTH_INPUT_CLASSNAME_DARK =
  "w-full rounded-full border border-white/10 bg-[#0c1220] pl-10 pr-4 py-4 text-base md:text-sm text-white shadow-none transition placeholder:text-slate-500 focus:border-[rgba(72,99,255,0.75)] focus:outline-none focus:ring-4 focus:ring-[rgba(72,99,255,0.12)] disabled:opacity-100";

export function AuthShell({ title, subtitle, children, className, hideHeader = false, theme = "light", width = "lg", bare = false }: AuthShellProps) {
  const isLight = theme === "light";
  const maxWidthPx = WIDTH_PX[width];
  const maxWidthClass = maxWidthPx ? undefined : "max-w-5xl";
  const maxWidthStyle = maxWidthPx ? { maxWidth: `${maxWidthPx}px` } : undefined;

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col overflow-hidden px-4 py-8 sm:px-6 sm:py-10 auth-shell-enter",
        isLight ? "bg-white text-slate-900" : "bg-[#060810] text-slate-100"
      )}
    >
      {/* The portal's printed dot grid, fading out from the top -- the same
          backdrop as the marketing pages and the Academy, instead of the
          old drifting orbs. */}
      <div
        aria-hidden
        className="auth-shell-grid pointer-events-none fixed inset-0"
        style={{ opacity: isLight ? 1 : 0.35 }}
      />

      {
        // Always rendered, independent of hideHeader -- this is the way
        // back to the rest of the site, not part of the "welcome" header a
        // page might suppress because it renders its own heading. Pinned
        // to the top-left corner, independent of the form's own width.
        // shrink-0 keeps its natural height inside the flex column below,
        // rather than being squeezed by the centering block's flex-1.
        <Link
          href="/"
          aria-label="Home"
          className={cn(
            "relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition",
            isLight
              ? "border-[var(--pvrx-border-light)] bg-white text-slate-900 hover:bg-slate-50"
              : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
          )}
        >
          <HomeIcon className="h-5 w-5" />
        </Link>
      }

      <div
        // flex-1 fills whatever height the nav row above didn't use, out of
        // the outer h-screen box -- no magic-number min-height to keep in
        // sync with the nav's actual height. overflow-y-auto is a safety
        // net for a card genuinely taller than the remaining space, so
        // that inner region scrolls instead of the whole page.
        className={cn("relative z-10 mx-auto flex w-full flex-1 items-center justify-center overflow-y-auto py-4", maxWidthClass)}
        style={maxWidthStyle}
      >
        <div
          className={cn(
            hideHeader || bare
              ? "mx-auto w-full px-0 py-0"
              : isLight
                ? "w-full rounded-none border border-[var(--pvrx-border-light)] border-t-2 border-t-[#5546e0] bg-white px-4 py-8 shadow-[0_40px_80px_-48px_rgba(15,23,42,0.22)] sm:px-8 sm:py-10"
                : "w-full rounded-none border border-white/8 bg-[rgba(10,17,31,0.6)] px-4 py-8 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-8 sm:py-10",
            className
          )}
        >
          {!hideHeader && (
            <div className={cn("flex flex-col items-center text-center", bare ? "mb-6" : "mb-10")}>
              <div className={cn("mb-5 flex h-14 w-14 items-center justify-center rounded-md border", isLight ? "border-[var(--pvrx-border-light)] bg-white" : "border-white/10 bg-white/95")}>
                <Image src="/logo.png" alt="" width={36} height={36} priority />
              </div>
              {title ? (
                <h1
                  className={cn("font-display font-semibold", bare ? "text-[1.9rem] sm:text-[2.25rem]" : "text-3xl sm:text-[2.4rem]", isLight ? "text-slate-900" : "text-white")}
                  // Inline: globals.css sets h1 letter-spacing outside any
                  // layer, which beats a Tailwind tracking utility.
                  style={{ letterSpacing: "-0.04em", lineHeight: 1.08 }}
                >
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
        .auth-shell-grid {
          background-image: radial-gradient(rgba(16,25,46,.11) 1.6px, transparent 1.6px);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(ellipse 70% 55% at 50% 0%, black, transparent 75%);
          mask-image: radial-gradient(ellipse 70% 55% at 50% 0%, black, transparent 75%);
        }
        @keyframes auth-shell-enter {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-shell-enter { animation: auth-shell-enter 0.32s cubic-bezier(0.16,1,0.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .auth-shell-enter { animation: none; }
        }
      `}</style>
    </div>
  );
}
