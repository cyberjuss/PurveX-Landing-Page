"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, Keyboard, Maximize2, Minimize2 } from "lucide-react";
import { Recap, SlideBody } from "./slide-body";
import { splitLessonIntoDeck } from "@/lib/lesson-deck";
import { curlyQuotes } from "@/lib/typography";
import type { TrailLink } from "./trail-dock";
import { SlideArt, pickScenes, type Scene } from "./slide-art";
import { DragActivity } from "./drag-activity";
import "./lesson-deck.css";

/** Fired as the reader moves through a deck: { label, index, total }. */
export const DECK_PROGRESS_EVENT = "lesson-deck-progress";

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
  question,
  weekPath,
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
  /** The week's essential question, to open the deck. */
  question?: string;
  /** The week's other tabs, listed under the question as the road to its answer. */
  weekPath?: string[];
}) {
  const lesson = useMemo(() => splitLessonIntoDeck(markdown, label), [markdown, label]);
  // The week opens on its essential question, as a slide of its own before
  // the first lesson slide, so it is the first thing a student reads.
  const slides = useMemo(
    () => (question ? [{ title: "Essential question", cont: false, markdown: "", visual: false, question }, ...lesson] : lesson),
    [lesson, question]
  );
  // A slide that carries on a heading keeps the drawing that heading started
  // with, rather than switching because its own paragraph mentions something else.
  const scenes = useMemo(() => {
    const picked = weekScenes && weekScenes.length === lesson.length ? weekScenes : pickScenes(lesson, label);
    return question ? (["deck", ...picked] as Scene[]) : picked;
  }, [weekScenes, lesson, label, question]);
  const path = (weekPath ?? []).slice(0, 6);
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
      // A long way back up jumps rather than gliding, so the next slide is
      // there at once instead of after a second of scrolling.
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const far = -top > window.innerHeight;
      deckRef.current?.scrollIntoView({ block: "start", behavior: reduce || far ? "auto" : "smooth" });
    }
  }
  const back = () => (index === 0 ? prevBeyond?.go() : go(index - 1));
  const forward = () => (index === total - 1 ? nextBeyond?.go() : go(index + 1));

  // Left and right arrows turn the slide from anywhere on the page, not only
  // once the slide has focus. They stand down while the student is typing,
  // working an activity, holding a modifier (Alt+Left is the browser's Back),
  // or looking at a screenshot or any other dialog, which use the arrows
  // themselves.
  // Tell the section tabs where the reader is, so the current tab's underline
  // can fill as the slides go by and the tab can be ticked off at the end.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(DECK_PROGRESS_EVENT, { detail: { label, index, total } }));
  }, [label, index, total]);

  // The drawings loop, and a loop nobody can see still costs a repaint every
  // frame. While the deck is scrolled out of view they hold still.
  useEffect(() => {
    const el = deckRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => el.classList.toggle("is-offscreen", !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [help, setHelp] = useState(false);

  // Full screen: the browser's own where it is allowed, otherwise the deck
  // fills the window (iPhone Safari cannot make an element full screen).
  const [full, setFull] = useState(false);
  const windowed = useRef(false);
  useEffect(() => {
    const on = () => {
      if (!windowed.current) setFull(document.fullscreenElement === deckRef.current);
    };
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  useEffect(() => {
    if (!full || !windowed.current) return;
    const was = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = was;
    };
  }, [full]);
  const fillWindow = (on: boolean) => {
    windowed.current = on;
    setFull(on);
  };
  const toggleFull = () => {
    const el = deckRef.current;
    if (!el) return;
    if (full) {
      if (document.fullscreenElement) void document.exitFullscreen();
      else fillWindow(false);
      return;
    }
    if (el.requestFullscreen) el.requestFullscreen().catch(() => fillWindow(true));
    else fillWindow(true);
  };
  // A click anywhere outside the corner closes the list of keys.
  useEffect(() => {
    if (!help) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.(".lk__keyswrap")) setHelp(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [help]);
  const keys = useRef({ back, forward, toggleHelp: () => setHelp((h) => !h), closeHelp: () => setHelp(false), toggleFull, leaveWindow: () => fillWindow(false) });
  keys.current = { back, forward, toggleHelp: () => setHelp((h) => !h), closeHelp: () => setHelp(false), toggleFull, leaveWindow: () => fillWindow(false) };
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
        // The browser's own full screen closes on Escape by itself; the window fill does not.
        if (windowed.current) keys.current.leaveWindow();
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        keys.current.toggleFull();
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
    <div className={`lk${full ? " is-full" : ""}`} ref={deckRef}>
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
        {/* One row across the top: the progress bar, then the count and the keys button at its end. */}
        <div className="lk__topbar">
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
        </div>
        </div>
        <div className="lk__stage">
        <div
          key={index}
          className={`lk__slide${slide.visual ? " lk__slide--media" : ""}${slide.activity || slide.recap ? " lk__slide--activity" : ""}${
            slide.recap ? " lk__slide--recap" : ""
          }${slide.question ? " lk__slide--question" : ""}${moved.current ? (dir === 1 ? " ax-enter-fwd" : " ax-enter-back") : ""}`}
        >
          {slide.question && (
            <div className="lk-question">
              <div className="lk-question__main">
                <span className="rd-kicker">
                  <HelpCircle aria-hidden /> The week&apos;s question
                </span>
                <p className={`lk-question__text${slide.question.length > 60 ? " is-long" : ""}`}>{curlyQuotes(slide.question)}</p>
                <p className="lk-question__hint">Hold on to it. By the end of the week you will be able to answer it in your own words.</p>
                {path.length > 0 && (
                  <ol className="lk-question__path" aria-label="This week walks through">
                    {path.map((t, i) => (
                      <li key={t} style={{ ["--i" as string]: i }}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {curlyQuotes(t)}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              <div className="lk-question__art" aria-hidden>
                <i className="lk-question__ring" />
                <i className="lk-question__ring lk-question__ring--2" />
                <span className="lk-question__mark">?</span>
              </div>
            </div>
          )}
          <header className="lk__head">
            {slide.recap ? (
              <span className="rd-kicker">In 30 seconds</span>
            ) : slide.activity ? (
              <span className="rd-kicker">Try it</span>
            ) : (
              slide.title !== label && <span className="rd-kicker">{label}</span>
            )}
            <h2 className="lk__title">
              {curlyQuotes(slide.recap ? `What ${label} taught you` : slide.activity ? label : slide.title)}
              {slide.cont ? <span className="lk__cont"> (cont.)</span> : null}
            </h2>
          </header>
          <div className="lk__body">
            {slide.recap ? (
              <Recap items={slide.recap} slides={total - 1} activities={slides.filter((s) => s.activity).length} where={label} />
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
      {/* A slim bar under the slide: how to move on the left, the keys button
          on the right. It sits in the flow, so it never covers the lesson. */}
      <div className="lk__foot">
        <span className="lk__foothint" aria-hidden>
          <kbd>Space</kbd> next <span className="lk__footsep">·</span> <kbd>Shift</kbd> + <kbd>Space</kbd> back
        </span>
        <div className="lk__keyswrap">
            <button
              type="button"
              className={`lk__keys lk__full${full ? " is-open" : ""}`}
              aria-pressed={full}
              aria-label={full ? "Leave full screen" : "Full screen"}
              title={full ? "Leave full screen (F or Esc)" : "Full screen (F)"}
              onClick={toggleFull}
            >
              {full ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
            </button>
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
                    <span><kbd>F</kbd></span> Full screen, and back
                  </li>
                  <li>
                    <span><kbd>?</kbd></span> Show or hide this list
                  </li>
                </ul>
                <p className="lk__helpnote">
                  {index < total - 1
                    ? `Next up: ${slides[index + 1].title}`
                    : nextBeyond
                      ? `The next slide moves on to ${nextBeyond.label}`
                      : "This is the last slide"}
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
