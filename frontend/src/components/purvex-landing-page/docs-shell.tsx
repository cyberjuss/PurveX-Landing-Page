"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOCS_CONTENT_CSS } from "./docs-content";

/* ─────────────────────────────────────────────────────────
   PurveX Install Guide — docs shell
   A dedicated, minimal shell (not the marketing SiteChrome) --
   real docs sites use their own focused nav, not the full mega
   menu. Same tokens and type as chrome.tsx and the Academy portal
   (Space Grotesk, mono kickers, hairlines), scoped locally so this
   shell works standalone.
   ───────────────────────────────────────────────────────── */

export type GuidePageId =
  | "overview" | "features" | "installation" | "first-run" | "windows"
  | "detection-validation" | "runners-and-policy" | "detections" | "team-and-access" | "platform-tools"
  | "data-handling" | "faq" | "troubleshooting";

interface NavItem {
  id: GuidePageId;
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Get started",
    items: [
      { id: "overview", label: "Overview", href: "/install-guide" },
      { id: "features", label: "Capabilities", href: "/install-guide/features" },
      { id: "installation", label: "Installation", href: "/install-guide/installation" },
      { id: "first-run", label: "First run", href: "/install-guide/first-run" },
      { id: "windows", label: "Windows setup", href: "/install-guide/windows" },
    ],
  },
  {
    label: "Features",
    items: [
      { id: "detection-validation", label: "Validation", href: "/install-guide/features/detection-validation" },
      { id: "runners-and-policy", label: "Runners", href: "/install-guide/features/runners-and-policy" },
      { id: "detections", label: "Detections", href: "/install-guide/features/detections" },
      { id: "team-and-access", label: "Team", href: "/install-guide/features/team-and-access" },
      { id: "platform-tools", label: "Tools", href: "/install-guide/features/platform-tools" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "data-handling", label: "Data handling", href: "/install-guide/data-handling" },
      { id: "faq", label: "FAQ", href: "/install-guide/faq" },
      { id: "troubleshooting", label: "Troubleshooting", href: "/install-guide/troubleshooting" },
    ],
  },
];

const FLAT_NAV: NavItem[] = NAV.flatMap((g) => g.items);

function activeFromPathname(pathname: string | null): GuidePageId {
  const match = FLAT_NAV.find((item) => item.href === pathname);
  return match?.id ?? "overview";
}

function getAdjacentPages(current: GuidePageId): { prev: NavItem | null; next: NavItem | null } {
  const i = FLAT_NAV.findIndex((item) => item.id === current);
  return {
    prev: i > 0 ? FLAT_NAV[i - 1] : null,
    next: i >= 0 && i < FLAT_NAV.length - 1 ? FLAT_NAV[i + 1] : null,
  };
}

function Sidebar({ active }: { active: GuidePageId }) {
  return (
    <nav className="ds-sidebar" aria-label="Install guide sections">
      {NAV.map((group) => (
        <div className="ds-sidebar__group" key={group.label}>
          <p className="ds-sidebar__label">{group.label}</p>
          {group.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn("ds-sidebar__link", active === item.id && "ds-sidebar__link--active")}
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = activeFromPathname(pathname);
  const { prev, next } = getAdjacentPages(active);
  const activeLabel = FLAT_NAV.find((item) => item.id === active)?.label ?? "Sections";

  // Sidebar starts expanded (matches the pre-JS/SSR markup, so there's no
  // hydration mismatch) and only collapses once we know we're on a narrow
  // viewport -- desktop always keeps the full nav open, mobile starts
  // collapsed so a visitor lands on page content, not a 13-link nav dump.
  const [navOpen, setNavOpen] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 861px)");
    const sync = () => setNavOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
    // Re-sync on navigation too, so picking a link on mobile collapses the
    // nav back down for the page that loads rather than leaving it open.
  }, [pathname]);

  return (
    <div className="ds">
      <header className="ds-topbar">
        <div className="ds-topbar__inner">
          <Link href="/" className="ds-logo">
            <Image src="/logo.png" alt="PurveX" width={26} height={26} className="ds-logo__img" />
            <span>PurveX</span>
            <span className="ds-logo__divider" />
            <span className="ds-logo__suffix">Install Guide</span>
          </Link>
          <Link href="/" className="ds-back">
            <ArrowLeft size={14} />
            Back to site
          </Link>
        </div>
      </header>

      <div className="ds-layout">
        <aside className="ds-aside">
          <details className="ds-aside__toggle" open={navOpen} onToggle={(e) => setNavOpen(e.currentTarget.open)}>
            <summary className="ds-aside__summary">
              <span>{activeLabel}</span>
              <ChevronDown size={16} className="ds-aside__chev" />
            </summary>
            <Sidebar active={active} />
          </details>
        </aside>

        <main className="ds-main">
          <div className="ds-main__inner">
            {children}

            <div className="ds-pagenav">
              {prev ? (
                <Link href={prev.href} className="ds-pagenav__link ds-pagenav__link--prev">
                  <ArrowLeft size={15} />
                  <span><span className="ds-pagenav__eyebrow">Previous</span>{prev.label}</span>
                </Link>
              ) : <span />}
              {next ? (
                <Link href={next.href} className="ds-pagenav__link ds-pagenav__link--next">
                  <span><span className="ds-pagenav__eyebrow">Next</span>{next.label}</span>
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <a href="https://calendly.com/purvex-llc/30min" className="ds-pagenav__link ds-pagenav__link--next">
                  <span><span className="ds-pagenav__eyebrow">Still stuck?</span>Talk to the team</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{DOCS_CSS}</style>
      <style>{DOCS_CONTENT_CSS}</style>
    </div>
  );
}

const DOCS_CSS = `
.ds {
  --bg: #ffffff; --surface: #ffffff; --surface-alt: #f8fafc;
  --border: rgba(15,23,42,.1); --border-strong: rgba(15,23,42,.18);
  --ink: #0f172a; --ink-soft: #475569; --muted: #64748b; --muted-dim: #8a94a8;
  --accent: #6a5cff; --accent-deep: #5546e0; --accent-soft: rgba(85,70,224,.07);
  --font-display: var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  min-height: 100vh; background: var(--bg); color: var(--ink); font-family: var(--font-body);
}

.ds-topbar { position: sticky; top: 0; z-index: 30; background: rgba(255,255,255,.9); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border) }
.ds-topbar__inner { max-width: 1180px; margin: 0 auto; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px }
.ds-logo { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; color: var(--ink); font-family: var(--font-display); font-weight: 600; font-size: 1.02rem; letter-spacing: -.03em }
.ds-logo__img { border-radius: 6px }
.ds-logo__divider { width: 1px; height: 16px; background: var(--border-strong) }
.ds-logo__suffix { color: var(--muted); font-weight: 500 }
.ds-back { display: inline-flex; align-items: center; gap: 6px; font-size: .82rem; font-weight: 600; color: var(--muted); text-decoration: none; transition: color .15s }
.ds-back:hover { color: var(--accent-deep) }

.ds-layout { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 216px 1fr; gap: 0; align-items: start }
@media (max-width: 860px) { .ds-layout { grid-template-columns: 1fr } }

.ds-aside { position: sticky; top: 60px; align-self: start; height: calc(100vh - 60px); overflow-y: auto; padding: 32px 16px 32px 24px; border-right: 1px solid var(--border) }
.ds-aside__summary { display: none }
@media (max-width: 860px) {
  .ds-aside { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 0 }
  /* Collapsed by default on mobile so a visitor lands on the page content,
     not a 13-link nav list, before ever seeing what they came for. */
  .ds-aside__toggle { padding: 14px 24px }
  .ds-aside__summary {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    list-style: none; cursor: pointer;
    font-size: .85rem; font-weight: 700; color: var(--ink);
  }
  .ds-aside__summary::-webkit-details-marker { display: none }
  .ds-aside__chev { flex-shrink: 0; color: var(--muted-dim); transition: transform .2s }
  .ds-aside__toggle[open] .ds-aside__chev { transform: rotate(180deg) }
  .ds-aside__toggle .ds-sidebar { margin-top: 18px }
}

.ds-sidebar__group + .ds-sidebar__group { margin-top: 22px }
.ds-sidebar__label { margin: 0 0 8px; font-family: var(--font-mono); font-size: .64rem; font-weight: 700; text-transform: uppercase; letter-spacing: .16em; color: var(--muted-dim) }
.ds-sidebar__link { position: relative; display: block; padding: 6px 12px; margin: 0 -12px; font-size: .86rem; font-weight: 500; color: var(--ink-soft); text-decoration: none; transition: color .15s }
.ds-sidebar__link::before { content: ""; position: absolute; left: 0; top: 50%; width: 2px; height: 16px; background: var(--accent-deep); transform: translateY(-50%) scaleY(0); transition: transform .2s }
.ds-sidebar__link:hover { color: var(--ink) }
.ds-sidebar__link--active { color: var(--ink); font-weight: 600 }
.ds-sidebar__link--active::before { transform: translateY(-50%) scaleY(1) }

.ds-main { min-width: 0; padding: 0 24px }
.ds-main__inner { max-width: 720px; margin: 0 auto; padding: 48px 0 80px }

.ds-pagenav { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--border) }
@media (max-width: 560px) { .ds-pagenav { grid-template-columns: 1fr } }
.ds-pagenav__link { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 0; padding: 14px 16px; text-decoration: none; color: var(--ink); font-family: var(--font-display); font-size: .95rem; font-weight: 600; letter-spacing: -.02em; transition: border-color .15s, background .15s }
.ds-pagenav__link:hover { border-color: var(--accent-deep); background: var(--surface-alt) }
.ds-pagenav__link--next { grid-column: 2; justify-content: flex-end; text-align: right }
@media (max-width: 560px) { .ds-pagenav__link--next { grid-column: 1 } }
.ds-pagenav__eyebrow { display: block; font-family: var(--font-mono); font-size: .6rem; font-weight: 700; text-transform: uppercase; letter-spacing: .16em; color: var(--muted-dim); margin-bottom: 4px }
`;
