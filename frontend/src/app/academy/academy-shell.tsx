"use client";

import { useState } from "react";
import Link from "next/link";
import { BookMarked, GraduationCap, Home, Menu, X } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";
import { AcademyProgressProvider } from "@/components/academy/academy-progress";
import { AcademySidebar } from "@/components/academy/academy-sidebar";

export function AcademyShell({ phases, children }: { phases: PhaseDef[]; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AcademyProgressProvider phases={phases}>
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-40 border-b border-[var(--pvrx-border-light)] bg-white">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--pvrx-border-light)] text-slate-600 transition hover:bg-slate-50 lg:hidden"
                aria-label="Open course menu"
              >
                <Menu className="h-[18px] w-[18px]" />
              </button>
              <Link href="/academy" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(106,92,255,0.1)] text-[#5546e0]">
                  <GraduationCap className="h-[18px] w-[18px]" />
                </span>
                <span className="hidden sm:inline">Think Like a SOC Analyst</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/academy/reference"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-[var(--pvrx-border-light)] px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <BookMarked className="h-4 w-4" /> Reference
              </Link>
              <Link
                href="/"
                aria-label="PurveX home"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--pvrx-border-light)] text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Home className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl">
          {/* Desktop sidebar */}
          <aside className="hidden w-72 shrink-0 border-r border-[var(--pvrx-border-light)] lg:sticky lg:top-[65px] lg:block lg:h-[calc(100vh-65px)]">
            <AcademySidebar phases={phases} />
          </aside>

          {/* Mobile drawer */}
          {sidebarOpen && (
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
