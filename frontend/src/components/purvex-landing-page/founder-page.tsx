"use client";

import Image from "next/image";
import { Linkedin } from "lucide-react";
import { SiteChrome } from "./chrome";

const bioSections = [
  {
    label: "Where I started",
    body: "Before this was a company, it was three jobs. Tuning Microsoft Sentinel detections for a federal agency. Automating response workflows in Splunk SOAR. Teaching SOC fundamentals to analysts at Ellington Cyber Academy. All of it taught the same lesson. Real growth comes from hands-on repetition, not from watching someone else do the work.",
  },
  {
    label: "What actually matters",
    body: "Hands-on alone is not enough, though. AI can write the query now. It can summarize the alert. What still matters is knowing how to think, how to read what a system is telling you, when to trust it, when to push back. That is what I teach. Not shortcuts to capture a flag. The judgment to actually solve the problem.",
  },
  {
    label: "Why PurveX exists",
    body: "I kept running into the same gap. Smaller security teams know they need stronger coverage. They do not have the headcount to build and maintain it by hand. AI agents can close that gap, paired with someone who still understands what is happening underneath them. No team should need to be enterprise-sized to be secure.",
  },
];

const quickFacts = [
  { label: "Background", value: "SOC Analyst → Security Instructor" },
  { label: "Core tools", value: "Microsoft Sentinel, Splunk SOAR" },
  { label: "Certifications", value: "CySA+, Security+" },
  { label: "Currently teaching at", value: "Ellington Cyber Academy" },
];

export default function FounderPage() {
  return (
    <SiteChrome active="about">
      <section className="sp-hero sp-hero--split">
        <div className="sp-hero__copy">
          <span className="sp-hero__badge">Founder</span>
          <h1 className="sp-hero__h1">Justin Duru</h1>
          <p className="sp-hero__sub">Founder &amp; Lead Security Consultant, PurveX</p>
          <div className="sp-founder-page__links">
            <a
              href="https://linkedin.com/in/jduru"
              target="_blank"
              rel="noreferrer"
              className="sp-btn sp-btn--ghost sp-btn--sm"
            >
              <Linkedin size={16} /> LinkedIn
            </a>
          </div>
        </div>
        <div className="sp-hero__preview">
          <Image
            src="/Justin.jpg"
            alt="Justin Duru"
            width={280}
            height={280}
            className="sp-founder-page__photo"
          />
        </div>
      </section>

      <section className="sp-section sp-section--tight">
        <div className="sp-founder-page__grid" data-r>
          <div className="sp-founder-page__bio">
            <p className="sp-founder-page__quote">I lead by serving the work, not standing above it.</p>
            {bioSections.map((s) => (
              <div key={s.label} className="sp-founder-page__section">
                <span className="sp-founder-page__section-label">{s.label}</span>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <aside className="sp-founder-page__facts">
            <h3>At a Glance</h3>
            {quickFacts.map((f) => (
              <div key={f.label} className="sp-founder-page__fact">
                <span>{f.label}</span>
                <strong>{f.value}</strong>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <style>{`
.sp-hero.sp-hero--split { text-align: left; max-width: 1140px; display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center }
.sp-hero--split .sp-hero__badge { margin-bottom: 22px }
.sp-hero--split .sp-hero__h1 { text-align: left }
.sp-hero--split .sp-hero__sub { margin: 22px 0 0; max-width: 480px; text-align: left }
.sp-hero__preview { display: flex; justify-content: center }
@media (max-width: 940px) {
  .sp-hero.sp-hero--split { grid-template-columns: 1fr; text-align: center; gap: 40px }
  .sp-hero--split .sp-hero__h1, .sp-hero--split .sp-hero__badge { text-align: center }
  .sp-hero--split .sp-hero__sub { margin-left: auto; margin-right: auto; text-align: center }
  .sp-founder-page__chips, .sp-founder-page__links { justify-content: center }
}

.sp-founder-page__links { display: flex; gap: 12px; margin-top: 26px }
.sp-founder-page__photo { width: 280px; height: 280px; border-radius: 50%; object-fit: cover; object-position: center 12%; box-shadow: 0 24px 48px -16px rgba(85,70,224,.4) }

/* ── Bio + facts sidebar: the old version was one undifferentiated
   680px column of prose. Labeled sections give it scannable structure;
   the facts card pulls the credentials out of the paragraphs entirely
   so the prose can stay about the story, not the resume line items. ── */
.sp-founder-page__grid { display: grid; grid-template-columns: 1fr 260px; gap: 56px; align-items: start; max-width: 940px; margin: 0 auto }
.sp-founder-page__bio .sp-founder-page__quote {
  margin: 0 0 32px; padding-left: 20px; border-left: 3px solid var(--accent);
  font-family: var(--font-display); font-size: clamp(1.2rem, 2.4vw, 1.5rem); font-weight: 650;
  letter-spacing: -.015em; line-height: 1.4; color: var(--ink);
}
.sp-founder-page__section { margin-top: 28px; padding-top: 28px; border-top: 1px solid var(--border) }
.sp-founder-page__section:first-of-type { margin-top: 0; padding-top: 0; border-top: none }
.sp-founder-page__section-label {
  display: block; margin-bottom: 10px; font-size: .74rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep);
}
.sp-founder-page__section p { margin: 0; font-size: 1.03rem; line-height: 1.75; color: var(--ink-soft); text-wrap: pretty }

.sp-founder-page__facts { position: sticky; top: 100px; border: 1px solid var(--border); border-top: 2px solid var(--accent-deep); border-radius: 0; padding: 24px; background: var(--surface) }
.sp-founder-page__facts h3 { margin: 0 0 18px; font-size: .74rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted-dim) }
.sp-founder-page__fact { padding: 13px 0; border-top: 1px solid var(--border) }
.sp-founder-page__fact:first-of-type { padding-top: 0; border-top: none }
.sp-founder-page__fact span { display: block; font-size: .72rem; color: var(--muted); margin-bottom: 3px }
.sp-founder-page__fact strong { display: block; font-size: .88rem; font-weight: 620; color: var(--ink); line-height: 1.4 }

@media (max-width: 780px) {
  .sp-founder-page__grid { grid-template-columns: 1fr; gap: 32px }
  .sp-founder-page__facts { position: static }
}
@media (max-width: 640px) {
  .sp-founder-page__photo { width: 200px; height: 200px }
  .sp-founder-page__links { flex-wrap: wrap }
}
      `}</style>
    </SiteChrome>
  );
}
