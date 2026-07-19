"use client";

import { SiteChrome } from "./chrome";

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <h1 className="sp-hero__h1">About PurveX</h1>
        <p className="sp-hero__sub">
          PurveX helps organizations strengthen their security operations and develop the
          cybersecurity talent needed to support them.
        </p>
      </section>

      {/* ═══════════ WHO WE ARE ═══════════ */}
      <section id="who-we-are" className="sp-section">
        <div className="sp-panel" data-r>
          <span className="sp-tag">Who we are</span>
          <h2>You work directly with the practitioner.</h2>
          <p>
            The person doing your security operations work is the same one teaching in the
            field. You get real experience, not a script.
          </p>
          <p>No sales layer. The best way to see if we&apos;re a fit is a quick conversation.</p>
        </div>
      </section>

      {/* ═══════════ BUILDING WHAT'S NEXT ═══════════ */}
      <section id="purvex-labs" className="sp-section">
        <div className="sp-panel" data-r>
          <span className="sp-tag">Building what&apos;s next</span>
          <h2>PurveX Labs</h2>
          <p>
            PurveX is exploring new ways to help security teams continuously measure and validate
            their detection capabilities.
          </p>
          <p>
            Our long-term vision is to develop technology that helps organizations move beyond
            assumed security coverage toward measurable evidence that their detections work when
            they are needed.
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
