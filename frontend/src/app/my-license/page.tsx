"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, signOut } from "@/lib/portal-auth";
import { Copy, Check, KeyRound, Loader2, Clock, Download } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface LicenseRow {
  plan: "unselected" | "free" | "paid";
  current_license_key: string | null;
  license_issued_at: string | null;
}

function formatIssuedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, { dateStyle: "medium" });
}

// The token is a signed JWT -- decoding its payload here is just to show
// plan/dates on the document below, not verification (that only ever
// happens product-side, against the ed25519 public key). Best-effort: any
// parse failure just means the document renders without these details,
// the key itself is unaffected either way.
interface LicenseClaims {
  plan?: string;
  seat_limit?: number | null;
  runner_limit?: number | null;
  iat?: number;
  exp?: number;
}
function decodeLicenseClaims(token: string): LicenseClaims | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as LicenseClaims;
  } catch {
    return null;
  }
}

// A plain-text document rather than a bare token -- reads like an actual
// license (who it's issued to, plan, dates) instead of an opaque string.
// The key itself lives in a clearly marked block so Settings -> License's
// upload can pull it back out regardless of what surrounds it.
function buildLicenseDocument(token: string, email: string | undefined): string {
  const claims = decodeLicenseClaims(token);
  const seats = claims?.seat_limit == null ? "Unlimited" : String(claims.seat_limit);
  const runners = claims?.runner_limit == null ? "Unlimited" : String(claims.runner_limit);
  const issued = claims?.iat ? formatDate(claims.iat) : "--";
  const expires = claims?.exp ? formatDate(claims.exp) : "--";

  return `================================================================
PURVEX LICENSE
================================================================

Licensed to     ${email || "--"}
Plan            Paid
Team members    ${seats}
Test runners    ${runners}
Issued          ${issued}
Valid through   ${expires}

----------------------------------------------------------------
Upload this file as-is in Settings -> License in your PurveX
instance, or copy the key below and paste it there directly.
----------------------------------------------------------------

${token}

================================================================
purvex-llc.com/my-license
================================================================
`;
}

function downloadLicenseFile(token: string, email: string | undefined) {
  const blob = new Blob([buildLicenseDocument(token, email)], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "purvex-license.lic";
  link.click();
  URL.revokeObjectURL(url);
}

function LicenseKeyBlock({ token, email }: { token: string; email: string | undefined }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--pvrx-border-light)] bg-slate-50">
      <div className="flex items-start justify-between gap-3 p-4">
        <code className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-slate-700">{token}</code>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => downloadLicenseFile(token, email)}
            className="rounded-lg border border-[var(--pvrx-border-light)] bg-white p-1.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Download license document"
            title="Download purvex-license.lic"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(token).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              });
            }}
            className="rounded-lg border border-[var(--pvrx-border-light)] bg-white p-1.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Copy license key"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyLicenseContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [license, setLicense] = useState<LicenseRow | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then(async (u) => {
      if (cancelled) return;
      if (!u) {
        router.replace(`/account/login?next=${encodeURIComponent("/my-license")}`);
        return;
      }
      setUser(u);

      if (!supabase) {
        if (!cancelled) setLoadError("Sign-in isn't fully configured yet -- try again shortly.");
        return;
      }
      const { data, error } = await supabase
        .from("portal_profiles")
        .select("plan, current_license_key, license_issued_at")
        .eq("user_id", u.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setLoadError("Couldn't load your license. Try refreshing.");
        return;
      }
      setLicense((data as LicenseRow | null) ?? null);
    });
    return () => { cancelled = true; };
  }, [router]);

  const loading = user === undefined || license === undefined;

  return (
    <AuthShell theme="light" width="sm" bare title="My license" subtitle="Download this and upload it in Settings → License in your PurveX instance.">
      <div className="w-full">
        {loading ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : loadError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>
        ) : license?.current_license_key ? (
          <div className="space-y-3">
            <LicenseKeyBlock token={license.current_license_key} email={user?.email} />
            {license.license_issued_at && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Issued {formatIssuedAt(license.license_issued_at)}
              </p>
            )}
            <p className="text-sm leading-relaxed text-slate-600">
              Keys are valid for 35 days and renew automatically with your subscription -- check back here any
              time you need the current one, no need to wait on an email.
            </p>
          </div>
        ) : license?.plan === "paid" ? (
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--pvrx-border-light)] bg-slate-50">
              <KeyRound className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              We issue license keys by hand right now, so yours isn&apos;t here yet -- expect it within one
              business day of payment. This page updates automatically once it&apos;s ready; no need to check
              your email for it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">
              You&apos;re on the free plan, which doesn&apos;t need a license key at all -- it just works. Want
              team limits and scheduled runs removed? <Link href="/pricing" className="font-medium text-[#6a5cff] hover:text-[#5546e0]">See paid plans</Link>.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => { void signOut(); router.push("/"); }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--pvrx-border-light)] bg-white py-1.5 pl-3 pr-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
          >
            {user?.email}
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">Sign out</span>
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export default function MyLicensePage() {
  return (
    <Suspense fallback={<AuthShell theme="light" width="sm" bare><div className="min-h-[200px]" /></AuthShell>}>
      <MyLicenseContent />
    </Suspense>
  );
}
