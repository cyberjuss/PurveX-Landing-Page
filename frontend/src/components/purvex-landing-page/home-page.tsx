"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  MessageSquare,
  Radar,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const slides = [
  {
    key: "security-operations",
    icon: ShieldCheck,
    tag: "For organizations",
    title: "Security Operations",
    body: "We help organizations improve their security operations through SIEM optimization, detection engineering, security assessments, and detection validation.",
    bullets: ["SIEM & detection engineering", "SIEM optimization", "Security operations assessments", "Detection validation"],
    cta: "Explore Security Operations",
    href: "/security-operations",
    external: false,
  },
  {
    key: "training",
    icon: Users,
    tag: "For academies & programs",
    title: "Cybersecurity Training",
    body: "We partner with academies and workforce development programs to deliver hands-on cybersecurity instruction built around real-world security operations.",
    bullets: ["Cybersecurity instruction", "Hands-on security labs", "Curriculum support", "Instructor partnerships"],
    cta: "Explore Cybersecurity Training",
    href: "/cybersecurity-training",
    external: false,
  },
  {
    key: "labs",
    icon: Radar,
    tag: "In development",
    title: "PurveX Labs",
    body: "We are building technology that helps security teams move beyond assumed coverage toward measurable, continuous evidence that their detections work.",
    bullets: ["Continuous detection validation", "Measurable coverage over time", "Private beta, in development"],
    cta: "See what we are building",
    href: "/platform",
    external: true,
  },
];

const differentiators = [
  {
    icon: MessageSquare,
    title: "Real feedback, not a form letter",
    body: "We look at your actual environment or work and show you what is strong and where to tighten up.",
  },
  {
    icon: Users,
    title: "Direct access, no sales layer",
    body: "You work with the person doing the security work or teaching, not an account manager.",
  },
  {
    icon: Compass,
    title: "Judgment, not just checklists",
    body: "Knowing what to prioritize when everything looks urgent comes from real experience, not a script.",
  },
];

const tools = ["Microsoft Sentinel", "Splunk", "KQL / SPL", "Security+", "CySA+"];

const faqs: [string, string][] = [
  ["Who is PurveX for?", "Two groups: organizations that need help strengthening their security operations, and academies or workforce programs that need hands-on cybersecurity instruction."],
  ["Is this a 24/7 outsourced SOC?", "No. We are not a monitoring service. Engagements are project-based: assessments, detection engineering, SIEM optimization, and detection validation."],
  ["How is training delivered?", "Remotely: live sessions, self-paced labs, or a mix. 1:1 or small-group, scoped to your program."],
  ["Do you replace our curriculum, or work alongside it?", "Whatever fits. We can instruct inside your existing program, or supply labs and materials to back up what you already teach."],
  ["Who will we actually work with?", "You will deal directly with the person doing the security work and teaching, not a sales team."],
  ["What does it cost?", "It depends on scope and format, so we would rather talk it through and find something that works."],
];

function useCarousel(count: number) {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % count);
    }, 6000);
    return () => clearInterval(id);
  }, [count]);

  return {
    index,
    goTo: (i: number) => setIndex(i),
    next: () => setIndex((i) => (i + 1) % count),
    prev: () => setIndex((i) => (i - 1 + count) % count),
    pause: () => (paused.current = true),
    resume: () => (paused.current = false),
  };
}

export default function HomePage() {
  const carousel = useCarousel(slides.length);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 40) carousel.prev();
    else if (dx < -40) carousel.next();
    touchStartX.current = null;
  };

  return (
    <SiteChrome active="home">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <h1 className="sp-hero__h1">Building Stronger Security Operations.</h1>
        <p className="sp-hero__sub">
          PurveX helps organizations strengthen their security capabilities through security
          operations consulting and hands-on cybersecurity training.
        </p>
        <div className="sp-hero__actions">
          <a href="#how-we-help" className="sp-btn sp-btn--prim sp-btn--lg">
            Explore Our Services <ArrowRight size={16} />
          </a>
        </div>
        <p className="sp-hero__strip">Security Operations • Detection Engineering • Cybersecurity Training</p>
      </section>

      {/* ═══════════ HOW WE HELP — CAROUSEL ═══════════ */}
      <section className="sp-section" id="how-we-help">
        <div className="sp-head" data-r>
          <span className="sp-tag">How PurveX helps</span>
          <h2>Three ways we strengthen your security posture.</h2>
        </div>

        <div
          className="sp-carousel"
          data-r
          onMouseEnter={carousel.pause}
          onMouseLeave={carousel.resume}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button className="sp-carousel__arrow sp-carousel__arrow--prev" onClick={carousel.prev} aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <div className="sp-carousel__viewport">
            <div className="sp-carousel__track" style={{ transform: `translateX(-${carousel.index * 100}%)` }}>
              {slides.map((s) => (
                <div className="sp-carousel__slide" key={s.key}>
                  <div className="sp-carousel__panel">
                    <s.icon size={26} />
                  </div>
                  <div className="sp-carousel__content">
                    <span className="sp-tag">{s.tag}</span>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                    <ul className="sp-carousel__list">
                      {s.bullets.map((b) => (
                        <li key={b}>
                          <Check size={14} /> {b}
                        </li>
                      ))}
                    </ul>
                    {s.external ? (
                      <a href={s.href} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--sm">
                        {s.cta} <ArrowRight size={15} />
                      </a>
                    ) : (
                      <Link href={s.href} className="sp-btn sp-btn--prim sp-btn--sm">
                        {s.cta} <ArrowRight size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="sp-carousel__arrow sp-carousel__arrow--next" onClick={carousel.next} aria-label="Next">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="sp-carousel__dots">
          {slides.map((s, i) => (
            <button
              key={s.key}
              className={i === carousel.index ? "sp-carousel__dot sp-carousel__dot--active" : "sp-carousel__dot"}
              onClick={() => carousel.goTo(i)}
              aria-label={`Go to ${s.title}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════ WHO WE ARE ═══════════ */}
      <section className="sp-section">
        <div className="sp-panel" data-r>
          <span className="sp-tag">Who we are</span>
          <h2>You work directly with the practitioner.</h2>
          <p>
            The person doing your security operations work is the same one teaching in the
            field. You get real experience, not a script.
          </p>
          <p>No sales layer. The best way to see if we are a fit is a quick conversation.</p>
        </div>
      </section>

      {/* ═══════════ WHAT SETS IT APART ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">What sets it apart</span>
          <h2>Results come from people, not just process.</h2>
        </div>
        <div className="sp-cards sp-cards--3" data-r>
          {differentiators.map((d) => (
            <article key={d.title} className="sp-card">
              <div className="sp-card__icon">
                <d.icon size={20} />
              </div>
              <h3 className="sp-card__title">{d.title}</h3>
              <p className="sp-card__body">{d.body}</p>
            </article>
          ))}
        </div>
        <div className="sp-tools" data-r>
          <span className="sp-tools__label">Tools &amp; certs</span>
          <div className="sp-tools__chips">
            {tools.map((t) => (
              <span key={t} className="sp-tagchip">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="sp-section" id="faq">
        <div className="sp-head" data-r>
          <span className="sp-tag">FAQ</span>
          <h2>Common questions.</h2>
        </div>
        <div className="sp-faq" data-r>
          {faqs.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={q} className={`sp-faq__item${open ? " sp-faq__item--open" : ""}`}>
                <button className="sp-faq__btn" onClick={() => setOpenFaq(open ? null : i)}>
                  <span>{q}</span>
                  <ChevronDown size={16} className={`sp-faq__chev${open ? " sp-faq__chev--open" : ""}`} />
                </button>
                <div className={`sp-faq__body${open ? " sp-faq__body--open" : ""}`}>
                  <p>{a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <span className="sp-tag">Not sure where to start?</span>
          <h2>Tell us what your organization needs.</h2>
          <p>A short conversation is the fastest way to find out where PurveX can help.</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
/* ── Carousel ── */
.sp-carousel { position: relative; display: flex; align-items: center; gap: 14px }
.sp-carousel__viewport { flex: 1; overflow: hidden; border-radius: calc(var(--radius) + 8px); border: 1px solid var(--border); box-shadow: 0 24px 60px -40px rgba(16,25,46,.3) }
.sp-carousel__track { display: flex; transition: transform .5s var(--ease) }
.sp-carousel__slide { flex: 0 0 100%; display: grid; grid-template-columns: 1fr 1.4fr; min-height: 380px; background: var(--surface) }
.sp-carousel__panel { display: flex; align-items: center; justify-content: center; background: linear-gradient(150deg, var(--accent), var(--accent-deep)); color: #fff; position: relative; overflow: hidden }
.sp-carousel__panel svg { width: 72px; height: 72px; opacity: .92 }
.sp-carousel__panel::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.18), transparent 55%) }
.sp-carousel__content { padding: 44px 48px; display: flex; flex-direction: column; justify-content: center }
.sp-carousel__content h3 { margin: 12px 0 0; font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-carousel__content p { margin: 12px 0 0; color: var(--muted); font-size: .96rem; line-height: 1.65; max-width: 480px }
.sp-carousel__list { list-style: none; margin: 18px 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px }
.sp-carousel__list li { display: flex; align-items: center; gap: 7px; font-size: .84rem; color: var(--ink-soft); font-weight: 500 }
.sp-carousel__list li svg { color: var(--accent-deep); flex-shrink: 0 }
.sp-carousel__content .sp-btn { margin-top: 22px; align-self: flex-start }
.sp-carousel__arrow { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--border-strong); background: var(--surface); color: var(--ink); cursor: pointer; transition: transform .2s var(--ease), border-color .2s, color .2s }
.sp-carousel__arrow:hover { border-color: var(--accent); color: var(--accent-deep); transform: scale(1.06) }
.sp-carousel__dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px }
.sp-carousel__dot { width: 8px; height: 8px; border-radius: 50%; border: 0; background: var(--border-strong); cursor: pointer; padding: 0; transition: background .2s, width .2s }
.sp-carousel__dot--active { background: var(--accent-deep); width: 22px; border-radius: 5px }

/* ── Tools strip ── */
.sp-tools { display: flex; align-items: center; gap: 12px 18px; flex-wrap: wrap; margin-top: 24px; padding: 18px 24px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface-alt) }
.sp-tools__label { font-family: var(--font-mono); font-size: .7rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-dim) }
.sp-tools__chips { display: flex; flex-wrap: wrap; gap: 8px; flex: 1 }
.sp-tagchip { font-size: .74rem; font-weight: 550; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); border-radius: 999px; padding: 5px 11px }

/* ── FAQ ── */
.sp-faq { max-width: 720px; margin: 0 auto; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); overflow: hidden; box-shadow: 0 18px 44px -40px rgba(16,25,46,.28) }
.sp-faq__item + .sp-faq__item { border-top: 1px solid var(--border) }
.sp-faq__item--open { background: var(--accent-soft) }
.sp-faq__btn { display: flex; align-items: center; width: 100%; justify-content: space-between; gap: 16px; padding: 20px 24px; background: none; border: 0; color: var(--ink); font-size: .94rem; font-weight: 600; text-align: left; cursor: pointer; transition: color .2s }
.sp-faq__btn:hover { color: var(--accent-deep) }
.sp-faq__chev { flex-shrink: 0; color: var(--muted-dim); transition: transform .35s var(--ease) }
.sp-faq__chev--open { transform: rotate(180deg); color: var(--accent-deep) }
.sp-faq__body { max-height: 0; overflow: hidden; opacity: 0; transition: max-height .4s var(--ease), opacity .3s }
.sp-faq__body--open { max-height: 240px; opacity: 1 }
.sp-faq__body p { padding: 0 24px 20px; margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.7 }

@media (max-width: 940px) {
  .sp-carousel__slide { grid-template-columns: 1fr }
  .sp-carousel__panel { padding: 32px; min-height: 120px }
  .sp-carousel__panel svg { width: 48px; height: 48px }
  .sp-carousel__content { padding: 32px }
  .sp-carousel__list { grid-template-columns: 1fr }
}
@media (max-width: 680px) {
  .sp-carousel__arrow { display: none }
  .sp-carousel__content { padding: 26px }
}
      `}</style>
    </SiteChrome>
  );
}
