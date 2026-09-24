"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Markdown } from "@/lib/markdown";
import type { MarkdownSlide } from "@/lib/markdown";
import { TrailDock, type TrailLink } from "./trail-dock";

// A lab used to be one long scroll of Step 1 through Step N. This shows
// one slide at a time instead -- buttons, arrow keys, and a swipe on
// touch devices all move between them, matching how a phone gallery or
// a slide deck behaves rather than a page you scroll down forever.
export function LabCarousel({
  slides,
  actionHost,
  prevBeyond,
  nextBeyond,
}: {
  slides: MarkdownSlide[];
  actionHost?: HTMLElement | null;
  prevBeyond?: TrailLink | null;
  nextBeyond?: TrailLink | null;
}) {
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

  const nav = (
    <TrailDock
      prev={{
        go: () => (index === 0 ? prevBeyond?.go() : go(index - 1)),
        disabled: index === 0 && !prevBeyond,
        label: index === 0 && prevBeyond ? prevBeyond.label : "Previous",
      }}
      next={{
        go: () => (index === total - 1 ? nextBeyond?.go() : go(index + 1)),
        disabled: index === total - 1 && !nextBeyond,
        label: index === total - 1 && nextBeyond ? nextBeyond.label : "Next",
      }}
      center={
        <span className="ax-panel__count">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      }
    />
  );

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
        <div key={index} className={dir === 1 ? "academy-slide-in-right" : "academy-slide-in-left"}>
          <Markdown content={slides[index].markdown} />
        </div>
      </div>
      {actionHost ? createPortal(nav, actionHost) : nav}
    </div>
  );
}
