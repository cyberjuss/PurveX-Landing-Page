"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Flag, FlaskConical, Wrench } from "lucide-react";
import { Markdown, splitMarkdownIntoSlides } from "@/lib/markdown";
import { CHALLENGE_PATHS, MISSION_CATALOG } from "@/lib/academy-missions";
import { QuizBlock } from "./quiz";
import { LabCarousel } from "./lab-carousel";
import { MissionPager } from "./mission-pager";
import type { Quiz } from "@/content/academy/quizzes";

interface TabSection {
  label: string;
  markdown: string;
}

type Item =
  | { kind: "section"; label: string; markdown: string }
  | { kind: "quiz"; label: string }
  | { kind: "lab"; label: string; markdown: string }
  | { kind: "challenge"; label: string; markdown: string }
  | { kind: "troubleshooting"; label: string; markdown: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function indexForHash(hash: string, items: Item[]): number {
  const raw = decodeURIComponent(hash.replace(/^#/, "")).toLowerCase();
  if (!raw) return 0;
  const mission = MISSION_CATALOG[raw];
  const want = mission ? CHALLENGE_PATHS[mission.challenge].tab : raw;
  const i = items.findIndex((it) => slugify(it.label) === want);
  return i >= 0 ? i : 0;
}

// A lab used to render as its own always-visible card below this panel --
// present on the page no matter which section you were actually reading.
// Folding it into the same switcher means it only takes up room once you
// pick it, same as every other section. Numbered items (sections + the
// quiz) count toward the "05/08" progress line; labs sit below a divider,
// icon-marked instead of numbered, since picking up a lab isn't the same
// kind of step as reading the next section.
export function SectionTabs({
  sections,
  quiz,
  labs,
  challenges,
  troubleshooting,
}: {
  sections: TabSection[];
  quiz?: Quiz;
  labs?: TabSection[];
  challenges?: TabSection[];
  troubleshooting?: TabSection[];
}) {
  const numberedItems: Item[] = [
    ...sections.map((s): Item => ({ kind: "section", label: s.label, markdown: s.markdown })),
    ...(quiz ? [{ kind: "quiz", label: "Quiz" } as Item] : []),
  ];
  const labItems: Item[] = (labs ?? []).map((l) => ({ kind: "lab", label: l.label, markdown: l.markdown }));
  const challengeItems: Item[] = (challenges ?? []).map((c) => ({ kind: "challenge", label: c.label, markdown: c.markdown }));
  const troubleshootingItems: Item[] = (troubleshooting ?? []).map((t) => ({ kind: "troubleshooting", label: t.label, markdown: t.markdown }));
  const items = [...numberedItems, ...labItems, ...challengeItems, ...troubleshootingItems];

  const [active, setActive] = useState(0);
  const [quizFoot, setQuizFoot] = useState<HTMLElement | null>(null);
  // Expanded by default -- collapsing is an option for a long list like Home
  // Lab's 9 sections, not the default state. Collapsed shows just the
  // current section's name so context isn't lost while the list is hidden.
  const [collapsed, setCollapsed] = useState(false);
  const current = items[active];
  const prevItem = active > 0 ? items[active - 1] : null;
  const nextItem = active < items.length - 1 ? items[active + 1] : null;

  useEffect(() => {
    const apply = () => setActive(indexForHash(window.location.hash, items));
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
    // items is rebuilt each render from the same labels; hash is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!MISSION_CATALOG[id]) return;
    const jump = () => {
      document
        .querySelector<HTMLElement>(`.ad-mission[data-id="${CSS.escape(id)}"]`)
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    };
    const t = window.setTimeout(jump, 60);
    return () => window.clearTimeout(t);
  }, [active]);

  const panel =
    current.kind === "quiz" ? (
      <QuizBlock quiz={quiz!} actionHost={quizFoot} />
    ) : current.kind === "lab" ? (
      <div>
        {/* Keyed on the label so switching labs remounts this instead of
            reusing the instance -- otherwise it kept whatever step index
            you were on in the previous lab instead of starting over at
            Overview. */}
        <LabCarousel key={current.label} slides={splitMarkdownIntoSlides(current.markdown)} />
      </div>
    ) : (
      <MissionPager
        key={current.label}
        prevSection={prevItem ? { label: prevItem.label, go: () => setActive(active - 1) } : null}
        nextSection={nextItem ? { label: nextItem.label, go: () => setActive(active + 1) } : null}
      >
        <Markdown content={current.markdown} />
      </MissionPager>
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
          className={`ax-index__toggle flex w-full items-center gap-2 py-2 text-left ${
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
                className={`ax-tab ${active === i ? "ax-tab--on" : ""}`}
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
                    className={`ax-tab ${active === idx ? "ax-tab--on" : ""}`}
                  >
                    <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {/* Lab titles run longer than a section's ("Network
                        Forensics -- Hidden Tear Ransomware") -- truncating
                        to one line lost the part that actually identifies
                        the lab, so this wraps instead. */}
                    <span className="min-w-0">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          {challengeItems.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5 overflow-hidden border-t border-[var(--pvrx-border-light)] pt-2">
              <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-400">Challenges</p>
              {challengeItems.map((item, i) => {
                const idx = numberedItems.length + labItems.length + i;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="tab"
                    tabIndex={collapsed ? -1 : 0}
                    aria-selected={active === idx}
                    onClick={() => setActive(idx)}
                    className={`ax-tab ${active === idx ? "ax-tab--on" : ""}`}
                  >
                    <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0">
                      {item.label}
                      {item.label === "Ticket Queue" && <i className="ax-tab__hands">Hands</i>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {troubleshootingItems.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5 overflow-hidden border-t border-[var(--pvrx-border-light)] pt-2">
              <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-400">Troubleshooting</p>
              {troubleshootingItems.map((item, i) => {
                const idx = numberedItems.length + labItems.length + challengeItems.length + i;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="tab"
                    tabIndex={collapsed ? -1 : 0}
                    aria-selected={active === idx}
                    onClick={() => setActive(idx)}
                    className={`ax-tab ${active === idx ? "ax-tab--on" : ""}`}
                  >
                    <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="ax-panel min-w-0 flex-1">
        <div className="py-2 sm:py-4">{panel}</div>

        {/* Lets you read straight through a lesson without dropping back to
            the sidebar after every section -- and, once it reaches the labs,
            the same control that was previously only reachable by clicking
            a sidebar link. */}
        {items.length > 1 && current.kind !== "challenge" && (
          <div className="ax-panel__foot">
            <button
              type="button"
              onClick={() => setActive((a) => Math.max(0, a - 1))}
              disabled={active === 0}
              aria-label="Previous section"
              className="ax-step"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{active > 0 ? items[active - 1].label : "Previous"}</span>
            </button>

            <span className={current.kind === "quiz" ? "ax-panel__action" : "ax-panel__count"} ref={setQuizFoot}>
              {current.kind === "quiz" ? null : `${pad(active + 1)} / ${pad(items.length)}`}
            </span>

            <button
              type="button"
              onClick={() => setActive((a) => Math.min(items.length - 1, a + 1))}
              disabled={active === items.length - 1}
              aria-label="Next section"
              className="ax-step ax-step--next"
            >
              <span className="hidden sm:inline">{active < items.length - 1 ? items[active + 1].label : "Next"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
