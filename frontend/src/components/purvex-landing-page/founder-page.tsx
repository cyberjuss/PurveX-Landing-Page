"use client";

import Image from "next/image";
import { ArrowRight, Download, Linkedin } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

export default function FounderPage() {
  return (
    <SiteChrome active="about">
      <section className="sp-hero sp-hero--split">
        <div className="sp-hero__copy">
          <span className="sp-hero__badge">Founder</span>
          <h1 className="sp-hero__h1">Justin Duru</h1>
          <p className="sp-hero__sub">Founder &amp; Lead Security Consultant, PurveX</p>
          <div className="sp-founder-page__chips">
            <span className="sp-founder-page__chip">SOC Analyst → Instructor</span>
            <span className="sp-founder-page__chip">Sentinel &amp; SOAR</span>
            <span className="sp-founder-page__chip">CySA+ · Security+</span>
          </div>
          <div className="sp-founder-page__links">
            <a
              href="https://linkedin.com/in/jduru"
              target="_blank"
              rel="noreferrer"
              className="sp-btn sp-btn--ghost sp-btn--sm"
            >
              <Linkedin size={16} /> LinkedIn
            </a>
            <a href="/Justin_Duru_Resume.pdf" target="_blank" rel="noreferrer" className="sp-btn sp-btn--ghost sp-btn--sm">
              <Download size={16} /> Resume
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
        <div className="sp-founder-page__bio" data-r>
          <p className="sp-story__pull">I lead by serving the work, not standing above it.</p>
          <p>
            Before this was a company, it was time spent tuning Microsoft Sentinel detections for
            a federal agency, automating response workflows in Splunk SOAR, and teaching SOC
            fundamentals to analysts at Ellington Cyber Academy. All of that taught me the same
            lesson from different angles: real growth comes from hands-on repetition, not from
            watching someone else do the work.
          </p>
          <p>
            Hands-on alone is not enough, though. In an age where AI can write the query and
            summarize the alert for you, the skill that actually matters is knowing how to think:
            how to interpret what a system is telling you, when to trust it, and when to push
            back. That is what I try to teach, not shortcuts to capture a flag, but the judgment
            to actually solve the problem.
          </p>
          <p>
            That belief is also why PurveX exists. I kept running into the same gap: smaller
            security teams know they need stronger coverage, but do not have the headcount to
            build and maintain it by hand. I believe AI agents, paired with someone who still
            understands what is happening underneath them, can close that gap without requiring
            every team to be enterprise-sized to be secure.
          </p>
        </div>
      </section>

      <section className="sp-section">
        <div className="sp-cta" data-r>
          <h2>The best way to see if we are a fit is a real conversation, not a pitch.</h2>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Talk to us <ArrowRight size={16} />
          </a>
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

.sp-founder-page__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px }
.sp-founder-page__chip { font-size: .74rem; font-weight: 600; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.25); border-radius: 999px; padding: 5px 12px }
.sp-founder-page__links { display: flex; gap: 12px; margin-top: 26px }
.sp-founder-page__photo { width: 280px; height: 280px; border-radius: 50%; object-fit: cover; object-position: center 12%; box-shadow: 0 24px 48px -16px rgba(85,70,224,.4) }
.sp-founder-page__bio { max-width: 680px; margin: 0 auto }
.sp-founder-page__bio p { margin: 20px 0 0; font-size: 1.05rem; line-height: 1.78; color: var(--ink-soft) }
.sp-founder-page__bio .sp-story__pull { margin: 0; max-width: none }
@media (max-width: 640px) {
  .sp-founder-page__photo { width: 200px; height: 200px }
  .sp-founder-page__links { flex-wrap: wrap }
}
      `}</style>
    </SiteChrome>
  );
}
