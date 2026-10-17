"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard } from "lucide-react";
import { Recap, SlideBody } from "./slide-body";
import { splitLessonIntoDeck } from "@/lib/lesson-deck";
import type { TrailLink } from "./trail-dock";
import { SlideArt, pickScenes, type Scene } from "./slide-art";
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
  prevBeyond,
  nextBeyond,
  weekScenes,
}: {
  label: string;
  markdown: string;
  storageKey: string;
  /** Open on the last slide, for a student stepping back from the next section. */
  startAtEnd?: boolean;
  prevBeyond?: TrailLink | null;
  nextBeyond?: TrailLink | null;
  /** Drawings picked across the whole week, so no tab repeats another's. */
  weekScenes?: Scene[];
}) {
  const slides = useMemo(() => splitLessonIntoDeck(markdown, label), [markdown, label]);
  // A slide that carries on a heading keeps the drawing that heading started
  // with, rather than switching because its own paragraph mentions something else.
  const scenes = useMemo(
    () => (weekScenes && weekScenes.length === slides.length ? weekScenes : pickScenes(slides, label)),
    [weekScenes, slides, label]
  );
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

  // Left and right arrows turn the slide from anywhere on the page, not only
  // once the slide has focus. They stand down while the student is typing,
  // working an activity, holding a modifier (Alt+Left is the browser's Back),
  // or looking at a screenshot or any other dialog, which use the arrows
  // themselves.
  const [help, setHelp] = useState(false);
  // A click anywhere outside the corner closes the list of keys.
  useEffect(() => {
    if (!help) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.(".lk__corner")) setHelp(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [help]);
  const keys = useRef({ back, forward, toggleHelp: () => setHelp((h) => !h), closeHelp: () => setHelp(false) });
  keys.current = { back, forward, toggleHelp: () => setHelp((h) => !h), closeHelp: () => setHelp(false) };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("input, textarea, select, [contenteditable], .lkd, [role='dialog'], [aria-modal='true']")) return;
      if (document.querySelector(".ad-zoom, [aria-modal='true']")) return;
      if (e.key === "?") {
        e.preventDefault();
        keys.current.toggleHelp();
        return;
      }
      if (e.key === "Escape") {
        keys.current.closeHelp();
        return;
      }
      const space = e.key === " ";
      // Space on a focused button or link presses it, as it always has. The
      // tabs, the progress bar, the drawing and the keys button are the
      // exception: after clicking one, Space should still turn the slide.
      if (space && target?.closest?.("a, summary, [role='button'], button:not([role='tab']):not(.lk__art):not(.lk__keys)")) return;
      const right = (!e.shiftKey && (e.key === "ArrowRight" || e.key === "PageDown" || space));
      const left = (!e.shiftKey && (e.key === "ArrowLeft" || e.key === "PageUp")) || (e.shiftKey && space);
      if (!right && !left) return;
      e.preventDefault();
      if (right) keys.current.forward();
      else keys.current.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (total === 0) return null;
  const slide = slides[Math.min(index, total - 1)];
  const scene = scenes[Math.min(index, total - 1)];

  const count = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <div className="lk" ref={deckRef}>
      <div
        className="lk__frame"
        role="group"
        aria-roledescription="slide"
        aria-label={`${label}, slide ${index + 1} of ${total}`}
        tabIndex={0}
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
        <div className="lk__corner">
          <span className="lk__count" aria-hidden>
            {count}
          </span>
          <button
            type="button"
            className={`lk__keys${help ? " is-open" : ""}`}
            aria-expanded={help}
            aria-controls="lk-help"
            aria-label="How to move through the slides"
            title="Keys (?)"
            onClick={() => setHelp((h) => !h)}
          >
            <Keyboard aria-hidden />
          </button>
          {help && (
            <div id="lk-help" className="lk__help" role="note">
              <p className="lk__helptitle">Moving through the slides</p>
              <ul>
                <li>
                  <span><kbd>Space</kbd> or <kbd>→</kbd></span> Next slide
                </li>
                <li>
                  <span><kbd>Shift</kbd> + <kbd>Space</kbd> or <kbd>←</kbd></span> Previous slide
                </li>
                <li>
                  <span>Bar at the top</span> Jump to any slide
                </li>
                <li>
                  <span>Swipe</span> Next or previous, on a phone
                </li>
                <li>
                  <span>Tap the drawing</span> Play it again
                </li>
                <li>
                  <span><kbd>?</kbd></span> Show or hide this list
                </li>
              </ul>
              <p className="lk__helpnote">
                {index < total - 1
                  ? `Next up: ${slides[index + 1].title}`
                  : nextBeyond
                    ? `The next slide moves on to ${nextBeyond.label}.`
                    : "This is the last slide."}
              </p>
            </div>
          )}
        </div>
        <div className="lk__stage">
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
      </div>
    </div>
  );
}
