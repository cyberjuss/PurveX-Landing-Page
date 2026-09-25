"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { academyFetch, READINESS_PATH, RESULTS_UPDATED_EVENT } from "@/lib/academy-client";
import { loadResults, saveResults, type MissionResult } from "@/lib/academy-score";
import { LabPulse } from "./lab-pulse";
import { TrailDock } from "./trail-dock";

type Neighbor = { label: string; go: () => void };

// Challenge lessons are authored as a stack of .ad-mission blocks. This
// shows one at a time: a question strip above it (where you are, which are
// solved) and one trail below it. On the first and last ticket the same
// trail steps into the neighboring section, so the page does not grow a
// second Previous / Next bar.
export function MissionPager({
  children,
  prevSection,
  nextSection,
  actionHost,
}: {
  children: ReactNode;
  prevSection?: Neighbor | null;
  nextSection?: Neighbor | null;
  actionHost?: HTMLElement | null;
}) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const prevAt = useRef(0);
  const prevBrief = useRef(false);
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState<boolean[]>([]);
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [strip, setStrip] = useState<HTMLElement | null>(null);
  const [labHost, setLabHost] = useState<HTMLElement | null>(null);

  const missions = useCallback(() => Array.from(root.current?.querySelectorAll<HTMLElement>(".ad-mission") ?? []), []);
  const brief = useCallback(() => root.current?.querySelector<HTMLElement>(".ad-brief") ?? null, []);
  const [onBrief, setOnBrief] = useState(false);

  const measure = useCallback(() => {
    const list = missions();
    const stored = loadResults();
    const marks = list.length < 2 ? [] : list.map((m) => m.classList.contains("ad-mission--solved"));
    const flags = list.length < 2 ? [] : list.map((m) => Boolean(stored[m.getAttribute("data-id") || ""]?.flagged) && !m.classList.contains("ad-mission--solved"));
    setSolved((prev) => (prev.length === marks.length && prev.every((v, i) => v === marks[i]) ? prev : marks));
    setFlagged((prev) => (prev.length === flags.length && prev.every((v, i) => v === flags[i]) ? prev : flags));
  }, [missions]);

  // Follow mission blocks as they render, restore, or become solved.
  // Layout effect so a section jump (new key) sees the tickets on the
  // same paint, not after a frame that can miss the first measure.
  useLayoutEffect(() => {
    measure();
    const el = root.current;
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    const jump = hash && missions().some((m) => m.getAttribute("data-id") === hash);
    if (brief() && !jump) setOnBrief(true);
    const obs = new MutationObserver(measure);
    if (el) obs.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [measure, brief, missions]);

  // The question strip sits directly above the first mission.
  const total = solved.length;
  useEffect(() => {
    if (total < 2 || onBrief) return;
    const host = document.createElement("div");
    host.className = "ad-steps-host";
    missions()[0]?.before(host);
    const frame = window.requestAnimationFrame(() => setStrip(host));
    return () => {
      window.cancelAnimationFrame(frame);
      host.remove();
      setStrip(null);
    };
  }, [total, missions, onBrief]);

  // A #tq-03 style link opens that mission.
  useEffect(() => {
    const go = () => {
      const id = window.location.hash.replace(/^#/, "");
      const at = id ? missions().findIndex((m) => m.getAttribute("data-id") === id) : -1;
      if (at >= 0) {
        setOnBrief(false);
        setStep(at);
      }
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [missions, total]);

  const at = Math.min(step, Math.max(0, total - 1));
  const done = solved.filter(Boolean).length;
  const isLast = at === total - 1;
  const paging = total >= 2;

  // Leaving an unsolved question going forward flags it for Coach. Going
  // back does not. Solving later clears the flag.
  const flagCurrent = useCallback(() => {
    const el = missions()[at];
    if (!el || el.classList.contains("ad-mission--solved")) return;
    const id = el.getAttribute("data-id");
    if (!id) return;
    const all = loadResults();
    const base: MissionResult = all[id] ?? { solved: false, wrong: 0, hint: false };
    if (base.solved || base.flagged) return;
    all[id] = { ...base, flagged: true, at: new Date().toISOString() };
    saveResults(all);
    window.dispatchEvent(new Event(RESULTS_UPDATED_EVENT));
    academyFetch("/academy/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: all }),
    }).catch(() => {});
    setFlagged((prev) => prev.map((v, i) => (i === at ? true : v)));
  }, [at, missions]);

  const goForward = useCallback(
    (next: number) => {
      if (next > at) flagCurrent();
      setStep(next);
    },
    [at, flagCurrent]
  );

  useEffect(() => {
    const briefing = brief();
    briefing?.classList.toggle("ad-brief--off", total >= 2 && !onBrief);
    missions().forEach((m, i) => {
      m.setAttribute("data-n", String(i + 1).padStart(2, "0"));
      m.classList.toggle("ad-mission--off", total >= 2 && (onBrief || i !== at));
    });
    const labOn = onBrief ? null : missions().find((m) => !m.classList.contains("ad-mission--off")) ?? missions()[at] ?? null;
    setLabHost(labOn);
    if (first.current) {
      first.current = false;
      prevAt.current = at;
      prevBrief.current = onBrief;
      return;
    }
    const shown = onBrief ? briefing : missions()[at];
    const enter =
      onBrief !== prevBrief.current
        ? onBrief
          ? "ax-enter-back"
          : "ax-enter-fwd"
        : at >= prevAt.current
          ? "ax-enter-fwd"
          : "ax-enter-back";
    prevAt.current = at;
    prevBrief.current = onBrief;
    if (shown) {
      shown.classList.remove("ax-enter", "ax-enter-fwd", "ax-enter-back");
      void shown.offsetWidth;
      shown.classList.add(enter);
    }
    if (total >= 2) strip?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [at, total, onBrief, brief, missions, strip]);

  const nav =
    paging && !onBrief ? (
      <TrailDock
        prev={{
          go: () => (at > 0 ? setStep(at - 1) : brief() ? setOnBrief(true) : prevSection?.go()),
          disabled: at === 0 && !brief() && !prevSection,
        }}
        next={{
          go: () => {
            if (!isLast) {
              goForward(at + 1);
              return;
            }
            flagCurrent();
            if (nextSection) nextSection.go();
            else router.push(READINESS_PATH);
          },
        }}
        center={
          <span className="ax-panel__count">
            {String(at + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        }
      />
    ) : null;

  return (
    <div ref={root}>
      {children}
      {strip && !onBrief &&
        createPortal(
          <div className="ad-steps" role="tablist" aria-label={`Question ${at + 1} of ${total}, ${done} solved`}>
            <span className="ad-steps__chips">
              {solved.map((ok, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={!onBrief && i === at}
                  aria-label={`Question ${i + 1}${ok ? ", solved" : flagged[i] ? ", flagged" : ""}`}
                  className={`ad-steps__chip${ok ? " is-done" : ""}${flagged[i] ? " is-flagged" : ""}${!onBrief && i === at ? " is-here" : ""}`}
                  onClick={() => {
                    setOnBrief(false);
                    if (!onBrief && i > at) goForward(i);
                    else setStep(i);
                  }}
                >
                  {ok ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </button>
              ))}
            </span>
          </div>,
          strip
        )}
      {paging && onBrief ? (
        <div className="ad-brief-start">
          <button type="button" className="rd-cta" onClick={() => setOnBrief(false)}>
            Get Started <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {labHost ? createPortal(<LabPulse />, labHost) : null}
      {nav && actionHost ? createPortal(nav, actionHost) : nav}
    </div>
  );
}
