"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { joinWaitlist } from "@/lib/waitlist";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Database,
  GitBranch,
  Linkedin,
  Menu,
  Radar,
  ShieldCheck,
  Sliders,
  Terminal,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   PurveX — Platform (product) page · bento-grid structure

   Shares the home page's design system (light, single purple
   accent) so the site reads as one cohesive experience.
   ───────────────────────────────────────────────────────── */
const BOOKING_URL = "https://calendly.com/purvex-llc/30min";

/* ─────────────────── data ─────────────────── */

const features = [
  {
    icon: Crosshair,
    title: "Validate what matters",
    body: "Run controlled tests against the behaviors you care about. See which detections fire before a real adversary finds the gap.",
  },
  {
    icon: Radar,
    title: "Isolate the failure",
    body: "Separate telemetry gaps, rule failures, tuning issues, and drift so your team knows exactly what to fix.",
  },
  {
    icon: BrainCircuit,
    title: "AI-assisted explanation",
    body: "Selective AI speeds up triage, prioritization, and communication without adding noise to your workflow.",
  },
  {
    icon: ShieldCheck,
    title: "Defensible coverage",
    body: "Turn claimed ATT&CK coverage into measured, repeatable evidence your team can defend.",
  },
];

const audience = [
  {
    icon: Database,
    eyebrow: "Detection engineers",
    body: "Know if the miss came from telemetry, parser drift, rule logic, or tuning, before the post-incident review starts.",
  },
  {
    icon: Sliders,
    eyebrow: "SOC managers",
    body: "Turn ad hoc checks into a repeatable workflow that shows coverage improving across the detections that matter.",
  },
  {
    icon: GitBranch,
    eyebrow: "Security leadership",
    body: "Replace claimed ATT&CK coverage and screenshots with measured results you can take to a program review.",
  },
];

const withoutItems = [
  "Hours spent proving whether telemetry or rule logic actually failed",
  "Coverage reviews built from screenshots, notes, and assumptions",
  "Validation work that happens only before audits or major incidents",
  "Leadership hearing 'we have a rule' instead of 'we know it works'",
];

const withItems = [
  "One run that shows what fired, what missed, and where the chain broke",
  "Clear failure isolation so engineers can fix the right layer first",
  "Measured coverage that can be tracked over time across environments",
  "Evidence strong enough for both operators and budget owners",
];

const dashRows = [
  { tech: "T1059.001", name: "PowerShell Execution", status: "pass", badge: "Fired" },
  { tech: "T1053.005", name: "Scheduled Task", status: "pass", badge: "Fired" },
  { tech: "T1003.001", name: "LSASS Memory", status: "fail", badge: "Missed" },
  { tech: "T1547.001", name: "Registry Run Keys", status: "pass", badge: "Fired" },
];

const tiers = [
  {
    name: "Pilot",
    price: "$0",
    note: "Early access",
    summary: "Prove the value of validation before rolling it out broadly.",
    items: ["Focused detection set", "Core validation workflow", "Single environment", "Foundational reporting"],
    href: "#top",
    cta: "Join the waitlist",
    featured: false,
  },
  {
    name: "Team",
    price: "$49",
    note: "per user / month",
    summary: "Make detection validation part of the operating rhythm.",
    items: ["Unlimited detections", "Unlimited validation runs", "AI-assisted explanation", "Leadership-ready reporting"],
    href: "#top",
    cta: "Join the waitlist",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "Annual contract",
    summary: "Standardize validation across environments and stakeholders.",
    items: ["Everything in Team", "Advanced integrations", "Expanded support model", "Enterprise rollout planning"],
    href: "#top",
    cta: "Join the waitlist",
    featured: false,
  },
];

const faqs: [string, string][] = [
  ["Is this BAS? How is it different from AttackIQ or SafeBreach?", "BAS simulates adversary behavior against endpoints. PurveX validates the full detection chain (telemetry, parser, rule, alert, ticket) and isolates exactly where it broke. We complement BAS rather than replace it."],
  ["Do you run anything in production? What's the safety model?", "Read-only against your SIEM by default. Validation actions are scoped, auditable, and approved per environment. Production-impacting tests require explicit opt-in inside your guardrails."],
  ["How long until we see a first coverage report?", "Pilot teams typically see first coverage signal within hours of connecting their SIEM, and a leadership-ready report inside the first week."],
  ["Does PurveX replace the SIEM?", "No. Your SIEM stays the system of record. PurveX adds the validation layer that proves detections actually fire and tracks coverage over time."],
];

/* ─────────────────── hooks ─────────────────── */

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, threshold]);
  return visible;
}

/* ─────────────────── component ─────────────────── */

export default function PlatformPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [email, setEmail] = useState("");
  const [wlState, setWlState] = useState<"idle" | "loading" | "success" | "exists" | "error">("idle");
  const [wlMsg, setWlMsg] = useState("");

  const dashVisible = useInView(dashRef);

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
        // Elite touch: if the target holds the waitlist email field, focus it after the scroll.
        const input = el.querySelector<HTMLInputElement>("input[type='email']");
        if (input) setTimeout(() => input.focus({ preventScroll: true }), 480);
      }
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  const submitWaitlist = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = email.trim();
      if (!trimmed) {
        setWlState("error");
        setWlMsg("Enter your work email.");
        return;
      }
      setWlState("loading");
      setWlMsg("");
      try {
        const data = await joinWaitlist(trimmed, "platform-hero");
        if (data.already_exists) {
          setWlState("exists");
          setWlMsg("You're already on the waitlist.");
        } else {
          setWlState("success");
          setWlMsg("You're on the list. We'll be in touch.");
          setEmail("");
        }
      } catch (err) {
        setWlState("error");
        setWlMsg(err instanceof Error ? err.message : "Unable to join right now. Try again.");
      }
    },
    [email],
  );

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
            <Link href="/">Services</Link>
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
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
          <Link href="/" onClick={closeNav}>Services</Link>
          <a href="#product" onClick={closeNav}>Product</a>
          <a href="#pricing" onClick={closeNav}>Pricing</a>
          <a href="#faq" onClick={closeNav}>FAQ</a>
          <div className="sp-mobile__div" />
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
        <section id="top" className={`sp-hero${heroReady ? " sp-hero--in" : ""}`}>
          <span className="sp-hero__badge">
            <Radar size={13} /> The PurveX Platform · Private beta
          </span>
          <h1 className="sp-hero__h1">
            See the miss before attackers do.
            <br />
            <span className="sp-hero__grad">Know exactly why it happened.</span>
          </h1>
          <p className="sp-hero__sub">
            Most teams assume their detections work. PurveX proves which ones actually fire, then
            pinpoints whether a failure came from telemetry, rule logic, tuning, or drift.
          </p>
          <form className="sp-wl" onSubmit={submitWaitlist}>
            <div className="sp-wl__row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="sp-wl__input"
                autoComplete="email"
              />
              <button type="submit" className="sp-btn sp-btn--prim sp-btn--lg" disabled={wlState === "loading"}>
                {wlState === "loading" ? "Joining..." : <><span>Join the Waitlist</span><ArrowRight size={15} /></>}
              </button>
            </div>
            {wlMsg && <p className={`sp-wl__msg sp-wl__msg--${wlState}`}>{wlMsg}</p>}
          </form>
          <a href="#pricing" className="sp-hero__ghost-link">
            View pricing <ChevronRight size={14} />
          </a>
        </section>

        {/* ═══════════ BENTO — THE PRODUCT ═══════════ */}
        <section className="sp-section" id="product">
          <div className="sp-head sp-head--left" data-r>
            <span className="sp-tag">The platform</span>
            <h2>Everything on one screen. Proof, not assumptions.</h2>
          </div>

          <div className="sp-bento" data-r>
            {/* Dashboard — large tile */}
            <article className="sp-tile sp-tile--dash" ref={dashRef}>
              <div className="sp-dash__chrome">
                <div className="sp-dash__dots"><span /><span /><span /></div>
                <span className="sp-dash__title"><Terminal size={12} /> Detection Assurance Workflow</span>
                <span className="sp-dash__live"><span className="sp-dash__pulse" />Live</span>
              </div>
              <div className="sp-dash__body">
                {dashRows.map((r) => (
                  <div key={r.tech} className="sp-dash__row">
                    <span className={`sp-dash__dot sp-dash__dot--${r.status}`} />
                    <code className="sp-dash__tech">{r.tech}</code>
                    <span className="sp-dash__name">{r.name}</span>
                    <span className={`sp-dash__badge sp-dash__badge--${r.status}`}>{r.badge}</span>
                  </div>
                ))}
                <div className="sp-dash__score">
                  <span className="sp-dash__score-label">Validation Score</span>
                  <div className="sp-dash__track"><div className={`sp-dash__fill${dashVisible ? " sp-dash__fill--in" : ""}`} /></div>
                  <span className="sp-dash__score-val">95<span className="sp-dash__score-max">/100</span></span>
                </div>
                <div className="sp-dash__insight">
                  <span className="sp-dash__insight-kicker">Aha moment</span>
                  <p>
                    <strong>LSASS Memory missed.</strong> PurveX isolates the issue to parser drift,
                    so the team fixes the broken ingest path instead of retuning the rule.
                  </p>
                </div>
              </div>
            </article>

            {/* First two feature tiles (right of dashboard) */}
            {features.slice(0, 2).map((f) => (
              <article key={f.title} className="sp-tile sp-tile--feat">
                <div className="sp-tile__icon"><f.icon size={18} /></div>
                <h3 className="sp-tile__title">{f.title}</h3>
                <p className="sp-tile__body">{f.body}</p>
              </article>
            ))}

            {/* Row: remaining features + accent tile */}
            {features.slice(2).map((f) => (
              <article key={f.title} className="sp-tile sp-tile--feat">
                <div className="sp-tile__icon"><f.icon size={18} /></div>
                <h3 className="sp-tile__title">{f.title}</h3>
                <p className="sp-tile__body">{f.body}</p>
              </article>
            ))}
            <article className="sp-tile sp-tile--accent">
              <span className="sp-tile__kick">The point</span>
              <p className="sp-tile__accent-text">
                Not another dashboard. It tests the detection chain, isolates the miss, and turns
                the result into evidence you can defend.
              </p>
              <ShieldCheck size={20} className="sp-tile__accent-icon" />
            </article>

            {/* Audience tiles */}
            {audience.map((a) => (
              <article key={a.eyebrow} className="sp-tile sp-tile--aud">
                <div className="sp-tile__aud-top">
                  <a.icon size={16} />
                  <span className="sp-tile__ey">{a.eyebrow}</span>
                </div>
                <p className="sp-tile__body sp-tile__body--sm">{a.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════ COMPARE ═══════════ */}
        <section className="sp-section">
          <div className="sp-head" data-r>
            <span className="sp-tag">The risk of guessing</span>
            <h2>Every unproven detection is a blind spot.</h2>
            <p>
              A rule that exists is not a rule that works. Until you test the chain, you are trusting
              coverage you have never actually watched fire.
            </p>
          </div>
          <div className="sp-compare" data-r>
            <div className="sp-compare__col sp-compare__col--without">
              <h3 className="sp-compare__h">Without PurveX</h3>
              <ul>{withoutItems.map((t) => <li key={t}><X size={15} className="sp-compare__icon sp-compare__icon--x" /><span>{t}</span></li>)}</ul>
            </div>
            <div className="sp-compare__col sp-compare__col--with">
              <h3 className="sp-compare__h">With PurveX</h3>
              <ul>{withItems.map((t) => <li key={t}><Check size={15} className="sp-compare__icon sp-compare__icon--ok" /><span>{t}</span></li>)}</ul>
            </div>
          </div>
        </section>

        {/* ═══════════ PRICING ═══════════ */}
        <section className="sp-section" id="pricing">
          <div className="sp-head" data-r>
            <span className="sp-tag">Planned pricing</span>
            <h2>Start focused. Expand when the evidence is there.</h2>
            <p>
              This is the pricing we&apos;re planning at launch. Beta teams get first access and
              preferred terms, so join the waitlist to be part of the early group.
            </p>
          </div>
          <div className="sp-pricing">
            {tiers.map((tier, i) => (
              <article key={tier.name} className={`sp-tier${tier.featured ? " sp-tier--feat" : ""}`} data-r data-d={String(i + 1)}>
                {tier.featured && <div className="sp-tier__badge">Most Popular</div>}
                <div className="sp-tier__name">{tier.name}</div>
                <div className="sp-tier__price">{tier.price}</div>
                <div className="sp-tier__note">{tier.note}</div>
                <p className="sp-tier__sum">{tier.summary}</p>
                <div className="sp-tier__sep" />
                <ul className="sp-tier__list">
                  {tier.items.map((it) => <li key={it}><Check size={15} /><span>{it}</span></li>)}
                </ul>
                <a href={tier.href} className={`sp-btn sp-btn--full sp-btn--lg ${tier.featured ? "sp-btn--prim" : "sp-btn--ghost"}`}>
                  {tier.cta}
                  <ChevronRight size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════ FAQ ═══════════ */}
        <section className="sp-section" id="faq">
          <div className="sp-head" data-r>
            <span className="sp-tag">FAQ</span>
            <h2>Questions teams ask before they commit.</h2>
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

      </main>

      {/* ─── Footer ─── */}
      <footer className="sp-footer" data-r>
        <div className="sp-footer__top">
          <div className="sp-footer__brand">
            <Link href="/" className="sp-logo">
              <Image src="/logo.png" alt="PurveX" width={24} height={24} className="sp-logo__img" />
              <span>PurveX</span>
            </Link>
            <p>Strengthening security operations and supporting cybersecurity education.</p>
          </div>
          <div className="sp-footer__cols">
            <div className="sp-footer__col">
              <h4>Company</h4>
              <Link href="/">Home</Link>
              <Link href="/#training">Training</Link>
              <Link href="/#services">Business Security</Link>
            </div>
            <div className="sp-footer__col">
              <h4>Platform</h4>
              <a href="#product">Product</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
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
   PURVEX — PLATFORM (bento) · shares home design system
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
.sp-nav {
  position: sticky; top: 0; z-index: 50; padding: 0 24px;
  transition: background .35s, backdrop-filter .35s, box-shadow .35s, border-color .35s;
  border-bottom: 1px solid transparent;
}
.sp-nav--s {
  background: rgba(251,252,254,.82);
  backdrop-filter: blur(14px) saturate(1.3); -webkit-backdrop-filter: blur(14px) saturate(1.3);
  border-bottom: 1px solid var(--border);
}
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
.sp-btn:disabled { opacity: .7; cursor: default }
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
.sp-mobile__div { height: 1px; width: 64px; background: var(--border-strong); margin: 24px auto 20px }
.sp-mobile__nav .sp-btn { margin-top: 4px; min-width: 240px }
@keyframes sp-menu-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .sp-mobile--open .sp-mobile__nav > * { animation: none; opacity: 1 } }

/* ── Main ── */
.sp-main { position: relative; z-index: 1; max-width: 1140px; margin: 0 auto; padding: 0 24px 96px }

/* ── Hero ── */
.sp-hero { text-align: center; padding: 90px 0 0; max-width: 880px; margin: 0 auto; scroll-margin-top: 76px }
.sp-tile__icon { transition: transform .35s var(--ease) }
.sp-tile:hover .sp-tile__icon { transform: translateY(-2px) scale(1.06) }
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
.sp-hero__sub { margin: 22px auto 0; max-width: 640px; color: var(--ink-soft); font-size: 1.1rem; line-height: 1.72 }

/* ── Waitlist ── */
.sp-wl { margin: 30px auto 0; max-width: 460px }
.sp-wl__row { display: flex; gap: 10px }
.sp-wl__input { flex: 1; height: 50px; border-radius: 11px; border: 1px solid var(--border-strong); background: var(--surface); padding: 0 16px; font-size: .92rem; color: var(--ink); outline: none; transition: border-color .2s, box-shadow .2s }
.sp-wl__input::placeholder { color: var(--muted-dim) }
.sp-wl__input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(106,92,255,.12) }
.sp-wl__msg { margin: 10px 0 0; font-size: .82rem }
.sp-wl__msg--success, .sp-wl__msg--exists { color: var(--green) }
.sp-wl__msg--error { color: var(--red) }
.sp-hero__ghost-link { display: inline-flex; align-items: center; gap: 5px; margin-top: 18px; font-size: .86rem; font-weight: 600; color: var(--muted); text-decoration: none; transition: color .2s, gap .2s }
.sp-hero__ghost-link:hover { color: var(--accent-deep); gap: 8px }

/* ── Sections ── */
.sp-section { padding-top: 108px; scroll-margin-top: 84px }
.sp-head { text-align: center; max-width: 640px; margin: 0 auto 40px }
.sp-head--left { text-align: left; max-width: 720px; margin: 0 0 32px }
.sp-head h2 { margin: 12px 0 0; font-family: var(--font-display); font-size: clamp(1.65rem, 3.4vw, 2.5rem); font-weight: 700; line-height: 1.14; letter-spacing: -.032em; color: var(--ink) }
.sp-head p { margin: 16px auto 0; color: var(--muted); font-size: 1rem; line-height: 1.7; max-width: 560px }
.sp-head--left p { margin-left: 0 }
.sp-tag { display: inline-block; font-size: .72rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--accent-deep) }

/* ── Bento ── */
.sp-bento {
  display: grid; grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(120px, auto); gap: 16px;
}
.sp-tile {
  display: flex; flex-direction: column;
  padding: 26px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface); box-shadow: 0 18px 44px -40px rgba(16,25,46,.28);
  transition: transform .3s var(--ease), border-color .3s, box-shadow .3s;
}
.sp-tile:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: 0 26px 56px -40px rgba(16,25,46,.34) }
.sp-tile--feat { grid-column: span 2 }
.sp-tile--accent { grid-column: span 2 }
.sp-tile--aud { grid-column: span 2 }
.sp-tile--dash { grid-column: span 4; grid-row: span 2; padding: 0; overflow: hidden }
.sp-tile--dash:hover { transform: none; box-shadow: 0 18px 44px -40px rgba(16,25,46,.28); border-color: var(--border) }

.sp-tile__icon { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep) }
.sp-tile__title { margin: 16px 0 0; font-family: var(--font-display); font-size: 1.14rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-tile__body { margin: 9px 0 0; color: var(--muted); font-size: .88rem; line-height: 1.66 }
.sp-tile__body--sm { font-size: .84rem }

/* accent tile */
.sp-tile--accent { position: relative; overflow: hidden; background: linear-gradient(140deg, var(--accent), var(--accent-deep)); border-color: transparent; justify-content: center }
.sp-tile--accent:hover { border-color: transparent }
.sp-tile__kick { font-size: .66rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.75) }
.sp-tile__accent-text { margin: 12px 0 0; font-family: var(--font-display); font-size: 1.04rem; font-weight: 600; line-height: 1.4; letter-spacing: -.015em; color: #fff }
.sp-tile__accent-icon { position: absolute; right: 18px; bottom: 16px; color: rgba(255,255,255,.35) }

/* audience tile */
.sp-tile__aud-top { display: flex; align-items: center; gap: 9px; color: var(--accent-deep) }
.sp-tile__ey { font-size: .72rem; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; color: var(--muted-dim) }
.sp-tile--aud .sp-tile__aud-top svg { color: var(--accent-deep) }

/* ── Dashboard (inside big tile) ── */
.sp-dash__chrome { display: flex; align-items: center; gap: 10px; padding: 13px 18px; border-bottom: 1px solid var(--border); background: var(--surface-alt) }
.sp-dash__dots { display: flex; gap: 6px }
.sp-dash__dots span { width: 9px; height: 9px; border-radius: 50% }
.sp-dash__dots span:nth-child(1) { background: #f2777a }
.sp-dash__dots span:nth-child(2) { background: #f4c059 }
.sp-dash__dots span:nth-child(3) { background: #5ec269 }
.sp-dash__title { display: flex; align-items: center; gap: 7px; font-size: .72rem; font-weight: 700; letter-spacing: .04em; color: var(--muted) }
.sp-dash__live { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: .68rem; font-weight: 700; letter-spacing: .05em; color: var(--accent-deep) }
.sp-dash__pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: sp-pulse 2s ease-in-out infinite }
.sp-dash__body { flex: 1; padding: 18px; display: flex; flex-direction: column; gap: 8px }
.sp-dash__row { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface-alt); font-size: .86rem }
.sp-dash__dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0 }
.sp-dash__dot--pass { background: var(--green) }
.sp-dash__dot--fail { background: var(--red) }
.sp-dash__tech { font-family: var(--font-mono); font-size: .78rem; color: var(--accent-deep); font-weight: 600; min-width: 82px }
.sp-dash__name { flex: 1; color: var(--ink-soft); font-size: .84rem }
.sp-dash__badge { font-size: .64rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; padding: 3px 9px; border-radius: 999px }
.sp-dash__badge--pass { background: rgba(22,163,74,.1); color: var(--green); border: 1px solid rgba(22,163,74,.2) }
.sp-dash__badge--fail { background: rgba(229,72,77,.1); color: var(--red); border: 1px solid rgba(229,72,77,.2) }
.sp-dash__score { display: flex; align-items: center; gap: 14px; margin-top: 4px; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(106,92,255,.18); background: var(--accent-soft) }
.sp-dash__score-label { font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); white-space: nowrap }
.sp-dash__track { flex: 1; height: 5px; border-radius: 999px; background: rgba(16,25,46,.08); overflow: hidden }
.sp-dash__fill { height: 100%; border-radius: 999px; width: 0; background: var(--accent); transition: width 1.2s var(--ease) .3s }
.sp-dash__fill--in { width: 95% }
.sp-dash__score-val { font-family: var(--font-display); font-weight: 700; font-size: .95rem; color: var(--accent-deep) }
.sp-dash__score-max { color: var(--muted-dim); font-size: .78rem }
.sp-dash__insight { margin-top: auto; padding: 16px; border-radius: 12px; border: 1px solid rgba(106,92,255,.2); background: rgba(106,92,255,.05) }
.sp-dash__insight-kicker { display: inline-flex; font-size: .64rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }
.sp-dash__insight p { margin: 8px 0 0; color: var(--ink-soft); font-size: .88rem; line-height: 1.65 }
.sp-dash__insight strong { color: var(--ink) }

/* ── Compare ── */
.sp-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px }
.sp-compare__col { padding: 32px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); box-shadow: 0 18px 44px -40px rgba(16,25,46,.28) }
.sp-compare__col--without { border-top: 3px solid rgba(229,72,77,.35) }
.sp-compare__col--with { border-top: 3px solid var(--accent); background: linear-gradient(180deg, rgba(106,92,255,.035), var(--surface)) }
.sp-compare__h { margin: 0 0 18px; font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-compare__col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px }
.sp-compare__col li { display: flex; align-items: flex-start; gap: 11px; color: var(--ink-soft); font-size: .9rem; line-height: 1.55 }
.sp-compare__icon { flex-shrink: 0; margin-top: 2px }
.sp-compare__icon--x { color: var(--red) }
.sp-compare__icon--ok { color: var(--accent-deep) }

/* ── Pricing ── */
.sp-pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start }
.sp-tier { position: relative; display: flex; flex-direction: column; padding: 32px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); box-shadow: 0 18px 44px -40px rgba(16,25,46,.28); transition: transform .3s var(--ease), border-color .3s }
.sp-tier:hover { transform: translateY(-3px); border-color: var(--border-strong) }
.sp-tier--feat { border-color: rgba(106,92,255,.35); box-shadow: 0 30px 60px -36px rgba(85,70,224,.4) }
.sp-tier__badge { position: absolute; top: 0; right: 22px; transform: translateY(-50%); padding: 4px 13px; border-radius: 999px; background: linear-gradient(135deg, var(--accent), var(--accent-deep)); font-size: .62rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #fff }
.sp-tier__name { font-size: .68rem; text-transform: uppercase; letter-spacing: .12em; color: var(--muted-dim); font-weight: 700 }
.sp-tier__price { margin-top: 8px; font-family: var(--font-display); font-size: 2.3rem; font-weight: 700; letter-spacing: -.04em; color: var(--ink) }
.sp-tier__note { margin-top: 2px; color: var(--muted); font-size: .82rem }
.sp-tier__sum { margin: 12px 0 0; color: var(--muted); font-size: .86rem; line-height: 1.6 }
.sp-tier__sep { height: 1px; background: var(--border); margin: 20px 0 }
.sp-tier__list { list-style: none; padding: 0; margin: 0 0 22px; display: flex; flex-direction: column; gap: 10px }
.sp-tier__list li { display: flex; align-items: center; gap: 9px; color: var(--ink-soft); font-size: .86rem }
.sp-tier__list li svg { color: var(--accent-deep); flex-shrink: 0 }
.sp-tier .sp-btn { margin-top: auto }

/* ── FAQ ── */
.sp-faq { max-width: 720px; margin: 0 auto; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); overflow: hidden; box-shadow: 0 18px 44px -40px rgba(16,25,46,.28) }
.sp-faq__item + .sp-faq__item { border-top: 1px solid var(--border) }
.sp-faq__item--open { background: var(--accent-soft) }
.sp-faq__btn { display: flex; align-items: center; width: 100%; justify-content: space-between; gap: 16px; padding: 20px 24px; background: none; border: 0; color: var(--ink); font-size: .94rem; font-weight: 650; text-align: left; cursor: pointer; transition: color .2s }
.sp-faq__btn:hover { color: var(--accent-deep) }
.sp-faq__chev { flex-shrink: 0; color: var(--muted-dim); transition: transform .35s var(--ease) }
.sp-faq__chev--open { transform: rotate(180deg); color: var(--accent-deep) }
.sp-faq__body { max-height: 0; overflow: hidden; opacity: 0; transition: max-height .4s var(--ease), opacity .3s }
.sp-faq__body--open { max-height: 240px; opacity: 1 }
.sp-faq__body p { padding: 0 24px 20px; margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.7 }

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

@keyframes sp-pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }

/* ── Responsive ── */
@media (max-width: 940px) {
  .sp-bento { grid-template-columns: repeat(2, 1fr) }
  .sp-tile--dash { grid-column: 1 / -1; grid-row: auto }
  .sp-tile--feat { grid-column: span 1 }
  .sp-tile--accent { grid-column: 1 / -1 }
  .sp-tile--aud { grid-column: 1 / -1 }
  .sp-compare { grid-template-columns: 1fr }
  .sp-pricing { grid-template-columns: 1fr }
  .sp-footer__top { flex-direction: column; gap: 30px }
}
@media (max-width: 680px) {
  .sp-main { padding: 0 16px 64px }
  .sp-nav { padding: 0 16px }
  .sp-nav__links { display: none }
  .sp-nav__burger { display: flex }
  .sp-nav__right .sp-btn { display: none }
  .sp-hero { padding-top: 60px }
  .sp-wl__row { flex-direction: column }
  .sp-section { padding-top: 80px }
  .sp-bento { grid-template-columns: 1fr }
  .sp-tile--feat { grid-column: 1 / -1 }
  .sp-dash__name { display: none }
  .sp-footer__cols { flex-wrap: wrap; gap: 32px }
  .sp-footer__bottom { flex-direction: column; align-items: flex-start; gap: 10px }
}
      `}</style>
    </div>
  );
}
