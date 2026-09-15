import Link from "next/link";
import { BookMarked, GraduationCap, Home } from "lucide-react";

export function AcademyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[var(--pvrx-border-light)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/academy" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(106,92,255,0.1)] text-[#5546e0]">
              <GraduationCap className="h-[18px] w-[18px]" />
            </span>
            <span className="hidden sm:inline">Think Like a SOC Analyst</span>
          </Link>
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
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
