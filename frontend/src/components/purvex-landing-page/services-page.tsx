"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronRight,
  Compass,
  FlaskConical,
  GraduationCap,
  Linkedin,
  Menu,
  MessageSquare,
  Radar,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   PurveX — Education-led landing page

   Lead track: cybersecurity training & education (labs, SOC
   upskilling, instruction) for academies, workforce programs,
   and institutions.
   Second track: security operations services for small and mid-sized businesses.

   BOOKING_URL: scheduling link for all consultation CTAs.
   ───────────────────────────────────────────────────────── */
const BOOKING_URL = "https://calendly.com/purvex-llc/30min";

const PROJECTS_URL = "https://medium.com/@jduru213";

/* ─────────────────── data ─────────────────── */

const courseArc = [
  { n: "01", title: "Fundamentals", body: "The groundwork every analyst needs to start strong." },
  { n: "02", title: "Threat detection", body: "Spotting suspicious activity and acting on it early." },
  { n: "03", title: "Log analysis projects", body: "Real log data, and finding what matters in the noise." },
  { n: "04", title: "Incident response", body: "An incident end to end: triage, investigate, contain, document." },
];

const formats = [
  { icon: Users, title: "1:1 & small-group instruction", body: "Live online sessions, paced to the learner." },
  { icon: FlaskConical, title: "Hands-on lab projects", body: "Real scenarios, worked at your own pace." },
  { icon: GraduationCap, title: "Embedded in your program", body: "I teach inside your existing program." },
];

const tools = ["Microsoft Sentinel", "Splunk", "KQL / SPL", "Security+", "CySA+"];

const difference = [
  {
    icon: MessageSquare,
    title: "Real feedback on your work",
    body: "We look at your actual work and show you what's strong and where to tighten up. That back-and-forth is how it sticks.",
  },
  {
    icon: Target,
    title: "Someone keeping you on track",
    body: "It's easy to stall out on your own. A live instructor keeps people moving until they finish, ready for the job.",
  },
  {
    icon: Compass,
    title: "Judgment, not just steps",
    body: "Knowing what to chase and what to ignore when everything's going off at once. You learn that from real scenarios, not a checklist.",
  },
];

const faqs: [string, string][] = [
  [
    "Who is PurveX for?",
    "Two groups: programs and institutions that want job-ready learners, and small businesses that need security help without a full team.",
  ],
  [
    "How is the training delivered?",
    "Remotely: live sessions, self-paced labs, or a mix. 1:1 or small-group, scoped to your program.",
  ],
  [
    "What does the course cover?",
    "Fundamentals, threat detection, log analysis, and incident response, in real tools like Sentinel and Splunk, aligned to Security+ and CySA+.",
  ],
  [
    "Do you replace our curriculum or work alongside it?",
    "Whatever fits. We can run our own course, instruct inside your program, or supply labs and materials to back up what you teach.",
  ],
  [
    "What does it cost?",
    "It depends on format, length, and scope, so we'd rather talk it through and find something that works.",
  ],
  [
    "Who will we actually work with?",
    "You'll deal directly with the person doing the teaching and security work, not a sales team. The quickest way to tell if we're a fit is a short chat.",
  ],
  [
    "What is the PurveX platform?",
    "A separate product we're building, in private beta. You don't need it for the training or security work; it's just an early look at what's coming.",
  ],
];

const bizServices = [
  "Security operations consulting",
  "SIEM monitoring & analysis",
  "Alert triage & investigation",
  "Detection engineering",
  "Microsoft Sentinel & Splunk",
];

const paths = [
  {
    icon: GraduationCap,
    eyebrow: "For educators & programs",
    title: "Train cybersecurity talent",
    body: "For academies, workforce programs, and institutions.",
    cta: "Explore training",
    href: "#training",
  },
  {
    icon: Building2,
    eyebrow: "For businesses",
    title: "Strengthen your security",
    body: "For small and mid-sized businesses without a full security team.",
    cta: "Get security help",
    href: "#services",
  },
  {
    icon: Radar,
    eyebrow: "For security teams",
    title: "Prove your detections",
    body: "For security teams that want proof their detections actually work.",
    cta: "Join the beta",
    href: "/platform",
  },
];

/* ─────────────────── component ─────────────────── */

export default function ServicesPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const els = pageRef.current?.querySelectorAll("[data-r]");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", fn);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", fn);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
      if (!a) return;
      const el = document.getElementById(a.getAttribute("href")!.slice(1));
      if (el) {
        e.preventDefault();
        setMobileOpen(false);
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  const closeNav = () => setMobileOpen(false);

  return (
    <div className="sp" ref={pageRef}>
      {/* ─── Ambient background ─── */}
      <div className="sp-bg" aria-hidden>
        <div className="sp-bg__grad" />
        <div className="sp-bg__grid" />
      </div>

      {/* ─── Nav ─── */}
      <header className={`sp-nav${scrolled ? " sp-nav--s" : ""}`}>
        <div className="sp-nav__inner">
          <Link href="/" className="sp-logo">
            <Image src="/logo.png" alt="PurveX" width={40} height={40} className="sp-logo__img" />
            <span>PurveX</span>
          </Link>
          <nav className="sp-nav__links">
            <a href="#training">Training</a>
            <a href="#services">Business Security</a>
            <Link href="/platform">Platform</Link>
          </nav>
          <div className="sp-nav__right">
            <button className="sp-nav__burger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile menu ─── */}
      <div className={`sp-mobile${mobileOpen ? " sp-mobile--open" : ""}`} onClick={closeNav}>
        <nav className="sp-mobile__nav" onClick={(e) => e.stopPropagation()}>
          <a href="#training" onClick={closeNav}>Training</a>
          <a href="#services" onClick={closeNav}>Business Security</a>
          <Link href="/platform" onClick={closeNav}>Platform</Link>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            onClick={closeNav}
            className="sp-btn sp-btn--prim sp-btn--lg sp-btn--full"
          >
            Book a Consultation
          </a>
        </nav>
      </div>

      <main className="sp-main">
        {/* ═══════════ HERO ═══════════ */}
        <section className={`sp-hero${heroReady ? " sp-hero--in" : ""}`}>
          <span className="sp-hero__badge">
            <GraduationCap size={13} /> Cybersecurity Training &amp; Team Development
          </span>
          <h1 className="sp-hero__h1">
            We help organizations build
            <br />
            <span className="sp-hero__grad">stronger security teams.</span>
          </h1>
          <p className="sp-hero__sub">
            Hands-on security training with real feedback and someone in your corner, not just labs
            to work through alone. Plus practical security help when your business needs it.
          </p>
          <div className="sp-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book a Consultation <ArrowRight size={16} />
            </a>
            <a href="#training" className="sp-btn sp-btn--ghost sp-btn--lg">
              Explore Training <ChevronRight size={15} />
            </a>
          </div>
        </section>

        {/* ═══════════ PATHS (segmentation) ═══════════ */}
        <section className="sp-section sp-section--paths" id="paths">
          <div className="sp-head" data-r>
            <span className="sp-tag">How we help</span>
            <h2>One team, built around what you need.</h2>
            <p>Pick the door that fits where you are today.</p>
          </div>
          <div className="sp-paths">
            {paths.map((p, i) => (
              <a key={p.title} href={p.href} className="sp-path" data-r data-d={String(i + 1)}>
                <div className="sp-path__icon"><p.icon size={20} /></div>
                <span className="sp-path__ey">{p.eyebrow}</span>
                <h3 className="sp-path__title">{p.title}</h3>
                <p className="sp-path__body">{p.body}</p>
                <span className="sp-path__link">
                  {p.cta} <ArrowRight size={15} />
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ═══════════ WHO WE ARE ═══════════ */}
        <section className="sp-section" id="about">
          <div className="sp-who" data-r>
            <div className="sp-who__head">
              <span className="sp-tag">Who we are</span>
              <h2>You work directly with the practitioner.</h2>
            </div>
            <div className="sp-who__body">
              <p>
                The person teaching your learners is the same one doing real security work. You get
                experience, not a script.
              </p>
              <p>
                No sales layer. The best way to see if we&apos;re a fit is a quick conversation.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════ TRAINING (primary) ═══════════ */}
        <section className="sp-section" id="training">
          <div className="sp-head" data-r>
            <span className="sp-tag">SOC analyst readiness</span>
            <h2>A hands-on path from fundamentals to incident response.</h2>
            <p>
              From fundamentals to incident response, through live instruction and real lab work.
            </p>
          </div>

          {/* course arc */}
          <div className="sp-arc">
            {courseArc.map((s, i) => (
              <div key={s.title} className="sp-arc__step" data-r data-d={String(i + 1)}>
                <span className="sp-arc__num">{s.n}</span>
                <h3 className="sp-arc__title">{s.title}</h3>
                <p className="sp-arc__body">{s.body}</p>
              </div>
            ))}
          </div>

          {/* delivery formats */}
          <div className="sp-train">
            {formats.map((f, i) => (
              <article key={f.title} className="sp-service" data-r data-d={String(i + 1)}>
                <div className="sp-service__icon"><f.icon size={22} /></div>
                <h3 className="sp-service__title">{f.title}</h3>
                <p className="sp-service__body">{f.body}</p>
              </article>
            ))}
          </div>

          {/* tools & certs + proof */}
          <div className="sp-tools" data-r>
            <span className="sp-tools__label">Tools &amp; certs</span>
            <div className="sp-tools__chips">
              {tools.map((t) => (
                <span key={t} className="sp-tagchip">{t}</span>
              ))}
            </div>
            <a href={PROJECTS_URL} target="_blank" rel="noreferrer" className="sp-proof__link">
              See the write-ups on Medium <ArrowRight size={15} />
            </a>
          </div>
        </section>

        {/* ═══════════ WHAT SETS IT APART ═══════════ */}
        <section className="sp-section" id="difference">
          <div className="sp-head" data-r>
            <span className="sp-tag">What sets it apart</span>
            <h2>Readiness comes from feedback, not just access.</h2>
            <p>
              Labs and courses are everywhere. What gets someone job-ready is a real person in the
              mix: feedback, accountability, and judgment you only get from doing the job.
            </p>
          </div>
          <div className="sp-diff">
            {difference.map((d, i) => (
              <article key={d.title} className="sp-diff__card" data-r data-d={String(i + 1)}>
                <div className="sp-diff__icon"><d.icon size={18} /></div>
                <h3 className="sp-diff__title">{d.title}</h3>
                <p className="sp-diff__body">{d.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════ BUSINESS SECURITY (secondary) ═══════════ */}
        <section className="sp-section" id="services">
          <div className="sp-biz" data-r>
            <div className="sp-biz__head">
              <div className="sp-biz__icon"><Building2 size={22} /></div>
              <span className="sp-tag">For small &amp; mid-sized businesses</span>
              <h2>Security operations support, without a full in-house team.</h2>
              <p>
                For businesses that can&apos;t staff a security team yet: detection, monitoring, and
                response help from the same people who train the field.
              </p>
              <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-biz__link">
                Talk through your needs <ArrowRight size={15} />
              </a>
            </div>
            <ul className="sp-biz__list">
              {bizServices.map((s) => (
                <li key={s}>
                  <ShieldCheck size={16} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ═══════════ LOOKING AHEAD ═══════════ */}
        <section className="sp-section" id="future">
          <div className="sp-future" data-r>
            <div className="sp-future__glow" />
            <div className="sp-future__content">
              <span className="sp-tag">Looking ahead</span>
              <h2>The future of PurveX</h2>
              <p>
                A detection-assurance platform, now in private beta: it proves which detections fire
                and shows why coverage breaks.
              </p>
              <Link href="/platform" className="sp-future__link">
                See the platform <ArrowRight size={15} />
              </Link>
            </div>
            <div className="sp-future__aside" aria-hidden>
              <div className="sp-future__panel">
                <span className="sp-future__panel-ey">
                  <Radar size={14} /> Private beta
                </span>
                <p>
                  A platform that turns claimed detection coverage into measured, defensible
                  evidence.
                </p>
              </div>
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
          <p className="sp-faq__cta" data-r>
            Still have questions?{" "}
            <a href={BOOKING_URL} target="_blank" rel="noreferrer">
              Book a consultation <ArrowRight size={14} />
            </a>
          </p>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="sp-footer" data-r>
        <div className="sp-footer__top">
          <div className="sp-footer__brand">
            <Link href="/" className="sp-logo">
              <Image src="/logo.png" alt="PurveX" width={24} height={24} className="sp-logo__img" />
              <span>PurveX</span>
            </Link>
            <p>Building cybersecurity talent. Strengthening security operations.</p>
          </div>
          <div className="sp-footer__cols">
            <div className="sp-footer__col">
              <h4>Company</h4>
              <a href="#training">Training</a>
              <a href="#services">Business Security</a>
              <a href="#about">About</a>
            </div>
            <div className="sp-footer__col">
              <h4>Platform</h4>
              <Link href="/platform">Overview</Link>
              <Link href="/platform#faq">FAQ</Link>
            </div>
            <div className="sp-footer__col">
              <h4>Legal</h4>
              <Link href="/legal/privacy">Privacy</Link>
              <Link href="/legal/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="sp-footer__bottom">
          <span>&copy; 2026 PurveX. All rights reserved.</span>
          <a
            href="https://www.linkedin.com/company/purvex/?viewAsMember=true"
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin size={14} /> LinkedIn
          </a>
        </div>
      </footer>

      <style>{`
/* ═══════════════════════════════════════════════
   PURVEX — EDUCATION-LED (light, single purple accent)
   ═══════════════════════════════════════════════ */

.sp {
  --bg: #fbfcfe;
  --surface: #ffffff;
  --surface-alt: #f5f7fc;
  --border: #e6eaf2;
  --border-strong: #d6dcea;
  --ink: #10192e;
  --ink-soft: #3f4a63;
  --muted: #64708a;
  --muted-dim: #8a95ac;
  --accent: #6a5cff;
  --accent-deep: #5546e0;
  --accent-soft: #eef0ff;
  --radius: 16px;
  --font-display: var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --ease: cubic-bezier(.16,1,.3,1);

  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
}

/* ── Ambient bg ── */
.sp-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0 }
.sp-bg__grad {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 45% at 50% -8%, rgba(106,92,255,.10), transparent 60%),
    radial-gradient(ellipse 45% 35% at 88% 8%, rgba(106,92,255,.04), transparent 60%);
}
.sp-bg__grid {
  position: absolute; inset: 0; opacity: .5;
  background-image:
    linear-gradient(rgba(16,25,46,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16,25,46,.03) 1px, transparent 1px);
  background-size: 76px 76px;
  mask-image: radial-gradient(ellipse 65% 45% at 50% 20%, black, transparent 78%);
}

/* ── Reveal ── */
[data-r] { opacity: 0; transform: translateY(26px) scale(.985); transition: opacity .8s var(--ease), transform .8s var(--ease); will-change: opacity, transform }
[data-d="1"] { transition-delay: .05s } [data-d="2"] { transition-delay: .12s } [data-d="3"] { transition-delay: .19s } [data-d="4"] { transition-delay: .26s } [data-d="5"] { transition-delay: .33s }
[data-r].in { opacity: 1; transform: none }
@media (prefers-reduced-motion: reduce) { [data-r] { opacity: 1; transform: none; transition: none } }

/* ── Nav ── */
.sp-nav { position: sticky; top: 0; z-index: 50; padding: 0 24px; transition: background .35s, backdrop-filter .35s, box-shadow .35s, border-color .35s; border-bottom: 1px solid transparent }
.sp-nav--s { background: rgba(251,252,254,.82); backdrop-filter: blur(14px) saturate(1.3); -webkit-backdrop-filter: blur(14px) saturate(1.3); border-bottom: 1px solid var(--border) }
.sp-nav__inner { max-width: 1140px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 66px }
.sp-logo { display: inline-flex; align-items: center; gap: 9px; justify-self: start; font-family: var(--font-display); font-weight: 700; font-size: 1.2rem; color: var(--ink); text-decoration: none; letter-spacing: -.02em }
.sp-logo__img { border-radius: 8px }
.sp-nav .sp-logo { font-size: 1.5rem; gap: 11px }
.sp-nav__links { display: none; gap: 30px; justify-self: center }
.sp-nav__links a { font-size: .86rem; font-weight: 550; color: var(--muted); text-decoration: none; transition: color .2s }
.sp-nav__links a:hover { color: var(--ink) }
.sp-nav__right { display: flex; align-items: center; gap: 10px; margin-left: auto }
.sp-nav__burger { display: flex; align-items: center; justify-content: center; background: none; border: 0; color: var(--ink); cursor: pointer; padding: 6px; margin-right: -6px }

/* ── Buttons ── */
.sp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 0; border-radius: 11px; font-weight: 620; font-size: .88rem; text-decoration: none; cursor: pointer; white-space: nowrap; transition: transform .25s var(--ease), background .25s, box-shadow .25s, border-color .25s, color .25s }
.sp-btn:active { transform: scale(.98); transition-duration: .05s }
.sp-btn--sm { height: 40px; padding: 0 18px; font-size: .85rem }
.sp-btn--lg { height: 50px; padding: 0 24px; font-size: .92rem }
.sp-btn--full { width: 100% }
.sp-btn--prim { background: linear-gradient(135deg, var(--accent), var(--accent-deep)); color: #fff; box-shadow: 0 6px 18px -8px rgba(85,70,224,.5), inset 0 1px 0 rgba(255,255,255,.18) }
.sp-btn--prim:hover { transform: translateY(-2px); box-shadow: 0 12px 26px -8px rgba(85,70,224,.55), inset 0 1px 0 rgba(255,255,255,.18) }
.sp-btn--ghost { background: var(--surface); color: var(--ink); border: 1px solid var(--border-strong); box-shadow: 0 1px 2px rgba(16,25,46,.03) }
.sp-btn--ghost:hover { border-color: var(--accent); color: var(--accent-deep); transform: translateY(-2px) }

/* ── Mobile overlay (elevated) ── */
.sp-mobile { position: fixed; inset: 0; z-index: 45; background: radial-gradient(72% 55% at 50% 32%, rgba(106,92,255,.08), transparent 70%), rgba(251,252,254,.98); backdrop-filter: blur(26px) saturate(1.25); -webkit-backdrop-filter: blur(26px) saturate(1.25); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .35s ease }
.sp-mobile--open { opacity: 1; pointer-events: auto }
.sp-mobile__nav { display: flex; flex-direction: column; align-items: center; gap: 2px; width: min(88vw, 440px); text-align: center; counter-reset: navitem }
.sp-mobile__nav > * { opacity: 0 }
.sp-mobile--open .sp-mobile__nav > * { animation: sp-menu-in .55s var(--ease) both }
.sp-mobile--open .sp-mobile__nav > *:nth-child(1) { animation-delay: .06s }
.sp-mobile--open .sp-mobile__nav > *:nth-child(2) { animation-delay: .12s }
.sp-mobile--open .sp-mobile__nav > *:nth-child(3) { animation-delay: .18s }
.sp-mobile--open .sp-mobile__nav > *:nth-child(4) { animation-delay: .24s }
.sp-mobile--open .sp-mobile__nav > *:nth-child(5) { animation-delay: .30s }
.sp-mobile--open .sp-mobile__nav > *:nth-child(6) { animation-delay: .36s }
.sp-mobile__nav a:not(.sp-btn) { position: relative; counter-increment: navitem; font-family: var(--font-display); font-size: clamp(1.7rem, 7vw, 2.2rem); font-weight: 700; letter-spacing: -.02em; color: var(--ink); text-decoration: none; padding: 12px 0; transition: color .25s var(--ease) }
.sp-mobile__nav a:not(.sp-btn)::before { content: "0" counter(navitem); font-family: var(--font-mono); font-size: .78rem; font-weight: 500; color: var(--accent); margin-right: 14px; vertical-align: 6px }
.sp-mobile__nav a:not(.sp-btn)::after { content: ""; position: absolute; left: 50%; bottom: 8px; width: 0; height: 2px; border-radius: 2px; background: var(--accent); transform: translateX(-50%); transition: width .3s var(--ease) }
.sp-mobile__nav a:not(.sp-btn):hover { color: var(--accent-deep) }
.sp-mobile__nav a:not(.sp-btn):hover::after { width: 42% }
.sp-mobile__nav .sp-btn { margin-top: 28px; min-width: 240px }
@keyframes sp-menu-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .sp-mobile--open .sp-mobile__nav > * { animation: none; opacity: 1 } }

/* ── Main ── */
.sp-main { position: relative; z-index: 1; max-width: 1140px; margin: 0 auto; padding: 0 24px 96px }

/* ── Hero ── */
.sp-hero { text-align: center; padding: 90px 0 0; max-width: 880px; margin: 0 auto }
.sp-hero > * { opacity: 0; transform: translateY(18px); transition: opacity .65s var(--ease), transform .65s var(--ease) }
.sp-hero--in > * { opacity: 1; transform: none }
.sp-hero--in > *:nth-child(1) { transition-delay: 0s }
.sp-hero--in > *:nth-child(2) { transition-delay: .1s }
.sp-hero--in > *:nth-child(3) { transition-delay: .18s }
.sp-hero--in > *:nth-child(4) { transition-delay: .26s }
.sp-hero--in > *:nth-child(5) { transition-delay: .34s }
.sp-hero__badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 15px; border-radius: 999px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.2); font-size: .74rem; font-weight: 650; color: var(--accent-deep); letter-spacing: .01em; margin-bottom: 22px }
.sp-hero__h1 { margin: 0; font-family: var(--font-display); font-size: clamp(1.9rem, 3.8vw, 2.9rem); font-weight: 700; line-height: 1.1; letter-spacing: -.03em; color: var(--ink); text-wrap: balance }
.sp-hero__grad { color: var(--accent-deep) }
.sp-hero__sub { margin: 22px auto 0; max-width: 680px; color: var(--ink-soft); font-size: 1.06rem; line-height: 1.72 }
.sp-hero__actions { margin: 30px auto 0; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap }
.sp-hero__cred { margin: 34px auto 0; display: flex; gap: 10px 26px; justify-content: center; flex-wrap: wrap }
.sp-hero__cred-item { display: inline-flex; align-items: center; gap: 7px; font-size: .82rem; font-weight: 550; color: var(--muted) }
.sp-hero__cred-item svg { color: var(--accent) }

/* ── Sections ── */
.sp-section { padding-top: 108px; scroll-margin-top: 84px }
.sp-head { text-align: center; max-width: 640px; margin: 0 auto 44px }
.sp-head h2 { margin: 12px 0 0; font-family: var(--font-display); font-size: clamp(1.65rem, 3.4vw, 2.5rem); font-weight: 700; line-height: 1.14; letter-spacing: -.032em; color: var(--ink) }
.sp-head p { margin: 16px auto 0; color: var(--muted); font-size: 1rem; line-height: 1.7; max-width: 560px }
.sp-tag { display: inline-block; font-size: .72rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--accent-deep) }

/* ── Paths (segmentation) ── */
.sp-section--paths { padding-top: 66px }
.sp-paths { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px }
.sp-path { display: flex; flex-direction: column; padding: 28px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); box-shadow: 0 18px 44px -40px rgba(16,25,46,.28); text-decoration: none; color: inherit; transition: transform .3s var(--ease), border-color .3s, box-shadow .3s }
.sp-path:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: 0 30px 60px -40px rgba(85,70,224,.35) }
.sp-path__icon { display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 12px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep) }
.sp-path__ey { display: block; margin-top: 18px; font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-dim) }
.sp-path__title { margin: 8px 0 0; font-family: var(--font-display); font-size: 1.24rem; font-weight: 700; letter-spacing: -.025em; color: var(--ink) }
.sp-path__body { margin: 10px 0 0; color: var(--muted); font-size: .9rem; line-height: 1.6; flex: 1 }
.sp-path__link { display: inline-flex; align-items: center; gap: 7px; margin-top: 18px; font-size: .88rem; font-weight: 650; color: var(--accent-deep); transition: gap .25s var(--ease) }
.sp-path:hover .sp-path__link { gap: 11px }

/* ── Who we are ── */
.sp-who { display: grid; grid-template-columns: 1fr 1.25fr; gap: 48px; align-items: start; padding: 44px; border-radius: calc(var(--radius) + 6px); border: 1px solid var(--border); background: radial-gradient(120% 130% at 0% 0%, rgba(106,92,255,.05), transparent 55%), var(--surface); box-shadow: 0 24px 60px -40px rgba(16,25,46,.25) }
.sp-who__head h2 { margin: 12px 0 0; font-family: var(--font-display); font-size: clamp(1.5rem, 2.8vw, 2.1rem); font-weight: 700; line-height: 1.16; letter-spacing: -.03em }
.sp-who__body p { margin: 0 0 16px; color: var(--ink-soft); font-size: 1rem; line-height: 1.78 }
.sp-who__body p:last-child { margin-bottom: 0 }

/* ── Training (primary) ── */
.sp-train { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px }
.sp-service { position: relative; padding: 30px; border-radius: calc(var(--radius) + 4px); border: 1px solid var(--border); background: var(--surface); box-shadow: 0 20px 50px -40px rgba(16,25,46,.3); transition: transform .35s var(--ease), border-color .35s, box-shadow .35s }
.sp-service:hover { transform: translateY(-4px); border-color: var(--border-strong); box-shadow: 0 32px 64px -40px rgba(16,25,46,.35) }
.sp-service__icon { display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg, var(--accent-soft), #ffffff); border: 1px solid rgba(106,92,255,.2); color: var(--accent-deep); box-shadow: 0 8px 20px -12px rgba(106,92,255,.5) }
.sp-service__title { margin: 20px 0 0; font-family: var(--font-display); font-size: 1.24rem; font-weight: 700; letter-spacing: -.025em; color: var(--ink) }
.sp-service__body { margin: 10px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.65 }
.sp-service__tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px }
.sp-tagchip { font-size: .74rem; font-weight: 550; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); border-radius: 999px; padding: 5px 11px }

/* course arc */
.sp-arc { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px }
.sp-arc__step { position: relative; padding: 24px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); box-shadow: 0 18px 44px -40px rgba(16,25,46,.24); transition: transform .3s var(--ease), border-color .3s }
.sp-arc__step:hover { transform: translateY(-3px); border-color: var(--border-strong) }
.sp-arc__step:not(:last-child)::after { content: ""; position: absolute; top: 33px; right: -10px; width: 9px; height: 9px; border-top: 1.5px solid var(--border-strong); border-right: 1.5px solid var(--border-strong); transform: rotate(45deg); z-index: 1 }
.sp-arc__num { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; letter-spacing: -.04em; color: var(--accent) }
.sp-arc__title { margin: 10px 0 0; font-family: var(--font-display); font-size: 1.06rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-arc__body { margin: 8px 0 0; color: var(--muted); font-size: .86rem; line-height: 1.6 }
.sp-arc + .sp-train { margin-top: 20px }

/* tools & certs */
.sp-tools { display: flex; align-items: center; gap: 12px 18px; flex-wrap: wrap; margin-top: 24px; padding: 18px 24px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface-alt) }
.sp-tools__label { font-family: var(--font-mono); font-size: .7rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-dim) }
.sp-tools__chips { display: flex; flex-wrap: wrap; gap: 8px; flex: 1 }

/* proof */
.sp-proof { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 22px; flex-wrap: wrap; color: var(--muted); font-size: .92rem }
.sp-proof__link { display: inline-flex; align-items: center; gap: 7px; font-weight: 650; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-proof__link:hover { gap: 11px }

/* ── What sets it apart ── */
.sp-diff { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px }
.sp-diff__card { padding: 28px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); box-shadow: 0 18px 44px -40px rgba(16,25,46,.28); transition: transform .3s var(--ease), border-color .3s }
.sp-diff__card:hover { transform: translateY(-3px); border-color: var(--border-strong) }
.sp-diff__icon { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 11px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep) }
.sp-diff__title { margin: 16px 0 0; font-family: var(--font-display); font-size: 1.14rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-diff__body { margin: 10px 0 0; color: var(--muted); font-size: .9rem; line-height: 1.68 }

/* ── Business security (secondary) ── */
.sp-biz { display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: center; padding: 40px; border-radius: calc(var(--radius) + 4px); border: 1px solid var(--border); background: radial-gradient(120% 130% at 100% 0%, rgba(106,92,255,.045), transparent 55%), var(--surface-alt); box-shadow: 0 18px 44px -40px rgba(16,25,46,.24) }
.sp-biz__icon { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 13px; background: linear-gradient(135deg, var(--accent-soft), #ffffff); border: 1px solid rgba(106,92,255,.2); color: var(--accent-deep); margin-bottom: 16px; box-shadow: 0 8px 20px -12px rgba(106,92,255,.5) }
.sp-biz__head h2 { margin: 12px 0 0; font-family: var(--font-display); font-size: clamp(1.4rem, 2.6vw, 1.9rem); font-weight: 700; line-height: 1.2; letter-spacing: -.025em; color: var(--ink) }
.sp-biz__head p { margin: 14px 0 0; color: var(--muted); font-size: .96rem; line-height: 1.7 }
.sp-biz__link { display: inline-flex; align-items: center; gap: 7px; margin-top: 20px; font-size: .9rem; font-weight: 650; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-biz__link:hover { gap: 11px }
.sp-biz__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px }
.sp-biz__list li { display: flex; align-items: center; gap: 11px; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); color: var(--ink-soft); font-size: .92rem; font-weight: 550; transition: transform .25s var(--ease), border-color .25s, box-shadow .25s }
.sp-biz__list li:hover { transform: translateX(4px); border-color: var(--border-strong); box-shadow: 0 12px 30px -22px rgba(16,25,46,.3) }
.sp-biz__list li svg { color: var(--accent-deep); flex-shrink: 0 }

/* ── Looking ahead ── */
.sp-future { position: relative; overflow: hidden; display: grid; grid-template-columns: 1.35fr 1fr; gap: 44px; align-items: center; padding: 48px; border-radius: calc(var(--radius) + 8px); border: 1px solid rgba(106,92,255,.22); background: linear-gradient(135deg, #f4f3ff 0%, #ffffff 60%); box-shadow: 0 30px 70px -46px rgba(85,70,224,.5) }
.sp-future__glow { position: absolute; top: -50%; right: -10%; width: 480px; height: 480px; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(106,92,255,.14), transparent 62%) }
.sp-future__content { position: relative }
.sp-future__content h2 { margin: 12px 0 0; font-family: var(--font-display); font-size: clamp(1.6rem, 3vw, 2.3rem); font-weight: 700; letter-spacing: -.03em; color: var(--ink) }
.sp-future__content p { margin: 16px 0 0; color: var(--ink-soft); font-size: 1rem; line-height: 1.75; max-width: 480px }
.sp-future__link { display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; font-size: .92rem; font-weight: 650; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-future__link:hover { gap: 12px }
.sp-future__aside { position: relative }
.sp-future__panel { padding: 26px; border-radius: var(--radius); border: 1px solid var(--border); background: rgba(255,255,255,.85); backdrop-filter: blur(6px); box-shadow: 0 24px 50px -34px rgba(16,25,46,.4) }
.sp-future__panel-ey { display: inline-flex; align-items: center; gap: 7px; font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }
.sp-future__panel p { margin: 12px 0 0; color: var(--ink-soft); font-size: .92rem; line-height: 1.65 }

/* ── FAQ ── */
.sp-faq { max-width: 720px; margin: 0 auto; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); overflow: hidden; box-shadow: 0 18px 44px -40px rgba(16,25,46,.28) }
.sp-faq__item + .sp-faq__item { border-top: 1px solid var(--border) }
.sp-faq__item--open { background: var(--accent-soft) }
.sp-faq__btn { display: flex; align-items: center; width: 100%; justify-content: space-between; gap: 16px; padding: 20px 24px; background: none; border: 0; color: var(--ink); font-size: .94rem; font-weight: 650; text-align: left; cursor: pointer; transition: color .2s }
.sp-faq__btn:hover { color: var(--accent-deep) }
.sp-faq__chev { flex-shrink: 0; color: var(--muted-dim); transition: transform .35s var(--ease) }
.sp-faq__chev--open { transform: rotate(180deg); color: var(--accent-deep) }
.sp-faq__body { max-height: 0; overflow: hidden; opacity: 0; transition: max-height .4s var(--ease), opacity .3s }
.sp-faq__body--open { max-height: 320px; opacity: 1 }
.sp-faq__body p { padding: 0 24px 20px; margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.7 }
.sp-faq__cta { text-align: center; margin: 24px 0 0; color: var(--muted); font-size: .92rem }
.sp-faq__cta a { display: inline-flex; align-items: center; gap: 6px; color: var(--accent-deep); font-weight: 650; text-decoration: none; transition: gap .2s var(--ease) }
.sp-faq__cta a:hover { gap: 10px }

/* ── Footer ── */
.sp-footer { border-top: 1px solid var(--border); max-width: 1140px; margin: 0 auto; padding: 40px 24px 28px }
.sp-footer__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px }
.sp-footer__brand { max-width: 280px }
.sp-footer__brand p { margin: 12px 0 0; color: var(--muted); font-size: .88rem; line-height: 1.65 }
.sp-footer__cols { display: flex; gap: 52px }
.sp-footer__col { display: flex; flex-direction: column; gap: 10px }
.sp-footer__col h4 { margin: 0 0 4px; font-size: .68rem; text-transform: uppercase; letter-spacing: .11em; color: var(--muted-dim); font-weight: 700 }
.sp-footer__col a { color: var(--muted); font-size: .86rem; text-decoration: none; transition: color .2s }
.sp-footer__col a:hover { color: var(--accent-deep) }
.sp-footer__bottom { border-top: 1px solid var(--border); margin-top: 32px; padding-top: 20px; display: flex; align-items: center; justify-content: space-between; color: var(--muted-dim); font-size: .8rem }
.sp-footer__bottom a { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); text-decoration: none; font-weight: 600; transition: color .2s }
.sp-footer__bottom a:hover { color: var(--accent-deep) }

/* ── Micro-interactions ── */
.sp-service__icon, .sp-path__icon { transition: transform .35s var(--ease) }
.sp-service:hover .sp-service__icon, .sp-path:hover .sp-path__icon { transform: translateY(-2px) scale(1.06) }

/* ── Responsive ── */
@media (max-width: 940px) {
  .sp-paths { grid-template-columns: 1fr }
  .sp-who { grid-template-columns: 1fr; gap: 24px; padding: 34px }
  .sp-arc { grid-template-columns: 1fr 1fr }
  .sp-arc__step:not(:last-child)::after { display: none }
  .sp-train { grid-template-columns: 1fr }
  .sp-diff { grid-template-columns: 1fr }
  .sp-biz { grid-template-columns: 1fr; gap: 26px; padding: 32px }
  .sp-future { grid-template-columns: 1fr; gap: 30px; padding: 36px }
  .sp-footer__top { flex-direction: column; gap: 30px }
}
@media (max-width: 680px) {
  .sp-main { padding: 0 16px 64px }
  .sp-nav { padding: 0 16px }
  .sp-nav__links { display: none }
  .sp-nav__burger { display: flex }
  .sp-nav__right .sp-btn { display: none }
  .sp-hero { padding-top: 60px }
  .sp-hero__actions { flex-direction: column }
  .sp-hero__actions .sp-btn { width: 100% }
  .sp-section { padding-top: 80px }
  .sp-arc { grid-template-columns: 1fr }
  .sp-service { padding: 26px }
  .sp-footer__cols { flex-wrap: wrap; gap: 32px }
  .sp-footer__bottom { flex-direction: column; align-items: flex-start; gap: 10px }
}
      `}</style>
    </div>
  );
}
