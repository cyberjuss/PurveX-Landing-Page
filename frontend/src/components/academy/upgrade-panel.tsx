"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, MessageCircle, Server } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import "./upgrade-panel.css";

// What a free account already has, and the two things a plan adds. Both of the
// paid items cost real money per student (an AWS instance, and model usage),
// which is why they sit behind the plan and the rest of the course does not.
const FREE = [
  "Every lesson, in all phases",
  "Every challenge and the Ticket Queue",
  "The browser labs: risk triage, hashing, passwords, access, the sign-in log",
  "Your readiness score and Proof Profile",
];
const PAID = [
  { icon: Server, title: "Your own hosted lab", body: "A real Windows domain controller in the cloud, opened in your browser. No setup, nothing to install." },
  { icon: MessageCircle, title: "PurveX Coach", body: "An AI mentor that can see your lab and your progress, and coaches you without handing over answers." },
];

export function UpgradePanel() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await academyFetch("/academy/api/checkout", { method: "POST" });
      const data = (await r.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Could not start checkout.");
    } catch {
      setError("Could not reach checkout. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="up">
      <Link href="/range" className="up__back"><ArrowLeft aria-hidden="true" /> Back to Range</Link>
      <h1>Add the hosted lab and Coach</h1>
      <p className="up__sub">You already have the whole course. The plan adds the two parts that run on real infrastructure.</p>

      <div className="up__grid">
        {PAID.map((p) => (
          <div key={p.title} className="up__card">
            <span className="up__icon" aria-hidden="true"><p.icon /></span>
            <b>{p.title}</b>
            <span>{p.body}</span>
          </div>
        ))}
      </div>

      <button type="button" className="up__go" onClick={() => void start()} disabled={busy}>
        {busy ? <Loader2 className="up__spin" aria-hidden="true" /> : null}
        {busy ? "Opening checkout" : "Continue to checkout"}
      </button>
      {error && <p className="up__error">{error}</p>}

      <div className="up__free">
        <b>Free with your account</b>
        <ul>
          {FREE.map((f) => <li key={f}><Check aria-hidden="true" /> {f}</li>)}
        </ul>
      </div>
    </div>
  );
}
