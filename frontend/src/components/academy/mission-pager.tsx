"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { READINESS_PATH } from "@/lib/academy-client";

// Challenge lessons are authored as a stack of .ad-mission blocks. This
// shows one at a time: a question strip above it (where you are, which are
// solved) and Back / Next below it. Lessons with fewer than two missions
// are left alone.
export function MissionPager({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState<boolean[]>([]);
  const [strip, setStrip] = useState<HTMLElement | null>(null);

  const missions = useCallback(() => Array.from(root.current?.querySelectorAll<HTMLElement>(".ad-mission") ?? []), []);

  const measure = useCallback(() => {
    const list = missions();
    setSolved((prev) => {
      const next = list.length < 2 ? [] : list.map((m) => m.classList.contains("ad-mission--solved"));
      return prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next;
    });
  }, [missions]);

  // Follow mission blocks as they render, restore, or become solved.
  useEffect(() => {
    const frame = window.requestAnimationFrame(measure);
    const el = root.current;
    const obs = new MutationObserver(measure);
    if (el) obs.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => {
      window.cancelAnimationFrame(frame);
      obs.disconnect();
    };
  }, [measure]);

  // The question strip sits directly above the first mission.
  const total = solved.length;
  useEffect(() => {
    if (total < 2) return;
    const host = document.createElement("div");
    host.className = "ad-steps-host";
    missions()[0]?.before(host);
    const frame = window.requestAnimationFrame(() => setStrip(host));
    return () => {
      window.cancelAnimationFrame(frame);
      host.remove();
      setStrip(null);
    };
  }, [total, missions]);

  // A #tq-03 style link opens that mission.
  useEffect(() => {
    const go = () => {
      const id = window.location.hash.replace(/^#/, "");
      const at = id ? missions().findIndex((m) => m.getAttribute("data-id") === id) : -1;
      if (at >= 0) setStep(at);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [missions, total]);

  const at = Math.min(step, Math.max(0, total - 1));
  const done = solved.filter(Boolean).length;
  const isLast = at === total - 1;

  useEffect(() => {
    missions().forEach((m, i) => {
      m.setAttribute("data-n", String(i + 1).padStart(2, "0"));
      m.classList.toggle("ad-mission--off", total >= 2 && i !== at);
    });
    if (first.current) {
      first.current = false;
      return;
    }
    if (total >= 2) strip?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [at, total, missions, strip]);

  return (
    <div ref={root}>
      {children}
      {strip &&
        createPortal(
          <div className="ad-steps" role="tablist" aria-label="Questions">
            <span className="ad-steps__count">
              Question {at + 1} of {total}
              <em>{done} solved</em>
            </span>
            <span className="ad-steps__chips">
              {solved.map((ok, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === at}
                  aria-label={`Question ${i + 1}${ok ? ", solved" : ""}`}
                  className={`ad-steps__chip${ok ? " is-done" : ""}${i === at ? " is-here" : ""}`}
                  onClick={() => setStep(i)}
                >
                  {ok ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </button>
              ))}
            </span>
          </div>,
          strip
        )}
      {total >= 2 && (
        <nav className="ad-pager" aria-label="Question navigation">
          <button type="button" className="ad-pager__btn" disabled={at === 0} onClick={() => setStep(at - 1)}>
            <ArrowLeft className="h-4 w-4" /> Previous question
          </button>
          {isLast ? (
            <Link href={READINESS_PATH} className={`ad-pager__btn ad-pager__btn--next${solved[at] ? " is-ready" : ""}`}>
              See my readiness <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              className={`ad-pager__btn ad-pager__btn--next${solved[at] ? " is-ready" : ""}`}
              onClick={() => setStep(at + 1)}
            >
              Next question <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
