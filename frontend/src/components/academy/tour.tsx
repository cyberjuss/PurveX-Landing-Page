"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Flag,
  Flame,
  Gauge,
  Headset,
  ListTree,
  Palette,
  PlayCircle,
  Route,
  Server,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import "./tour.css";

// First-run explainers. One card, in the middle, that says what is on the page
// and then gets out of the way.
//
// This used to walk the page: each step dimmed everything, lifted one real
// control out of the page, and moved a caret-tagged card around to point at it.
// Seven stops to read the home page. The same content fits on one card as a
// grid of tiles, and nobody has to be led anywhere.
//
// There is one card per area rather than one for the whole portal, because the
// home page and a lesson page share almost no furniture. Each remembers itself
// separately, so someone who starts on a lesson still gets the home card later.
//
// A tile whose target is not on the page is dropped before the card opens. An
// Explore account has no lab button, and describing furniture that is not there
// is worse than saying nothing.

type Tile = { sel?: string; icon: LucideIcon; title: string; body: string };
type Tour = {
  key: string;
  when: (path: string) => boolean;
  /** Below this many surviving tiles the card is not worth opening. */
  min: number;
  title: string;
  lede: string;
  tiles: Tile[];
};

const HOME: Tour = {
  key: "purvex.tour.home.v4",
  when: (p) => p === "/range" || p === "/range/",
  min: 3,
  title: "Welcome to Range.",
  lede: "This is where you work the same problems a new security hire sees. Here is what is on this page.",
  tiles: [
    {
      sel: '[data-tour="next"]',
      icon: PlayCircle,
      title: "Next",
      body: "Always names the next thing to do, and moves on its own as you finish.",
    },
    {
      sel: '[data-tour="readiness"]',
      icon: Gauge,
      title: "Readiness",
      body: "One score out of 100. Open it to see which competencies are behind.",
    },
    {
      sel: '[data-tour="drills"]',
      icon: Flame,
      title: "Drills",
      body: "A named case a day against your own directory. The streak tracks how often you turn up.",
    },
    {
      sel: '[data-tour="path"]',
      icon: Route,
      title: "The course",
      body: "Fundamentals, then a live directory, then alerts and logs. In that order.",
    },
    {
      sel: '[data-tour="lab"]',
      icon: Server,
      title: "Your lab",
      body: "A Windows domain controller and an Ubuntu desktop, yours alone, in a browser tab.",
    },
    {
      sel: '[data-tour="account"]',
      icon: Headset,
      title: "Account",
      body: "The coach, the full readiness report, your Proof Profile, and sign out.",
    },
  ],
};

// Shown on any other page in the portal, where the body changes but the header
// and the course menu do not.
const PORTAL: Tour = {
  key: "purvex.tour.portal.v2",
  when: (p) => p.startsWith("/range") && p.replace(/\/$/, "") !== "/range",
  min: 2,
  title: "Around the portal.",
  lede: "The page changes as you work. These four stay where they are.",
  tiles: [
    {
      sel: '[data-tour="menu-desktop"], [data-tour="menu"]',
      icon: ListTree,
      title: "Course menu",
      body: "Every lesson in order. Anything finished is ticked and you can jump back to it.",
    },
    {
      sel: '[data-tour="lab"]',
      icon: Server,
      title: "Your lab",
      body: "Start it or open it from any page. The same two machines follow you everywhere.",
    },
    {
      sel: '[data-tour="account"]',
      icon: Headset,
      title: "Account",
      body: "The coach, the full readiness report, your Proof Profile, and sign out.",
    },
    {
      sel: '[data-tour="theme"]',
      icon: Palette,
      title: "Light or dark",
      body: "Range follows whichever you pick and remembers it across every page.",
    },
  ],
};

// The drills page carries four separate things, and the numbered rows do not
// say much about what any of them are until you open one.
const DRILLS: Tour = {
  key: "purvex.tour.drills.v2",
  when: (p) => p.startsWith("/range/drill"),
  min: 3,
  title: "Four ways to practise.",
  lede: "This page is the daily habit rather than the course. Here is what each row is for.",
  tiles: [
    {
      sel: '[data-tour="case"]',
      icon: PlayCircle,
      title: "A case a day",
      body: "One scenario written against your own directory. A decision, a write-up, or a real change.",
    },
    {
      sel: '[data-tour="shift"]',
      icon: Clock,
      title: "Shift",
      body: "Thirty minutes on the desk. Real incidents fire into your lab, each with an SLA.",
    },
    {
      sel: '[data-tour="ctf"]',
      icon: Flag,
      title: "Weekly CTF",
      body: "One hard investigation a week against your own Security log. A new one every Monday.",
    },
    {
      sel: '[data-tour="findings"]',
      icon: ShieldAlert,
      title: "What your lab needs",
      body: "A real audit of your directory, checked inside the lab rather than marked on paper.",
    },
  ],
};

const TOURS: Tour[] = [HOME, DRILLS, PORTAL];

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
  const { skin, theme } = useAcademySkin();
  const [run, setRun] = useState<{ tour: Tour; tiles: Tile[] } | null>(null);
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
    // The page needs a moment to finish rendering before its furniture can be
    // found. A replay is a deliberate click, so it waits far less.
    const id = window.setTimeout(() => {
      const tiles = tour.tiles.filter((t) => !t.sel || present(t.sel));
      if (tiles.length >= tour.min) setRun({ tour, tiles });
      else markSeen(tour.key);
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

  return createPortal(
    <div className="tour" data-tour-theme={theme} style={skin} role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <button type="button" className="tour__scrim" aria-label="Close" onClick={close} />

      <div className="tour__card">
        <header className="tour__strip">
          <span className="tour__kicker">Getting started</span>
          <strong>Range</strong>
          <button type="button" className="tour__skip" onClick={close}>
            Skip
          </button>
        </header>

        <div className="tour__main">
          <h2 id="tour-title">{run.tour.title}</h2>
          <p className="tour__lede">{run.tour.lede}</p>

          <ul className="tour__tiles">
            {run.tiles.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <span className="tour__ic" aria-hidden="true">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <strong>{title}</strong>
                <small>{body}</small>
              </li>
            ))}
          </ul>
        </div>

        <footer className="tour__foot">
          <button type="button" className="tour__go" onClick={close}>
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
