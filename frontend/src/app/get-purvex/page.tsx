"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Copy, Check, Terminal } from "lucide-react";

const INSTALL_COMMAND = "git clone https://github.com/cyberjuss/PurveX.git && cd PurveX && cp .env.example .env && chmod +x scripts/purvex.sh && ./scripts/purvex.sh --setup && ./scripts/purvex.sh --start";

function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0a0e1a] p-4 font-mono text-[13px] leading-relaxed text-slate-200">
      <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
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
  );
}

function GetPurveXContent() {
  const params = useSearchParams();
  const plan = params?.get("plan") === "paid" ? "paid" : "free";

  return (
    <AuthShell
      title={plan === "paid" ? "You're all set" : "Get PurveX running"}
      subtitle={
        plan === "paid"
          ? "Same install as the free plan below -- your license key removes the team and runner limits."
          : "Runs entirely on your own infrastructure. Nothing to configure on our side."
      }
    >
      <div className="w-full space-y-6">
        {plan === "paid" && (
          <div className="rounded-2xl border border-[rgba(72,99,255,0.3)] bg-[rgba(72,99,255,0.08)] p-4 text-sm leading-relaxed text-slate-200">
            <strong className="text-white">Your license key is on its way.</strong> We issue keys by hand right now,
            so expect an email at the address you signed up with within one business day. Once it arrives, paste it
            into <span className="font-mono text-blue-300">Settings → License</span> after you finish setup below.
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-200">1. Clone, configure, and start PurveX</p>
          <CopyableCommand command={INSTALL_COMMAND} />
          <p className="text-xs text-slate-500">
            Requires Python 3.11+, Node 20+, and PostgreSQL 14+ already installed. Full prerequisites and a manual
            Windows path are in the repo README.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-200">2. Open your instance</p>
          <p className="text-sm leading-relaxed text-slate-400">
            Visit <span className="font-mono text-slate-300">http://localhost:1120</span> -- the first visitor is
            walked through creating the admin account. There&apos;s no separate login for this step; whoever gets
            there first sets it up.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="https://github.com/cyberjuss/PurveX#readme" className="text-sm font-medium text-blue-300 hover:text-blue-200">
            Full install guide &rarr;
          </Link>
          <Link href="https://calendly.com/purvex-llc/30min" className="text-sm font-medium text-slate-400 hover:text-slate-200">
            Get help from the team &rarr;
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default function GetPurveXPage() {
  return (
    <Suspense fallback={<AuthShell><div className="min-h-[200px]" /></AuthShell>}>
      <GetPurveXContent />
    </Suspense>
  );
}
