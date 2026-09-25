"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { joinWaitlist } from "@/lib/waitlist";
import { SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { IconChain, IconEvidence, IconLog, IconReadOnly, IconRecord, IconValidate } from "./brand-icons";
import { AssuranceConsole, Comparison, Pathways, PRODUCT_CSS, ProvenChain, TrustStrip } from "./lab-product";
import { ChainDiagram, CoverageMatrix, COVERAGE_PERCENT, HealthTrend, LAB_CSS } from "./lab-visuals";
import { PG_CSS } from "./page-skin";

const facts = [
  { title: "Runs Atomic Red Team tests", body: "Real adversary behavior, run against your own environment.", Icon: IconValidate },
  { title: "Queries your SIEM", body: "Works with Splunk, Elastic, and Microsoft Sentinel.", Icon: IconLog },
  { title: "Names the stage that failed", body: "Telemetry, parser, rule, or alert, with the evidence attached.", Icon: IconChain },
];

const start = [
  { n: "01", title: "Connect your SIEM", body: "Read-only access to Splunk, Elastic, or Microsoft Sentinel.", Icon: IconLog },
  { n: "02", title: "Run a test", body: "Pick an ATT&CK technique and run it against your environment.", Icon: IconValidate },
  { n: "03", title: "Read the result", body: "See which stage of the chain fired and which one failed.", Icon: IconChain },
  { n: "04", title: "Fix and run again", body: "Every result is kept as evidence, so progress is easy to show.", Icon: IconEvidence },
];

const runs = [
  { id: "T1059.001", name: "PowerShell execution", state: "Fired" },
  { id: "T1003.001", name: "LSASS memory access", state: "Missed" },
  { id: "T1053.005", name: "Scheduled task creation", state: "Fired" },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    note: "self-hosted",
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

const faqs = [
  {
    q: "Is this BAS",
    Icon: IconChain,
    a: <>BAS hits endpoints, and we test the chain after that: telemetry, parser, rule, and alert.</>,
  },
  {
    q: "Does it run in production",
    Icon: IconReadOnly,
    a: (
      <>
        <mark>Read-only</mark> on the SIEM by default. Production tests need an <mark>explicit opt-in</mark>, and every run
        is <mark>auditable</mark>.
      </>
    ),
  },
  {
    q: "Does it replace the SIEM",
    Icon: IconRecord,
    a: (
      <>
        No. Your SIEM remains the <mark>system of record</mark>, and we prove that the detections fire.
      </>
    ),
  },
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
      <section className="pg-hero lb-motion" id="top">
        <ol className="lb-spine" aria-hidden="true">
          <li>Telemetry</li>
          <li>Parser</li>
          <li>Rule</li>
          <li data-fail>Alert</li>
        </ol>
        <div className="pg-hero__copy">
          <span className="sp-tag">Platform</span>
          <h1 className="pg-hero__h1">Name the stage that failed</h1>
          <p className="pg-hero__sub">Telemetry, parser, rule, or alert. The run keeps the evidence. Still private.</p>
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
        <AssuranceConsole />
      </section>

      <section className="pg-section" id="proof">
        <div className="pg-head pg-head--xl" data-r>
          <h2>A rule that exists is not a rule that works</h2>
          <p>The chain is the proof. A dashboard is the list.</p>
        </div>
        <ProvenChain />
      </section>

      <section className="pg-section" id="how">
        <div className="pg-head" data-r>
          <h2>Most misses happen after the rule</h2>
          <p>The test follows the alert through every stage and stops where it broke.</p>
        </div>
        <ChainDiagram />
        <ul className="lb-facts" data-r>
          {facts.map((f) => (
            <li key={f.title}>
              <i className="pg-ico"><f.Icon size={22} /></i>
              <strong>{f.title}</strong>
              <p>{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="pg-section">
        <div className="pg-dark" data-r>
          <div className="lb-band">
            <div>
              <span className="pg-dark__kicker">Coverage</span>
              <h2>Show the miss</h2>
              <ul className="lb-legend">
                <li><i data-s="fired" /> Fired</li>
                <li><i data-s="missed" /> Missed</li>
                <li><i data-s="untested" /> Not yet tested</li>
              </ul>
            </div>
            <div className="lb-big">
              <strong>{COVERAGE_PERCENT}%</strong>
              <span>of tested techniques fired<br />Example matrix</span>
            </div>
          </div>
          <CoverageMatrix />
        </div>
      </section>

      <section className="pg-section">
        <div className="lb-evidence">
          <div>
            <HealthTrend />
            <ul className="lb-runs" data-r>
              {runs.map((r) => (
                <li key={r.id}>
                  <code>{r.id}</code>
                  <span>{r.name}</span>
                  <em data-s={r.state.toLowerCase()}>{r.state}</em>
                </li>
              ))}
            </ul>
          </div>
          <div className="pg-head lb-evidence__copy" data-r>
            <h2>The score moves when the run does</h2>
            <p>Each run is scored and kept. You can show the difference.</p>
            <ul className="pg-bullets">
              <li>Scores update after every run</li>
              <li>Reports carry the evidence for each technique</li>
              <li>AI-assisted analysis explains failed tests</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <h2>Assumed, then proven</h2>
        </div>
        <Comparison />
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <h2>Three roles. One chain.</h2>
          <p>Each role reads a different stage of the same detection.</p>
        </div>
        <Pathways />
      </section>

      <section className="pg-section">
        <div className="ox-split">
          <div className="pg-head" data-r>
            <h2>Connect. Run. Read. Keep.</h2>
            <p>Four steps from a fresh install to evidence you can show.</p>
          </div>
          <ol className="ox-steps" data-r>
            {start.map((s) => (
              <li key={s.n}>
                <span className="ox-steps__n">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
                <i className="pg-ico"><s.Icon size={24} /></i>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-section" id="pricing">
        <div className="pg-head" data-r>
          <h2>Same software. Two limits.</h2>
          <p>Paid lifts the team and runner caps when you are ready.</p>
        </div>
        <div className="pr" data-r>
          {tiers.map((t) => (
            <article key={t.name} className={`pr__side${t.dark ? " pr__side--paid" : ""}`}>
              <span className="pr__name">{t.name}</span>
              <p className="pr__price">
                {t.price}
                <small>{t.note}</small>
              </p>
              <ul className="pr__list">
                {t.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a href={t.href} className="sp-btn sp-btn--ghost sp-btn--lg">
                {t.cta} <ArrowRight size={16} />
              </a>
            </article>
          ))}
          <span className="pr__seam">Same software</span>
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <h2>Before you join</h2>
        </div>
        <TrustStrip />
        <div className="fq" data-r>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                <i><f.Icon size={22} /></i>
                <strong>{f.q}</strong>
              </summary>
              <div>
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Ask for a seat</h2>
          <p className="pg-close__sub">We write when one opens.</p>
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
      <style>{LAB_CSS}</style>
      <style>{PRODUCT_CSS}</style>
      <style>{`
        .lb-motion { position: relative }
        .lb-spine {
          grid-column: 1 / -1; list-style: none; display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0; margin: 8px 0 0; padding: 0 0 8px; position: relative;
        }
        .lb-spine::before {
          content: ""; position: absolute; left: 0; right: 8%; top: 7px; height: 2px;
          background: rgba(106,92,255,.18);
        }
        .lb-spine::after {
          content: ""; position: absolute; left: 0; top: 7px; height: 2px; width: 72%;
          background: var(--accent); transform-origin: left; transform: scaleX(0);
        }
        .lb-spine li {
          position: relative; padding-top: 22px;
          font-family: var(--font-display); font-weight: 700;
          font-size: clamp(1.4rem, 2.4vw, 2.1rem); letter-spacing: -.03em;
        }
        .lb-spine li::before {
          content: ""; position: absolute; left: 0; top: 2px; width: 12px; height: 12px;
          background: #fff; border: 2px solid var(--accent);
        }
        .lb-spine li[data-fail] { color: #c23030 }
        .lb-spine li[data-fail]::before { background: #fdeaea; border-color: #e5484d }
        .lb-motion .pg-hero__copy, .lb-motion .as-floor { position: relative; z-index: 1 }
        @media (prefers-reduced-motion: no-preference) {
          .lb-motion .as-sheet { animation: lb-settle .6s var(--ease) both; }
          .lb-spine::after { animation: lb-run 2.4s var(--ease) .2s forwards }
          .lb-spine li[data-fail]::before { animation: lb-fail 1.6s ease-in-out 2.2s infinite }
        }
        @keyframes lb-settle { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes lb-run { to { transform: scaleX(1) } }
        @keyframes lb-fail { 0%, 100% { box-shadow: 0 0 0 0 rgba(229,72,77,.45) } 70% { box-shadow: 0 0 0 8px rgba(229,72,77,0) } }
        @media (max-width: 980px) {
          .lb-motion { min-height: 0; }
          .lb-spine { grid-template-columns: 1fr 1fr; gap: 12px 0 }
          .lb-spine::before, .lb-spine::after { display: none }
        }
      `}</style>
    </SiteChrome>
  );
}
