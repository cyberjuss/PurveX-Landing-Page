"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, signOut } from "@/lib/portal-auth";
import { Copy, Check, KeyRound, Loader2, Clock } from "lucide-react";
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

function LicenseKeyBlock({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--pvrx-border-light)] bg-slate-50">
      <div className="flex items-start justify-between gap-3 p-4">
        <code className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-slate-700">{token}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(token).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            });
          }}
          className="shrink-0 rounded-lg border border-[var(--pvrx-border-light)] bg-white p-1.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          aria-label="Copy license key"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
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
    <AuthShell theme="light" width="sm" bare title="My license" subtitle="Paste this into Settings → License in your PurveX instance.">
      <div className="w-full">
        {loading ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : loadError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>
        ) : license?.current_license_key ? (
          <div className="space-y-3">
            <LicenseKeyBlock token={license.current_license_key} />
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
