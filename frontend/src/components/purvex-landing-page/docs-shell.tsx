"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOCS_CONTENT_CSS } from "./docs-content";

/* ─────────────────────────────────────────────────────────
   PurveX Install Guide — docs shell
   A dedicated, minimal shell (not the marketing SiteChrome) --
   real docs sites use their own focused nav, not the full mega
   menu. Same brand tokens as chrome.tsx (#6a5cff/#5546e0), just
   scoped locally so this shell works standalone.
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
      { id: "features", label: "Features", href: "/install-guide/features" },
      { id: "installation", label: "Installation", href: "/install-guide/installation" },
      { id: "first-run", label: "First run", href: "/install-guide/first-run" },
      { id: "windows", label: "Windows setup", href: "/install-guide/windows" },
    ],
  },
  {
    label: "Feature details",
    items: [
      { id: "detection-validation", label: "Detection validation", href: "/install-guide/features/detection-validation" },
      { id: "runners-and-policy", label: "Runners & testing policy", href: "/install-guide/features/runners-and-policy" },
      { id: "detections", label: "Detections & Detection-as-Code", href: "/install-guide/features/detections" },
      { id: "team-and-access", label: "Team & access", href: "/install-guide/features/team-and-access" },
      { id: "platform-tools", label: "Platform tools", href: "/install-guide/features/platform-tools" },
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
          <Sidebar active={active} />
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
  --bg: #fbfcfe; --surface: #ffffff; --surface-alt: #f5f7fc;
  --border: #e6eaf2; --border-strong: #d6dcea;
  --ink: #10192e; --ink-soft: #3f4a63; --muted: #64708a; --muted-dim: #8a95ac;
  --accent: #6a5cff; --accent-deep: #5546e0; --accent-soft: #eef0ff;
  --font-display: var(--font-inter), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  min-height: 100vh; background: var(--bg); color: var(--ink); font-family: var(--font-body);
}

.ds-topbar { position: sticky; top: 0; z-index: 30; background: rgba(251,252,254,.88); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border) }
.ds-topbar__inner { max-width: 1180px; margin: 0 auto; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px }
.ds-logo { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; color: var(--ink); font-family: var(--font-display); font-weight: 700; font-size: .96rem; letter-spacing: -.01em }
.ds-logo__img { border-radius: 6px }
.ds-logo__divider { width: 1px; height: 16px; background: var(--border-strong) }
.ds-logo__suffix { color: var(--muted); font-weight: 600 }
.ds-back { display: inline-flex; align-items: center; gap: 6px; font-size: .82rem; font-weight: 600; color: var(--muted); text-decoration: none; transition: color .15s }
.ds-back:hover { color: var(--accent-deep) }

.ds-layout { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 216px 1fr; gap: 0; align-items: start }
@media (max-width: 860px) { .ds-layout { grid-template-columns: 1fr } }

.ds-aside { position: sticky; top: 60px; align-self: start; height: calc(100vh - 60px); overflow-y: auto; padding: 32px 16px 32px 24px; border-right: 1px solid var(--border) }
@media (max-width: 860px) { .ds-aside { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 20px 24px } }

.ds-sidebar__group + .ds-sidebar__group { margin-top: 22px }
.ds-sidebar__label { margin: 0 0 8px; font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted-dim) }
.ds-sidebar__link { display: block; padding: 6px 10px; margin: 0 -10px; border-radius: 7px; font-size: .85rem; font-weight: 500; color: var(--ink-soft); text-decoration: none; transition: background .15s, color .15s }
.ds-sidebar__link:hover { background: var(--surface-alt); color: var(--ink) }
.ds-sidebar__link--active { background: var(--accent-soft); color: var(--accent-deep); font-weight: 700 }

.ds-main { min-width: 0; padding: 0 24px }
.ds-main__inner { max-width: 720px; margin: 0 auto; padding: 48px 0 80px }

.ds-pagenav { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--border) }
@media (max-width: 560px) { .ds-pagenav { grid-template-columns: 1fr } }
.ds-pagenav__link { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; text-decoration: none; color: var(--ink); font-size: .88rem; font-weight: 600; transition: border-color .15s, transform .15s }
.ds-pagenav__link:hover { border-color: var(--accent); transform: translateY(-1px) }
.ds-pagenav__link--next { grid-column: 2; justify-content: flex-end; text-align: right }
@media (max-width: 560px) { .ds-pagenav__link--next { grid-column: 1 } }
.ds-pagenav__eyebrow { display: block; font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--muted-dim); margin-bottom: 2px }
`;
