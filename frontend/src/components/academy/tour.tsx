"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckSquare,
  Clock,
  FileText,
  Flag,
  Flame,
  Gauge,
  Headset,
  Image,
  LayoutList,
  ListTree,
  Palette,
  PlayCircle,
  Route,
  Server,
  ShieldAlert,
  Ticket,
  Timer,
  type LucideIcon,
} from "lucide-react";
import "./tour.css";

// First-run explainers. A short run of cards, each one in the middle of the
// screen, that say what is on the page and then get out of the way.
//
// Two things this deliberately is not. It does not walk the page: nothing is
// anchored to a control, nothing is spotlit, and the card never moves, so
// there is no measuring, no caret and no scrolling the reader somewhere they
// did not ask to go. And it is not a single card either, because one card
// holding six tiles is a wall of small print nobody reads. One idea a card,
// a few cards a page, always in the same place.
//
// There is one card per area rather than one for the whole portal, because the
// home page and a lesson page share almost no furniture. Each remembers itself
// separately, so someone who starts on a lesson still gets the home card later.
//
// A step whose target is not on the page is dropped before the run starts. An
// Explore account has no lab button, and describing furniture that is not there
// is worse than saying nothing.

type Tile = { sel?: string; icon: LucideIcon; title: string; body: string };
type Tour = {
  key: string;
  when: (path: string) => boolean;
  /** Below this many surviving steps the run is not worth opening. */
  min: number;
  /** The small label in the strip, above the run's name. */
  kicker: string;
  title: string;
  tiles: Tile[];
};

const HOME: Tour = {
  key: "purvex.tour.home.v4",
  when: (p) => p === "/range" || p === "/range/",
  min: 3,
  kicker: "Getting started",
  title: "Range",
  tiles: [
    {
      sel: '[data-tour="readiness"]',
      icon: Gauge,
      title: "Readiness",
      body: "One score out of 100 · Open it to see what is behind",
    },
    {
      sel: '[data-tour="drills"]',
      icon: Flame,
      title: "The Desk",
      body: "Your ticket queue · A new ticket every day",
    },
    {
      sel: '[data-tour="path"]',
      icon: Route,
      title: "The course",
      body: "Fundamentals then a live directory then alerts and logs",
    },
    {
      sel: '[data-tour="lab"]',
      icon: Server,
      title: "Your lab",
      body: "Your own Windows domain controller and Ubuntu desktop in a browser tab",
    },
    {
      sel: '[data-tour="account"]',
      icon: Headset,
      title: "Account",
      body: "Coach · Readiness report · Proof Profile · Sign out",
    },
  ],
};

// Shown on any other page in the portal, where the body changes but the header
// and the course menu do not.
const PORTAL: Tour = {
  key: "purvex.tour.portal.v2",
  when: (p) => p.startsWith("/range") && p.replace(/\/$/, "") !== "/range",
  min: 2,
  kicker: "Getting started",
  title: "Around the portal",
  tiles: [
    {
      sel: '[data-tour="menu-desktop"], [data-tour="menu"]',
      icon: ListTree,
      title: "Course menu",
      body: "Every lesson in order · Finished ones are ticked",
    },
    {
      sel: '[data-tour="lab"]',
      icon: Server,
      title: "Your lab",
      body: "Start or open your lab from any page",
    },
    {
      sel: '[data-tour="account"]',
      icon: Headset,
      title: "Account",
      body: "Coach · Readiness report · Proof Profile · Sign out",
    },
    {
      sel: '[data-tour="theme"]',
      icon: Palette,
      title: "Light or dark",
      body: "Range remembers whichever you pick",
    },
  ],
};

// The drills page carries four separate things, and the numbered rows do not
// say much about what any of them are until you open one.
const DRILLS: Tour = {
  key: "purvex.tour.drills.v3",
  when: (p) => p.startsWith("/range/drill"),
  min: 3,
  kicker: "Getting started",
  title: "The Desk",
  tiles: [
    {
      sel: '[data-tour="case"]',
      icon: PlayCircle,
      title: "A ticket a day",
      body: "One new ticket from your own lab every day",
    },
    {
      sel: '[data-tour="ctf"]',
      icon: Flag,
      title: "The weekly alert",
      body: "One hard security alert a week · A new one every Monday",
    },
    {
      sel: '[data-tour="shift"]',
      icon: Clock,
      title: "Clock in",
      body: "Thirty minutes live · Work the highest priority first",
    },
  ],
};

// A week's page. The tabs across the top are the part nobody finds on their
// own, because a week looks like one page until you notice it is eleven.
const LESSON: Tour = {
  key: "purvex.tour.lesson.v1",
  when: (p) => /^\/range\/phase-[^/]+\/[^/]+\/?$/.test(p),
  min: 3,
  kicker: "Getting started",
  title: "Reading a week",
  tiles: [
    {
      icon: LayoutList,
      title: "Tabs across the top",
      body: "Reading first then the challenge then the quiz",
    },
    {
      icon: CheckSquare,
      title: "Mark complete",
      body: "Tick the week off when you are done",
    },
    {
      icon: ArrowRight,
      title: "Previous and next",
      body: "Move to the next or last week from the foot of the page",
    },
    {
      sel: '[data-tour="menu-desktop"], [data-tour="menu"]',
      icon: ListTree,
      title: "Course menu",
      body: "Every week in order · Finished ones are ticked",
    },
  ],
};

const READINESS: Tour = {
  key: "purvex.tour.readiness.v1",
  when: (p) => p.startsWith("/range/readiness"),
  min: 2,
  kicker: "Getting started",
  title: "Readiness",
  tiles: [
    {
      icon: Gauge,
      title: "One score",
      body: "Out of 100 · It starts at zero and climbs as you work",
    },
    {
      icon: Route,
      title: "Competencies",
      body: "Each one measured against the bar for a Tier 1 hire",
    },
    {
      icon: FileText,
      title: "Mission log",
      body: "Every attempt as a hiring manager sees it",
    },
  ],
};

const PORTFOLIO: Tour = {
  key: "purvex.tour.portfolio.v1",
  when: (p) => p.startsWith("/range/portfolio"),
  min: 2,
  kicker: "Getting started",
  title: "Portfolio",
  tiles: [
    {
      icon: FileText,
      title: "Resume bullets",
      body: "Written from your finished work for a CV or LinkedIn",
    },
    {
      icon: Image,
      title: "Screenshots",
      body: "Evidence from your own lab that a hiring manager can see",
    },
    {
      icon: BadgeCheck,
      title: "Part of Range Pro",
      body: "Pro turns your verified work into a public page employers can check",
    },
  ],
};

const SHIFT: Tour = {
  key: "purvex.tour.shift.v1",
  when: (p) => p.startsWith("/range/shift"),
  min: 2,
  kicker: "Getting started",
  title: "Shift",
  tiles: [
    {
      icon: Ticket,
      title: "Tickets arrive on their own",
      body: "They land while you are still working the last one",
    },
    {
      icon: Timer,
      title: "Every ticket has a clock",
      body: "P1 five minutes · P2 eight · P3 twelve",
    },
    {
      icon: ShieldAlert,
      title: "Fixed in the lab not on paper",
      body: "A ticket closes when the change is real in your directory",
    },
  ],
};

// Most specific first. PORTAL is the fallback for any page in the portal
// that has no card of its own, so it has to stay last.
const TOURS: Tour[] = [HOME, DRILLS, READINESS, PORTFOLIO, SHIFT, LESSON, PORTAL];

// One welcome, not one per page. Once the portal has shown the tour the first
// time, this flag stops any other tour from firing on a first visit to drills,
// labs and the rest. Cleared by a replay.
const PORTAL_TOURED = "academy-toured-v1";

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
    /* a card that repeats beats one that crashes */
  }
}

/** True when the selector matches something actually rendered. A hidden element
 *  still matches, so size is what decides. */
function present(sel: string): boolean {
  for (const el of Array.from(document.querySelectorAll(sel))) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return true;
  }
  return false;
}

/** The card is portaled to <body>, a sibling of .academy-bg rather than a child,
 *  so the portal's tokens are out of scope. Only the brand accent is copied
 *  across, because that is the one value this must not get wrong. The rest of
 *  the palette is the card's own, keyed off the theme. */
function useAcademySkin(): { skin: React.CSSProperties; theme: "light" | "dark" } {
  const [skin, setSkin] = useState<React.CSSProperties>({});
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const root = document.querySelector(".academy-bg");
    if (!root) return;
    const read = () => {
      setTheme(root.getAttribute("data-academy-theme") === "dark" ? "dark" : "light");
      const accent = window.getComputedStyle(root).getPropertyValue("--rd-accent").trim();
      setSkin(accent ? ({ "--tour-accent": accent } as React.CSSProperties) : {});
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["data-academy-theme", "style", "class"] });
    return () => obs.disconnect();
  }, []);
  return { skin, theme };
}

export function AcademyTour() {
  const pathname = usePathname() ?? "";
  const { skin } = useAcademySkin();
  const [run, setRun] = useState<{ tour: Tour; steps: Tile[] } | null>(null);
  const [i, setI] = useState(0);
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
      // Clear the one-welcome flag too, or a replay would be suppressed.
      try {
        window.localStorage.removeItem(PORTAL_TOURED);
      } catch {
        /* nothing to clear */
      }
      setReplay((n) => n + 1);
    };
    window.addEventListener("purvex:tour-replay", onReplay);
    return () => window.removeEventListener("purvex:tour-replay", onReplay);
  }, []);

  useEffect(() => {
    // Shown once for the whole portal, on the first page that can display it.
    if (seen(PORTAL_TOURED)) return;
    const tour = TOURS.find((t) => t.when(pathname) && !seen(t.key));
    if (!tour) return;
    // The page needs a moment to finish rendering before its furniture can be
    // found. A replay is a deliberate click, so it waits far less.
    const id = window.setTimeout(() => {
      const steps = tour.tiles.filter((t) => !t.sel || present(t.sel));
      if (steps.length >= tour.min) {
        setI(0);
        setRun({ tour, steps });
        // From here on the portal counts as toured, so no other page's tour
        // fires. A page that could not show its tour does not burn this, so
        // the welcome still appears on the next page that can.
        markSeen(PORTAL_TOURED);
      } else markSeen(tour.key);
    }, replay ? 80 : 700);
    return () => window.clearTimeout(id);
  }, [pathname, replay]);

  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        markSeen(run.tour.key);
        setRun(null);
      }
      if (e.key === "ArrowRight") setI((n) => Math.min(run.steps.length - 1, n + 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [run]);

  if (!run || typeof document === "undefined") return null;

  const close = () => {
    markSeen(run.tour.key);
    setRun(null);
  };

  const steps = run.steps;
  const step = steps[i];
  const last = i + 1 === steps.length;
  const Icon = step.icon;

  return createPortal(
    <div className="tour" style={skin} role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <button type="button" className="tour__scrim" aria-label="Close" onClick={close} />

      <div className="tour__card">
        <header className="tour__strip">
          <span className="tour__kicker">{run.tour.kicker}</span>
          <strong>{run.tour.title}</strong>
          <button type="button" className="tour__skip" onClick={close}>
            Skip
          </button>
        </header>

        {/* key on the index so each card fades in rather than swapping text
            under a static frame. */}
        <div className="tour__main" key={i}>
          <span className="tour__ic" aria-hidden="true">
            <Icon className="h-7 w-7" />
          </span>
          <h2 id="tour-title">{step.title}</h2>
          <p className="tour__lede">{step.body}</p>
        </div>

        <footer className="tour__foot">
          <span className="tour__dots">
            {steps.map((st, n) => (
              <button
                key={st.title}
                type="button"
                className={n === i ? "is-on" : n < i ? "is-past" : ""}
                aria-label={`Step ${n + 1} of ${steps.length}: ${st.title}`}
                aria-current={n === i}
                onClick={() => setI(n)}
              />
            ))}
          </span>
          <span className="tour__btns">
            {i > 0 && (
              <button type="button" className="tour__back" onClick={() => setI(Math.max(0, i - 1))}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              type="button"
              className="tour__go"
              onClick={() => (last ? close() : setI(i + 1))}
            >
              {last ? "Get started" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </span>
        </footer>
      </div>
    </div>,
    document.body
  );
}
