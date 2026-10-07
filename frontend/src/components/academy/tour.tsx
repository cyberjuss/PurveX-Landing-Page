"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import "./tour.css";

// A one-time walk around the Range home page for someone who has never seen it.
// Anchored steps dim the page and lift one real control out of it; the opening
// and closing steps have no target and sit in the middle of the window.
//
// Steps whose target is missing are dropped before the tour starts. An Explore
// account has no lab button, and a tour that points at nothing is worse than no
// tour at all.

type Step = { sel?: string; title: string; body: string };

const KEY = "purvex.tour.home.v2";

const STEPS: Step[] = [
  {
    title: "Welcome to Range",
    body: "This is where you work the same problems a new security hire sees. Here is the two minute version of what is on this page.",
  },
  {
    sel: '[data-tour="next"]',
    title: "Pick up where you left off",
    body: "This card always names the next thing to do. It moves on its own as you finish lessons and missions.",
  },
  {
    sel: '[data-tour="readiness"]',
    title: "Readiness",
    body: "One score out of 100 across everything you have finished. It opens at zero and climbs as you work. Open it to see which competencies are behind.",
  },
  {
    sel: '[data-tour="drills"]',
    title: "Practice every day",
    body: "One named case a day against your own directory. Shift and the weekly CTF start from the same place and the streak tracks how often you turn up.",
  },
  {
    sel: '[data-tour="path"]',
    title: "The course runs in order",
    body: "Fundamentals first and then a live directory and then alerts and logs. Each row shows how far through it you are.",
  },
  {
    sel: '[data-tour="lab"]',
    title: "A lab of your own",
    body: "A Windows domain controller and an Ubuntu server built for you alone. Start them here and they open in a browser tab with nothing to install.",
  },
  {
    sel: '[data-tour="theme"]',
    title: "Light or dark",
    body: "Range follows whichever you pick and remembers it. Worth setting now if you are going to be reading for a while.",
  },
  {
    title: "That is the tour",
    body: "Start with the card at the top of the page. Everything else can wait until you need it.",
  },
];

/** Storage can throw in a private window, so a failed read means "show it". */
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
    /* a tour that repeats beats one that crashes */
  }
}

/** The first match that is actually rendered. A hidden element still matches a
 *  selector, so size is what decides whether a step has somewhere to point. */
function pick(sel: string): Element | null {
  for (const el of Array.from(document.querySelectorAll(sel))) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

type Box = { top: number; left: number; width: number; height: number };
type Spot = { top: number; left: number; side: "top" | "bottom"; caret: number };

const CARD_W = 352;
const CARD_H = 212;
const GAP = 14;

/** Below the target when it fits, otherwise above. The caret tracks the target
 *  so the card still reads as attached after it has been clamped to the window. */
function locate(box: Box): Spot {
  const below = box.top + box.height + GAP;
  const fits = window.innerHeight - below > CARD_H;
  const side: "top" | "bottom" = fits ? "bottom" : "top";
  const top = fits ? below : Math.max(GAP, box.top - GAP - CARD_H);
  const wanted = box.left + box.width / 2 - CARD_W / 2;
  const left = Math.min(Math.max(GAP, wanted), Math.max(GAP, window.innerWidth - CARD_W - GAP));
  const caret = Math.min(Math.max(22, box.left + box.width / 2 - left), CARD_W - 22);
  return { top, left, side, caret };
}

export function AcademyTour() {
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (alreadySeen()) return;
    const id = window.setTimeout(() => {
      const found = STEPS.filter((s) => !s.sel || pick(s.sel));
      // Fewer than three anchored stops is not a tour, just a popup in the way.
      if (found.filter((s) => s.sel).length >= 3) setSteps(found);
      else markSeen();
    }, 700);
    return () => window.clearTimeout(id);
  }, []);

  const step = steps?.[i];

  const place = useCallback(() => {
    if (!step?.sel) return;
    const el = pick(step.sel);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useEffect(() => {
    if (!step?.sel) return;
    pick(step.sel)?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = window.setTimeout(place, 340);
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
  }, []);

  const next = useCallback(() => {
    if (!steps) return;
    if (i + 1 >= steps.length) close();
    else setI(i + 1);
  }, [steps, i, close]);

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

  // A box left over from the previous step must not leak onto a centred one,
  // so every use of it is gated on this step having a target of its own.
  const onTarget = Boolean(step?.sel) && box !== null;
  const spot = useMemo(() => (onTarget && box ? locate(box) : null), [onTarget, box]);

  if (!steps || !step || typeof document === "undefined") return null;
  const last = i + 1 === steps.length;
  const anchored = spot !== null;

  return createPortal(
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <button type="button" className="tour__scrim" aria-label="Skip the tour" onClick={close} />
      {onTarget && box && (
        <span
          className="tour__ring"
          aria-hidden="true"
          style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12 }}
        />
      )}

      <div
        className={`tour__card${anchored ? ` tour__card--${spot!.side}` : " tour__card--mid"}`}
        style={anchored ? { top: spot!.top, left: spot!.left } : undefined}
      >
        {anchored && <span className="tour__caret" aria-hidden="true" style={{ left: spot!.caret }} />}

        <button type="button" className="tour__x" aria-label="Skip the tour" onClick={close}>
          <X className="h-4 w-4" />
        </button>

        <h2 id="tour-title">{step.title}</h2>
        <p className="tour__body">{step.body}</p>

        <div className="tour__foot">
          <span className="tour__dots">
            {steps.map((s, n) => (
              <button
                key={s.title}
                type="button"
                className={n === i ? "is-on" : n < i ? "is-past" : ""}
                aria-label={`Step ${n + 1}: ${s.title}`}
                aria-current={n === i}
                onClick={() => setI(n)}
              />
            ))}
          </span>
          <span className="tour__btns">
            {i > 0 && (
              <button type="button" className="tour__ghost" onClick={() => setI(Math.max(0, i - 1))}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button type="button" className="tour__go" onClick={next}>
              {last ? "Get started" : i === 0 ? "Show me" : "Next"}
              {!last && <ArrowRight className="h-4 w-4" />}
            </button>
          </span>
        </div>

        {!last && (
          <button type="button" className="tour__skip" onClick={close}>
            Skip the tour
          </button>
        )}
      </div>

      <div className="tour__live" aria-live="polite">
        Step {i + 1} of {steps.length}. {step.title}. {step.body}
      </div>
    </div>,
    document.body
  );
}
