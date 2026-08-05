"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/* Shared content primitives for the /install-guide pages -- terminal
   blocks, numbered steps, tables, callouts. Kept separate from docs-shell
   (the page chrome) since these are content-level, reused across pages. */

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="dc-eyebrow">{children}</p>;
}

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="dc-h1">{children}</h1>;
}

export function Lede({ children }: { children: React.ReactNode }) {
  return <p className="dc-lede">{children}</p>;
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 className="dc-h2" id={id}>{children}</h2>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="dc-p">{children}</p>;
}

export function TermBlock({ lines, copyText }: { lines: React.ReactNode; copyText: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="dc-term">
      <div className="dc-term__bar">
        <span className="dc-term__dot" style={{ background: "#f2777a" }} />
        <span className="dc-term__dot" style={{ background: "#f4c059" }} />
        <span className="dc-term__dot" style={{ background: "#5ec269" }} />
        <span className="dc-term__title">bash</span>
        <button
          type="button"
          className="dc-term__copy"
          aria-label="Copy command"
          onClick={() => {
            navigator.clipboard?.writeText(copyText).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
      <div className="dc-term__body">{lines}</div>
    </div>
  );
}

export function Step({ n, title, children, last }: { n: React.ReactNode; title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className="dc-step">
      <div className="dc-step__rail">
        <div className="dc-step__num">{n}</div>
        {!last && <div className="dc-step__line" />}
      </div>
      <div className="dc-step__body">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function Callout({ tone = "warn", children }: { tone?: "warn" | "info"; children: React.ReactNode }) {
  return <div className={`dc-callout dc-callout--${tone}`}>{children}</div>;
}

export function Table({ head, rows, variant }: { head: string[]; rows: React.ReactNode[][]; variant?: "trouble" }) {
  return (
    <div className="dc-table-wrap">
      <table className={variant === "trouble" ? "dc-table dc-table--trouble" : "dc-table"}>
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MetaRow({ children }: { children: React.ReactNode }) {
  return <div className="dc-meta">{children}</div>;
}

export const DOCS_CONTENT_CSS = `
.dc-eyebrow { margin: 0 0 10px; font-family: var(--font-mono); font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }
.dc-h1 { margin: 0 0 14px; font-family: var(--font-display); font-size: clamp(1.7rem, 3.4vw, 2.15rem); font-weight: 700; line-height: 1.18; letter-spacing: -.02em; color: var(--ink) }
.dc-lede { margin: 0 0 28px; font-size: 1rem; line-height: 1.7; color: var(--muted); max-width: 60ch }
.dc-meta { display: flex; flex-wrap: wrap; gap: 8px 20px; margin: -14px 0 28px }
.dc-meta span { display: inline-flex; align-items: center; gap: 6px; font-size: .8rem; color: var(--muted-dim) }

.dc-h2 { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; letter-spacing: -.01em; color: var(--ink); margin: 40px 0 14px; scroll-margin-top: 76px }
.dc-h2:first-child { margin-top: 0 }
.dc-p { font-size: .92rem; line-height: 1.72; color: var(--ink-soft); margin: 0 0 12px }
.dc-p code { font-family: var(--font-mono); font-size: .82em; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px; color: var(--ink) }
.dc-p strong { color: var(--ink) }
.dc-list { margin: 0 0 12px; padding-left: 20px; color: var(--muted); font-size: .92rem; line-height: 1.8 }

.dc-step { display: flex; gap: 14px }
.dc-step__rail { display: flex; flex-direction: column; align-items: center; flex-shrink: 0 }
.dc-step__num { width: 26px; height: 26px; border-radius: 50%; background: var(--accent-deep); color: #fff; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: .74rem; font-weight: 700 }
.dc-step__line { flex: 1; width: 1px; background: var(--border-strong); margin: 4px 0 }
.dc-step__body { flex: 1; padding-bottom: 26px }
.dc-step__body h3 { margin: 0 0 8px; font-size: .96rem; font-weight: 700; color: var(--ink) }

.dc-term { border-radius: 10px; overflow: hidden; border: 1px solid var(--border-strong); box-shadow: 0 16px 36px -24px rgba(16,25,46,.32); margin: 10px 0 14px }
.dc-term__bar { display: flex; align-items: center; gap: 6px; background: #171b26; padding: 8px 12px }
.dc-term__dot { width: 9px; height: 9px; border-radius: 50% }
.dc-term__title { margin-left: 6px; font-family: var(--font-mono); font-size: .68rem; color: #7c869c }
.dc-term__copy { margin-left: auto; background: none; border: 1px solid rgba(255,255,255,.1); border-radius: 6px; color: #8892a6; padding: 3px 6px; cursor: pointer; display: flex; align-items: center }
.dc-term__copy:hover { border-color: rgba(255,255,255,.2); color: #fff }
.dc-term__body { background: #0d1117; padding: 13px 15px; font-family: var(--font-mono); font-size: .78rem; line-height: 1.85; overflow-x: auto }
.dc-p1 { color: #565f76; user-select: none }
.dc-cmd { color: #e6e9f2 }
.dc-out { color: #7c869c }
.dc-hl { color: #a599ff }
.dc-ok { color: #4ade80 }

.dc-callout { border-radius: 10px; padding: 13px 15px; font-size: .85rem; line-height: 1.65; margin: 4px 0 18px }
.dc-callout--warn { background: #fffbeb; color: var(--ink-soft) }
.dc-callout--info { background: var(--accent-soft); color: var(--ink-soft) }
.dc-callout strong { color: var(--ink) }
.dc-callout code { font-family: var(--font-mono); font-size: .85em; background: rgba(0,0,0,.05); border-radius: 4px; padding: 1px 5px }

.dc-table-wrap { overflow-x: auto; margin: 4px 0 18px }
.dc-table { width: 100%; border-collapse: collapse; font-size: .85rem }
.dc-table th { text-align: left; font-size: .68rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted-dim); font-weight: 700; padding: 0 12px 8px 0; border-bottom: 1px solid var(--border-strong) }
.dc-table td { padding: 10px 12px 10px 0; border-bottom: 1px solid var(--border); color: var(--ink-soft); vertical-align: top; line-height: 1.55 }
.dc-table code { font-family: var(--font-mono); font-size: .78rem; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px }
.dc-table--trouble td:first-child { color: var(--ink); font-weight: 600; width: 34% }

.dc-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px }
@media (max-width: 560px) { .dc-grid2 { grid-template-columns: 1fr } }
.dc-label { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--muted-dim); margin: 0 0 6px }

.dc-faq__item { padding: 16px 0; border-bottom: 1px solid var(--border) }
.dc-faq__item:first-child { padding-top: 0 }
.dc-faq__item:last-child { border-bottom: none }
.dc-faq__q { margin: 0 0 6px; font-weight: 700; font-size: .92rem; color: var(--ink) }
.dc-faq__a { margin: 0; font-size: .88rem; line-height: 1.65; color: var(--muted) }

.dc-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px }
@media (max-width: 560px) { .dc-cards { grid-template-columns: 1fr } }
.dc-card { display: flex; flex-direction: column; gap: 4px; border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: border-color .15s, transform .15s }
.dc-card:hover { border-color: var(--accent); transform: translateY(-1px) }
.dc-card .t { font-size: .9rem; font-weight: 700; color: var(--ink) }
.dc-card .d { font-size: .78rem; color: var(--muted) }
`;
