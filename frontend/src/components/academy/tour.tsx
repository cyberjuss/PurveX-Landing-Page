"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flag,
  Flame,
  Gauge,
  Headset,
  ListTree,
  Palette,
  PlayCircle,
  Rocket,
  Route,
  Server,
  ShieldAlert,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import "./tour.css";

// First-run walkthroughs. Anchored steps dim the page and lift one real control
// out of it; the opening and closing steps have no target and sit in the middle.
//
// There is one tour per area rather than one for the whole portal, because the
// home page and a lesson page share almost no furniture. Each remembers itself
// separately, so someone who starts on a lesson still gets the home tour later.
//
// Steps whose target is missing are dropped before a tour starts. An Explore
// account has no lab button, and pointing at nothing is worse than not running.

type Step = { sel?: string; icon: LucideIcon; title: string; body: string };
type Tour = { key: string; when: (path: string) => boolean; min: number; steps: Step[] };

const HOME: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to Range",
    body: "This is where you work the same problems a new security hire sees. Here is the two minute version of what is on this page.",
  },
  {
    sel: '[data-tour="next"]',
    icon: PlayCircle,
    title: "Pick up where you left off",
    body: "This card always names the next thing to do. It moves on its own as you finish lessons and missions.",
  },
  {
    sel: '[data-tour="readiness"]',
    icon: Gauge,
    title: "Readiness",
    body: "One score out of 100 across everything you have finished. It opens at zero and climbs as you work. Open it to see which competencies are behind.",
  },
  {
    sel: '[data-tour="drills"]',
    icon: Flame,
    title: "Practice every day",
    body: "One named case a day against your own directory. Shift and the weekly CTF start from the same place and the streak tracks how often you turn up.",
  },
  {
    sel: '[data-tour="path"]',
    icon: Route,
    title: "The course runs in order",
    body: "Fundamentals first and then a live directory and then alerts and logs. Each row shows how far through it you are.",
  },
  {
    sel: '[data-tour="lab"]',
    icon: Server,
    title: "A lab of your own",
    body: "A Windows domain controller and an Ubuntu server built for you alone. Start them here and they open in a browser tab with nothing to install.",
  },
  {
    sel: '[data-tour="account"]',
    icon: Headset,
    title: "The coach and your profile",
    body: "Four things live behind here. Ask the coach when a lesson will not land, read the full readiness report, publish a Proof Profile employers can check, and sign out.",
  },
  {
    sel: '[data-tour="theme"]',
    icon: Palette,
    title: "Light or dark",
    body: "Range follows whichever you pick and remembers it. Worth setting now if you are going to be reading for a while.",
  },
  {
    icon: Rocket,
    title: "That is the tour",
    body: "Start with the card at the top of the page. Everything else can wait until you need it.",
  },
];

// Shown on any other page in the portal, where the page body changes but the
// header and the course menu do not.
const PORTAL: Step[] = [
  {
    sel: '[data-tour="menu-desktop"], [data-tour="menu"]',
    icon: ListTree,
    title: "Every lesson in order",
    body: "The whole course sits here. Anything finished is ticked and you can jump back to any of it whenever you want.",
  },
  {
    sel: '[data-tour="lab"]',
    icon: Server,
    title: "Your lab travels with you",
    body: "Start it or open it from any page. The same two machines follow you through every lesson and mission.",
  },
  {
    sel: '[data-tour="account"]',
    icon: Headset,
    title: "The coach and your profile",
    body: "Four things live behind here. Ask the coach when something will not land, read the full readiness report, publish a Proof Profile employers can check, and sign out.",
  },
  {
    sel: '[data-tour="theme"]',
    icon: Palette,
    title: "Light or dark",
    body: "Range follows whichever you pick and remembers it across every page.",
  },
];

// The drills page carries four separate things, and the numbered rows do not
// say much about what any of them are until you open one.
const DRILLS: Step[] = [
  {
    icon: Sparkles,
    title: "Four ways to practise",
    body: "This page is the daily habit rather than the course. Here is what each row is for.",
  },
  {
    sel: '[data-tour="case"]',
    icon: PlayCircle,
    title: "A case a day",
    body: "One named scenario written against your own directory. It is a decision or a short write-up or a real change you make in the lab.",
  },
  {
    sel: '[data-tour="shift"]',
    icon: Clock,
    title: "Shift",
    body: "Thirty minutes on the desk. Real incidents fire into your lab and each ticket has an SLA you are working against.",
  },
  {
    sel: '[data-tour="ctf"]',
    icon: Flag,
    title: "The weekly CTF",
    body: "One hard investigation a week asked about your own Security log. A new one opens every Monday.",
  },
  {
    sel: '[data-tour="findings"]',
    icon: ShieldAlert,
    title: "What your lab needs",
    body: "A real audit of your own directory. The daily task is often one of these and it is checked inside your lab rather than marked on paper.",
  },
];

const TOURS: Tour[] = [
  { key: "purvex.tour.home.v3", when: (p) => p === "/range" || p === "/range/", min: 3, steps: HOME },
  { key: "purvex.tour.drills.v1", when: (p) => p.startsWith("/range/drill"), min: 3, steps: DRILLS },
  // Everywhere else, which has its own course menu to point at.
  { key: "purvex.tour.portal.v1", when: (p) => p.startsWith("/range") && p.replace(/\/$/, "") !== "/range", min: 2, steps: PORTAL },
];

/** Storage can throw in a private window, so a failed read means "show it". */
function seen(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function markSeen(key: string) {
  try {
    window.localStorage.setItem(key, "1");
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

type Box = { top: number; left: number; width: number; height: number; radius: string };
type Spot = { top: number; left: number; side: "top" | "bottom"; caret: number };

const CARD_W = 360;
const CARD_H = 236;
const GAP = 14;

/** Below the target when it fits, otherwise above. The caret tracks the target
 *  so the card still reads as attached after it has been clamped to the window. */
function locate(box: Box): Spot {
  const below = box.top + box.height + GAP;
  const roomAbove = box.top - GAP > CARD_H;
  // Something taller than the window has no room on either side of it, so the
  // card sits at the foot and the caret is dropped by pinning it off-card.
  if (window.innerHeight - below <= CARD_H && !roomAbove) {
    return { top: window.innerHeight - CARD_H - GAP, left: Math.max(GAP, (window.innerWidth - CARD_W) / 2), side: "bottom", caret: -999 };
  }
  const fits = window.innerHeight - below > CARD_H;
  const side: "top" | "bottom" = fits ? "bottom" : "top";
  const top = fits ? below : Math.max(GAP, box.top - GAP - CARD_H);
  const wanted = box.left + box.width / 2 - CARD_W / 2;
  const left = Math.min(Math.max(GAP, wanted), Math.max(GAP, window.innerWidth - CARD_W - GAP));
  const caret = Math.min(Math.max(26, box.left + box.width / 2 - left), CARD_W - 26);
  return { top, left, side, caret };
}

/** The portal keeps its colours on .academy-bg, and this is portaled to <body>,
 *  which is a sibling of it rather than a child, so none of them are in scope.
 *  Rather than keeping a second palette in step with the first, the real values
 *  are read off the page and copied onto the tour root. The page background is
 *  read as a computed colour because it is pure black in dark mode and white in
 *  light, and a floating card has to be opaque. */
const TOKENS = ["--rd-ink", "--rd-ink-2", "--rd-ink-3", "--rd-line", "--rd-accent"] as const;

function useAcademySkin(): React.CSSProperties {
  const [skin, setSkin] = useState<React.CSSProperties>({});
  useEffect(() => {
    const root = document.querySelector(".academy-bg");
    if (!root) return;
    const read = () => {
      const cs = window.getComputedStyle(root);
      const vars: Record<string, string> = { "--tour-surface": cs.backgroundColor || "#ffffff" };
      for (const t of TOKENS) {
        const v = cs.getPropertyValue(t).trim();
        if (v) vars[t.replace("--rd-", "--tour-")] = v;
      }
      setSkin(vars as React.CSSProperties);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["data-academy-theme", "style", "class"] });
    return () => obs.disconnect();
  }, []);
  return skin;
}

export function AcademyTour() {
  const pathname = usePathname() ?? "";
  const skin = useAcademySkin();
  const [run, setRun] = useState<{ key: string; steps: Step[] } | null>(null);
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    const onReplay = () => {
      for (const t of TOURS) {
        try {
          window.localStorage.removeItem(t.key);
        } catch {
          /* nothing to clear */
        }
      }
      setReplay((n) => n + 1);
    };
    window.addEventListener("purvex:tour-replay", onReplay);
    return () => window.removeEventListener("purvex:tour-replay", onReplay);
  }, []);

  useEffect(() => {
    const tour = TOURS.find((t) => t.when(pathname) && !seen(t.key));
    if (!tour) return;
    const id = window.setTimeout(() => {
      const found = tour.steps.filter((s) => !s.sel || pick(s.sel));
      if (found.filter((s) => s.sel).length >= tour.min) {
        setI(0);
        setRun({ key: tour.key, steps: found });
      } else markSeen(tour.key);
    }, replay ? 80 : 700);
    return () => window.clearTimeout(id);
  }, [pathname, replay]);

  const step = run?.steps[i];

  const place = useCallback(() => {
    if (!step?.sel) return;
    const el = pick(step.sel);
    if (!el) {
      setBox(null);
      return;
    }
    const r = el.getBoundingClientRect();
    // A circular avatar should be ringed by a circle, so the highlight borrows
    // the target's own corner radius instead of guessing one.
    // A square target gets a square ring, because Range is square. Only a target
    // that is actually rounded, like the avatar, gets a rounded one.
    const raw = window.getComputedStyle(el).borderRadius.split(" ")[0] || "0px";
    const radius = parseFloat(raw) > 0 ? `calc(${raw} + 6px)` : "0px";
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height, radius });
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
    if (run) markSeen(run.key);
    setRun(null);
  }, [run]);

  const next = useCallback(() => {
    if (!run) return;
    if (i + 1 >= run.steps.length) close();
    else setI(i + 1);
  }, [run, i, close]);

  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowRight") {
        next();
        return;
      }
      if (e.key === "ArrowLeft") {
        setI((n) => Math.max(0, n - 1));
        return;
      }
      if (e.key !== "Tab") return;
      // Keep Tab inside the card. Without this it walks into the page behind
      // the scrim, which cannot be seen or clicked.
      const items = cardRef.current?.querySelectorAll<HTMLElement>("button, [href]");
      if (!items?.length) return;
      const list = Array.from(items);
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, close, next]);

  // No scroll lock here on purpose: each step scrolls its own target into view,
  // and a locked page would strand every step below the fold. The ring already
  // tracks the target through a scroll.
  //
  // Focus goes into the card and comes back to wherever it was on the way out.
  useEffect(() => {
    if (!run) return;
    returnTo.current = document.activeElement;
    const t = window.setTimeout(() => cardRef.current?.querySelector<HTMLElement>(".tour__go")?.focus(), 60);
    return () => {
      window.clearTimeout(t);
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, [run]);

  // A box left over from the previous step must not leak onto a centred one.
  const onTarget = Boolean(step?.sel) && box !== null;
  const spot = useMemo(() => (onTarget && box ? locate(box) : null), [onTarget, box]);

  if (!run || !step || typeof document === "undefined") return null;
  const steps = run.steps;
  const last = i + 1 === steps.length;
  const anchored = spot !== null;
  const Icon = step.icon;

  return createPortal(
    <div className="tour" style={skin} role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <button type="button" className="tour__scrim" aria-label="Skip the tour" onClick={close} />
      {onTarget && box && (
        <span
          key={i}
          className="tour__ring"
          aria-hidden="true"
          style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12, borderRadius: box.radius }}
        />
      )}

      <div
        key={i}
        ref={cardRef}
        className={`tour__card${anchored ? ` tour__card--${spot!.side}` : " tour__card--mid"}`}
        style={anchored ? { top: spot!.top, left: spot!.left } : undefined}
      >
        {anchored && spot!.caret > 0 && <span className="tour__caret" aria-hidden="true" style={{ left: spot!.caret }} />}

        <button type="button" className="tour__x" aria-label="Skip the tour" onClick={close}>
          <X className="h-4 w-4" />
        </button>

        <span className="tour__ic" aria-hidden="true">
          <Icon className="h-[18px] w-[18px]" />
        </span>

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
              {last ? "Get started" : i === 0 && !step.sel ? "Show me" : "Next"}
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
