"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Copy, Check, BookOpen, LifeBuoy, Timer } from "lucide-react";

// Falls back to the production domain for the SSR/pre-mount render; swapped
// for the real window.location.origin once mounted (see useEffect below) --
// matters for local dev, harmless everywhere else since it's already correct.
const DEFAULT_ORIGIN = "https://purvex-llc.com";

// Same traffic-light palette as the dashboard mockup dots elsewhere on the
// site (platform-page.tsx's .sp-dash__dots) -- one visual vocabulary.
const TERMINAL_DOTS = ["#f2777a", "#f4c059", "#5ec269"];

function TerminalCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--pvrx-border-light)] shadow-[0_24px_48px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex items-center gap-1.5 bg-[#12161f] px-4 py-2.5">
        {TERMINAL_DOTS.map((color) => (
          <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        ))}
        <span className="ml-2 font-mono text-[11px] tracking-wide text-slate-500">bash</span>
      </div>
      <div className="flex items-start gap-3 bg-[#0a0e1a] p-4 font-mono text-[13px] leading-relaxed text-slate-200">
        <span className="mt-0.5 shrink-0 select-none text-[#8b7dff]">$</span>
        <code className="flex-1 break-all">{command}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(command).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            });
          }}
          className="shrink-0 rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/20 hover:text-white"
          aria-label="Copy command"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Step({ number, title, last, children }: { number: number; title: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6a5cff] text-xs font-bold text-white shadow-[0_6px_16px_-6px_rgba(106,92,255,0.6)]">
          {number}
        </div>
        {!last && <div className="mt-1 w-px flex-1 bg-[var(--pvrx-border-light)]" />}
      </div>
      <div className={`flex-1 space-y-2.5 ${last ? "" : "pb-7"}`}>
        <p className="text-[15px] font-semibold text-slate-900">{title}</p>
        {children}
      </div>
    </div>
  );
}

function GetPurveXContent() {
  const params = useSearchParams();
  const plan = params?.get("plan") === "paid" ? "paid" : "free";
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  useEffect(() => {
    // window.location doesn't exist during SSR -- this has to be an effect,
    // there's no way to read it during the render that produces the
    // server-rendered HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);
  const installCommand = `curl -fsSL ${origin}/install.sh | bash`;

  return (
    <AuthShell
      theme="light"
      width="md"
      bare
      title={plan === "paid" ? "You're all set" : "Get PurveX running"}
      subtitle={
        plan === "paid"
          ? "Same install as the free plan below -- your license key removes the team and runner limits."
          : "Runs entirely on your own infrastructure. Nothing to configure on our side."
      }
    >
      <div className="w-full space-y-7">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pvrx-border-light)] bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            <Timer className="h-3.5 w-3.5" />
            About 5 minutes, start to finish
          </span>
        </div>

        {plan === "paid" && (
          <div className="rounded-2xl border border-[rgba(106,92,255,0.25)] bg-[rgba(106,92,255,0.05)] p-4 text-sm leading-relaxed text-slate-700">
            <strong className="text-slate-900">Your license key is on its way.</strong> We issue keys by hand right
            now, so expect an email at the address you signed up with within one business day. Once it arrives,
            paste it into <span className="font-mono text-[#5546e0]">Settings → License</span> after you finish
            setup below.
          </div>
        )}

        <div>
          <Step number={1} title="Install and start PurveX">
            <TerminalCommand command={installCommand} />
            <p className="text-xs text-slate-500">
              Requires Python 3.11+, Node 20+, and PostgreSQL 14+ already installed. Full prerequisites and a manual
              Windows path are in the repo README.
            </p>
          </Step>
          <Step number={2} title="Open your instance" last>
            <p className="text-sm leading-relaxed text-slate-500">
              Visit <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-700">http://localhost:1120</span> -- the
              first visitor is walked through creating the admin account. There&apos;s no separate login for this
              step; whoever gets there first sets it up.
            </p>
          </Step>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--pvrx-border-light)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/install-guide"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6a5cff] transition hover:text-[#5546e0]"
          >
            <BookOpen className="h-4 w-4" />
            Full install guide
          </Link>
          <Link
            href="https://calendly.com/purvex-llc/30min"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <LifeBuoy className="h-4 w-4" />
            Get help from the team
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default function GetPurveXPage() {
  return (
    <Suspense fallback={<AuthShell theme="light" width="md" bare><div className="min-h-[200px]" /></AuthShell>}>
      <GetPurveXContent />
    </Suspense>
  );
}
