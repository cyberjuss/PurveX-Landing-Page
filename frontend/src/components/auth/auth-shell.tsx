"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Mirrors the top-level items in chrome.tsx's NAV_MENUS -- just the labels
// and hrefs, none of the mega-menu submenu content, since this is a
// lightweight stand-in for auth-flow pages, not the full site nav.
const SITE_NAV = [
  { label: "Home", href: "/" },
  { label: "Security Operations", href: "/security-operations" },
  { label: "Cybersecurity Training", href: "/cybersecurity-training" },
  { label: "PurveX Labs", href: "/platform" },
  { label: "About", href: "/about" },
];

interface AuthShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
  /** "dark" (default) matches the original account-flow treatment, used by
   * forgot/reset-password. "light" matches the rest of the marketing site
   * (white background, #6a5cff purple accent, same as chrome.tsx's --accent)
   * -- used by the newer portal account pages (/account/*, /pricing,
   * /get-purvex) so navigating from /platform's pricing cards doesn't jump
   * to a different color scheme. */
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

export function AuthShell({ title, subtitle, children, className, hideHeader = false, theme = "dark", width = "lg", bare = false }: AuthShellProps) {
  const isLight = theme === "light";
  const maxWidthPx = WIDTH_PX[width];
  const maxWidthClass = maxWidthPx ? undefined : "max-w-5xl";
  const maxWidthStyle = maxWidthPx ? { maxWidth: `${maxWidthPx}px` } : undefined;

  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navOpen) return;
    function handleOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setNavOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setNavOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [navOpen]);

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-10 auth-shell-enter",
        isLight ? "bg-white text-slate-900" : "bg-[#060810] text-slate-100"
      )}
    >
      {/* Orbs - same as landing */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className={cn("absolute -left-24 top-0 h-[600px] w-[600px] rounded-full blur-[100px]", isLight ? "bg-[rgba(106,92,255,0.08)]" : "bg-[rgba(72,99,255,0.13)]")}
          style={{ animation: "ct-orbit 22s ease-in-out infinite" }}
        />
        <div
          className={cn("absolute right-[-5rem] bottom-[5%] h-[500px] w-[500px] rounded-full blur-[100px]", isLight ? "bg-[rgba(106,92,255,0.06)]" : "bg-[rgba(72,99,255,0.10)]")}
          style={{ animation: "ct-orbit 28s ease-in-out infinite reverse" }}
        />
      </div>

      {
        // Always rendered, independent of hideHeader -- this is the way
        // back to the rest of the site, not part of the "welcome" header a
        // page might suppress because it renders its own heading. Pinned
        // to the top-left corner, independent of the form's own width.
        <div className="relative z-20" ref={navRef}>
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl border transition",
              isLight
                ? "border-[var(--pvrx-border-light)] bg-white text-slate-900 hover:bg-slate-50"
                : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
            )}
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {navOpen && (
            <nav
              className={cn(
                "absolute left-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-2xl border py-2 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25)]",
                isLight ? "border-[var(--pvrx-border-light)] bg-white" : "border-white/10 bg-[#0a0e1a]"
              )}
            >
              {SITE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 text-sm font-medium no-underline transition",
                    isLight ? "text-slate-700 hover:bg-slate-50 hover:text-slate-900" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      }

      <div
        className={cn("relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full items-center justify-center", maxWidthClass)}
        style={maxWidthStyle}
      >
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
