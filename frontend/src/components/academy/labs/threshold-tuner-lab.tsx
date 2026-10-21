"use client";

import { useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { confettiFrom } from "@/lib/confetti";
import { useLabDone, useLabResult, useSaved } from "./lab-kit";
import "./threshold-tuner-lab.css";

// Week 4 lab: a real slider, not a card to drop. Five failed-sign-in counts
// are plotted on one scale (plus a password spray, always far past it), and
// dragging the threshold line live-recolors which ones would trigger an
// alert. Two challenges ask the student to land the slider in a specific
// place for a specific reason, not just read the picture.

const SCALE_MAX = 20;
type Mark = { id: string; label: string; count: number };
const MARKS: Mark[] = [
  { id: "typo", label: "A single mistyped password", count: 2 },
  { id: "retry", label: "A second retry a moment later", count: 3 },
  { id: "kiosk", label: "A shared kiosk account's normal daily noise", count: 9 },
  { id: "guess", label: "A targeted guess against one account", count: 12 },
  { id: "noisytest", label: "A known noisy test account", count: 15 },
];

type Challenge = { id: string; prompt: string; check: (t: number) => boolean; why: string };
const CHALLENGES: Challenge[] = [
  {
    id: "sweet",
    prompt: "Set the threshold so it still catches the targeted guess against one account, but stops flagging the shared kiosk account's normal daily noise.",
    check: (t) => t >= 10 && t <= 12,
    why: "10 to 12 is the only band where the kiosk account (9) falls quiet and the targeted guess (12) still trips the alert. That band is the actual job of tuning a threshold.",
  },
  {
    id: "floor",
    prompt: "Now find the lowest threshold that still never flags a single mistyped password.",
    check: (t) => t === 3,
    why: "3 is the floor. One lower and a single typo (2) starts an alert every time someone fat-fingers their password, and that is exactly how a SOC trains itself to ignore Critical.",
  },
];

interface State {
  value: number;
  locked: string[];
}
const START: State = { value: 6, locked: [] };
const STORE = "academy-lab-threshold-tuner-v1";

function note(t: number): string {
  if (t <= 2) return "Everything trips the alert, including a single typo. This is how a queue teaches people to ignore Critical.";
  if (t <= 8) return "Typos stay quiet, but the kiosk account's ordinary noise still fires every day.";
  if (t <= 9) return "Right at the edge: the kiosk account just barely still trips it.";
  if (t <= 12) return "The kiosk account is quiet now, and the targeted guess still gets caught. This is the band worth aiming for.";
  if (t <= 15) return "The targeted guess just slipped under the bar. A real, quieter attack would now go uncaught.";
  return "Nothing but the loudest, most obvious attack would ever reach this bar.";
}

export function ThresholdTunerLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => typeof v.value === "number" && Array.isArray(v.locked));
  const [justWrong, setJustWrong] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const done = s.locked.length === CHALLENGES.length;
  useLabDone(done, onDone);
  useLabResult("lab-threshold-tuner", done, s.locked.length, CHALLENGES.length);

  const curChallenge = CHALLENGES.find((c) => !s.locked.includes(c.id));
  const caught = useMemo(() => MARKS.map((m) => m.count >= s.value), [s.value]);
  const pct = (n: number) => `${Math.min(100, (n / SCALE_MAX) * 100)}%`;

  const lockIn = () => {
    if (!curChallenge) return;
    if (curChallenge.check(s.value)) {
      const locked = [...s.locked, curChallenge.id];
      setS({ ...s, locked });
      if (locked.length === CHALLENGES.length) window.setTimeout(() => confettiFrom(boardRef.current, 40), 100);
    } else {
      setJustWrong(true);
      window.setTimeout(() => setJustWrong(false), 500);
    }
  };

  return (
    <div className="ttl" ref={boardRef}>
      <p className="ttl__round">Failed sign-ins per account, per hour. Drag the line.</p>

      <div className="ttl__scale">
        <div className="ttl__line" style={{ left: pct(s.value) }} aria-hidden />
        {MARKS.map((m) => (
          <div key={m.id} className={`ttl__mark${caught[MARKS.indexOf(m)] ? " is-caught" : ""}`} style={{ left: pct(m.count) }}>
            <span className="ttl__dot" />
            <span className="ttl__tag">{m.count}</span>
          </div>
        ))}
        <div className="ttl__spray">
          <span className="ttl__dot is-caught" />
          <span className="ttl__tag">40+</span>
        </div>
      </div>

      <input
        type="range"
        className="ttl__slider"
        min={1}
        max={SCALE_MAX}
        step={1}
        value={s.value}
        onChange={(e) => setS({ ...s, value: Number(e.target.value) })}
        aria-label="Detection threshold, failed sign-ins per account per hour"
      />
      <p className="ttl__value">Threshold: <b>{s.value}</b> failed sign-ins/hour</p>

      <ul className="ttl__legend">
        {MARKS.map((m, i) => (
          <li key={m.id} className={caught[i] ? "is-caught" : ""}>
            <span>{caught[i] ? "Caught" : "Missed"}</span> {m.label} ({m.count})
          </li>
        ))}
        <li className="is-caught"><span>Caught</span> A password spray, 40+ in minutes — always past any threshold you&rsquo;d set here</li>
      </ul>

      <p className="ttl__note" aria-live="polite">{note(s.value)}</p>

      {curChallenge ? (
        <div className={`ttl__challenge${justWrong ? " is-wrong" : ""}`}>
          <p>{curChallenge.prompt}</p>
          <button type="button" className="ttl__lock" onClick={lockIn}>
            Lock in {s.value}
          </button>
        </div>
      ) : (
        <p className="ttl__done">
          <Check className="h-4 w-4" aria-hidden /> There is no threshold that is simply correct. There is only the one that matches what your environment&rsquo;s baseline can tolerate in false positives against what it can afford to miss.
        </p>
      )}

      {s.locked.map((id) => {
        const c = CHALLENGES.find((cc) => cc.id === id)!;
        return (
          <p key={id} className="ttl__why">
            <Check className="h-3.5 w-3.5" aria-hidden /> {c.why}
          </p>
        );
      })}
    </div>
  );
}
