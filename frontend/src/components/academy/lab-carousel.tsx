"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Markdown } from "@/lib/markdown";
import type { MarkdownSlide } from "@/lib/markdown";

// A lab used to be one long scroll of Step 1 through Step N. This shows
// one slide at a time instead -- buttons, arrow keys, and a swipe on
// touch devices all move between them, matching how a phone gallery or
// a slide deck behaves rather than a page you scroll down forever.
export function LabCarousel({ slides }: { slides: MarkdownSlide[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);
  const total = slides.length;

  function go(next: number) {
    const clamped = Math.max(0, Math.min(total - 1, next));
    if (clamped === index) return;
    setDir(clamped > index ? 1 : -1);
    setIndex(clamped);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? index + 1 : index - 1);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  }

  if (total === 0) return null;

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`Lab steps, slide ${index + 1} of ${total}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="overflow-hidden outline-none"
      >
        <div key={index} className={`p-6 sm:p-8 ${dir === 1 ? "academy-slide-in-right" : "academy-slide-in-left"}`}>
          <Markdown content={slides[index].markdown} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--pvrx-border-light)] px-6 py-3 sm:px-8">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous step"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-sm bg-slate-100">
            <div
              className="h-full rounded-sm bg-[#5546e0] transition-all duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-xs text-slate-400">
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === total - 1}
          aria-label="Next step"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
