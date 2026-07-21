"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  MessageCircle,
  Quote,
  Radar,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const problems = [
  {
    icon: ShieldCheck,
    title: "Alerts without answers",
    body: "Your tools are running, but nobody can say with confidence they would catch a real attack.",
  },
  {
    icon: Users,
    title: "Training that stops at theory",
    body: "Programs teach the concepts. Employers need analysts who can already do the job.",
  },
  {
    icon: Radar,
    title: "Coverage nobody has tested",
    body: "Detections exist on paper. Nobody has actually watched them fire.",
  },
];

const slides = [
  {
    key: "security-operations",
    icon: ShieldCheck,
    tag: "For organizations",
    title: "Security Operations",
    body: "We help organizations improve their security operations through SIEM optimization, detection engineering, security assessments, and detection validation.",
    bullets: ["SIEM & detection engineering", "SIEM optimization", "Security operations assessments", "Detection validation"],
    cta: "Explore",
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
    cta: "Explore",
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
    cta: "Explore",
    href: "/platform",
    external: false,
  },
];

// TODO: replace placeholder quotes once received. Drop a headshot in
// /public and set `photo` (e.g. "/kenneth-ellington.jpg"), or set
// `logo` to a company logo path — either renders in place of the
// initial. `role` should be "Founder, Company" once confirmed.
// `services` lists which PurveX offering(s) they used, shown as tags.
const testimonials = [
  {
    quote: "Add Kenneth's quote here once received.",
    name: "Kenneth Ellington",
    role: "Cyber Security Coach + Instructor, Ellington Cyber Academy",
    linkedin: "https://www.linkedin.com/in/kenneth-ellington/",
    photo: "/kenneth.jpg",
    logo: "",
    services: ["Cybersecurity Training"],
  },
  {
    quote: "Add Symone's quote here once received.",
    name: "Symone",
    role: "Founder, GovTech Academy",
    linkedin: "https://www.linkedin.com/in/symonedb/",
    photo: "/symone.jpg",
    logo: "",
    services: ["Cybersecurity Training"],
  },
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
        <p className="sp-hero__strip">With great visibility comes great responsibility.</p>
      </section>

      {/* ═══════════ PROBLEMS WE SOLVE ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">Sound familiar?</span>
          <h2>The problems we solve.</h2>
        </div>
        <div className="sp-cards sp-cards--3" data-r>
          {problems.map((p) => (
            <article key={p.title} className="sp-card">
              <div className="sp-card__icon">
                <p.icon size={20} />
              </div>
              <h3 className="sp-card__title">{p.title}</h3>
              <p className="sp-card__body">{p.body}</p>
            </article>
          ))}
        </div>
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
            <div className="sp-carousel__progress">
              <div key={carousel.index} className="sp-carousel__progress-fill" />
            </div>
          </div>
          <button className="sp-carousel__arrow sp-carousel__arrow--next" onClick={carousel.next} aria-label="Next">
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ═══════════ TESTIMONIAL ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">What people say</span>
          <h2>Feedback from the field.</h2>
        </div>
        <div className="sp-testimonials" data-r>
          {testimonials.map((t) => (
            <div key={t.name} className="sp-testimonial">
              <div className="sp-testimonial__stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} />
                ))}
              </div>
              <Quote size={32} className="sp-testimonial__mark" />
              <p className="sp-testimonial__quote">{t.quote}</p>
              {t.services.length > 0 && (
                <div className="sp-testimonial__services">
                  {t.services.map((s) => (
                    <span key={s} className="sp-tagchip">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <a href={t.linkedin} target="_blank" rel="noreferrer" className="sp-testimonial__author">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo} alt={t.name} className="sp-testimonial__photo" />
                ) : t.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.logo} alt="" className="sp-testimonial__logo" />
                ) : (
                  <span className="sp-testimonial__avatar">{t.name.charAt(0)}</span>
                )}
                <span>
                  <strong>{t.name}</strong>
                  {t.role && <em>{t.role}</em>}
                </span>
                <Linkedin size={15} className="sp-testimonial__linkedin" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <div className="sp-cta__icon">
            <MessageCircle size={22} />
          </div>
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
.sp-carousel__viewport { position: relative; flex: 1; overflow: hidden; border-radius: calc(var(--radius) + 8px); border: 1px solid var(--border); box-shadow: 0 24px 60px -40px rgba(16,25,46,.3) }
.sp-carousel__track { display: flex; transition: transform .5s var(--ease) }
.sp-carousel__progress { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(16,25,46,.08); z-index: 2 }
.sp-carousel__progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-deep)); animation: sp-carousel-fill 6s linear forwards }
.sp-carousel:hover .sp-carousel__progress-fill { animation-play-state: paused }
@keyframes sp-carousel-fill { from { width: 0% } to { width: 100% } }
@media (prefers-reduced-motion: reduce) { .sp-carousel__progress { display: none } }
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

/* ── Testimonials ── */
.sp-testimonials { max-width: 1040px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch }
.sp-testimonial {
  --cut: 26px;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 40px 40px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: radial-gradient(130% 140% at 0% 0%, rgba(106,92,255,.06), transparent 55%), var(--surface);
  filter: drop-shadow(0 24px 48px rgba(16,25,46,.12));
  transition: transform .3s var(--ease);
}
.sp-testimonial:hover { transform: translateY(-3px) }
.sp-testimonial__stars { display: flex; gap: 3px; color: #f4b740; margin-bottom: 16px }
.sp-testimonial__stars svg { fill: currentColor }
.sp-testimonial__mark { color: var(--accent); opacity: .35 }
.sp-testimonial__quote { margin: 18px 0 0; font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; line-height: 1.5; letter-spacing: -.015em; color: var(--ink) }
.sp-testimonial__services { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; margin-bottom: 24px }
.sp-tagchip { font-size: .74rem; font-weight: 550; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); border-radius: 999px; padding: 5px 11px }
.sp-testimonial__author { display: flex; align-items: center; gap: 14px; margin-top: auto; padding-top: 26px; border-top: 1px solid var(--border); text-decoration: none; color: inherit }
.sp-testimonial__avatar { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-deep)); color: #fff; font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; flex-shrink: 0; box-shadow: 0 8px 18px -8px rgba(85,70,224,.5) }
.sp-testimonial__photo { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; flex-shrink: 0; box-shadow: 0 8px 18px -8px rgba(16,25,46,.3) }
.sp-testimonial__logo { width: 46px; height: 46px; border-radius: 10px; object-fit: contain; padding: 6px; background: var(--surface-alt); border: 1px solid var(--border); flex-shrink: 0 }
.sp-testimonial__author strong { display: block; font-size: .96rem; font-weight: 650; color: var(--ink) }
.sp-testimonial__author em { display: block; margin-top: 2px; font-style: normal; font-size: .84rem; color: var(--muted) }
.sp-testimonial__linkedin { margin-left: auto; color: var(--muted-dim); transition: color .2s }
.sp-testimonial__author:hover .sp-testimonial__linkedin { color: var(--accent-deep) }

@media (max-width: 860px) { .sp-testimonials { grid-template-columns: 1fr } }
@media (max-width: 680px) { .sp-testimonial { padding: 36px 30px } }

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
