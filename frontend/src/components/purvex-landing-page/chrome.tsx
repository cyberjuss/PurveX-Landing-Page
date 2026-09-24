"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Linkedin, Menu, X } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   PurveX — shared site chrome

   One cybersecurity company, two ways it helps organizations
   today: Security Operations consulting and Cybersecurity
   Training partnerships. The PurveX platform is the future
   product roadmap, referenced from the nav's About menu.

   This file owns the nav (with mega-menu dropdowns), mobile
   menu, footer, and the base design system (bg, buttons,
   sections, cards, responsive rules) shared by every page so
   pages only carry their own content and layout unique to them.

   BOOKING_URL: scheduling link for every "talk to us" CTA.
   ───────────────────────────────────────────────────────── */
export const BOOKING_URL = "https://calendly.com/purvex-llc/30min";

export type NavKey = "home" | "security-operations" | "training" | "about" | "platform" | "legal";

type NavMenu = {
  key: NavKey;
  label: string;
  href: string;
  external?: boolean;
};

const NAV_MENUS: NavMenu[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "security-operations", label: "Security Operations", href: "/security-operations" },
  { key: "training", label: "Cybersecurity Training", href: "/cybersecurity-training" },
  { key: "platform", label: "PurveX Labs", href: "/platform" },
  { key: "about", label: "About", href: "/about" },
];

export function SiteChrome({
  active,
  children,
}: {
  active: NavKey;
  children: React.ReactNode;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDock, setShowDock] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > 32);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      // Phone-only contact dock: the nav's CTA is hidden on small screens,
      // so it slides up once the hero is out of view and tucks away again
      // near the footer, which carries its own CTA.
      setShowDock(window.scrollY > 520 && max - window.scrollY > 520);
    };
    const fn = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    };
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

  const closeNav = () => {
    setMobileOpen(false);
  };

  return (
    <div className="sp" ref={pageRef}>
      <div className="sp-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />
      <div className="sp-bg" aria-hidden>
        <div className="sp-bg__grid" />
      </div>

      <header className={`sp-nav${scrolled ? " sp-nav--s" : ""}`}>
        <div className="sp-nav__inner">
          <Link href="/" className="sp-logo">
            <Image src="/logo.png" alt="PurveX" width={40} height={40} className="sp-logo__img" priority />
            <span>PurveX</span>
          </Link>

          <nav className="sp-nav__links" aria-label="Primary">
            {NAV_MENUS.filter((menu) => menu.key !== "home").map((menu) => (
              <Link
                key={menu.key}
                href={menu.href}
                className={`sp-nav__link${active === menu.key ? " sp-nav__link--active" : ""}`}
              >
                {menu.label}
              </Link>
            ))}
          </nav>

          <div className="sp-nav__right">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--sm">
              Get in Touch
            </a>
            <button
              className="sp-nav__burger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="sp-mobile-menu"
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="sp-mobile-menu"
        className={`sp-mobile${mobileOpen ? " sp-mobile--open" : ""}`}
        onClick={closeNav}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <nav className="sp-mobile__nav" aria-label="Mobile" onClick={(e) => e.stopPropagation()}>
          {NAV_MENUS.map((menu, i) => (
            <div key={menu.key} className="sp-mobile__group" style={{ animationDelay: `${0.06 + i * 0.06}s` }}>
              <Link
                href={menu.href}
                onClick={closeNav}
                className={`sp-mobile__toplink${active === menu.key ? " sp-mobile__toplink--active" : ""}`}
                {...(menu.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {menu.label}
              </Link>
            </div>
          ))}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            onClick={closeNav}
            className="sp-btn sp-btn--prim sp-btn--lg sp-btn--full"
          >
            Get in Touch
          </a>
          <div className="sp-mobile__meta">
            <Link href="/academy" onClick={closeNav}>Academy Portal</Link>
            <Link href="/legal/privacy" onClick={closeNav}>Privacy</Link>
            <Link href="/legal/terms" onClick={closeNav}>Terms</Link>
          </div>
        </nav>
      </div>

      <div className={`sp-dock${showDock && !mobileOpen ? " sp-dock--show" : ""}`} aria-hidden={!showDock || mobileOpen}>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className="sp-btn sp-btn--prim sp-btn--lg sp-btn--full"
          tabIndex={showDock && !mobileOpen ? 0 : -1}
        >
          Schedule a Conversation <ArrowRight size={16} />
        </a>
      </div>

      <main className="sp-main">{children}</main>

      <footer className="sp-footer" data-r>
        <div className="sp-footer__top">
          <div className="sp-footer__brand">
            <Link href="/" className="sp-logo">
              <Image src="/logo.png" alt="PurveX" width={24} height={24} className="sp-logo__img" />
              <span>PurveX</span>
            </Link>
            <p>Strengthening security operations. Developing cybersecurity talent.</p>
            {/* The one contact CTA for the whole site, lives here so every
                page gets it automatically instead of each page carrying its
                own (previously inconsistent) version. */}
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg sp-footer__cta">
              Schedule a Conversation <ArrowRight size={16} />
            </a>
          </div>
          <div className="sp-footer__cols">
            <div className="sp-footer__col">
              <h4>Company</h4>
              <Link href="/security-operations">Security Operations</Link>
              <Link href="/cybersecurity-training">Cybersecurity Training</Link>
              <Link href="/academy">Academy Portal</Link>
              <Link href="/about">About</Link>
            </div>
            <div className="sp-footer__col">
              <h4>Platform</h4>
              <Link href="/platform">PurveX Labs</Link>
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

      <style>{CHROME_CSS}</style>
    </div>
  );
}

export const CHROME_CSS = `
/* ═══════════════════════════════════════════════
   PURVEX — SHARED CHROME
   Same design language as the Academy portal: Space Grotesk display
   type, mono uppercase kickers, hairline rules instead of floating
   cards, square tags, a quiet dot grid, and one purple accent.
   ═══════════════════════════════════════════════ */

.sp {
  --bg: #ffffff;
  --surface: #ffffff;
  --surface-alt: #f8fafc;
  --border: rgba(15,23,42,.1);
  --border-strong: rgba(15,23,42,.18);
  --ink: #0f172a;
  --ink-soft: #475569;
  --muted: #64748b;
  --muted-dim: #8a94a8;
  --accent: #6a5cff;
  --accent-deep: #5546e0;
  --accent-soft: rgba(85,70,224,.07);
  --green: #0f9f6e;
  --red: #d93a3f;
  --radius: 6px;
  --font-display: var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --ease: cubic-bezier(.16,1,.3,1);

  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
}
.sp ::selection { background: rgba(85,70,224,.16) }

/* ── Scroll progress: a hairline, not a glowing bar ── */
.sp-progress { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 80; background: var(--accent-deep); transform-origin: left; transform: scaleX(0); transition: transform .1s linear; pointer-events: none }

/* ── Ambient bg: the portal's printed dot grid, fading out below the fold ── */
.sp-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden }
.sp-bg__grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(16,25,46,.11) 1.6px, transparent 1.6px);
  background-size: 26px 26px;
  mask-image: radial-gradient(ellipse 70% 55% at 50% 0%, black, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 70% 55% at 50% 0%, black, transparent 75%);
  animation: sp-print 5.5s ease-in-out infinite;
}
@keyframes sp-print { 0%, 100% { opacity: .45 } 50% { opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .sp-bg__grid { animation: none; opacity: .8 } }

/* ── Reveal ── */
[data-r] { opacity: 0; transform: translateY(18px); transition: opacity .8s var(--ease), transform .8s var(--ease); will-change: opacity, transform }
[data-d="1"] { transition-delay: .05s } [data-d="2"] { transition-delay: .12s } [data-d="3"] { transition-delay: .19s } [data-d="4"] { transition-delay: .26s } [data-d="5"] { transition-delay: .33s }
[data-r].in { opacity: 1; transform: none }

/* Cascading child reveal for card/step grids */
.sp-cards[data-r], .sp-process[data-r], .sp-formats[data-r], .sp-arc[data-r] { opacity: 1; transform: none; transition: none }
.sp-cards[data-r] > *, .sp-process[data-r] > *, .sp-formats[data-r] > *, .sp-arc[data-r] > * { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.sp-cards[data-r].in > *, .sp-process[data-r].in > *, .sp-formats[data-r].in > *, .sp-arc[data-r].in > * { opacity: 1; transform: none }
.sp-cards[data-r] > *:nth-child(1), .sp-process[data-r] > *:nth-child(1), .sp-formats[data-r] > *:nth-child(1), .sp-arc[data-r] > *:nth-child(1) { transition-delay: .03s }
.sp-cards[data-r] > *:nth-child(2), .sp-process[data-r] > *:nth-child(2), .sp-formats[data-r] > *:nth-child(2), .sp-arc[data-r] > *:nth-child(2) { transition-delay: .1s }
.sp-cards[data-r] > *:nth-child(3), .sp-process[data-r] > *:nth-child(3), .sp-formats[data-r] > *:nth-child(3), .sp-arc[data-r] > *:nth-child(3) { transition-delay: .17s }
.sp-cards[data-r] > *:nth-child(4), .sp-process[data-r] > *:nth-child(4), .sp-formats[data-r] > *:nth-child(4), .sp-arc[data-r] > *:nth-child(4) { transition-delay: .24s }

@media (prefers-reduced-motion: reduce) {
  [data-r], .sp-cards[data-r] > *, .sp-process[data-r] > *, .sp-formats[data-r] > *, .sp-arc[data-r] > * { opacity: 1; transform: none; transition: none }
}

/* ── Nav: a full-bleed bar with a hairline under it, like the portal
   header, rather than a floating pill. ── */
.sp-nav { position: sticky; top: 0; z-index: 50 }
.sp-nav__inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 68px; padding: 0 24px;
  background: rgba(255,255,255,.86); border-bottom: 1px solid var(--border);
  backdrop-filter: blur(14px) saturate(1.3); -webkit-backdrop-filter: blur(14px) saturate(1.3);
  transition: background .3s, box-shadow .3s;
}
.sp-nav--s .sp-nav__inner { background: rgba(255,255,255,.96); box-shadow: 0 1px 0 rgba(16,25,46,.03), 0 8px 24px -16px rgba(16,25,46,.12) }
.sp-logo { display: inline-flex; align-items: center; gap: 10px; justify-self: start; font-family: var(--font-display); font-weight: 600; font-size: 1.15rem; color: var(--ink); text-decoration: none; letter-spacing: -.03em }
.sp-logo__img { border-radius: 6px }
.sp-nav__right { display: flex; align-items: center; gap: 10px; justify-self: end }
.sp-nav__burger { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--ink); cursor: pointer; padding: 0 }

.sp-nav__links { display: none }
@media (min-width: 940px) {
  .sp-nav__inner { display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px }
  .sp-nav__links { display: flex; align-items: center; justify-content: center; gap: 4px }
  .sp-nav__burger { display: none }
}
.sp-nav__link {
  position: relative; display: inline-flex; align-items: center; height: 68px; padding: 0 14px;
  font-size: .86rem; font-weight: 500; color: var(--ink-soft); text-decoration: none;
  transition: color .2s var(--ease);
}
.sp-nav__link::after { content: ""; position: absolute; left: 14px; right: 14px; bottom: -1px; height: 2px; background: var(--accent-deep); transform: scaleX(0); transition: transform .3s var(--ease) }
.sp-nav__link:hover, .sp-nav__link:focus-visible { color: var(--ink) }
.sp-nav__link--active { color: var(--ink); font-weight: 600 }
.sp-nav__link--active::after { transform: scaleX(1) }

/* ── Buttons: pill primary, as in the portal's CTAs ── */
.sp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 999px; font-weight: 600; font-size: .9rem; letter-spacing: -.005em; text-decoration: none; cursor: pointer; white-space: nowrap; transition: transform .25s var(--ease), background .25s, box-shadow .25s, border-color .25s, color .25s; outline: none }
.sp-btn svg { transition: transform .25s var(--ease) }
.sp-btn:hover svg { transform: translateX(2px) }
.sp-btn:active { transform: scale(.98); transition-duration: .05s }
.sp-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(85,70,224,.3) }
.sp-btn:disabled { opacity: .7; cursor: default }
.sp-btn--sm { height: 38px; padding: 0 18px; font-size: .85rem }
.sp-btn--lg { height: 48px; padding: 0 24px; font-size: .92rem }
.sp-btn--full { width: 100% }
.sp-btn--prim { background: var(--accent-deep); color: #fff }
.sp-btn--prim:hover { background: #4a3bd4; box-shadow: 0 10px 24px -12px rgba(85,70,224,.7) }
.sp-btn--ghost { background: transparent; color: var(--ink); border: 1px solid var(--border-strong) }
.sp-btn--ghost:hover { border-color: var(--ink); background: rgba(15,23,42,.02) }

/* ── Mobile overlay ── */
.sp-mobile { position: fixed; inset: 0; z-index: 45; background: rgba(255,255,255,.98); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .35s ease; overflow-y: auto; padding: 90px 0 40px }
.sp-mobile--open { opacity: 1; pointer-events: auto }
.sp-mobile__nav { display: flex; flex-direction: column; align-items: stretch; width: min(88vw, 440px); margin: auto; text-align: left; counter-reset: navitem; border-top: 1px solid var(--border) }
.sp-mobile__group { opacity: 0; animation: sp-menu-in .55s var(--ease) both; border-bottom: 1px solid var(--border) }
.sp-mobile__toplink { position: relative; display: flex; align-items: baseline; gap: 14px; counter-increment: navitem; font-family: var(--font-display); font-size: clamp(1.45rem, 6.2vw, 1.85rem); font-weight: 600; letter-spacing: -.03em; color: var(--ink); text-decoration: none; padding: 16px 0; transition: color .25s var(--ease) }
.sp-mobile__toplink::before { content: counter(navitem, decimal-leading-zero); font-family: var(--font-mono); font-size: .72rem; font-weight: 700; letter-spacing: .04em; color: var(--accent-deep) }
.sp-mobile__toplink:hover, .sp-mobile__toplink--active { color: var(--accent-deep) }
.sp-mobile__nav .sp-btn { margin: 28px 0 0; width: 100% }
@keyframes sp-menu-in { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .sp-mobile__group { animation: none; opacity: 1 } }

.sp-mobile__meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 22px; margin-top: 22px }
.sp-mobile__meta a { font-family: var(--font-mono); font-size: .7rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted-dim); text-decoration: none; padding: 6px 0 }
.sp-mobile__meta a:hover { color: var(--accent-deep) }

/* ── Mobile contact dock -- phones only ── */
.sp-dock { display: none }
@media (max-width: 680px) {
  .sp-dock {
    display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    background: linear-gradient(to top, rgba(255,255,255,.97) 55%, rgba(255,255,255,0));
    transform: translateY(110%); transition: transform .4s var(--ease); pointer-events: none;
  }
  .sp-dock--show { transform: none; pointer-events: auto }
  .sp-dock .sp-btn { box-shadow: 0 14px 30px -12px rgba(85,70,224,.55) }
}
@media (prefers-reduced-motion: reduce) { .sp-dock { transition: none } }

/* ── Main ── */
.sp-main { position: relative; z-index: 1; max-width: 1140px; margin: 0 auto; padding: 0 24px 48px; counter-reset: sp-sec }

/* ── Hero ── */
.sp-hero { position: relative; text-align: center; padding: 112px 0 0; max-width: 820px; margin: 0 auto }
.sp-hero__badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 10px; border: 1px solid var(--accent-deep); border-radius: 0; font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--accent-deep); margin-bottom: 28px }
.sp-hero__h1 { margin: 0; font-family: var(--font-display); font-size: clamp(2.5rem, 5.6vw, 4.4rem); font-weight: 600; line-height: 1.02; letter-spacing: -.04em; color: var(--ink); text-wrap: balance }
.sp-hero__grad { color: var(--accent-deep) }
/* globals.css gives every span the body font at weight 400 with a 1.6
   line-height; inside a heading that splits the line apart. Spans in
   headings take the heading's type instead. */
.sp :is(h1, h2, h3, h4) span { font: inherit; letter-spacing: inherit; line-height: inherit }
.sp-hero__sub { margin: 24px auto 0; max-width: 580px; color: var(--ink-soft); font-size: 1.1rem; line-height: 1.6; text-wrap: pretty }
.sp-hero__actions { margin: 36px auto 0; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap }
.sp-hero__strip { margin: 44px auto 0; font-family: var(--font-mono); color: var(--muted-dim); font-size: .7rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase }

.sp-hero__badge, .sp-hero__h1, .sp-hero__sub, .sp-hero__actions, .sp-hero__strip {
  opacity: 0; animation: sp-hero-in .85s var(--ease) both;
}
.sp-hero__badge { animation-delay: .04s }
.sp-hero__h1 { animation-delay: .1s }
.sp-hero__sub { animation-delay: .2s }
.sp-hero__actions { animation-delay: .3s }
.sp-hero__strip { animation-delay: .4s }
@keyframes sp-hero-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) {
  .sp-hero__badge, .sp-hero__h1, .sp-hero__sub, .sp-hero__actions, .sp-hero__strip { animation: none; opacity: 1 }
}

/* ── Sections: every section kicker is auto-numbered 01, 02, ... in
   accent mono, the way the portal numbers phases and report sections. ── */
.sp-section { padding-top: 152px; scroll-margin-top: 84px }
.sp-section--tight { padding-top: 152px }
.sp-head { text-align: center; max-width: 640px; margin: 0 auto 64px }
.sp-head--left { text-align: left; max-width: 720px; margin: 0 0 36px }
.sp-head h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.75rem, 3.2vw, 2.6rem); font-weight: 600; line-height: 1.1; letter-spacing: -.035em; color: var(--ink); text-wrap: balance }
.sp-head p { margin: 16px auto 0; color: var(--ink-soft); font-size: 1.04rem; line-height: 1.65; max-width: 560px; text-wrap: pretty }
.sp-head--left p { margin-left: 0 }
.sp-tag { display: inline-flex; align-items: baseline; gap: 12px; font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--muted-dim) }
.sp-head .sp-tag::before { counter-increment: sp-sec; content: counter(sp-sec, decimal-leading-zero); color: var(--accent-deep); letter-spacing: .04em }

/* ── Generic card grid: hairline-divided strip, not boxed cards ── */
.sp-cards { display: grid; gap: 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--border) }
.sp-cards--2 { grid-template-columns: repeat(2, 1fr) }
.sp-cards--3 { grid-template-columns: repeat(3, 1fr) }
.sp-cards--4 { grid-template-columns: repeat(2, 1fr) }
.sp-card { position: relative; display: flex; flex-direction: column; padding: 36px 32px; transition: background .3s var(--ease) }
.sp-card:hover { background: var(--surface-alt) }
.sp-cards--2 .sp-card:not(:first-child), .sp-cards--3 .sp-card:not(:first-child) { border-left: 1px solid var(--border) }
.sp-cards--4 .sp-card:nth-child(2n) { border-left: 1px solid var(--border) }
.sp-cards--4 .sp-card:nth-child(n+3) { border-top: 1px solid var(--border) }
.sp-card__icon {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 40px; height: 40px; border-radius: var(--radius);
  background: transparent; border: 1px solid var(--border-strong); color: var(--accent-deep);
}
.sp-card__title { margin: 20px 0 0; font-family: var(--font-display); font-size: 1.12rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink) }
.sp-card__body { margin: 10px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.65; flex: 1 }
.sp-card__link { display: inline-flex; align-items: center; gap: 7px; margin-top: 18px; font-size: .9rem; font-weight: 600; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-card__link:hover { gap: 11px }

/* ── Footnote ── */
.sp-footnote { max-width: 640px; margin: 28px auto 0; text-align: center; color: var(--muted); font-size: .92rem; line-height: 1.65 }
.sp-footnote a { color: var(--accent-deep); font-weight: 600; text-decoration: none; white-space: nowrap }
.sp-footnote a:hover { text-decoration: underline }

/* ── Panel: a square hairline block with an accent rule on top ── */
.sp-panel {
  padding: 52px;
  border: 1px solid var(--border); border-top: 2px solid var(--accent-deep);
  background: var(--surface);
}
.sp-panel h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.5rem, 2.4vw, 2rem); font-weight: 600; line-height: 1.15; letter-spacing: -.03em }
.sp-panel p { margin: 18px 0 0; color: var(--ink-soft); font-size: 1.04rem; line-height: 1.75 }

/* ── Cardless statement block ── */
.sp-statement { max-width: 640px; margin: 0 auto; text-align: center }
.sp-statement h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.75rem, 3.2vw, 2.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -.035em; color: var(--ink) }
.sp-statement p { margin: 18px 0 0; color: var(--ink-soft); font-size: 1.05rem; line-height: 1.75 }
.sp-statement__link { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; font-size: .92rem; font-weight: 600; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-statement__link:hover { gap: 12px }

/* ── Footer ── */
.sp-footer { position: relative; z-index: 1; border-top: 1px solid var(--ink); width: calc(100% - 48px); max-width: 1092px; margin: 168px auto 0; padding: 56px 0 32px }
.sp-footer__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px }
.sp-footer__brand { max-width: 300px }
.sp-footer__brand p { margin: 12px 0 0; color: var(--muted); font-size: .9rem; line-height: 1.65 }
.sp-footer__cta { margin-top: 22px }
.sp-footer__cols { display: flex; gap: 64px }
.sp-footer__col { display: flex; flex-direction: column; gap: 12px }
.sp-footer__col h4 { margin: 0 0 6px; font-family: var(--font-mono); font-size: .66rem; text-transform: uppercase; letter-spacing: .16em; color: var(--muted-dim); font-weight: 700 }
.sp-footer__col a { color: var(--ink-soft); font-size: .88rem; text-decoration: none; transition: color .2s }
.sp-footer__col a:hover { color: var(--accent-deep) }
.sp-footer__bottom { border-top: 1px solid var(--border); margin-top: 40px; padding-top: 20px; display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono); color: var(--muted-dim); font-size: .7rem; letter-spacing: .06em }
.sp-footer__bottom a { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); text-decoration: none; font-weight: 700; transition: color .2s }
.sp-footer__bottom a:hover { color: var(--accent-deep) }

/* ── Responsive ── */
@media (max-width: 940px) {
  .sp-cards--2, .sp-cards--3, .sp-cards--4 { grid-template-columns: 1fr 1fr }
  .sp-cards--2 .sp-card, .sp-cards--3 .sp-card, .sp-cards--4 .sp-card { border-left: none }
  .sp-cards--2 .sp-card:nth-child(2n), .sp-cards--3 .sp-card:nth-child(2n), .sp-cards--4 .sp-card:nth-child(2n) { border-left: 1px solid var(--border) }
  .sp-cards--2 .sp-card:nth-child(n+3), .sp-cards--3 .sp-card:nth-child(n+3), .sp-cards--4 .sp-card:nth-child(n+3) { border-top: 1px solid var(--border) }
  .sp-footer__top { flex-direction: column; gap: 30px }
}
/* Touch devices: no sticky hover lifts after a tap, no grey tap flash. */
.sp a, .sp button { -webkit-tap-highlight-color: transparent }
@media (hover: none) {
  .sp-btn:hover svg { transform: none }
}
@media (max-width: 680px) {
  .sp-main { padding: 0 16px 16px }
  .sp-nav__inner { height: 60px; padding: 0 max(16px, env(safe-area-inset-left)); padding-top: env(safe-area-inset-top); box-sizing: content-box }
  .sp-nav__right .sp-btn { display: none }
  .sp-nav__burger { width: 44px; height: 44px }
  .sp-mobile { padding: calc(90px + env(safe-area-inset-top)) 0 calc(40px + env(safe-area-inset-bottom)) }
  .sp-bg__grid { animation: none; opacity: .7 }
  .sp-hero { padding-top: 64px }
  .sp-hero__badge { margin-bottom: 20px }
  .sp-hero__sub { margin-top: 18px; font-size: 1.04rem }
  .sp-hero__actions { flex-direction: column; margin-top: 28px }
  .sp-hero__actions .sp-btn { width: 100% }
  .sp-section { padding-top: 96px; scroll-margin-top: 76px }
  .sp-section--tight { padding-top: 96px }
  .sp-head { margin-bottom: 36px }
  .sp-cards--2, .sp-cards--3, .sp-cards--4 { grid-template-columns: 1fr }
  .sp-card { padding: 28px 4px; border-left: none !important; border-top: none }
  .sp-card:hover { background: none }
  .sp-card:not(:first-child) { border-top: 1px solid var(--border) }
  .sp-panel { padding: 30px 22px }
  .sp-footer { width: calc(100% - 32px); margin-top: 112px; padding: 44px 0 calc(96px + env(safe-area-inset-bottom)) }
  .sp-footer__brand { max-width: none }
  .sp-footer__cta { width: 100% }
  .sp-footer__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 20px }
  .sp-footer__col a { padding: 4px 0 }
  .sp-footer__bottom { flex-direction: column; align-items: flex-start; gap: 10px }
}
`;
