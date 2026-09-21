"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Markdown } from "@/lib/markdown";
import { QuizBlock } from "./quiz";
import type { Quiz } from "@/content/academy/quizzes";

interface TabSection {
  label: string;
  markdown: string;
}

// A page with a normal lesson's 5-6 sections reads fine as a row of pills.
// Home Lab has 9 -- past that, pills wrap into a ragged two-row mess with
// no clear reading order. Past VERTICAL_NAV_THRESHOLD, switch to a vertical
// list instead: full-width stacked on mobile (there's no room for a side
// column anyway), a fixed-width left column beside the content on desktop.
const VERTICAL_NAV_THRESHOLD = 6;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function SectionTabs({ sections, quiz }: { sections: TabSection[]; quiz?: Quiz }) {
  const tabLabels = quiz ? [...sections.map((s) => s.label), "Test yourself"] : sections.map((s) => s.label);
  const [active, setActive] = useState(0);
  // Expanded by default -- collapsing is an option for a long list like Home
  // Lab's 9 sections, not the default state. Collapsed shows just the
  // current section's name so context isn't lost while the list is hidden.
  const [collapsed, setCollapsed] = useState(false);
  const isQuizTab = quiz !== undefined && active === sections.length;
  const panel = isQuizTab ? <QuizBlock quiz={quiz!} /> : <Markdown content={sections[active].markdown} />;

  if (tabLabels.length > VERTICAL_NAV_THRESHOLD) {
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
            <span className={`truncate ${collapsed ? "md:hidden" : ""}`}>{collapsed ? tabLabels[active] : "Sections"}</span>
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
              {tabLabels.map((label, i) => (
                <button
                  key={label}
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
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 rounded-md border border-[var(--pvrx-border-light)] bg-white p-6 shadow-[0_1px_2px_rgba(16,25,46,0.04),0_20px_40px_-32px_rgba(16,25,46,0.18)] sm:p-8">
          {panel}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-[var(--pvrx-border-light)] pb-3">
        {tabLabels.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={`rounded-md px-3.5 py-2 text-sm font-semibold transition-colors duration-150 ${
              active === i ? "bg-[#5546e0] text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-md border border-[var(--pvrx-border-light)] bg-white p-6 shadow-[0_1px_2px_rgba(16,25,46,0.04),0_20px_40px_-32px_rgba(16,25,46,0.18)] sm:p-8">
        {panel}
      </div>
    </div>
  );
}
