"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { accountInitials, useAcademyAccount } from "./academy-account";
import { PersonSeated } from "./soc-person";
import "./soc-floor.css";

/** Fired by a lab's self-checks: { graded, ok }. */
export const LAB_CHECK_EVENT = "academy-lab-check";
/** Fired by the lab carousel on each step: { index, total, title }. */
export const LAB_STEP_EVENT = "academy-lab-step";
/** Fired when a lab is finished. */
export const LAB_DONE_EVENT = "academy-lab-done";

type Pose = "idle" | "typing" | "right" | "wrong" | "done";

// The lab page's picture of the student at work: their workstation from the
// SOC floor, them in the chair, the step they are on up on the main screen.
// It answers to what they do. Moving through the steps or typing anywhere in
// the lab sets them typing; a right answer gets a fist in the air and a green
// screen, a wrong one a scratch of the head; finishing gets both arms up.
export function SocStation({ title, accent, skill }: { title: string; accent: string; skill: string }) {
  const initials = accountInitials(useAcademyAccount());
  const [pose, setPose] = useState<Pose>("idle");
  const [step, setStep] = useState<{ index: number; total: number; title: string } | null>(null);
  const timer = useRef<number | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const hold = (p: Pose, ms: number) => {
      if (done.current && p !== "done") return;
      setPose(p);
      if (timer.current) window.clearTimeout(timer.current);
      if (p !== "done") timer.current = window.setTimeout(() => setPose("idle"), ms);
    };
    const onCheck = (e: Event) => {
      const d = (e as CustomEvent<{ graded: boolean; ok: boolean }>).detail;
      hold(!d.graded ? "typing" : d.ok ? "right" : "wrong", 1700);
    };
    const onStep = (e: Event) => {
      setStep((e as CustomEvent<{ index: number; total: number; title: string }>).detail);
      hold("typing", 1300);
    };
    const onDone = () => {
      done.current = true;
      hold("done", 0);
    };
    // Any typing or clicking inside the lab reads as working at the desk.
    const onWork = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(".sl") && !t.closest(".soc-scene, .ad-check")) hold("typing", 900);
    };
    window.addEventListener(LAB_CHECK_EVENT, onCheck);
    window.addEventListener(LAB_STEP_EVENT, onStep);
    window.addEventListener(LAB_DONE_EVENT, onDone);
    document.addEventListener("keydown", onWork);
    document.addEventListener("click", onWork);
    return () => {
      window.removeEventListener(LAB_CHECK_EVENT, onCheck);
      window.removeEventListener(LAB_STEP_EVENT, onStep);
      window.removeEventListener(LAB_DONE_EVENT, onDone);
      document.removeEventListener("keydown", onWork);
      document.removeEventListener("click", onWork);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const main = step ? step.title : title;
  return (
    <div className={`soc-scene is-${pose}`} style={{ ["--acc" as string]: accent } as CSSProperties} aria-hidden>
      <svg viewBox="0 0 640 210">
        <rect x="0" y="0" width="640" height="150" className="soc-scene__wall" />
        {/* side monitor: a log scrolling */}
        <g transform="translate(150 34)">
          <rect width="110" height="76" rx="4" fill="#151827" />
          <rect x="5" y="5" width="100" height="66" rx="2" className="soc-scene__screen" />
          <g className="soc-scene__log">
            {[0, 1, 2, 3, 4, 5, 6].map((r) => (
              <rect key={r} x="11" y={11 + r * 8.5} width={[70, 46, 82, 38, 64, 52, 74][r]} height="3" rx="1.5" />
            ))}
          </g>
          <rect x="49" y="76" width="12" height="16" fill="#2a2f45" />
        </g>
        {/* main monitor: the step you are on */}
        <g transform="translate(270 14)">
          <rect width="200" height="112" rx="5" fill="#151827" />
          <rect x="6" y="6" width="188" height="100" rx="2" className="soc-scene__screen soc-scene__screen--main" />
          <foreignObject x="6" y="6" width="188" height="100">
            <div className="soc-scene__text">
              <small>{step ? `Step ${step.index + 1} of ${step.total}` : skill}</small>
              {main}
            </div>
          </foreignObject>
          <rect x="92" y="112" width="16" height="18" fill="#2a2f45" />
        </g>
        {/* desk */}
        <path d="M60 148 H580 L600 164 H40 Z" className="soc-desk__top" />
        <rect x="40" y="164" width="560" height="10" className="soc-desk__edge" />
        <rect x="320" y="150" width="96" height="9" rx="2" className="soc-desk__keys" />
        <rect x="500" y="134" width="22" height="16" rx="3" fill="color-mix(in srgb, var(--acc) 50%, #444)" />
        {/* you */}
        <g transform="translate(368 176) scale(1.45)">
          <PersonSeated initials={initials} pose={pose} />
        </g>
        {/* what you think of it */}
        <g transform="translate(410 96)">
          <g className="soc-scene__bubble soc-scene__bubble--right">
            <circle r="14" fill="var(--rd-good, #34d399)" />
            <path d="M-6 0 l4 4 l8 -9" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className="soc-scene__bubble soc-scene__bubble--wrong">
            <circle r="14" fill="#f59e0b" />
            <text y="5" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="16">?</text>
          </g>
          <g className="soc-scene__bubble soc-scene__bubble--done">
            <circle r="16" fill="var(--acc)" />
            <text y="5" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="13">✓✓</text>
          </g>
        </g>
      </svg>
      <span className="soc-scene__caption">
        Your workstation · <b>{skill}</b>
      </span>
    </div>
  );
}
