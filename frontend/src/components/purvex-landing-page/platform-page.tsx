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
      <section className="pg-hero" id="top">
        <div className="pg-hero__copy">
          <span className="sp-tag">In development</span>
          <h1 className="pg-hero__h1">See the miss. Know exactly why.</h1>
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
        <AssuranceConsole />
      </section>

      <section className="pg-section" id="proof">
        <div className="pg-head pg-head--xl" data-r>
          <span className="sp-tag">Not another dashboard</span>
          <h2>A rule that exists is not a rule that works.</h2>
          <p>A dashboard shows the rules you have. PurveX proves each stage of the chain, from the first event to the ticket.</p>
        </div>
        <ProvenChain />
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
              <h2>ATT&amp;CK coverage you can show</h2>
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

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">The difference</span>
          <h2>From assumed to proven</h2>
        </div>
        <Comparison />
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">Who it is for</span>
          <h2>One system for three roles</h2>
          <p>Each role looks at a different part of the same detection chain.</p>
        </div>
        <Pathways />
      </section>

      <section className="pg-section">
        <div className="ox-split">
          <div className="pg-head" data-r>
            <span className="sp-tag">Getting started</span>
            <h2>From connection to evidence</h2>
            <p>Four steps from a fresh install to a result you can show.</p>
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
          <span className="sp-tag">When it ships</span>
          <h2>Start small</h2>
          <p>The same software on both plans, and paid lifts the team and runner limits when you are ready.</p>
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
          <span className="sp-tag">Questions</span>
          <h2>Answers before you join</h2>
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
      <style>{PRODUCT_CSS}</style>
    </SiteChrome>
  );
}
