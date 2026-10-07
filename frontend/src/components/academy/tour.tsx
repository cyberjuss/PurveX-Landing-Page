"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import "./tour.css";

// A one-time walk around the Range home page for someone who has never seen it.
// Each step dims the page and lifts one thing out of it, so the tour explains
// the actual control rather than a picture of it.
//
// Steps whose target is not on the page are dropped before the tour starts. An
// Explore account has no lab button and a brand new account has no drill card,
// and a tour that points at nothing is worse than no tour.

type Step = { sel: string; title: string; body: string };

const KEY = "purvex.tour.home.v1";

const STEPS: Step[] = [
  {
    sel: '[data-tour="next"]',
    title: "Start here",
    body: "This is the next thing to pick up. It follows you and changes as you finish work.",
  },
  {
    sel: '[data-tour="readiness"]',
    title: "Readiness",
    body: "Every mission you finish feeds this score. It opens at zero and climbs as you work.",
  },
  {
    sel: '[data-tour="drills"]',
    title: "Daily practice",
    body: "One named case a day against your own directory. Shift and the weekly CTF start here too.",
  },
  {
    sel: '[data-tour="path"]',
    title: "The course",
    body: "Three phases in order. Fundamentals first then a live directory then alerts and logs.",
  },
  {
    sel: '[data-tour="lab"]',
    title: "Your own lab",
    body: "A domain controller and an Ubuntu server built for you alone. Start them here and they open in a browser tab.",
  },
  {
    sel: '[data-tour="menu-desktop"], [data-tour="menu"]',
    title: "Everything else",
    body: "Every lesson and every lab sits in this menu whenever you want to jump ahead.",
  },
];

/** Storage can throw in a private window, so a failed read just means "show it". */
function alreadySeen(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* a tour that repeats is better than one that crashes */
  }
}

/** The first match that is actually on screen. A step can name two elements --
 *  the sidebar on a wide window and the menu button on a narrow one -- and only
 *  one of them is ever rendered, so document order alone picks the wrong one. */
function pick(sel: string): Element | null {
  for (const el of Array.from(document.querySelectorAll(sel))) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}
const visible = (sel: string) => pick(sel) !== null;

type Box = { top: number; left: number; width: number; height: number };

export function AcademyTour() {
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  // Decide once, after paint, so the targets exist to be measured.
  useEffect(() => {
    if (alreadySeen()) return;
    const id = window.setTimeout(() => {
      const found = STEPS.filter((s) => visible(s.sel));
      // Two stops is not a tour. Below that it is just a popup in the way.
      if (found.length >= 3) setSteps(found);
      else markSeen();
    }, 650);
    return () => window.clearTimeout(id);
  }, []);

  const step = steps?.[i];

  const place = useCallback(() => {
    if (!step) return;
    const el = pick(step.sel);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useEffect(() => {
    if (!step) return;
    const el = pick(step.sel);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    // Measure after the scroll settles, then keep up with the page.
    const t = window.setTimeout(place, 320);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [step, place]);

  const close = useCallback(() => {
    markSeen();
    setSteps(null);
    setBox(null);
  }, []);

  const next = useCallback(() => {
    setI((n) => {
      if (!steps) return n;
      if (n + 1 >= steps.length) {
        close();
        return n;
      }
      return n + 1;
    });
  }, [steps, close]);

  useEffect(() => {
    if (!steps) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps, close, next]);

  // Below the target when there is room for the card, otherwise above it.
  const pos = useMemo(() => {
    if (!box) return null;
    const CARD = 190;
    const below = box.top + box.height + 14;
    const above = box.top - 14;
    const room = window.innerHeight - below > CARD;
    const left = Math.min(Math.max(16, box.left), Math.max(16, window.innerWidth - 360));
    return room
      ? { top: below, left, transform: "none" }
      : { top: Math.max(16, above), left, transform: "translateY(-100%)" };
  }, [box]);

  if (!steps || !step || typeof document === "undefined") return null;

  return createPortal(
    <div className="tour" role="dialog" aria-modal="true" aria-label="Getting started">
      <button type="button" className="tour__scrim" aria-label="Skip the tour" onClick={close} />
      {box && (
        <span
          className="tour__ring"
          aria-hidden="true"
          style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12 }}
        />
      )}
      {pos && (
        <div className="tour__card" style={{ top: pos.top, left: pos.left, transform: pos.transform }}>
          <p className="tour__count">
            {i + 1} of {steps.length}
          </p>
          <h2>{step.title}</h2>
          <p className="tour__body">{step.body}</p>
          <div className="tour__row">
            {i > 0 && (
              <button type="button" className="tour__ghost" onClick={() => setI((n) => Math.max(0, n - 1))}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button type="button" className="tour__go" onClick={next}>
              {i + 1 === steps.length ? "Done" : "Next"}
              {i + 1 < steps.length && <ArrowRight className="h-4 w-4" />}
            </button>
            <button type="button" className="tour__skip" onClick={close}>
              Skip
            </button>
          </div>
          <button type="button" className="tour__x" aria-label="Skip the tour" onClick={close}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="tour__live" aria-live="polite">
        {step.title}. {step.body}
      </div>
    </div>,
    document.body
  );
}
