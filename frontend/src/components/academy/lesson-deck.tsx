"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Recap, SlideBody } from "./slide-body";
import { splitLessonIntoDeck } from "@/lib/lesson-deck";
import { TrailDock, type TrailLink } from "./trail-dock";
import { SlideArt, pickScenes } from "./slide-art";
import { DragActivity } from "./drag-activity";
import "./lesson-deck.css";

// A lesson section shown as a slide deck: one idea per slide, a title on
// each, an animated drawing or the section's own screenshot beside the text, and the
// same Previous / Next dock the rest of the lesson uses. At either end the
// dock steps into the neighbouring section, so the deck and the tabs read as
// one run of slides.
export function LessonDeck({
  label,
  markdown,
  storageKey,
  startAtEnd,
  actionHost,
  prevBeyond,
  nextBeyond,
}: {
  label: string;
  markdown: string;
  storageKey: string;
  /** Open on the last slide, for a student stepping back from the next section. */
  startAtEnd?: boolean;
  actionHost?: HTMLElement | null;
  prevBeyond?: TrailLink | null;
  nextBeyond?: TrailLink | null;
}) {
  const slides = useMemo(() => splitLessonIntoDeck(markdown, label), [markdown, label]);
  // A slide that carries on a heading keeps the drawing that heading started
  // with, rather than switching because its own paragraph mentions something else.
  const scenes = useMemo(() => pickScenes(slides, label), [slides, label]);
  const total = slides.length;
  const [index, setIndex] = useState(() => (startAtEnd ? Math.max(0, total - 1) : 0));
  const [dir, setDir] = useState<1 | -1>(1);
  const [replay, setReplay] = useState(0);
  const moved = useRef(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const key = () => `academy-deck:${window.location.pathname}:${storageKey}`;
  useEffect(() => {
    if (startAtEnd) return;
    try {
      const saved = Number(window.sessionStorage.getItem(key()));
      if (saved > 0 && saved < total) setIndex(saved);
    } catch {}
    // Restore once on mount; the key is fixed for this instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(next: number) {
    const to = Math.max(0, Math.min(total - 1, next));
    if (to === index) return;
    moved.current = true;
    setDir(to > index ? 1 : -1);
    setIndex(to);
    try {
      window.sessionStorage.setItem(key(), String(to));
    } catch {}
    const top = deckRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      deckRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  }
  const back = () => (index === 0 ? prevBeyond?.go() : go(index - 1));
  const forward = () => (index === total - 1 ? nextBeyond?.go() : go(index + 1));

  function onKeyDown(e: React.KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable], .lkd")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      forward();
    }
    if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      back();
    }
  }

  if (total === 0) return null;
  const slide = slides[Math.min(index, total - 1)];
  const scene = scenes[Math.min(index, total - 1)];

  const nav = (
    <TrailDock
      prev={{ go: back, disabled: index === 0 && !prevBeyond }}
      next={{ go: forward, disabled: index === total - 1 && !nextBeyond }}
      center={
        <span className="ax-panel__count">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      }
    />
  );

  return (
    <div className="lk" ref={deckRef}>
      <div
        className="lk__frame"
        role="group"
        aria-roledescription="slide"
        aria-label={`${label}, slide ${index + 1} of ${total}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        // A drag inside an activity is not a swipe to the next slide.
        onTouchStart={(e) => (touchX.current = (e.target as HTMLElement).closest(".lkd") ? null : e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(delta) >= 48) (delta < 0 ? forward : back)();
        }}
      >
        {total > 1 && (
          <div className="lk__progress" role="tablist" aria-label="Slides">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${s.title}`}
                className={i < index ? "is-past" : i === index ? "is-here" : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
        )}
        <div
          key={index}
          className={`lk__slide${slide.visual ? " lk__slide--media" : ""}${slide.activity || slide.recap ? " lk__slide--activity" : ""}${
            slide.recap ? " lk__slide--recap" : ""
          }${moved.current ? (dir === 1 ? " ax-enter-fwd" : " ax-enter-back") : ""}`}
        >
          <header className="lk__head">
            {slide.recap ? (
              <span className="rd-kicker">In 30 seconds</span>
            ) : slide.activity ? (
              <span className="rd-kicker">Try it</span>
            ) : (
              slide.title !== label && <span className="rd-kicker">{label}</span>
            )}
            <h2 className="lk__title">
              {slide.recap ? `What ${label} taught you` : slide.activity ? label : slide.title}
              {slide.cont ? <span className="lk__cont"> (cont.)</span> : null}
            </h2>
          </header>
          <div className="lk__body">
            {slide.recap ? (
              <Recap items={slide.recap} slides={total - 1} activities={slides.filter((s) => s.activity).length} />
            ) : slide.activity ? (
              <DragActivity activity={slide.activity} />
            ) : (
              <>
                {!slide.visual && (
                  // Tapping the drawing plays it again from the start.
                  <button
                    type="button"
                    className="lk__art"
                    aria-label="Replay the animation"
                    onClick={() => setReplay((n) => n + 1)}
                  >
                    <SlideArt key={replay} scene={scene} />
                    <span className="lk__replay" aria-hidden>
                      Replay
                    </span>
                  </button>
                )}
                <SlideBody markdown={slide.markdown} />
              </>
            )}
          </div>
        </div>
      </div>
      {actionHost ? createPortal(nav, actionHost) : nav}
    </div>
  );
}
