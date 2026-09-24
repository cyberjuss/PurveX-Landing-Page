"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { joinWaitlist } from "@/lib/waitlist";
import { SiteChrome } from "./chrome";
import { CaseFloor, DETECTION_ALERTS, DETECTION_CASES } from "./case-floor";
import { HoldCard } from "./hold-card";
import { IconChain, IconLog, IconValidate } from "./brand-icons";
import { ChainDiagram, CoverageMatrix, COVERAGE_PERCENT, HealthTrend, LAB_CSS } from "./lab-visuals";
import { PG_CSS } from "./page-skin";

const facts = [
  { title: "Runs Atomic Red Team tests", body: "Real adversary behavior, run against your own environment.", Icon: IconValidate },
  { title: "Queries your SIEM", body: "Works with Splunk, Elastic, and Microsoft Sentinel.", Icon: IconLog },
  { title: "Names the stage that failed", body: "Telemetry, parser, rule, or alert, with the evidence attached.", Icon: IconChain },
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
  ["Is this BAS", "BAS hits endpoints, and we test the chain after that: telemetry, parser, rule, and alert."],
  ["Does it run in production", "Read-only on the SIEM by default. Production tests need an opt-in."],
  ["Does it replace the SIEM", "No. Your SIEM stays, and we prove the detections fire."],
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
          <p className="pg-hero__sub">Scheduled detection tests, with the evidence kept, while the product is still in private development. Join the list to see a run when a seat opens.</p>
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
        <CaseFloor cases={DETECTION_CASES} alerts={DETECTION_ALERTS} label="Scheduled runs" />
      </section>

      <section className="pg-section" id="how">
        <div className="pg-head" data-r>
          <span className="sp-tag">How it works</span>
          <h2>Most misses happen after the rule is written</h2>
          <p>PurveX runs a real attack behavior and follows the alert through every stage, so the report shows exactly where the chain broke.</p>
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
              <h2>Coverage you can show, mapped to MITRE ATT&amp;CK</h2>
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
            <span className="sp-tag">Evidence</span>
            <h2>A score that moves with every run</h2>
            <p>Each run is scored and kept, so improvement is something you can show to a stakeholder.</p>
            <ul className="pg-bullets">
              <li>Scores update after every run</li>
              <li>Reports carry the evidence for each technique</li>
              <li>AI-assisted analysis explains failed tests</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="pg-section" id="pricing">
        <div className="pg-head" data-r>
          <span className="sp-tag">When it ships</span>
          <h2>Start small</h2>
          <p>The same software on both plans, and paid lifts the team and runner limits when you are ready.</p>
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
          <p className="pg-close__sub">The product is still in private development, and we write when a seat opens. Join the list if you want to see a run before it is public.</p>
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
    </SiteChrome>
  );
}
