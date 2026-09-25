"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText, Globe, Laptop, Server, Users, type LucideIcon } from "lucide-react";
import { BOOKING_URL } from "./chrome";

/* Training hero. The student's own company network, drawn as a live map.
   A tour lights each part up in the order the course teaches it, traffic
   starts to flow, and the attack on the Ops PC is contained last. Hovering
   or tapping any part stops the tour and explains what is learned there. */

type NodeKey = "server" | "users" | "finance" | "internet" | "logs" | "ops";

type MapNode = {
  key: NodeKey;
  x: number;
  y: number;
  Icon: LucideIcon;
  name: string;
  title: string;
  body: string;
  alert?: boolean;
};

// Tour order is course order. Coordinates are in the SVG's 100 x 69 box.
const NODES: MapNode[] = [
  { key: "server", x: 50, y: 35, Icon: Server, name: "Server", title: "Build the network", body: "They set up the server that runs a small company. Everything else connects to it." },
  { key: "users", x: 14, y: 28, Icon: Users, name: "Users", title: "Manage who has access", body: "Create accounts, give the right access, and remove it safely when someone leaves." },
  { key: "finance", x: 25, y: 57, Icon: Laptop, name: "Finance PC", title: "Fix help desk tickets", body: "Locked accounts and lost access, solved in their own lab and checked automatically." },
  { key: "internet", x: 50, y: 8, Icon: Globe, name: "Internet", title: "Read network traffic", body: "Look at what goes in and out of the company, and spot what does not belong." },
  { key: "logs", x: 86, y: 28, Icon: FileText, name: "Logs", title: "Catch threats early", body: "Read the trail every attack leaves behind and turn it into an alert." },
  { key: "ops", x: 75, y: 57, Icon: Laptop, name: "Ops PC", title: "Respond to an attack", body: "A suspicious 2 AM sign-in. They investigate, contain it, and keep the evidence.", alert: true },
];

const HUB = NODES[0];
const STEP_MS = 3200;

const FACTS = [
  { k: "3", v: "phases, from the basics to incident response" },
  { k: "25", v: "hands-on missions checked in their own lab" },
  { k: "4", v: "job skills in a score employers can read" },
];

const QUERY = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(QUERY);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

type State = "idle" | "active" | "learned";

function NetworkMap() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (manual || paused || reduced) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % NODES.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [manual, paused, reduced]);

  // Reduced motion and manual browsing both show the finished network.
  const complete = manual || reduced;
  const current = reduced && !manual ? NODES.length - 1 : step;
  const active = NODES[current];

  function stateOf(i: number): State {
    if (i === current) return "active";
    return complete || i < current ? "learned" : "idle";
  }

  function pick(i: number) {
    setManual(true);
    setStep(i);
  }

  const learned = NODES.filter((_, i) => stateOf(i) !== "idle").length;

  return (
    <div
      className="tn"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="tn-map">
        <svg viewBox="0 0 100 69" aria-hidden="true">
          <rect className="tn-zone" x="3" y="17" width="94" height="50" />
          {NODES.slice(1).map((n) => {
            const i = NODES.indexOf(n);
            const s = stateOf(i);
            const path = `M${HUB.x} ${HUB.y} L${n.x} ${n.y}`;
            return (
              <g key={n.key}>
                <path d={path} className="tn-link" data-state={s} />
                {!reduced && s !== "idle" && (
                  <>
                    <circle r="0.9" className="tn-packet">
                      <animateMotion dur="2.2s" repeatCount="indefinite" path={path} />
                    </circle>
                    <circle r="0.9" className="tn-packet">
                      <animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" path={path} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        <span className="tn-zone__label">Their company network</span>

        {NODES.map((n, i) => {
          const s = stateOf(i);
          const threat = n.alert && s === "idle";
          return (
            <button
              key={n.key}
              type="button"
              className="tn-node"
              data-state={s}
              data-threat={threat ? "1" : "0"}
              style={{ left: `${n.x}%`, top: `${(n.y / 69) * 100}%` }}
              aria-pressed={s === "active"}
              aria-label={`${n.name}: ${n.title}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && pick(i)}
              onFocus={() => pick(i)}
              onClick={() => pick(i)}
            >
              <span className="tn-node__tile">
                <n.Icon size={22} strokeWidth={1.75} />
                {s === "learned" && <b className="tn-node__ok"><Check size={10} strokeWidth={3.5} /></b>}
                {threat && <b className="tn-node__warn">!</b>}
              </span>
              <span className="tn-node__name">{n.name}</span>
            </button>
          );
        })}
      </div>

      <div className="tn-detail" aria-live={manual ? "polite" : "off"}>
        <div className="tn-detail__body" key={active.key}>
          <i><active.Icon size={20} strokeWidth={1.75} /></i>
          <div>
            <span>{active.name}</span>
            <strong>{active.title}</strong>
            <p>{active.body}</p>
          </div>
        </div>
        <footer>
          <ol aria-hidden="true">
            {NODES.map((n, i) => (
              <li key={n.key} data-on={stateOf(i) !== "idle" ? "1" : "0"} />
            ))}
          </ol>
          <span>{manual ? `${learned} of ${NODES.length} skills` : "Tap to explore"}</span>
        </footer>
      </div>
    </div>
  );
}

export function TrainingHero() {
  return (
    <section className="th">
      <div className="th-copy">
        <span className="sp-tag">Training</span>
        <h1>
          <span>Job-ready</span> cybersecurity training
        </h1>
        <p className="th-sub">
          Students practice on their own company network, get help from an AI coach, and finish with proof employers
          trust.
        </p>
        <div className="th-actions">
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Book a cohort <ArrowRight size={16} />
          </a>
          <Link href="/academy" className="sp-btn sp-btn--ghost sp-btn--lg">
            Sign in
          </Link>
        </div>
      </div>

      <NetworkMap />

      <ul className="th-facts">
        {FACTS.map((f) => (
          <li key={f.v}>
            <b>{f.k}</b>
            <span>{f.v}</span>
          </li>
        ))}
      </ul>

      <style>{HERO_CSS}</style>
    </section>
  );
}

const HERO_CSS = `
.th {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 560px); gap: 28px 56px; align-items: center;
  padding: clamp(40px, 6vw, 80px) 0 0;
}
.th-copy { max-width: 620px }
.th h1 {
  margin: 18px 0 0; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(2.4rem, 4.4vw, 3.5rem); line-height: 1.04; letter-spacing: -.045em; color: var(--ink); text-wrap: balance;
}
.th h1 span { display: block; color: var(--accent-deep) }
.th-sub { margin: 22px 0 0; max-width: 46ch; color: var(--ink-soft); font-size: 1.1rem; line-height: 1.6 }
.th-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px }
.th-actions .sp-btn:active { transform: translateY(1px) scale(.98) }

/* map panel */
.tn {
  position: relative; background: #fff; border: 1px solid rgba(85,70,224,.18);
  box-shadow: 0 40px 80px -40px rgba(42,34,128,.4), 0 12px 24px -18px rgba(42,34,128,.22);
}
.tn::before {
  content: ""; position: absolute; inset: -44px -36px -36px -44px; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, rgba(106,92,255,.16), transparent);
}
.tn-map {
  position: relative; aspect-ratio: 100 / 69; margin: 14px 14px 0;
  background: radial-gradient(rgba(85,70,224,.14) 1px, transparent 1.2px) 0 0 / 16px 16px, #fbfbff;
}
.tn-map svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible }
.tn-zone { fill: rgba(106,92,255,.04); stroke: rgba(85,70,224,.28); stroke-width: 1; stroke-dasharray: 4 4; vector-effect: non-scaling-stroke }
.tn-zone__label { position: absolute; left: 50%; bottom: 4.5%; transform: translateX(-50%); white-space: nowrap; font-size: .72rem; font-weight: 600; color: var(--accent-deep); opacity: .75 }
.tn-link { fill: none; stroke: var(--border-strong); stroke-width: 1.5; vector-effect: non-scaling-stroke; transition: stroke .5s var(--ease) }
.tn-link[data-state="learned"] { stroke: rgba(106,92,255,.5) }
.tn-link[data-state="active"] { stroke: var(--accent); stroke-width: 2.5 }
.tn-packet { fill: var(--accent) }

/* nodes */
.tn-node {
  position: absolute; z-index: 1; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 7px;
  padding: 0; background: none; border: 0; cursor: pointer; color: inherit;
}
.tn-node:focus-visible { outline: none }
.tn-node:focus-visible .tn-node__tile { outline: 2px solid var(--accent); outline-offset: 3px }
.tn-node__tile {
  position: relative; display: grid; place-items: center; width: 54px; height: 54px;
  background: #fff; border: 1px solid var(--border-strong); color: var(--muted);
  box-shadow: 0 10px 20px -14px rgba(42,34,128,.4);
  transition: background .35s var(--ease), color .35s var(--ease), border-color .35s var(--ease), transform .35s var(--ease), box-shadow .35s var(--ease);
}
.tn-node__tile > svg { position: static; width: 24px; height: 24px; margin: 0 }
.tn-detail__body > i svg { position: static; width: 20px; height: 20px; margin: 0 }
.tn-node:hover .tn-node__tile { transform: translateY(-2px) }
.tn-node[data-state="learned"] .tn-node__tile { background: var(--accent-soft); border-color: rgba(106,92,255,.35); color: var(--accent-deep) }
.tn-node[data-state="active"] .tn-node__tile {
  background: var(--accent); border-color: var(--accent); color: #fff; transform: scale(1.08);
  box-shadow: 0 0 0 6px rgba(106,92,255,.16), 0 16px 28px -12px rgba(85,70,224,.6);
}
.tn-node[data-state="active"] .tn-node__tile::after {
  content: ""; position: absolute; inset: -6px; border: 2px solid var(--accent); opacity: 0; animation: tn-ring 1.8s ease-out infinite;
}
.tn-node[data-threat="1"] .tn-node__tile { border-color: #f59e0b; color: #b45309 }
.tn-node__ok, .tn-node__warn {
  position: absolute; top: -7px; right: -7px; display: grid; place-items: center; width: 18px; height: 18px;
  font-size: .72rem; font-weight: 800; color: #fff; animation: tn-pop .35s var(--ease) both;
}
.tn-node__ok { background: var(--green) }
.tn-node__warn { background: #f59e0b; animation: tn-warn 1.2s ease-in-out infinite }
.tn-node__name {
  padding: 2px 7px; background: rgba(251,251,255,.92); font-size: .78rem; font-weight: 600; white-space: nowrap; color: var(--ink-soft);
  transition: color .3s var(--ease);
}
.tn-node[data-state="active"] .tn-node__name { color: var(--accent-deep) }

/* detail */
.tn-detail { padding: 16px 18px 14px }
.tn-detail__body { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: start; min-height: 92px; animation: tn-in .4s cubic-bezier(.16,1,.3,1) both }
.tn-detail__body > i { display: grid; place-items: center; width: 42px; height: 42px; background: var(--accent-soft); color: var(--accent-deep) }
.tn-detail__body span { display: block; font-size: .78rem; font-weight: 600; color: var(--muted) }
.tn-detail__body strong { display: block; margin-top: 2px; font-family: var(--font-display); font-weight: 600; font-size: 1.25rem; letter-spacing: -.025em; color: var(--ink) }
.tn-detail__body p { margin: 4px 0 0; max-width: 46ch; color: var(--ink-soft); font-size: .93rem; line-height: 1.5 }
.tn-detail footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border) }
.tn-detail ol { display: flex; gap: 5px; list-style: none; margin: 0; padding: 0 }
.tn-detail ol li { width: 22px; height: 4px; background: var(--border-strong); transition: background .4s var(--ease) }
.tn-detail ol li[data-on="1"] { background: var(--accent) }
.tn-detail footer span { font-size: .8rem; font-weight: 600; color: var(--muted) }

/* facts */
.th-facts {
  grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); list-style: none;
  margin: clamp(28px, 4vw, 48px) 0 0; padding: 0; border-top: 1px solid var(--border);
}
.th-facts li { display: flex; align-items: baseline; gap: 14px; padding: 22px 24px 0 0 }
.th-facts li + li { padding-left: 24px; border-left: 1px solid var(--border) }
.th-facts b { font-family: var(--font-display); font-weight: 500; font-size: 2.2rem; letter-spacing: -.05em; line-height: 1; color: var(--accent-deep) }
.th-facts span { color: var(--ink-soft); font-size: .95rem; line-height: 1.4 }

@keyframes tn-in { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes tn-pop { from { opacity: 0; transform: scale(.6) } to { opacity: 1; transform: none } }
@keyframes tn-ring { from { opacity: .7; transform: scale(1) } to { opacity: 0; transform: scale(1.35) } }
@keyframes tn-warn { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.18) } }

@media (prefers-reduced-motion: reduce) {
  .tn-node__tile, .tn-link, .tn-detail ol li { transition: none }
  .tn-node[data-state="active"] .tn-node__tile::after, .tn-node__ok, .tn-node__warn, .tn-detail__body { animation: none }
}

@media (max-width: 1020px) {
  .th { grid-template-columns: minmax(0, 1fr) }
  .tn { max-width: 620px }
}
@media (max-width: 640px) {
  .tn::before { display: none }
  .tn-map { margin: 10px 10px 0; background-size: 12px 12px }
  .tn-node__tile { width: 40px; height: 40px }
  .tn-node__tile > svg { width: 18px; height: 18px }
  .tn-node__name { font-size: .68rem; padding: 1px 4px }
  .tn-zone__label { display: none }
  .tn-detail { padding: 14px }
  .th-facts { grid-template-columns: 1fr }
  .th-facts li, .th-facts li + li { padding: 16px 0; border-left: 0; border-bottom: 1px solid var(--border) }
}
`;
