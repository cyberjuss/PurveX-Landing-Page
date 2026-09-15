import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";

export function AcademyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[var(--pvrx-border-light)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/academy" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(106,92,255,0.1)] text-[#5546e0]">
              <GraduationCap className="h-[18px] w-[18px]" />
            </span>
            Think Like a SOC Analyst
          </Link>
          <Link
            href="/"
            aria-label="PurveX home"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--pvrx-border-light)] text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Home className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
