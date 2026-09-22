"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { Markdown, splitMarkdownIntoSlides } from "@/lib/markdown";
import { QuizBlock } from "./quiz";
import { LabCarousel } from "./lab-carousel";
import type { Quiz } from "@/content/academy/quizzes";

interface TabSection {
  label: string;
  markdown: string;
}

type Item =
  | { kind: "section"; label: string; markdown: string }
  | { kind: "quiz"; label: string }
  | { kind: "lab"; label: string; markdown: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// A lab used to render as its own always-visible card below this panel --
// present on the page no matter which section you were actually reading.
// Folding it into the same switcher means it only takes up room once you
// pick it, same as every other section. Numbered items (sections + the
// quiz) count toward the "05/08" progress line; labs sit below a divider,
// icon-marked instead of numbered, since picking up a lab isn't the same
// kind of step as reading the next section.
export function SectionTabs({ sections, quiz, labs }: { sections: TabSection[]; quiz?: Quiz; labs?: TabSection[] }) {
  const numberedItems: Item[] = [
    ...sections.map((s): Item => ({ kind: "section", label: s.label, markdown: s.markdown })),
    ...(quiz ? [{ kind: "quiz", label: "Test yourself" } as Item] : []),
  ];
  const labItems: Item[] = (labs ?? []).map((l) => ({ kind: "lab", label: l.label, markdown: l.markdown }));
  const items = [...numberedItems, ...labItems];

  const [active, setActive] = useState(0);
  // Expanded by default -- collapsing is an option for a long list like Home
  // Lab's 9 sections, not the default state. Collapsed shows just the
  // current section's name so context isn't lost while the list is hidden.
  const [collapsed, setCollapsed] = useState(false);
  const current = items[active];

  const panel =
    current.kind === "quiz" ? (
      <QuizBlock quiz={quiz!} />
    ) : current.kind === "lab" ? (
      <div>
        <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5546e0]">
          <FlaskConical className="h-3.5 w-3.5" /> Hands-on lab
        </p>
        <LabCarousel slides={splitMarkdownIntoSlides(current.markdown)} />
      </div>
    ) : (
      <Markdown content={current.markdown} />
    );

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
      <div
        className={`shrink-0 transition-[width] duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
          collapsed ? "md:w-12" : "md:w-[196px]"
        }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sections" : "Collapse sections"}
          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:bg-slate-50 ${
            collapsed ? "justify-between md:justify-center" : "justify-between"
          }`}
        >
          {/* On desktop, collapsing frees the column's width for the content
              panel to expand into -- there's no room left for the label, so
              only the chevron stays. Mobile never collapses width (it's a
              single stacked column there), so the label stays visible. */}
          <span className={`truncate ${collapsed ? "md:hidden" : ""}`}>{collapsed ? current.label : "Sections"}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${collapsed ? "md:-rotate-90" : "rotate-180"}`} />
        </button>
        {/* Always mounted (never conditionally rendered) so the collapse
            can animate -- a grid row tweened between 0fr and 1fr shrinks
            the list inward instead of the list just popping in/out. */}
        <div
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
            collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
          aria-hidden={collapsed}
        >
          <div role="tablist" aria-orientation="vertical" className="flex flex-col gap-0.5 overflow-hidden pt-1">
            {numberedItems.map((item, i) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                tabIndex={collapsed ? -1 : 0}
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors duration-150 ${
                  active === i ? "bg-[rgba(106,92,255,0.1)] text-[#5546e0]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="font-mono text-[10px] font-normal text-slate-400">{pad(i + 1)}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
          {labItems.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5 overflow-hidden border-t border-[var(--pvrx-border-light)] pt-2">
              <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-400">Labs</p>
              {labItems.map((item, i) => {
                const idx = numberedItems.length + i;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="tab"
                    tabIndex={collapsed ? -1 : 0}
                    aria-selected={active === idx}
                    onClick={() => setActive(idx)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors duration-150 ${
                      active === idx ? "bg-[rgba(106,92,255,0.1)] text-[#5546e0]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-[var(--pvrx-border-light)] bg-white shadow-[0_1px_2px_rgba(16,25,46,0.04),0_20px_40px_-32px_rgba(16,25,46,0.18)]">
        <div className="p-6 sm:p-8">{panel}</div>

        {/* Lets you read straight through a lesson without dropping back to
            the sidebar after every section -- and, once it reaches the labs,
            the same control that was previously only reachable by clicking
            a sidebar link. */}
        {items.length > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--pvrx-border-light)] px-6 py-3 sm:px-8">
            <button
              type="button"
              onClick={() => setActive((a) => Math.max(0, a - 1))}
              disabled={active === 0}
              aria-label="Previous section"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="flex-1 text-center font-mono text-xs text-slate-400">
              {pad(active + 1)}/{pad(items.length)}
            </span>

            <button
              type="button"
              onClick={() => setActive((a) => Math.min(items.length - 1, a + 1))}
              disabled={active === items.length - 1}
              aria-label="Next section"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
