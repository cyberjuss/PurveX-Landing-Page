"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FlaskConical,
  GraduationCap,
  Layers,
  Linkedin,
  Menu,
  Radar,
  ShieldCheck,
  Sliders,
  Swords,
  Target,
  Users,
  Waypoints,
  X,
} from "lucide-react";

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

export type NavKey = "home" | "security-operations" | "training" | "about" | "platform";

type NavSubItem = {
  label: string;
  desc: string;
  anchor: string;
  icon: typeof ShieldCheck;
};

type NavMenu = {
  key: NavKey;
  label: string;
  href: string;
  icon: typeof ShieldCheck;
  blurb: string;
  cta: string;
  items: NavSubItem[];
};

const NAV_MENUS: NavMenu[] = [
  {
    key: "security-operations",
    label: "Security Operations",
    href: "/security-operations",
    icon: ShieldCheck,
    blurb: "Strengthen how you detect and respond to threats.",
    cta: "Explore Security Operations",
    items: [
      { label: "SIEM & Detection Engineering", desc: "Build detections around your environment.", anchor: "#siem-detection-engineering", icon: Waypoints },
      { label: "SIEM Optimization", desc: "Reduce noise, improve alert quality.", anchor: "#siem-optimization", icon: Sliders },
      { label: "Security Operations Assessment", desc: "Evaluate visibility and workflows.", anchor: "#assessment", icon: Target },
      { label: "Detection Validation", desc: "Test controls with real simulations.", anchor: "#detection-validation", icon: Radar },
    ],
  },
  {
    key: "training",
    label: "Cybersecurity Training",
    href: "/cybersecurity-training",
    icon: GraduationCap,
    blurb: "Develop practical, job-ready cybersecurity talent.",
    cta: "Explore Cybersecurity Training",
    items: [
      { label: "Cybersecurity Instruction", desc: "Instructor support for SOC & SIEM programs.", anchor: "#instruction", icon: GraduationCap },
      { label: "Hands-On Security Labs", desc: "Practical alert and threat investigation.", anchor: "#labs", icon: FlaskConical },
      { label: "Curriculum Support", desc: "Build or improve your training content.", anchor: "#curriculum", icon: Layers },
    ],
  },
  {
    key: "about",
    label: "About",
    href: "/about",
    icon: Users,
    blurb: "Who PurveX is, and what we are building next.",
    cta: "About PurveX",
    items: [
      { label: "How We Think", desc: "Blue team, red team, one discipline.", anchor: "#how-we-think", icon: Swords },
      { label: "Who We Are", desc: "Work directly with the practitioner.", anchor: "#who-we-are", icon: Users },
      { label: "PurveX Labs", desc: "What we are building next.", anchor: "#purvex-labs", icon: Radar },
    ],
  },
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
  const [openMenu, setOpenMenu] = useState<NavKey | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<NavKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 32);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    };
  }, []);

  // Cursor-reactive tilt on cards — skipped entirely under reduced-motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = pageRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".sp-card"));
    const onMove = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--tiltX", `${(-py * 6).toFixed(2)}deg`);
      el.style.setProperty("--tiltY", `${(px * 8).toFixed(2)}deg`);
      el.style.setProperty("--tiltLift", "-6px");
    };
    const onLeave = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.setProperty("--tiltX", "0deg");
      el.style.setProperty("--tiltY", "0deg");
      el.style.setProperty("--tiltLift", "0px");
    };
    targets.forEach((el) => {
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    });
    return () => {
      targets.forEach((el) => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
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
    if (!openMenu) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const clickFn = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".sp-navitem")) setOpenMenu(null);
    };
    window.addEventListener("keydown", fn);
    document.addEventListener("click", clickFn);
    return () => {
      window.removeEventListener("keydown", fn);
      document.removeEventListener("click", clickFn);
    };
  }, [openMenu]);

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
    setOpenMobileGroup(null);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <div className="sp" ref={pageRef}>
      <div className="sp-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />
      <div className="sp-bg" aria-hidden>
        <div className="sp-bg__grad" />
        <div className="sp-bg__orb sp-bg__orb--1" />
        <div className="sp-bg__orb sp-bg__orb--2" />
        <div className="sp-bg__grid" />
      </div>

      <header className={`sp-nav${scrolled ? " sp-nav--s" : ""}`}>
        <div className="sp-nav__inner">
          <Link href="/" className="sp-logo">
            <Image src="/logo.png" alt="PurveX" width={40} height={40} className="sp-logo__img" />
            <span>PurveX</span>
          </Link>
          <nav className="sp-nav__links">
            {NAV_MENUS.map((menu) => (
              <div
                key={menu.key}
                className="sp-navitem"
                onMouseEnter={() => {
                  cancelClose();
                  setOpenMenu(menu.key);
                }}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={menu.href}
                  className={`sp-navitem__link${active === menu.key ? " sp-nav__link--active" : ""}`}
                  onClick={() => setOpenMenu(null)}
                >
                  {menu.label}
                </Link>
                <button
                  type="button"
                  className={`sp-navitem__chev${openMenu === menu.key ? " sp-navitem__chev--open" : ""}`}
                  aria-label={`${menu.label} menu`}
                  aria-expanded={openMenu === menu.key}
                  onClick={() => setOpenMenu(openMenu === menu.key ? null : menu.key)}
                >
                  <ChevronDown size={13} />
                </button>

                <div className={`sp-megamenu${openMenu === menu.key ? " sp-megamenu--open" : ""}`}>
                  <div className="sp-megamenu__head">
                    <div className="sp-megamenu__icon">
                      <menu.icon size={17} />
                    </div>
                    <p>{menu.blurb}</p>
                  </div>
                  <div className="sp-megamenu__list">
                    {menu.items.map((item) => (
                      <Link
                        key={item.label}
                        href={`${menu.href}${item.anchor}`}
                        className="sp-megamenu__item"
                        onClick={() => setOpenMenu(null)}
                      >
                        <item.icon size={15} />
                        <span>
                          <strong>{item.label}</strong>
                          <em>{item.desc}</em>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link href={menu.href} className="sp-megamenu__cta" onClick={() => setOpenMenu(null)}>
                    {menu.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </nav>
          <div className="sp-nav__right">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--sm">
              Get in Touch
            </a>
            <button className="sp-nav__burger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`sp-mobile${mobileOpen ? " sp-mobile--open" : ""}`} onClick={closeNav}>
        <nav className="sp-mobile__nav" onClick={(e) => e.stopPropagation()}>
          {NAV_MENUS.map((menu, i) => (
            <div key={menu.key} className="sp-mobile__group" style={{ animationDelay: `${0.06 + i * 0.06}s` }}>
              <div className="sp-mobile__row">
                <Link href={menu.href} onClick={closeNav} className="sp-mobile__toplink">
                  {menu.label}
                </Link>
                <button
                  type="button"
                  className={`sp-mobile__chev${openMobileGroup === menu.key ? " sp-mobile__chev--open" : ""}`}
                  aria-label={`Expand ${menu.label}`}
                  onClick={() => setOpenMobileGroup(openMobileGroup === menu.key ? null : menu.key)}
                >
                  <ChevronDown size={20} />
                </button>
              </div>
              <div className={`sp-mobile__sub${openMobileGroup === menu.key ? " sp-mobile__sub--open" : ""}`}>
                {menu.items.map((item) => (
                  <Link key={item.label} href={`${menu.href}${item.anchor}`} onClick={closeNav} className="sp-mobile__sublink">
                    {item.label}
                  </Link>
                ))}
              </div>
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
        </nav>
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
              <Link href="/security-operations">Security Operations</Link>
              <Link href="/cybersecurity-training">Cybersecurity Training</Link>
              <Link href="/about">About</Link>
            </div>
            <div className="sp-footer__col">
              <h4>Platform</h4>
              <a href="/platform" target="_blank" rel="noreferrer">PurveX Labs</a>
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
  --radius: 16px;
  --font-display: var(--font-inter), system-ui, sans-serif;
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

/* ── Scroll progress ── */
.sp-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 80; background: linear-gradient(90deg, var(--accent), var(--accent-deep)); transform-origin: left; transform: scaleX(0); transition: transform .1s linear; pointer-events: none }

/* ── Ambient bg ── */
.sp-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden }
.sp-bg__grad {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 45% at 50% -8%, rgba(106,92,255,.10), transparent 60%),
    radial-gradient(ellipse 45% 35% at 88% 8%, rgba(106,92,255,.04), transparent 60%);
}
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
[data-r] { opacity: 0; transform: translateY(26px) scale(.985); filter: blur(5px); transition: opacity .8s var(--ease), transform .8s var(--ease), filter .8s var(--ease); will-change: opacity, transform, filter }
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

/* ── Nav ── */
.sp-nav { position: sticky; top: 0; z-index: 50; padding: 0 24px; transition: background .35s, backdrop-filter .35s, box-shadow .35s, border-color .35s; border-bottom: 1px solid transparent }
.sp-nav--s { background: rgba(251,252,254,.82); backdrop-filter: blur(14px) saturate(1.3); -webkit-backdrop-filter: blur(14px) saturate(1.3); border-bottom: 1px solid var(--border) }
.sp-nav__inner { max-width: 1140px; margin: 0 auto; display: grid; grid-template-columns: auto 1fr auto; align-items: center; height: 66px }
.sp-logo { display: inline-flex; align-items: center; gap: 9px; justify-self: start; font-family: var(--font-display); font-weight: 650; font-size: 1.2rem; color: var(--ink); text-decoration: none; letter-spacing: -.015em }
.sp-logo__img { border-radius: 8px }
.sp-nav .sp-logo { font-size: 1.3rem; gap: 10px }
.sp-nav__links { display: flex; gap: 6px; justify-self: center }
.sp-nav__link--active { color: var(--ink) !important }
.sp-nav__right { display: flex; align-items: center; gap: 10px; justify-self: end }
.sp-nav__burger { display: none; align-items: center; justify-content: center; background: none; border: 0; color: var(--ink); cursor: pointer; padding: 6px; margin-right: -6px }

/* ── Mega menu ── */
.sp-navitem { position: relative; display: flex; align-items: center; padding: 22px 4px; }
.sp-navitem__link { position: relative; display: inline-flex; align-items: center; font-size: .87rem; font-weight: 500; color: var(--muted); text-decoration: none; transition: color .2s; padding: 6px 4px 6px 10px }
.sp-navitem__link:hover { color: var(--ink) }
.sp-navitem__link::after { content: ""; position: absolute; left: 10px; right: 4px; bottom: -1px; height: 2px; border-radius: 2px; background: var(--accent-deep); transform: scaleX(0); transform-origin: left; transition: transform .3s var(--ease) }
.sp-navitem__link:hover::after, .sp-navitem__link.sp-nav__link--active::after { transform: scaleX(1) }
.sp-navitem__chev { display: inline-flex; align-items: center; justify-content: center; background: none; border: 0; color: var(--muted-dim); cursor: pointer; padding: 6px 8px 6px 2px; transition: transform .25s var(--ease), color .2s }
.sp-navitem__chev:hover { color: var(--accent-deep) }
.sp-navitem__chev--open { transform: rotate(180deg); color: var(--accent-deep) }

.sp-megamenu {
  position: absolute; top: calc(100% - 6px); left: 50%; transform: translate(-50%, 8px);
  width: 340px; padding: 10px; border-radius: 16px; border: 1px solid var(--border);
  background: var(--surface); box-shadow: 0 30px 60px -28px rgba(16,25,46,.35), 0 4px 16px -8px rgba(16,25,46,.12);
  opacity: 0; visibility: hidden; pointer-events: none;
  transition: opacity .2s var(--ease), transform .2s var(--ease), visibility .2s;
  z-index: 60;
}
.sp-megamenu--open { opacity: 1; visibility: visible; pointer-events: auto; transform: translate(-50%, 0) }
.sp-megamenu__head { display: flex; align-items: center; gap: 11px; padding: 10px 10px 12px; border-bottom: 1px solid var(--border) }
.sp-megamenu__icon { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; background: var(--accent-soft); color: var(--accent-deep); flex-shrink: 0 }
.sp-megamenu__head p { margin: 0; font-size: .82rem; color: var(--muted); line-height: 1.4 }
.sp-megamenu__list { display: flex; flex-direction: column; padding: 6px 0 }
.sp-megamenu__item { display: flex; align-items: flex-start; gap: 11px; padding: 9px 10px; border-radius: 10px; text-decoration: none; color: inherit; transition: background .18s }
.sp-megamenu__item:hover { background: var(--surface-alt) }
.sp-megamenu__item svg { flex-shrink: 0; margin-top: 2px; color: var(--accent-deep) }
.sp-megamenu__item strong { display: block; font-size: .86rem; font-weight: 600; color: var(--ink) }
.sp-megamenu__item em { display: block; margin-top: 2px; font-style: normal; font-size: .78rem; color: var(--muted) }
.sp-megamenu__cta { display: block; margin-top: 4px; padding: 11px 10px; border-top: 1px solid var(--border); text-align: center; font-size: .85rem; font-weight: 650; color: var(--accent-deep); text-decoration: none; transition: color .2s }
.sp-megamenu__cta:hover { color: var(--accent) }

/* ── Buttons ── */
.sp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 0; border-radius: 11px; font-weight: 620; font-size: .88rem; text-decoration: none; cursor: pointer; white-space: nowrap; transition: transform .25s var(--ease), background .25s, box-shadow .25s, border-color .25s, color .25s; outline: none }
.sp-btn:active { transform: scale(.98); transition-duration: .05s }
.sp-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(85,70,224,.35) }
.sp-btn:disabled { opacity: .7; cursor: default }
.sp-btn--sm { height: 40px; padding: 0 18px; font-size: .85rem }
.sp-btn--lg { height: 50px; padding: 0 24px; font-size: .92rem }
.sp-btn--full { width: 100% }
.sp-btn--prim { position: relative; overflow: hidden; background: var(--accent-deep); color: #fff; box-shadow: none }
.sp-btn--prim::after { content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,.35), transparent); transform: skewX(-20deg); transition: left .6s var(--ease) }
.sp-btn--prim:hover { background: var(--accent); transform: translateY(-1px) }
.sp-btn--prim:hover::after { left: 130% }
@media (prefers-reduced-motion: reduce) { .sp-btn--prim::after { display: none } }
.sp-btn--ghost { background: var(--surface); color: var(--ink); border: 1px solid var(--border-strong); box-shadow: 0 1px 2px rgba(16,25,46,.03) }
.sp-btn--ghost:hover { border-color: var(--accent); color: var(--accent-deep); transform: translateY(-2px) }

/* ── Mobile overlay ── */
.sp-mobile { position: fixed; inset: 0; z-index: 45; background: radial-gradient(72% 55% at 50% 32%, rgba(106,92,255,.08), transparent 70%), rgba(251,252,254,.98); backdrop-filter: blur(26px) saturate(1.25); -webkit-backdrop-filter: blur(26px) saturate(1.25); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .35s ease; overflow-y: auto; padding: 90px 0 40px }
.sp-mobile--open { opacity: 1; pointer-events: auto }
.sp-mobile__nav { display: flex; flex-direction: column; align-items: stretch; gap: 2px; width: min(88vw, 440px); margin: auto; text-align: left; counter-reset: navitem }
.sp-mobile__group { opacity: 0; animation: sp-menu-in .55s var(--ease) both; border-bottom: 1px solid var(--border) }
.sp-mobile__row { display: flex; align-items: center; justify-content: space-between; gap: 12px }
.sp-mobile__toplink { position: relative; counter-increment: navitem; font-family: var(--font-display); font-size: clamp(1.5rem, 6.4vw, 1.9rem); font-weight: 700; letter-spacing: -.02em; color: var(--ink); text-decoration: none; padding: 14px 0; transition: color .25s var(--ease) }
.sp-mobile__toplink::before { content: "0" counter(navitem); font-family: var(--font-mono); font-size: .72rem; font-weight: 500; color: var(--accent); margin-right: 12px; vertical-align: 5px }
.sp-mobile__toplink:hover { color: var(--accent-deep) }
.sp-mobile__chev { display: flex; align-items: center; justify-content: center; background: none; border: 0; color: var(--muted-dim); cursor: pointer; padding: 10px; transition: transform .25s var(--ease), color .2s }
.sp-mobile__chev--open { transform: rotate(180deg); color: var(--accent-deep) }
.sp-mobile__sub { max-height: 0; overflow: hidden; opacity: 0; transition: max-height .35s var(--ease), opacity .25s }
.sp-mobile__sub--open { max-height: 240px; opacity: 1; padding-bottom: 14px }
.sp-mobile__sublink { display: block; padding: 8px 0 8px 34px; font-size: .92rem; font-weight: 500; color: var(--muted); text-decoration: none; transition: color .2s }
.sp-mobile__sublink:hover { color: var(--accent-deep) }
.sp-mobile__nav .sp-btn { margin: 28px 0 0; width: 100% }
@keyframes sp-menu-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .sp-mobile__group { animation: none; opacity: 1 } }

/* ── Main ── */
.sp-main { position: relative; z-index: 1; max-width: 1140px; margin: 0 auto; padding: 0 24px 48px }

/* ── Hero ── */
.sp-hero { text-align: center; padding: 116px 0 0; max-width: 760px; margin: 0 auto }
.sp-hero__badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 15px; border-radius: 999px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.2); font-size: .74rem; font-weight: 600; color: var(--accent-deep); letter-spacing: .01em; margin-bottom: 26px }
.sp-hero__h1 { margin: 0; font-family: var(--font-display); font-size: clamp(2.1rem, 4vw, 3.1rem); font-weight: 700; line-height: 1.12; letter-spacing: -.025em; color: var(--ink); text-wrap: balance }
.sp-hero__grad { color: var(--accent-deep) }
.sp-hero__sub { margin: 24px auto 0; max-width: 600px; color: var(--ink-soft); font-size: 1.125rem; line-height: 1.65 }
.sp-hero__actions { margin: 38px auto 0; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap }
.sp-hero__strip { margin: 44px auto 0; color: var(--muted); font-size: .88rem; font-weight: 500; font-style: italic; letter-spacing: .01em }

/* ── Sections ── */
.sp-section { padding-top: 132px; scroll-margin-top: 84px }
.sp-section--tight { padding-top: 88px }
.sp-head { text-align: center; max-width: 620px; margin: 0 auto 56px }
.sp-head--left { text-align: left; max-width: 720px; margin: 0 0 32px }
.sp-head h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.6rem, 2.9vw, 2.25rem); font-weight: 700; line-height: 1.2; letter-spacing: -.02em; color: var(--ink) }
.sp-head p { margin: 18px auto 0; color: var(--muted); font-size: 1.05rem; line-height: 1.7; max-width: 560px }
.sp-head--left p { margin-left: 0 }
.sp-tag { display: inline-block; font-size: .74rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }

/* ── Generic card grid (services / features) ── */
.sp-cards { display: grid; gap: 24px }
.sp-cards--2 { grid-template-columns: repeat(2, 1fr) }
.sp-cards--3 { grid-template-columns: repeat(3, 1fr) }
.sp-cards--4 { grid-template-columns: repeat(2, 1fr) }
.sp-card {
  --cut: 24px;
  position: relative; display: flex; flex-direction: column; padding: 36px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--accent-soft) 0%, transparent 18%), var(--surface);
  filter: drop-shadow(0 14px 26px rgba(16,25,46,.1));
  transform: perspective(900px) rotateX(var(--tiltX, 0deg)) rotateY(var(--tiltY, 0deg)) translateY(var(--tiltLift, 0px));
  transition: transform .35s var(--ease), border-color .3s, filter .3s;
}
.sp-card:hover { border-color: var(--border-strong); filter: drop-shadow(0 22px 38px rgba(16,25,46,.16)) }
@media (prefers-reduced-motion: reduce) { .sp-card { transform: none !important } }
.sp-card__icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; clip-path: polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px); background: linear-gradient(135deg, var(--accent-soft), #ffffff); border: 1px solid rgba(106,92,255,.2); color: var(--accent-deep); box-shadow: 0 8px 20px -12px rgba(106,92,255,.5); transition: transform .35s var(--ease) }
.sp-card:hover .sp-card__icon { transform: translateY(-2px) scale(1.06) }
.sp-card__title { margin: 22px 0 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 650; letter-spacing: -.015em; color: var(--ink) }
.sp-card__body { margin: 12px 0 0; color: var(--muted); font-size: .95rem; line-height: 1.7; flex: 1 }
.sp-card__link { display: inline-flex; align-items: center; gap: 7px; margin-top: 20px; font-size: .9rem; font-weight: 600; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-card:hover .sp-card__link { gap: 11px }

/* ── CTA banner ── */
.sp-cta { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px; padding: 60px 48px; border-radius: calc(var(--radius) + 8px); border: 1px solid rgba(106,92,255,.22); background: linear-gradient(135deg, #f4f3ff 0%, #ffffff 60%); box-shadow: 0 30px 70px -46px rgba(85,70,224,.5) }
.sp-cta h2 { margin: 0; font-family: var(--font-display); font-size: clamp(1.4rem, 2.4vw, 1.85rem); font-weight: 700; letter-spacing: -.02em; color: var(--ink); max-width: 560px }
.sp-cta p { margin: 0; color: var(--ink-soft); font-size: 1.05rem; line-height: 1.7; max-width: 520px }

/* ── Simple panel (About / teasers) ── */
.sp-panel { padding: 52px; border-radius: calc(var(--radius) + 6px); border: 1px solid var(--border); background: radial-gradient(120% 130% at 0% 0%, rgba(106,92,255,.05), transparent 55%), var(--surface); box-shadow: 0 24px 60px -40px rgba(16,25,46,.25) }
.sp-panel h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.5rem, 2.4vw, 1.95rem); font-weight: 700; line-height: 1.22; letter-spacing: -.02em }
.sp-panel p { margin: 18px 0 0; color: var(--ink-soft); font-size: 1.05rem; line-height: 1.75 }
.sp-panel p:first-of-type { margin-top: 18px }

/* ── Footer ── */
.sp-footer { border-top: 1px solid var(--border); max-width: 1140px; margin: 96px auto 0; padding: 56px 24px 32px }
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
  .sp-footer__top { flex-direction: column; gap: 30px }
}
@media (max-width: 680px) {
  .sp-main { padding: 0 16px 64px }
  .sp-nav { padding: 0 16px }
  .sp-nav__links { display: none }
  .sp-nav__burger { display: flex }
  .sp-nav__right .sp-btn { display: none }
  .sp-hero { padding-top: 64px }
  .sp-hero__actions { flex-direction: column }
  .sp-hero__actions .sp-btn { width: 100% }
  .sp-section { padding-top: 88px }
  .sp-head { margin-bottom: 40px }
  .sp-cards--2, .sp-cards--3, .sp-cards--4 { grid-template-columns: 1fr }
  .sp-card { padding: 28px; --cut: 18px }
  .sp-cta { padding: 40px 28px }
  .sp-panel { padding: 32px }
  .sp-footer__cols { flex-wrap: wrap; gap: 32px }
  .sp-footer__bottom { flex-direction: column; align-items: flex-start; gap: 10px }
}
`;
