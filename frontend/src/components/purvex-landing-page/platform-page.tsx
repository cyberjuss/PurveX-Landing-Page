"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Archive, ArrowRight, Search, Timer } from "lucide-react";
import { joinWaitlist } from "@/lib/waitlist";
import { SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

const points = [
  { n: "01", title: "Run the test", body: "The behaviors you care about. On a schedule.", Icon: Timer },
  { n: "02", title: "See the miss", body: "Fired, or not. And where the chain broke.", Icon: Search },
  { n: "03", title: "Keep the evidence", body: "Coverage you can show, not coverage you assume.", Icon: Archive },
];

const rows = [
  { title: "PowerShell execution", sev: "Fired", id: "T1059.001", host: "WIN-APP08" },
  { title: "LSASS memory access", sev: "Missed", id: "T1003.001", host: "WIN-DC02" },
  { title: "Scheduled task", sev: "Fired", id: "T1053.005", host: "WIN-WKS12" },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    note: "Self-hosted",
    items: ["ATT&CK-mapped tests", "Splunk, Elastic, or Sentinel", "3 people, 3 runs a day"],
    href: "/account/signup?plan=free",
    cta: "Get started free",
    dark: false,
  },
  {
    name: "Paid",
    price: "$99",
    note: "per month",
    items: ["Unlimited people and runs", "Scheduled tests", "Detection-as-code from git"],
    href: "/account/signup?plan=paid",
    cta: "Get started",
    dark: true,
  },
];

const faqs: [string, string][] = [
  ["Is this BAS", "BAS hits endpoints. We test the chain after that. Telemetry, parser, rule, alert."],
  ["Does it run in production", "Read-only on the SIEM by default. Production tests need an opt-in."],
  ["Does it replace the SIEM", "No. Your SIEM stays. We prove the detections fire."],
];

export default function PlatformPage() {
  const [email, setEmail] = useState("");
  const [wlState, setWlState] = useState<"idle" | "loading" | "success" | "exists" | "error">("idle");
  const [wlMsg, setWlMsg] = useState("");

  const submitWaitlist = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = email.trim();
      if (!trimmed) {
        setWlState("error");
        setWlMsg("Enter your work email.");
        return;
      }
      setWlState("loading");
      setWlMsg("");
      try {
        const data = await joinWaitlist(trimmed, "platform-hero");
        if (data.already_exists) {
          setWlState("exists");
          setWlMsg("Already on the waitlist.");
        } else {
          setWlState("success");
          setWlMsg("On the list. We will be in touch.");
          setEmail("");
        }
      } catch (err) {
        setWlState("error");
        setWlMsg(err instanceof Error ? err.message : "Unable to join right now. Try again.");
      }
    },
    [email],
  );

  return (
    <SiteChrome active="platform">
      <section className="pg-hero" id="top">
        <div className="pg-hero__copy">
          <span className="sp-tag">In development</span>
          <h1 className="pg-hero__h1">See what fires</h1>
          <p className="pg-hero__sub">Scheduled detection tests. The evidence kept. Private development.</p>
          <form className="pg-wl" onSubmit={submitWaitlist}>
            <div className="pg-wl__row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />
              <button type="submit" className="sp-btn sp-btn--prim sp-btn--sm" disabled={wlState === "loading"}>
                {wlState === "loading" ? "Joining..." : <>Join waitlist <ArrowRight size={14} /></>}
              </button>
            </div>
            {wlMsg && <p className={`pg-wl__msg pg-wl__msg--${wlState}`}>{wlMsg}</p>}
          </form>
        </div>
        <aside className="pg-floor" aria-hidden="true">
          <div className="pg-floor__wash" />
          <article className="pg-case">
            <header>
              <span>RUN-14</span>
              <span data-sev="Crit">Missed</span>
              <span>Open</span>
            </header>
            <h2>LSASS memory access</h2>
            <dl>
              <div><dt>Technique</dt><dd>T1003.001</dd></div>
              <div><dt>Host</dt><dd>WIN-DC02</dd></div>
              <div><dt>Rule</dt><dd>Exists</dd></div>
              <div><dt>Alert</dt><dd>None</dd></div>
            </dl>
            <p>The miss is parser drift. Fix the ingest, not the rule.</p>
          </article>
          <div className="pg-dock">
            <p><span className="pg-live" /> Last run</p>
            {rows.map((r) => (
              <div key={r.id} className="pg-dock__row">
                <strong>{r.title}</strong>
                <em data-sev={r.sev === "Fired" ? "High" : undefined}>{r.sev}</em>
                <span>{r.id}</span>
                <span>{r.host}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">Labs</span>
          <h2>What it does</h2>
          <p>A test run. A miss you can name. Evidence you keep.</p>
        </div>
        <ol className="pg-grid pg-grid--3 pg-grid--icons" data-r>
          {points.map((p) => (
            <li key={p.n}>
              <span>{p.n}</span>
              <i className="pg-ico"><p.Icon size={21} /></i>
              <strong>{p.title}</strong>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-section" id="pricing">
        <div className="pg-head" data-r>
          <span className="sp-tag">When it ships</span>
          <h2>Start small</h2>
          <p>Same software. Paid lifts the team and runner limits.</p>
        </div>
        <div className="pg-deck" data-r>
          {tiers.map((t) => (
            <article key={t.name} className={`pg-tile${t.dark ? " pg-tile--dark" : ""}`}>
              <div className="pg-tile__stub">
                <span>{t.name}</span>
                <span>{t.note}</span>
              </div>
              <h3>{t.price}</h3>
              <ul>
                {t.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a href={t.href} className={t.dark ? "pg-tile__link pg-tile__link--light" : "pg-tile__link"}>
                {t.cta} <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">Questions</span>
          <h2>Before you join</h2>
        </div>
        <div className="pg-faq" data-r>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <p className="pg-close__kicker">Early access</p>
          <h2>Get on the list</h2>
          <p className="pg-close__sub">Private development. We write when a seat opens.</p>
          <div className="pg-close__row">
            <a href="#top" className="pg-close__book">
              Join waitlist <ArrowRight size={16} />
            </a>
            <Link href="/security-operations" className="pg-close__more">
              Operations today <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="labs" />
      </section>

      <style>{PG_CSS}</style>
    </SiteChrome>
  );
}
