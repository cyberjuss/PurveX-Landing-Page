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
  { key: "training", label: "Training", href: "/cybersecurity-training" },
  { key: "platform", label: "Platform", href: "/platform" },
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
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDock, setShowDock] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      // Background orbs drift slower than the page scrolls -- written
      // straight to the DOM (not React state) since this fires every
      // scroll frame and a transform doesn't need a re-render to apply.
      // Skipped under reduced-motion, same as every other animation here.
      if (parallaxRef.current && !reduceMotion) {
        parallaxRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.12}px, 0)`;
      }
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
        <div className="sp-bg__grad" />
        <div className="sp-bg__parallax" ref={parallaxRef}>
          <div className="sp-bg__orb sp-bg__orb--1" />
          <div className="sp-bg__orb sp-bg__orb--2" />
        </div>
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
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-nav__book">
              Book <ArrowRight size={14} />
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
          </div>
          <div className="sp-footer__cols">
            <div className="sp-footer__col">
              <h4>Company</h4>
              <Link href="/cybersecurity-training">Cybersecurity Training</Link>
              <Link href="/academy">Academy Portal</Link>
              <Link href="/about">About</Link>
            </div>
            <div className="sp-footer__col">
              <h4>Platform</h4>
              <Link href="/platform">PurveX Platform</Link>
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
   PURVEX — SHARED CHROME (light, single purple accent)
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
  --green: #16a34a;
  --red: #e5484d;
  --radius: 0;
  --font-display: var(--font-space-grotesk), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  /* Premium layer: layered shadows and a hairline top highlight, used by
     every card-like surface so depth reads the same on every page. */
  --shadow-sm: 0 1px 1px rgba(16,25,46,.03), 0 2px 4px -2px rgba(16,25,46,.06);
  --shadow-md: 0 1px 2px rgba(16,25,46,.04), 0 8px 20px -8px rgba(16,25,46,.10), 0 24px 48px -24px rgba(16,25,46,.12);
  --shadow-lg: 0 2px 4px rgba(16,25,46,.04), 0 18px 40px -14px rgba(16,25,46,.16), 0 48px 96px -40px rgba(85,70,224,.22);
  --highlight: inset 0 1px 0 rgba(255,255,255,.9);
  --grad-accent: linear-gradient(135deg, #7b6dff 0%, #5546e0 55%, #4a3bd4 100%);
  --grad-border: linear-gradient(135deg, rgba(123,109,255,.55), rgba(85,70,224,.12) 40%, rgba(16,25,46,.06) 70%, rgba(123,109,255,.35));
  --ease: cubic-bezier(.16,1,.3,1);

  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
}

/* ── Scroll progress -- a soft glow trailing the fill reads more like a
   lit filament than a flat loading bar. ── */
.sp-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 80; background: linear-gradient(90deg, var(--accent), var(--accent-deep)); box-shadow: 0 0 12px 1px rgba(106,92,255,.55); transform-origin: left; transform: scaleX(0); transition: transform .1s linear; pointer-events: none }

/* ── Ambient bg ── */
.sp-bg { display: none }
.sp-bg__grad {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 45% at 50% -8%, rgba(106,92,255,.10), transparent 60%),
    radial-gradient(ellipse 45% 35% at 88% 8%, rgba(106,92,255,.04), transparent 60%);
}
/* Scroll-linked parallax -- the orbs drift at a fraction of scroll speed
   (see SiteChrome's scroll handler), giving the ambient background a
   sense of depth instead of staying glued to the viewport. */
.sp-bg__parallax { position: absolute; inset: 0; will-change: transform }
.sp-bg__orb { position: absolute; border-radius: 50%; filter: blur(70px); animation: sp-float 24s ease-in-out infinite }
.sp-bg__orb--1 { width: 440px; height: 440px; top: -140px; left: 4%; background: radial-gradient(circle, rgba(106,92,255,.30), transparent 70%); animation-duration: 22s }
.sp-bg__orb--2 { width: 380px; height: 380px; top: 6%; right: 4%; background: radial-gradient(circle, rgba(85,70,224,.22), transparent 70%); animation-duration: 28s; animation-delay: -9s }
@keyframes sp-float {
  0%, 100% { transform: translate(0, 0) scale(1) }
  33% { transform: translate(34px, -24px) scale(1.06) }
  66% { transform: translate(-24px, 22px) scale(.96) }
}
@media (prefers-reduced-motion: reduce) { .sp-bg__orb { animation: none } }
.sp-bg__grid {
  position: absolute; inset: 0; opacity: .5;
  background-image:
    linear-gradient(rgba(16,25,46,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16,25,46,.03) 1px, transparent 1px);
  background-size: 76px 76px;
  mask-image: radial-gradient(ellipse 65% 45% at 50% 20%, black, transparent 78%);
}

/* ── Reveal ── */
[data-r] { opacity: 1; transform: none; filter: none }
[data-d="1"] { transition-delay: .05s } [data-d="2"] { transition-delay: .12s } [data-d="3"] { transition-delay: .19s } [data-d="4"] { transition-delay: .26s } [data-d="5"] { transition-delay: .33s }
[data-r].in { opacity: 1; transform: none; filter: blur(0) }

/* Cascading child reveal for card/step grids — the grid itself just becomes visible instantly, its children stagger in one at a time */
.sp-cards[data-r], .sp-process[data-r], .sp-formats[data-r], .sp-arc[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-cards[data-r] > *, .sp-process[data-r] > *, .sp-formats[data-r] > *, .sp-arc[data-r] > * { opacity: 0; transform: translateY(24px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-cards[data-r].in > *, .sp-process[data-r].in > *, .sp-formats[data-r].in > *, .sp-arc[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-cards[data-r] > *:nth-child(1), .sp-process[data-r] > *:nth-child(1), .sp-formats[data-r] > *:nth-child(1), .sp-arc[data-r] > *:nth-child(1) { transition-delay: .03s }
.sp-cards[data-r] > *:nth-child(2), .sp-process[data-r] > *:nth-child(2), .sp-formats[data-r] > *:nth-child(2), .sp-arc[data-r] > *:nth-child(2) { transition-delay: .1s }
.sp-cards[data-r] > *:nth-child(3), .sp-process[data-r] > *:nth-child(3), .sp-formats[data-r] > *:nth-child(3), .sp-arc[data-r] > *:nth-child(3) { transition-delay: .17s }
.sp-cards[data-r] > *:nth-child(4), .sp-process[data-r] > *:nth-child(4), .sp-formats[data-r] > *:nth-child(4), .sp-arc[data-r] > *:nth-child(4) { transition-delay: .24s }

@media (prefers-reduced-motion: reduce) {
  [data-r], .sp-cards[data-r] > *, .sp-process[data-r] > *, .sp-formats[data-r] > *, .sp-arc[data-r] > * { opacity: 1; transform: none; filter: none; transition: none }
}

/* ── Nav — flush bar aligned with the page, not a floating capsule. ── */
.sp-nav {
  position: sticky; top: 0; z-index: 50; padding: 0;
  background: rgba(251,252,254,.62);
  backdrop-filter: blur(16px) saturate(1.3); -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border-bottom: 1px solid transparent;
  transition: background .3s var(--ease), border-color .3s var(--ease);
}
.sp-nav--s {
  background: rgba(251,252,254,.92);
  border-bottom-color: rgba(106,92,255,.16);
}
.sp-nav__inner {
  max-width: 1140px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;
  height: 64px; padding: 0 24px; background: none; border: 0; box-shadow: none;
}
.sp-logo { display: inline-flex; align-items: center; gap: 9px; justify-self: start; font-family: var(--font-display); font-weight: 650; font-size: 1.2rem; color: var(--ink); text-decoration: none; letter-spacing: -.015em }
.sp-logo__img { border-radius: 8px }
.sp-nav .sp-logo { font-size: 1.05rem; gap: 8px }
.sp-nav__right { display: flex; align-items: center; gap: 8px; justify-self: end }
.sp-nav__burger { display: flex; align-items: center; justify-content: center; background: none; border: 0; color: var(--ink); cursor: pointer; padding: 6px; margin-right: -6px }
.sp-nav__book {
  display: none; align-items: center; gap: 6px; height: 44px; padding: 0 16px;
  border: 1px solid rgba(106,92,255,.35); color: var(--accent-deep);
  font-size: .88rem; font-weight: 650; text-decoration: none; letter-spacing: 0;
  transition: background .2s var(--ease), border-color .2s var(--ease);
}
.sp-nav__book:hover { background: var(--accent-soft); border-color: var(--accent) }
.sp-nav__book:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px }

.sp-nav__links { display: none }
@media (min-width: 940px) {
  .sp-nav__inner { display: grid; grid-template-columns: auto 1fr auto; gap: 28px }
  .sp-nav__links { display: flex; align-items: stretch; justify-content: flex-end; gap: 2px }
  .sp-nav__book { display: inline-flex }
  .sp-nav__burger { display: none }
}
.sp-nav__link {
  position: relative; display: inline-flex; align-items: center; height: 64px; padding: 0 13px;
  font-size: .92rem; font-weight: 600; letter-spacing: 0; text-transform: none;
  color: var(--ink-soft); text-decoration: none;
  transition: color .2s var(--ease);
}
.sp-nav__link::after {
  content: ""; position: absolute; left: 13px; right: 13px; bottom: 0; height: 2px;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform .25s var(--ease);
}
.sp-nav__link:hover, .sp-nav__link:focus-visible { color: var(--ink) }
.sp-nav__link:hover::after, .sp-nav__link:focus-visible::after { transform: scaleX(1) }
.sp-nav__link--active { color: var(--accent-deep); background: none }
.sp-nav__link--active::after { transform: scaleX(1) }

/* ── Buttons ── */
.sp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 0; border-radius: 11px; font-weight: 620; font-size: .88rem; text-decoration: none; cursor: pointer; white-space: nowrap; transition: transform .25s var(--ease), background .25s, box-shadow .25s, border-color .25s, color .25s; outline: none }
.sp-btn:active { transform: scale(.98); transition-duration: .05s }
.sp-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(85,70,224,.35) }
.sp-btn:disabled { opacity: .7; cursor: default }
.sp-btn--sm { height: 40px; padding: 0 18px; font-size: .85rem }
.sp-btn--lg { height: 50px; padding: 0 24px; font-size: .92rem }
.sp-btn--full { width: 100% }
.sp-btn--prim { position: relative; overflow: hidden; background: var(--accent-deep); color: #fff; box-shadow: none }
.sp-btn--prim::after { content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,.35), transparent); transform: translateX(0) skewX(-20deg); transition: transform .6s var(--ease) }
.sp-btn--prim:hover { background: var(--accent); transform: translateY(-1px) }
.sp-btn--prim:hover::after { transform: translateX(475%) skewX(-20deg) }
@media (prefers-reduced-motion: reduce) { .sp-btn--prim::after { display: none } }
.sp-btn--ghost { background: var(--surface); color: var(--ink); border: 1px solid var(--border-strong); box-shadow: 0 1px 2px rgba(16,25,46,.03) }
.sp-btn--ghost:hover { border-color: var(--accent); color: var(--accent-deep); transform: translateY(-2px) }

/* ── Mobile overlay ── */
.sp-mobile { position: fixed; inset: 0; z-index: 45; background: radial-gradient(72% 55% at 50% 32%, rgba(106,92,255,.08), transparent 70%), rgba(251,252,254,.98); backdrop-filter: blur(26px) saturate(1.25); -webkit-backdrop-filter: blur(26px) saturate(1.25); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .35s ease; overflow-y: auto; padding: 90px 0 40px }
.sp-mobile--open { opacity: 1; pointer-events: auto }
.sp-mobile__nav { display: flex; flex-direction: column; align-items: stretch; gap: 2px; width: min(88vw, 440px); margin: auto; text-align: left; counter-reset: navitem }
.sp-mobile__group { opacity: 0; animation: sp-menu-in .55s var(--ease) both; border-bottom: 1px solid var(--border) }
.sp-mobile__toplink { position: relative; display: block; counter-increment: navitem; font-family: var(--font-display); font-size: clamp(1.5rem, 6.4vw, 1.9rem); font-weight: 700; letter-spacing: -.02em; color: var(--ink); text-decoration: none; padding: 14px 0; transition: color .25s var(--ease) }
.sp-mobile__toplink::before { content: "0" counter(navitem); font-family: var(--font-mono); font-size: .72rem; font-weight: 500; color: var(--accent); margin-right: 12px; vertical-align: 5px }
.sp-mobile__toplink:hover { color: var(--accent-deep) }
.sp-mobile__toplink--active { color: var(--accent-deep) }
.sp-mobile__toplink--active::before { color: var(--accent-deep) }
.sp-mobile__nav .sp-btn { margin: 28px 0 0; width: 100% }
@keyframes sp-menu-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .sp-mobile__group { animation: none; opacity: 1 } }

/* Secondary links under the menu CTA -- small, so the primary list stays
   the focus, but reachable without scrolling to the footer. */
.sp-mobile__meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 22px; margin-top: 22px }
.sp-mobile__meta a { font-size: .86rem; font-weight: 550; color: var(--muted); text-decoration: none; padding: 6px 0 }
.sp-mobile__meta a:hover { color: var(--accent-deep) }

/* ── Mobile contact dock -- phones only (the nav CTA is hidden there).
   Sits above the home indicator via safe-area insets. ── */
.sp-dock { display: none }
@media (max-width: 680px) {
  .sp-dock {
    display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    background: linear-gradient(to top, rgba(251,252,254,.96) 55%, rgba(251,252,254,0));
    transform: translateY(110%); transition: transform .4s var(--ease); pointer-events: none;
  }
  .sp-dock--show { transform: none; pointer-events: auto }
  .sp-dock .sp-btn { box-shadow: 0 14px 30px -12px rgba(85,70,224,.55) }
}
@media (prefers-reduced-motion: reduce) { .sp-dock { transition: none } }

/* ── Main ── */
.sp-main { position: relative; z-index: 1; max-width: 1140px; margin: 0 auto; padding: 0 24px 48px }

/* ── Hero ── */
.sp-hero { position: relative; text-align: center; padding: 116px 0 0; max-width: 760px; margin: 0 auto }
.sp-hero__badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 15px; border-radius: 999px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.2); font-size: .74rem; font-weight: 600; color: var(--accent-deep); letter-spacing: .01em; margin-bottom: 26px }
.sp-hero__h1 { margin: 0; font-family: var(--font-display); font-size: clamp(2.3rem, 4.8vw, 3.75rem); font-weight: 700; line-height: 1.1; letter-spacing: -.03em; color: var(--ink); text-wrap: balance }
.sp-hero__grad { color: var(--accent-deep) }
.sp-hero__sub { margin: 24px auto 0; max-width: 600px; color: var(--ink-soft); font-size: 1.125rem; line-height: 1.65; text-wrap: pretty }
.sp-hero__actions { margin: 38px auto 0; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap }
.sp-hero__strip { margin: 44px auto 0; color: var(--muted); font-size: .88rem; font-weight: 500; font-style: italic; letter-spacing: .01em }

/* Hero text load-in -- above the fold, so this plays on paint rather than
   waiting on the scroll-triggered [data-r] system below. Each line
   arrives slightly after the last so the hero reads as a sequence, not a
   single flat pop. Scoped to these exact classes (used by every page's
   .sp-hero) rather than .sp-hero__preview, which already reveals itself
   correctly via [data-r]/IntersectionObserver and would double-animate. */
.sp-hero__badge, .sp-hero__h1, .sp-hero__sub, .sp-hero__actions, .sp-hero__strip {
  opacity: 0; animation: sp-hero-in .85s var(--ease) both;
}
.sp-hero__badge { animation-delay: .04s }
.sp-hero__h1 { animation-delay: .12s }
.sp-hero__sub { animation-delay: .24s }
.sp-hero__actions { animation-delay: .36s }
.sp-hero__strip { animation-delay: .46s }
@keyframes sp-hero-in { from { opacity: 0; transform: translateY(16px); filter: blur(6px) } to { opacity: 1; transform: none; filter: blur(0) } }
@media (prefers-reduced-motion: reduce) {
  .sp-hero__badge, .sp-hero__h1, .sp-hero__sub, .sp-hero__actions, .sp-hero__strip { animation: none; opacity: 1 }
}

/* ── Sections ── */
.sp-section { padding-top: 184px; scroll-margin-top: 84px }
.sp-section--tight { padding-top: 184px }
.sp-head { text-align: center; max-width: 620px; margin: 0 auto 72px }
.sp-head--left { text-align: left; max-width: 720px; margin: 0 0 32px }
.sp-head h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.6rem, 2.9vw, 2.25rem); font-weight: 700; line-height: 1.2; letter-spacing: -.02em; color: var(--ink) }
.sp-head p { margin: 18px auto 0; color: var(--muted); font-size: 1.05rem; line-height: 1.7; max-width: 560px; text-wrap: pretty }
.sp-head--left p { margin-left: 0 }
.sp-tag { display: inline-block; font-size: .74rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }

/* ── Generic card grid (services / features): divided strip, not boxed cards ── */
.sp-cards { display: grid; gap: 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.sp-cards--2 { grid-template-columns: repeat(2, 1fr) }
.sp-cards--3 { grid-template-columns: repeat(3, 1fr) }
.sp-cards--4 { grid-template-columns: repeat(2, 1fr) }
.sp-card {
  position: relative; display: flex; flex-direction: column; padding: 36px 32px;
}
.sp-cards--2 .sp-card:not(:first-child), .sp-cards--3 .sp-card:not(:first-child) { border-left: 1px solid var(--border) }
.sp-cards--4 .sp-card:nth-child(2n) { border-left: 1px solid var(--border) }
.sp-cards--4 .sp-card:nth-child(n+3) { border-top: 1px solid var(--border) }
.sp-card__icon {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep);
}
.sp-card__title { margin: 18px 0 0; font-family: var(--font-display); font-size: 1.04rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-card__body { margin: 10px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.65; flex: 1 }
.sp-card__link { display: inline-flex; align-items: center; gap: 7px; margin-top: 18px; font-size: .9rem; font-weight: 600; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-card__link:hover { gap: 11px }

/* ── Footnote (cross-page callouts) ── */
.sp-footnote { max-width: 640px; margin: 28px auto 0; text-align: center; color: var(--muted); font-size: .92rem; line-height: 1.65 }
.sp-footnote a { color: var(--accent-deep); font-weight: 600; text-decoration: none; white-space: nowrap }
.sp-footnote a:hover { text-decoration: underline }

/* ── Simple panel (About / teasers) ── */
.sp-panel {
  --cut: 30px;
  padding: 52px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: radial-gradient(120% 130% at 0% 0%, rgba(106,92,255,.08), transparent 55%), var(--surface);
  filter: drop-shadow(0 16px 32px rgba(16,25,46,.12));
  transition: filter .3s;
}
.sp-panel:hover { filter: drop-shadow(0 22px 42px rgba(16,25,46,.16)) }
.sp-panel h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.5rem, 2.4vw, 1.95rem); font-weight: 700; line-height: 1.22; letter-spacing: -.02em }
.sp-panel p { margin: 18px 0 0; color: var(--ink-soft); font-size: 1.05rem; line-height: 1.75 }
.sp-panel p:first-of-type { margin-top: 18px }

/* ── Cardless statement block — no box at all, just content ── */
.sp-statement { max-width: 620px; margin: 0 auto; text-align: center }
.sp-statement h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.6rem, 2.9vw, 2.1rem); font-weight: 700; line-height: 1.25; letter-spacing: -.02em; color: var(--ink) }
.sp-statement p { margin: 16px 0 0; color: var(--ink-soft); font-size: 1.05rem; line-height: 1.75 }
.sp-statement__link { display: inline-flex; align-items: center; gap: 8px; margin-top: 20px; font-size: .92rem; font-weight: 650; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-statement__link:hover { gap: 12px }

/* ── Footer ── */
.sp-footer { border-top: 1px solid var(--border); max-width: 1140px; margin: 184px auto 0; padding: 56px 24px 32px }
.sp-footer__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px }
.sp-footer__brand { max-width: 280px }
.sp-footer__brand p { margin: 12px 0 0; color: var(--muted); font-size: .89rem; line-height: 1.65 }
.sp-footer__cols { display: flex; gap: 56px }
.sp-footer__col { display: flex; flex-direction: column; gap: 12px }
.sp-footer__col h4 { margin: 0 0 4px; font-size: .68rem; text-transform: uppercase; letter-spacing: .1em; color: var(--muted-dim); font-weight: 600 }
.sp-footer__col a { color: var(--muted); font-size: .87rem; text-decoration: none; transition: color .2s }
.sp-footer__col a:hover { color: var(--accent-deep) }
.sp-footer__bottom { border-top: 1px solid var(--border); margin-top: 32px; padding-top: 20px; display: flex; align-items: center; justify-content: space-between; color: var(--muted-dim); font-size: .8rem }
.sp-footer__bottom a { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); text-decoration: none; font-weight: 600; transition: color .2s }
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
  .sp-btn--prim:hover, .sp-btn--ghost:hover { transform: none }
}
@media (max-width: 680px) {
  .sp-main { padding: 0 16px 16px }
  .sp-nav { top: max(10px, env(safe-area-inset-top)); padding: 0 max(10px, env(safe-area-inset-left)) }
  .sp-nav__inner { height: 58px; padding: 0 6px 0 16px }
  .sp-nav__burger { width: 44px; height: 44px; margin-right: 0 }
  .sp-mobile { padding: calc(90px + env(safe-area-inset-top)) 0 calc(40px + env(safe-area-inset-bottom)) }
  /* Big blurred orbs are the most expensive paint on the page; phones get
     a still background and no scroll parallax. */
  .sp-bg__orb { animation: none; filter: blur(50px) }
  .sp-bg__parallax { transform: none !important }
  .sp-nav__right .sp-btn { display: none }
  .sp-hero { padding-top: 56px }
  .sp-hero__badge { margin-bottom: 18px }
  .sp-hero__sub { margin-top: 18px }
  .sp-hero__actions { flex-direction: column; margin-top: 28px }
  .sp-hero__actions .sp-btn { width: 100% }
  .sp-section { padding-top: 96px; scroll-margin-top: 76px }
  .sp-section--tight { padding-top: 96px }
  .sp-head { margin-bottom: 40px }
  .sp-cards--2, .sp-cards--3, .sp-cards--4 { grid-template-columns: 1fr }
  .sp-card { padding: 28px 24px; border-left: none !important; border-top: none }
  .sp-card:not(:first-child) { border-top: 1px solid var(--border) }
  .sp-panel { padding: 32px; --cut: 22px }
  .sp-footer { margin-top: 112px; padding: 44px 16px calc(96px + env(safe-area-inset-bottom)) }
  .sp-footer__brand { max-width: none }
  .sp-footer__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 20px }
  .sp-footer__col a { padding: 4px 0 }
  .sp-footer__bottom { flex-direction: column; align-items: flex-start; gap: 10px }
}

/* ═══════════════════════════════════════════════
   PREMIUM LAYER
   Same rounded, soft-purple site -- refined. Loaded last so it can
   lift shared components and each page's own surfaces consistently:
   layered depth, gradient hairlines, a lit primary button, a glass
   nav, tighter display type, and a whisper of film grain.
   ═══════════════════════════════════════════════ */

/* Film grain over the ambient background: breaks up flat gradients the
   way print does, so large soft areas read as material, not screen. */
.sp-bg::after {
  content: ""; position: absolute; inset: 0; opacity: .035; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

/* globals.css gives every span the body font at weight 400 with a 1.6
   line-height; inside a heading that breaks two-tone headlines apart. */
.sp :is(h1, h2, h3, h4) span { font: inherit; letter-spacing: inherit; line-height: inherit }

/* ── Type ── */
.sp-hero__h1 { font-weight: 750; letter-spacing: -.045em; line-height: 1.02; font-size: clamp(2.5rem, 5.6vw, 4.4rem);
  background: linear-gradient(180deg, #10192e 30%, #2a2f5c 100%); -webkit-background-clip: text; background-clip: text; color: transparent }
.sp-hero__grad { background: var(--grad-accent); -webkit-background-clip: text; background-clip: text; color: transparent }
.sp-hero__sub { color: var(--ink-soft); font-size: 1.14rem; line-height: 1.62 }
.sp-head h2, .sp-statement h2, .sp-panel h2, .sp-zigzag__text h2 { font-weight: 720; letter-spacing: -.035em; line-height: 1.1 }
.sp-head h2 { font-size: clamp(1.8rem, 3.3vw, 2.65rem) }
.sp-head p, .sp-statement p { color: var(--ink-soft) }

/* Eyebrows become a small pill with a lit dot, everywhere. */
.sp-tag, .sp-hero__badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px 6px 10px; border-radius: 999px;
  background: linear-gradient(180deg, #fff, #f6f5ff); border: 1px solid rgba(106,92,255,.2);
  box-shadow: var(--highlight), 0 1px 2px rgba(85,70,224,.08);
  font-size: .7rem; font-weight: 650; letter-spacing: .09em; text-transform: uppercase; color: var(--accent-deep)
}
.sp-tag::before, .sp-hero__badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--grad-accent); box-shadow: 0 0 0 3px rgba(106,92,255,.14); flex-shrink: 0 }
.sp-hero__badge { margin-bottom: 26px }
/* In flex columns (offer cards, heroes) the pill hugs its text instead of stretching. */
.sp-tag, .sp-hero__badge { align-self: flex-start; width: fit-content }
.sp-head .sp-tag, .sp-statement .sp-tag, .sp-hero .sp-hero__badge { align-self: auto }

/* ── Buttons: a lit gradient primary with an inner top highlight ── */
.sp-btn { border-radius: 12px; letter-spacing: -.005em }
.sp-btn--prim {
  background: var(--grad-accent); color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.28), inset 0 -1px 0 rgba(0,0,0,.12), 0 1px 2px rgba(85,70,224,.3), 0 10px 24px -10px rgba(85,70,224,.65);
}
.sp-btn--prim:hover { background: var(--grad-accent); filter: brightness(1.06); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 0 rgba(0,0,0,.12), 0 2px 4px rgba(85,70,224,.3), 0 16px 32px -12px rgba(85,70,224,.75) }
.sp-btn--ghost { background: linear-gradient(180deg, #fff, #fafbff); border: 1px solid var(--border-strong); box-shadow: var(--highlight), var(--shadow-sm) }
.sp-btn--ghost:hover { border-color: rgba(106,92,255,.45); color: var(--accent-deep); box-shadow: var(--highlight), 0 8px 20px -10px rgba(85,70,224,.35) }
.sp-btn svg { transition: transform .25s var(--ease) }
.sp-btn:hover svg { transform: translateX(2px) }

/* ── Nav: the flush bar above is the nav; the premium layer leaves it alone ── */
.sp-logo { font-weight: 700; letter-spacing: -.03em }

/* ── Surfaces: every card-like block shares one depth recipe ── */
.sp-problem, .sp-offer, .sp-feature-quote, .sp-panel, .sp-tile, .sp-founder-page__facts, .sp-console, .sp-faq {
  background: linear-gradient(180deg, #fff, #fcfcff);
  box-shadow: var(--highlight), var(--shadow-md);
  transition: transform .45s var(--ease), box-shadow .45s var(--ease), border-color .45s var(--ease);
}
.sp-problem:hover, .sp-offer:hover, .sp-tile:hover {
  transform: translateY(-4px); background: linear-gradient(180deg, #fff, #fcfcff);
  border-color: rgba(106,92,255,.3); box-shadow: var(--highlight), var(--shadow-lg);
}
/* PurveX Labs bento: rounded tiles; the accent tile keeps its own fill. */
.sp-tile { border-radius: 0 }
.sp-tile--accent, .sp-tile--accent:hover { background: radial-gradient(120% 140% at 0% 0%, #7b6dff 0%, #5546e0 50%, #2b2280 100%); border-color: transparent; box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 24px 48px -24px rgba(85,70,224,.7) }
.sp-panel { clip-path: none; filter: none; border-radius: 0; border: 1px solid var(--border) }
.sp-panel:hover { filter: none }
.sp-console { border: 1px solid var(--border); border-radius: 0; overflow: hidden }

/* Icon holders: a soft gradient tile with an inner edge instead of a flat circle */
.sp-card__icon, .sp-problem__icon, .sp-offer__panel, .sp-tile__icon, .sp-console__icon, .sp-mag__point-icon, .sp-format__icon, .sp-step__icon, .sp-rung__icon, .sp-versus__icon {
  border-radius: 12px !important;
  background: linear-gradient(145deg, #ffffff, #efedff) !important;
  border: 1px solid rgba(106,92,255,.2) !important;
  box-shadow: var(--highlight), 0 6px 14px -8px rgba(85,70,224,.45) !important;
  color: var(--accent-deep) !important;
}
.sp-problem:hover .sp-problem__icon, .sp-offer:hover .sp-offer__panel, .sp-format:hover .sp-format__icon, .sp-step:hover .sp-step__icon {
  background: var(--grad-accent) !important; color: #fff !important; border-color: transparent !important; transform: none;
}

/* Divided strips (cards grid) get a gradient hairline top and bottom */
.sp-cards { border: 0; position: relative }
.sp-cards::before, .sp-cards::after { content: ""; position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--border-strong) 15%, var(--border-strong) 85%, transparent) }
.sp-cards::before { top: 0 } .sp-cards::after { bottom: 0 }

/* ── Footer: a gradient hairline and a quieter, more considered block ── */
.sp-footer { border-top: 0; position: relative }
.sp-footer::before { content: ""; position: absolute; top: 0; left: 24px; right: 24px; height: 1px; background: linear-gradient(90deg, transparent, rgba(106,92,255,.35), var(--border-strong) 50%, transparent) }
.sp-footer__col h4 { letter-spacing: .12em }

/* Scroll progress: thinner, still lit */
.sp-progress { height: 2px }

@media (hover: none) {
  .sp-problem:hover, .sp-offer:hover, .sp-tile:hover { transform: none }
}
@media (max-width: 680px) {
  .sp-hero__h1 { font-size: clamp(2.3rem, 10vw, 2.9rem) }
  .sp-footer::before { left: 16px; right: 16px }
}

/* ═══════════════════════════════════════════════
   ONE BUTTON STYLE
   Square corners, a lavender hairline, a bold purple label, and a soft
   fill on hover. Matches the nav Book button. On dark bands the same
   shape turns white. Prefixed with .sp so it wins over page styles.
   ═══════════════════════════════════════════════ */
.sp .sp-btn, .sp .pg-close__book, .sp .hp-close__book, .sp .hp-perk__go, .sp .hold button {
  min-height: 44px; border-radius: 0; border: 1px solid rgba(106,92,255,.4); background: rgba(255,255,255,.55);
  color: var(--accent-deep); font-weight: 650; letter-spacing: 0; box-shadow: none; filter: none; cursor: pointer;
  transition: background .2s var(--ease), border-color .2s var(--ease);
}
.sp .sp-btn::after { display: none }
.sp .sp-btn--ghost { border-color: rgba(106,92,255,.22) }
.sp .sp-btn:hover, .sp .pg-close__book:hover, .sp .hp-close__book:hover, .sp .hp-perk__go:hover, .sp .hold button:hover {
  background: var(--accent-soft); border-color: var(--accent); color: var(--accent-deep); box-shadow: none; filter: none; transform: none;
}
.sp .sp-btn:focus-visible, .sp .pg-close__book:focus-visible, .sp .hp-close__book:focus-visible, .sp .hp-perk__go:focus-visible, .sp .hold button:focus-visible, .sp a:focus-visible {
  outline: 3px solid var(--accent); outline-offset: 3px;
}
.sp .hold button { height: 44px; padding: 0 16px; margin-top: 16px }

/* Eyebrows: small text with a short rule instead of a pill. */
.sp .sp-tag, .sp .sp-hero__badge {
  display: inline-flex; align-items: center; gap: 10px; padding: 0; border: 0; border-radius: 0; background: none; box-shadow: none;
  font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--accent-deep);
}
.sp .sp-tag::before, .sp .sp-hero__badge::before { content: ""; width: 22px; height: 2px; border-radius: 0; background: var(--accent); box-shadow: none; flex-shrink: 0 }
.sp .pg-dark__kicker, .sp .hp-perk__kicker {
  display: inline-flex; align-items: center; gap: 10px; padding: 0; border: 0; border-radius: 0; background: none;
  font-size: .78rem; font-weight: 650; letter-spacing: 0; text-transform: none; color: var(--accent-deep);
}
.sp .sp-hero__badge, .sp .sp-hero__h1, .sp .sp-hero__sub, .sp .sp-hero__actions, .sp .sp-hero__strip {
  animation: none; opacity: 1; filter: none;
}
`;
