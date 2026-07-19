"use client";

import { ArrowRight, Linkedin } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

export default function ContactPage() {
  return (
    <SiteChrome active="contact">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <h1 className="sp-hero__h1">Let&apos;s Work Together</h1>
        <p className="sp-hero__sub">
          Whether you need help strengthening your security operations or you&apos;re looking for
          a hands-on training partner, the fastest way to find out if we&apos;re a fit is a short
          conversation.
        </p>
        <div className="sp-hero__actions">
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
          <a
            href="https://www.linkedin.com/company/purvex/?viewAsMember=true"
            target="_blank"
            rel="noreferrer"
            className="sp-btn sp-btn--ghost sp-btn--lg"
          >
            <Linkedin size={16} /> Connect on LinkedIn
          </a>
        </div>
      </section>
    </SiteChrome>
  );
}
