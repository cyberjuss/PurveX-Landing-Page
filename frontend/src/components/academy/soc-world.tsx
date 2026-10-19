"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WALL_H, WORLD_W } from "@/lib/soc-world";
import { stationNo as no } from "./soc-guide";
import type { SocFloor } from "./use-soc-floor";
import "./soc-world.css";

/** Someone seen from above, facing +x. The caller rotates. */
function Person({ walking, typing, shirt, headset }: { walking?: boolean; typing?: boolean; shirt: string; headset?: boolean }) {
  return (
    <g className={`tdp${walking ? " is-walking" : ""}${typing ? " is-typing" : ""}`}>
      <ellipse cx="1" cy="2" rx="21" ry="23" className="tdp__shadow" />
      <circle cx="4" cy="-17" r="6" fill={shirt} className="tdp__arm tdp__arm--l" />
      <circle cx="4" cy="17" r="6" fill={shirt} className="tdp__arm tdp__arm--r" />
      <rect x="-12" y="-19" width="22" height="38" rx="11" fill={shirt} />
      <circle cx="2" cy="0" r="10.5" className="tdp__head" />
      <path d="M-8.5 -6 A10.5 10.5 0 0 1 8 -6.5 Q2 -2 -1 0 Q2 2 8 6.5 A10.5 10.5 0 0 1 -8.5 6 Z" className="tdp__hair" />
      {headset && <path d="M-1 -12 A12.5 12.5 0 0 1 -1 12" className="tdp__headset" />}
    </g>
  );
}

const trim = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

// The SOC floor drawn as a plan from above. The fallback for a device without
// WebGL, and the lighter view for anyone who prefers it. It draws what
// useSocFloor knows; walking, sitting and the Coach all live there.
export function SocPlan({ floor }: { floor: SocFloor }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [focused, setFocused] = useState(false);
  const { labs, world, done, nextUp, cleared, view, seated, talking, setCamSize } = floor;

  // The camera shows a window of the room shaped like the box.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const aspect = r.height / Math.max(1, r.width);
      let w = r.width < 560 ? 680 : Math.min(1000, WORLD_W);
      if (w * aspect > world.height) w = world.height / aspect;
      setCamSize(w, w * aspect);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    box.current?.focus({ preventScroll: true });
    return () => ro.disconnect();
  }, [world, setCamSize]);

  const onClick = (e: React.MouseEvent) => {
    box.current?.focus({ preventScroll: true });
    const t = e.target as Element;
    const st = t.closest<SVGGElement>("[data-station]");
    if (st) return floor.goToStation(Number(st.dataset.station));
    if (t.closest("[data-coach]")) return floor.goToCoach();
    const m = svg.current?.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    if (p.y > WALL_H) floor.walkTo({ x: p.x, y: p.y });
  };

  const n = view.near;
  const focusI = seated ?? (n?.kind === "station" ? n.i : null);
  const me = view.me;
  const hint: CSSProperties = {
    left: `${((me.x - view.cam.x) / view.cw) * 100}%`,
    top: `${((me.y - view.cam.y) / view.ch) * 100}%`,
  };

  return (
    <div
      ref={box}
      className={`sw${focused ? " is-focused" : ""}`}
      tabIndex={0}
      role="application"
      aria-label="The PurveX Financial SOC. Arrow keys or WASD to walk, E to sit at a workstation or talk to the Coach."
      onKeyDown={floor.onKeyDown}
      onKeyUp={floor.onKeyUp}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        floor.releaseKeys();
      }}
      onClick={onClick}
    >
        <svg ref={svg} viewBox={`${view.cam.x} ${view.cam.y} ${view.cw} ${view.ch}`} preserveAspectRatio="xMidYMid slice" className="sw__svg">
          <defs>
            <pattern id="sw-tile" width="64" height="64" patternUnits="userSpaceOnUse">
              <rect width="64" height="64" className="sw__floor" />
              <path d="M0 0 H64 M0 0 V64" className="sw__tile" />
            </pattern>
            <linearGradient id="sw-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="sw__sky-top" />
              <stop offset="1" className="sw__sky-low" />
            </linearGradient>
            <filter id="sw-soft" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" className="sw__shadow" />
            </filter>
          </defs>

          {/* Floor and the pods, one per week */}
          <rect x="0" y={WALL_H} width={WORLD_W} height={world.height - WALL_H} fill="url(#sw-tile)" />
          {world.pods.map((p) => (
            <g key={p.label}>
              <rect {...p.rug} width={p.rug.w} height={p.rug.h} rx="22" className="sw__rug" />
              <text x={p.rug.x + 24} y={p.rug.y + 28} className="sw__podlabel">
                {p.label.toUpperCase()}
              </text>
              <text x={p.rug.x + p.rug.w - 24} y={p.rug.y + 28} textAnchor="end" className="sw__podcount">
                {p.stations.filter((i) => done[i]).length}/{p.stations.length} done
              </text>
            </g>
          ))}

          {/* The back wall */}
          <rect x="0" y="0" width={WORLD_W} height={WALL_H} className="sw__wall" />
          <rect x="0" y={WALL_H - 4} width={WORLD_W} height="4" className="sw__skirting" />
          {[
            [28, 190],
            [1250, 320],
          ].map(([wx, ww], wi) => (
            <g key={wi}>
              <rect x={wx} y="24" width={ww} height="96" rx="4" fill="url(#sw-sky)" />
              <path
                d={`M${wx} 120 ${Array.from({ length: Math.floor(ww / 22) }, (_, b) => `V${78 + ((b * 37 + wi * 11) % 34)} h22`).join(" ")} V120 Z`}
                className="sw__skyline"
              />
              <rect x={wx} y="24" width={ww} height="96" rx="4" className="sw__frame" />
            </g>
          ))}
          <g transform="translate(250 46)">
            <rect width="36" height="36" rx="8" className="sw__logo" />
            <text x="18" y="25" textAnchor="middle" className="sw__logo-p">
              P
            </text>
            <text x="50" y="17" className="sw__sign">
              PurveX Financial
            </text>
            <text x="50" y="34" className="sw__sign-sub">
              SECURITY OPERATIONS CENTER
            </text>
          </g>
          <g transform="translate(560 22)">
            <rect width="220" height="104" rx="4" className="sw__vw" />
            <text x="12" y="20" className="sw__vw-label">
              THREAT MAP
            </text>
            <path d="M16 86 q40 -46 88 -18 t104 -12" className="sw__arc" />
            {[
              [26, 86],
              [92, 62],
              [148, 58],
              [204, 72],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" className="sw__ping" style={{ ["--i" as string]: i }} />
            ))}
            <g transform="translate(230 0)">
              <rect width="220" height="104" rx="4" className="sw__vw" />
              <text x="12" y="20" className="sw__vw-label">
                ALERT QUEUE
              </text>
              {["4625 ×40  alex.rivera", "New admin  svc-backup-job", "SYN burst  10.0.1.23", "Hash mismatch  vpn-client"].map((t, i) => (
                <g key={i} transform={`translate(12 ${40 + i * 17})`}>
                  <rect y="-7" width="5" height="7" className={`sw__sev is-p${(i % 3) + 1}`} />
                  <text x="12" className="sw__qtext">
                    {t}
                  </text>
                </g>
              ))}
            </g>
            <g transform="translate(460 0)">
              <rect width="150" height="104" rx="4" className="sw__vw" />
              <text x="12" y="20" className="sw__vw-label">
                LABS CLEARED
              </text>
              <text x="12" y="78" className="sw__big">
                {cleared}
                <tspan className="sw__big-of"> / {labs.length}</tspan>
              </text>
            </g>
          </g>

          {/* The right of the room */}
          <rect {...world.rack} width={world.rack.w} height={world.rack.h} rx="3" className="sw__rack" />
          {Array.from({ length: Math.floor(world.rack.h / 18) }, (_, i) => (
            <circle key={i} cx={world.rack.x + 9 + (i % 2) * 10} cy={world.rack.y + 12 + i * 18} r="2" className="sw__led" style={{ ["--i" as string]: i % 7 }} />
          ))}
          {world.plants.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y})`}>
              <circle r="17" className="sw__pot" />
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} rx="13" ry="5" transform={`rotate(${a + i * 20}) translate(8 0)`} className="sw__leaf" />
              ))}
            </g>
          ))}
          <g filter="url(#sw-soft)">
            <rect {...world.coffee} width={world.coffee.w} height={world.coffee.h} rx="8" className="sw__desk" />
          </g>
          <rect x={world.coffee.x + 16} y={world.coffee.y + 8} width="30" height="28" rx="5" className="sw__machine" />
          <circle cx={world.coffee.x + 108} cy={world.coffee.y + 22} r="8" className="sw__cup" />
          <text x={world.coffee.x + world.coffee.w / 2} y={world.coffee.y + 70} textAnchor="middle" className="sw__note">
            Coffee
          </text>
          <rect {...world.door} width={world.door.w} height={world.door.h} rx="2" className="sw__door" />
          <text x={world.door.x + world.door.w / 2} y={world.height - 22} textAnchor="middle" className="sw__note">
            Entrance
          </text>

          {/* Workstations */}
          {world.stations.map((s, i) => {
            const l = labs[i];
            return (
              <g
                key={l.slug}
                data-station={i}
                className={`sw-st${focusI === i ? " is-on" : ""}${done[i] ? " is-done" : ""}${i === nextUp ? " is-next" : ""}`}
                style={{ ["--acc" as string]: l.accent } as CSSProperties}
              >
                <rect x={s.desk.x - 18} y={s.desk.y - 18} width={s.desk.w + 36} height="190" className="sw-st__hit" />
                <ellipse cx={s.seat.x} cy={s.desk.y + 70} rx="150" ry="86" className="sw-st__pool" />
                <g filter="url(#sw-soft)">
                  <rect x={s.desk.x} y={s.desk.y} width={s.desk.w} height={s.desk.h} rx="9" className="sw__desk" />
                </g>
                {[34, 118].map((mx) => (
                  <g key={mx}>
                    <rect x={s.desk.x + mx} y={s.desk.y + 8} width="68" height="10" rx="3" className="sw-st__mon" />
                    <rect x={s.desk.x + mx + 4} y={s.desk.y + 15} width="60" height="2.5" rx="1" className="sw-st__screen" />
                  </g>
                ))}
                <rect x={s.desk.x + 82} y={s.desk.y + 32} width="56" height="13" rx="3" className="sw-st__keys" />
                <text x={s.desk.x + 14} y={s.desk.y + s.desk.h - 12} className="sw-st__no">
                  {no(i)}
                </text>
                {done[i] && (
                  <g transform={`translate(${s.desk.x + s.desk.w - 18} ${s.desk.y + s.desk.h - 18})`}>
                    <circle r="8" className="sw-st__check" />
                    <path d="M-3.5 0 l2.5 2.6 l4.6 -5" className="sw-st__tick" />
                  </g>
                )}
                {i === nextUp && !done[i] && <circle cx={s.desk.x + s.desk.w - 18} cy={s.desk.y + s.desk.h - 18} r="5" className="sw-st__next" />}
                {seated !== i && (
                  <g transform={`translate(${s.seat.x} ${s.seat.y})`} filter="url(#sw-soft)">
                    <rect x="-19" y="-17" width="38" height="34" rx="11" className="sw-st__chair" />
                  </g>
                )}
                <text x={s.label.x} y={s.label.y} textAnchor="middle" className="sw-st__title">
                  {trim(l.title, 30)}
                </text>
              </g>
            );
          })}

          {/* The Coach */}
          <g data-coach className={`sw-coach${n?.kind === "coach" || talking ? " is-near" : ""}`}>
            <rect x={world.coachDesk.x - 20} y={world.coachDesk.y - 20} width={world.coachDesk.w + 40} height="190" className="sw-st__hit" />
            <g filter="url(#sw-soft)">
              <rect {...world.coachDesk} width={world.coachDesk.w} height={world.coachDesk.h} rx="9" className="sw__desk" />
            </g>
            <rect x={world.coachDesk.x + 55} y={world.coachDesk.y + 8} width="100" height="10" rx="3" className="sw-st__mon" />
            <rect x={world.coachDesk.x + 59} y={world.coachDesk.y + 15} width="92" height="2.5" rx="1" className="sw-coach__screen" />
            <circle cx={world.coach.x} cy={world.coach.y} r="34" className="sw-coach__ring" />
            <g transform={`translate(${world.coach.x} ${world.coach.y}) rotate(180)`}>
              <Person shirt="var(--sw-coach)" headset />
            </g>
            <text x={world.coach.x} y={world.coach.y + 58} textAnchor="middle" className="sw-st__title sw-coach__name">
              Coach · Tier 2
            </text>
          </g>

          {/* A colleague on the night shift */}
          <g filter="url(#sw-soft)">
            <rect {...world.colleagueDesk} width={world.colleagueDesk.w} height={world.colleagueDesk.h} rx="9" className="sw__desk" />
          </g>
          {[40, 112].map((mx) => (
            <rect key={mx} x={world.colleagueDesk.x + mx} y={world.colleagueDesk.y + 8} width="60" height="10" rx="3" className="sw-st__mon is-live" />
          ))}
          <g transform={`translate(${world.colleague.x} ${world.colleague.y}) rotate(-90)`}>
            <Person shirt="var(--sw-colleague)" typing />
          </g>
          <text x={world.colleague.x} y={world.colleague.y + 52} textAnchor="middle" className="sw__note">
            Night shift
          </text>

          {view.path.map((p, i) => (i % 3 ? null : <circle key={i} cx={p.x} cy={p.y} r="2.5" className="sw__trail" />))}

          {/* You */}
          <g transform={`translate(${me.x} ${me.y})`} className="sw-me">
            <circle r="26" className="sw-me__ring" />
            <g transform={`rotate(${view.deg})`}>
              <Person walking={view.walking} typing={seated !== null} shirt="var(--rd-accent)" />
            </g>
          </g>
        </svg>

      {n && seated === null && !talking && (
        <span className="sw-key" style={hint}>
          <kbd>E</kbd> {n.kind === "coach" ? "Talk" : "Sit down"}
        </span>
      )}
      {seated !== null && (
        <span className="sw-key sw-key--signin" style={hint}>
          Signing in…
        </span>
      )}
      {!focused && <span className="sw-wake">Click the floor to walk</span>}
    </div>
  );
}
