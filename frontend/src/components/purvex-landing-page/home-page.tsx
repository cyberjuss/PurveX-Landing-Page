import Link from "next/link";
import {
  ArrowRight,
  Check,
  Linkedin,
  MessageCircle,
  Quote,
  Radar,
  ShieldCheck,
  Star,
  Terminal,
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

const offers = [
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

// Drop a headshot in /public and set `photo` (e.g. "/kenneth-ellington.jpg"), or set
// `logo` to a company logo path — either renders in place of the
// initial. `role` should be "Founder, Company" once confirmed.
// `services` lists which PurveX offering(s) they used, shown as tags.
const testimonials = [
  {
    quote:
      "Hands down one of the best services. Our students now work in tech, running their own SOC projects thanks to real hands-on experience.",
    name: "Kenneth Ellington",
    role: "Cyber Security Coach + Instructor, Ellington Cyber Academy",
    linkedin: "https://www.linkedin.com/in/kenneth-ellington/",
    photo: "/kenneth.jpg",
    logo: "",
    services: ["Cybersecurity Training"],
  },
  // Symone: pulled for now, ask for a quote once she's ~6 months in.
];

export default function HomePage() {
  return (
    <SiteChrome active="home">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <div className="sp-hero__deco sp-hero__deco--left" aria-hidden="true">
          <div className="sp-deco-float">
            <div className="sp-deco-card sp-deco-card--term">
              <div className="sp-deco-card__dots"><span /><span /><span /></div>
              <p className="sp-deco-card__line">
                <span className="sp-deco-card__prompt">$</span> purvex run T1059.001
              </p>
              <p className="sp-deco-card__line sp-deco-card__line--dim">atomic-red-team · PowerShell</p>
              <p className="sp-deco-card__line sp-deco-card__line--ok">
                <Terminal size={12} /> detection fired · 212ms
              </p>
            </div>
          </div>
        </div>
        <div className="sp-hero__deco sp-hero__deco--right" aria-hidden="true">
          <div className="sp-deco-float sp-deco-float--alt">
            <div className="sp-deco-card sp-deco-card--stat">
              <div className="sp-deco-card__top">
                <span className="sp-deco-card__pulse" />
                <span className="sp-deco-card__eyebrow">Live validation</span>
              </div>
              <p className="sp-deco-card__figure">98.4%</p>
              <p className="sp-deco-card__caption">detections confirmed this run</p>
            </div>
          </div>
        </div>

        <h1 className="sp-hero__h1">Building Stronger Security Operations.</h1>
        <p className="sp-hero__sub">
          PurveX helps organizations strengthen their security capabilities through security
          operations consulting and hands-on cybersecurity training.
        </p>
        <p className="sp-hero__strip">With great visibility comes great responsibility.</p>
        <div className="sp-hero__actions">
          <a href="#how-we-help" className="sp-btn sp-btn--prim sp-btn--lg">
            Explore Our Services <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ═══════════ PROBLEMS WE SOLVE ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">Sound familiar?</span>
          <h2>The problems we solve.</h2>
        </div>
        <div className="sp-problems" data-r>
          {problems.map((p) => (
            <article key={p.title} className="sp-problem">
              <div className="sp-problem__icon">
                <p.icon size={19} />
              </div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ HOW WE HELP ═══════════ */}
      <section className="sp-section" id="how-we-help">
        <div className="sp-head" data-r>
          <span className="sp-tag">How PurveX helps</span>
          <h2>Three ways we strengthen your security posture.</h2>
        </div>

        <div className="sp-offers" data-r>
          {offers.map((o) => (
            <article className="sp-offer" key={o.key}>
              <div className="sp-offer__panel">
                <o.icon size={30} />
              </div>
              <div className="sp-offer__body">
                <span className="sp-tag">{o.tag}</span>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
                <ul className="sp-offer__list">
                  {o.bullets.map((b) => (
                    <li key={b}>
                      <Check size={14} /> {b}
                    </li>
                  ))}
                </ul>
                {o.external ? (
                  <a href={o.href} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--sm">
                    {o.cta} <ArrowRight size={15} />
                  </a>
                ) : (
                  <Link href={o.href} className="sp-btn sp-btn--prim sp-btn--sm">
                    {o.cta} <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ TESTIMONIAL ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">What people say</span>
          <h2>Feedback from the field.</h2>
        </div>
        <div className="sp-feature-quotes">
          {testimonials.map((t) => (
            <div key={t.name} className="sp-feature-quote" data-r>
              <div className="sp-feature-quote__person">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo} alt={t.name} className="sp-feature-quote__photo" />
                ) : t.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.logo} alt="" className="sp-feature-quote__photo" />
                ) : (
                  <span className="sp-feature-quote__avatar">{t.name.charAt(0)}</span>
                )}
                <strong className="sp-feature-quote__name">{t.name}</strong>
                {t.role && <span className="sp-feature-quote__role">{t.role}</span>}
                <span className="sp-feature-quote__stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} />
                  ))}
                </span>
                <a href={t.linkedin} target="_blank" rel="noreferrer" className="sp-feature-quote__linkedin">
                  <Linkedin size={13} /> LinkedIn
                </a>
              </div>
              <div className="sp-feature-quote__body">
                <Quote size={30} className="sp-feature-quote__mark" />
                <p className="sp-feature-quote__text">{t.quote}</p>
                {t.services.length > 0 && (
                  <div className="sp-feature-quote__tags">
                    {t.services.map((s) => (
                      <span key={s} className="sp-tagchip">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
          <h2>Tell us what your organization needs.</h2>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
.sp-hero .sp-hero__strip { margin: 18px 0 0 }

/* ── Hero deco cards (desktop only -- there's no room to bleed past the
   hero column below ~1300px without overlapping the headline) ── */
.sp-hero__deco { position: absolute; top: 0; z-index: 2; pointer-events: none; display: none }
@media (min-width: 1300px) {
  .sp-hero__deco { display: block; opacity: 0; animation: sp-deco-in .8s var(--ease) both }
  .sp-hero__deco--left { left: -206px; top: 66px; animation-name: sp-deco-in-left; animation-delay: .35s }
  .sp-hero__deco--right { right: -206px; top: 188px; animation-name: sp-deco-in-right; animation-delay: .55s }
}
@keyframes sp-deco-in-left { from { opacity: 0; transform: translateY(16px) rotate(-2deg) scale(.94) } to { opacity: 1; transform: translateY(0) rotate(-7deg) scale(1) } }
@keyframes sp-deco-in-right { from { opacity: 0; transform: translateY(16px) rotate(2deg) scale(.94) } to { opacity: 1; transform: translateY(0) rotate(6deg) scale(1) } }
.sp-deco-float { animation: sp-deco-float 6.5s ease-in-out infinite }
.sp-deco-float--alt { animation-duration: 7.5s; animation-delay: -3s }
@keyframes sp-deco-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }

.sp-deco-card {
  width: 218px; border-radius: 14px; padding: 14px 15px;
  background: var(--surface); border: 1px solid var(--border-strong);
  box-shadow: 0 24px 48px -22px rgba(16,25,46,.28);
}
.sp-deco-card__dots { display: flex; gap: 5px; margin-bottom: 10px }
.sp-deco-card__dots span { width: 7px; height: 7px; border-radius: 50%; background: var(--border-strong) }
.sp-deco-card__dots span:nth-child(1) { background: #e5484d; opacity: .55 }
.sp-deco-card__dots span:nth-child(2) { background: #f4b740; opacity: .55 }
.sp-deco-card__dots span:nth-child(3) { background: var(--green); opacity: .55 }
.sp-deco-card__line { margin: 0; font-family: var(--font-mono); font-size: .72rem; line-height: 1.7; color: var(--ink-soft); white-space: nowrap; text-align: left }
.sp-deco-card__prompt { color: var(--accent-deep); font-weight: 700; margin-right: 2px }
.sp-deco-card__line--dim { color: var(--muted-dim); padding-left: 14px }
.sp-deco-card__line--ok { display: flex; align-items: center; gap: 5px; color: var(--green); font-weight: 600; margin-top: 2px }
.sp-deco-card__top { display: flex; align-items: center; gap: 7px }
.sp-deco-card__pulse { position: relative; width: 7px; height: 7px; border-radius: 50%; background: var(--green) }
.sp-deco-card__pulse::after { content: ""; position: absolute; inset: -5px; border-radius: 50%; border: 1.5px solid var(--green); opacity: .55; animation: sp-pulse-ring 2s ease-out infinite }
@keyframes sp-pulse-ring { from { transform: scale(.5); opacity: .6 } to { transform: scale(1.6); opacity: 0 } }
.sp-deco-card__eyebrow { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted) }
.sp-deco-card__figure { margin: 12px 0 0; text-align: left; font-family: var(--font-display); font-size: 1.9rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-deco-card__caption { margin: 2px 0 0; text-align: left; font-size: .76rem; color: var(--muted) }
@media (prefers-reduced-motion: reduce) {
  .sp-hero__deco { animation: none; opacity: 1; transform: none }
  .sp-hero__deco--left { transform: rotate(-7deg) }
  .sp-hero__deco--right { transform: rotate(6deg) }
  .sp-deco-float { animation: none }
  .sp-deco-card__pulse::after { animation: none; display: none }
}

/* ── Problems strip ── */
.sp-problems { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.sp-problem { padding: 36px 32px; position: relative }
.sp-problem:not(:first-child) { border-left: 1px solid var(--border) }
.sp-problem__icon { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep) }
.sp-problem h3 { margin: 18px 0 0; font-family: var(--font-display); font-size: 1.04rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-problem p { margin: 10px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.65 }
.sp-problems[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-problems[data-r] > * { opacity: 0; transform: translateY(20px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-problems[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-problems[data-r] > *:nth-child(1) { transition-delay: .03s }
.sp-problems[data-r] > *:nth-child(2) { transition-delay: .1s }
.sp-problems[data-r] > *:nth-child(3) { transition-delay: .17s }
@media (max-width: 680px) {
  .sp-problems { grid-template-columns: 1fr }
  .sp-problem:not(:first-child) { border-left: none; border-top: 1px solid var(--border) }
}

/* ── Offers (static, replaces the old auto-rotating carousel) ── */
.sp-offers { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.sp-offer { display: flex; flex-direction: column; padding: 32px }
.sp-offer:not(:first-child) { border-left: 1px solid var(--border) }
.sp-offer__panel {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep);
}
.sp-offer__body { padding: 0; margin-top: 20px; display: flex; flex-direction: column; flex: 1 }
.sp-offer__body h3 { margin: 8px 0 0; font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; letter-spacing: -.015em; color: var(--ink) }
.sp-offer__body p { margin: 10px 0 0; color: var(--muted); font-size: .88rem; line-height: 1.6 }
.sp-offer__list { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 7px }
.sp-offer__list li { display: flex; align-items: center; gap: 7px; font-size: .82rem; color: var(--ink-soft); font-weight: 500 }
.sp-offer__list li svg { color: var(--accent-deep); flex-shrink: 0 }
.sp-offer .sp-btn { margin-top: 20px }
.sp-offers[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-offers[data-r] > * { opacity: 0; transform: translateY(22px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-offers[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-offers[data-r] > *:nth-child(1) { transition-delay: .03s }
.sp-offers[data-r] > *:nth-child(2) { transition-delay: .1s }
.sp-offers[data-r] > *:nth-child(3) { transition-delay: .17s }
@media (max-width: 940px) {
  .sp-offers { grid-template-columns: 1fr }
  .sp-offer:not(:first-child) { border-left: none; border-top: 1px solid var(--border) }
}
@media (prefers-reduced-motion: reduce) {
  .sp-problems[data-r] > *, .sp-offers[data-r] > * { opacity: 1; transform: none; filter: none; transition: none }
}

/* ── Feature quote (single testimonial reads as intentional, not a sparse grid) ── */
.sp-feature-quotes { display: flex; flex-direction: column; gap: 24px }
.sp-feature-quote {
  max-width: 880px; margin: 0 auto; width: 100%;
  display: grid; grid-template-columns: 200px 1fr; gap: 44px; align-items: center;
  padding: 48px 0;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.sp-feature-quote__person { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px }
.sp-feature-quote__photo { width: 92px; height: 92px; border-radius: 50%; object-fit: cover; box-shadow: 0 10px 24px -10px rgba(16,25,46,.3) }
.sp-feature-quote__avatar { display: flex; align-items: center; justify-content: center; width: 92px; height: 92px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-deep)); color: #fff; font-family: var(--font-display); font-weight: 700; font-size: 2rem }
.sp-feature-quote__name { font-size: .98rem; font-weight: 650; color: var(--ink); margin-top: 4px }
.sp-feature-quote__role { color: var(--muted); font-size: .82rem; line-height: 1.4 }
.sp-feature-quote__stars { display: flex; gap: 3px; color: #f4b740; margin-top: 2px }
.sp-feature-quote__stars svg { fill: currentColor }
.sp-feature-quote__linkedin { display: inline-flex; align-items: center; gap: 6px; color: var(--muted-dim); font-size: .8rem; text-decoration: none; transition: color .2s; margin-top: 4px }
.sp-feature-quote__linkedin:hover { color: var(--accent-deep) }
.sp-feature-quote__mark { color: var(--accent); opacity: .3 }
.sp-feature-quote__text { margin: 14px 0 0; font-size: 1.1rem; font-weight: 400; line-height: 1.6; color: var(--ink) }
.sp-feature-quote__tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px }
.sp-tagchip { font-size: .74rem; font-weight: 550; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); border-radius: 999px; padding: 5px 11px }
@media (max-width: 680px) {
  .sp-feature-quote { grid-template-columns: 1fr; text-align: center; padding: 36px 0; gap: 24px }
}
      `}</style>
    </SiteChrome>
  );
}
