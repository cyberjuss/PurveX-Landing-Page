"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, ChevronLeft, GraduationCap, Home, Menu, X } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";
import { AcademyProgressProvider } from "@/components/academy/academy-progress";
import { AcademySidebar } from "@/components/academy/academy-sidebar";

export function AcademyShell({ phases, children }: { phases: PhaseDef[]; children: React.ReactNode }) {
  const pathname = usePathname();
  // The course sidebar is itself a "pick a phase, then a week" nav -- on the
  // course overview page, that's exactly what the phase cards in the main
  // content already are. Showing it there duplicated the one thing that
  // page does. It reappears everywhere else, once you're actually inside a
  // phase or a lesson, where it's a real jump-around tool rather than a
  // second copy of the page you're looking at.
  const showSidebar = pathname !== "/academy";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AcademyProgressProvider phases={phases}>
      <div className="academy-bg min-h-screen">
        <header
          className={`sticky top-0 z-40 border-b bg-white transition-shadow ${
            scrolled ? "border-[var(--pvrx-border-light)] shadow-[0_1px_0_rgba(16,25,46,0.03),0_8px_24px_-16px_rgba(16,25,46,0.12)]" : "border-[var(--pvrx-border-light)]"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              {showSidebar && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] text-slate-600 transition hover:bg-slate-50 lg:hidden"
                  aria-label="Open course menu"
                >
                  <Menu className="h-[18px] w-[18px]" />
                </button>
              )}
              <Link href="/academy" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#5546e0] text-white">
                  <GraduationCap className="h-[18px] w-[18px]" />
                </span>
                <span className="hidden sm:inline">
                  Think Like a SOC Analyst
                  <span className="ml-2 font-mono text-xs font-normal text-slate-400">101</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/academy/reference"
                className="flex h-9 items-center gap-1.5 rounded-md border border-[var(--pvrx-border-light)] bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
              >
                <BookMarked className="h-4 w-4" /> Reference
              </Link>
              <Link
                href="/"
                aria-label="PurveX home"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] bg-white text-slate-500 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
              >
                <Home className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl">
          {/* Desktop sidebar -- always mounted, width-animated to 0 rather
              than conditionally rendered, so going from the home page (no
              sidebar) into a phase reads as a slide-open instead of an
              instant layout jump. Same width transition the manual
              collapse toggle already uses, just driven by route too. */}
          <aside
            aria-hidden={!showSidebar}
            className={`hidden shrink-0 overflow-hidden bg-white transition-[width] duration-300 ease-[cubic-bezier(.16,1,.3,1)] lg:sticky lg:top-[65px] lg:block lg:h-[calc(100vh-65px)] ${
              showSidebar ? "border-r border-[var(--pvrx-border-light)]" : "border-r-0"
            } ${!showSidebar ? "lg:w-0" : collapsed ? "lg:w-12" : "lg:w-72"}`}
          >
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              tabIndex={showSidebar ? 0 : -1}
              title={collapsed ? "Expand course menu" : "Collapse course menu"}
              className="flex h-11 w-full items-center justify-center border-b border-[var(--pvrx-border-light)] text-slate-400 transition hover:bg-slate-50 hover:text-[#5546e0]"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>
            <div className={`h-[calc(100%-45px)] transition-opacity duration-200 ${collapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}>
              <AcademySidebar phases={phases} />
            </div>
          </aside>

          {/* Mobile drawer */}
          {showSidebar && sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-slate-900/30" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--pvrx-border-light)] px-5 py-4">
                  <span className="font-display text-sm font-semibold text-slate-900">Course menu</span>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label="Close course menu"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                </div>
                <div className="h-[calc(100%-57px)]">
                  <AcademySidebar phases={phases} onNavigate={() => setSidebarOpen(false)} />
                </div>
              </div>
            </div>
          )}

          <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl">{children}</div>
          </main>
        </div>
      </div>
    </AcademyProgressProvider>
  );
}
