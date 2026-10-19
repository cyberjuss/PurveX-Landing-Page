"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Clock, Footprints, Headset, MapPin } from "lucide-react";
import type { LabMeta } from "@/lib/academy-labs";
import { WALL_H, WORLD_W, findPath, layout, step, type Pt } from "@/lib/soc-world";
import { useAcademyProgress, slugify } from "./academy-progress";
import { useCoach } from "./coach-context";
import "./soc-world.css";

const SEAT_KEY = "academy-soc-seat";
const SPEED = 260;
const PATH_SPEED = 430;
const REACH = 78;

type Lab = LabMeta & { week?: string };
type Near = { kind: "station"; i: number } | { kind: "coach" } | null;
type Pending = { kind: "sit"; i: number } | { kind: "coach" } | null;

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
const no = (i: number) => String(i + 1).padStart(2, "0");

// The PurveX Financial SOC as a room to walk around. Arrow keys or WASD walk,
// a click walks you there around the desks, E (or Enter) sits you at the desk
// in front of you or talks to the Coach. Desks sit in pods, one per week of
// the course. The room is the picture; the panel beside it carries the words.
export function SocWorld({ labs }: { labs: Lab[] }) {
  const router = useRouter();
  const { isLabDone } = useAcademyProgress();
  const coach = useCoach();
  const pods = useMemo(() => {
    const out: { label: string; size: number }[] = [];
    for (const l of labs) {
      const label = l.week ?? "Labs";
      if (out.length && out[out.length - 1].label === label) out[out.length - 1].size++;
      else out.push({ label, size: 1 });
    }
    return out;
  }, [labs]);
  const world = useMemo(() => layout(pods), [pods]);
  const done = labs.map((l) => isLabDone(l.phaseSlug, l.entrySlug, slugify(l.title)));
  const nextUp = done.findIndex((d) => !d);
  const cleared = done.filter(Boolean).length;

  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const pos = useRef<Pt>(world.spawn);
  const dir = useRef(-Math.PI / 2);
  const keys = useRef(new Set<string>());
  const path = useRef<Pt[] | null>(null);
  const pending = useRef<Pending>(null);
  const stuck = useRef(0);
  const moving = useRef(false);
  const near = useRef<Near>(null);
  const cam = useRef<Pt>({ x: 0, y: 0 });
  const camSize = useRef({ w: 980, h: 600 });
  const snapped = useRef(false);
  const [view, setView] = useState<{ me: Pt; deg: number; walking: boolean; near: Near; path: Pt[]; cam: Pt; cw: number; ch: number }>({
    me: world.spawn,
    deg: -90,
    walking: false,
    near: null,
    path: [],
    cam: { x: 0, y: 0 },
    cw: 980,
    ch: 600,
  });
  const [seated, setSeated] = useState<number | null>(null);
  const [talking, setTalking] = useState(false);
  const [focused, setFocused] = useState(false);
  const seatedRef = useRef<number | null>(null);
  const talkingRef = useRef(false);
  const leaveTimer = useRef<number | null>(null);

  const publish = useCallback(
    () =>
      setView({
        me: { ...pos.current },
        deg: (dir.current * 180) / Math.PI,
        walking: moving.current,
        near: near.current,
        path: path.current ? [...path.current] : [],
        cam: { ...cam.current },
        cw: camSize.current.w,
        ch: camSize.current.h,
      }),
    []
  );

  useEffect(() => {
    seatedRef.current = seated;
  }, [seated]);
  useEffect(() => {
    talkingRef.current = talking;
  }, [talking]);

  // The camera shows a window of the room shaped like the box.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const aspect = r.height / Math.max(1, r.width);
      let w = r.width < 560 ? 680 : Math.min(1000, WORLD_W);
      if (w * aspect > world.height) w = world.height / aspect;
      camSize.current = { w, h: w * aspect };
      publish();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [world, publish]);

  // Back where you left off: standing by the chair you last sat in.
  useEffect(() => {
    try {
      const last = window.localStorage.getItem(SEAT_KEY);
      const i = labs.findIndex((l) => l.slug === last);
      if (i >= 0) {
        pos.current = { x: world.stations[i].seat.x, y: world.stations[i].seat.y + 34 };
        dir.current = Math.PI / 2;
      }
    } catch {}
    box.current?.focus({ preventScroll: true });
    publish();
  }, [labs, world, publish]);

  const sit = useCallback(
    (i: number) => {
      const s = world.stations[i];
      pos.current = { ...s.seat };
      dir.current = -Math.PI / 2;
      path.current = null;
      setSeated(i);
      setTalking(false);
      publish();
      try {
        window.localStorage.setItem(SEAT_KEY, labs[i].slug);
      } catch {}
      leaveTimer.current = window.setTimeout(() => router.push(`/range/labs/${labs[i].slug}`), 1300);
    },
    [world, labs, router, publish]
  );

  const standUp = useCallback(() => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    if (seatedRef.current !== null) {
      const s = world.stations[seatedRef.current];
      pos.current = { x: s.seat.x, y: s.seat.y + 30 };
      dir.current = Math.PI / 2;
    }
    setSeated(null);
    publish();
  }, [world, publish]);

  const faceCoach = () => {
    dir.current = Math.atan2(world.coach.y - pos.current.y, world.coach.x - pos.current.x);
    setTalking(true);
  };

  const interact = () => {
    const n = near.current;
    if (!n || seatedRef.current !== null) return;
    if (n.kind === "coach") faceCoach();
    else sit(n.i);
  };

  const walkTo = (target: Pt, then: Pending = null) => {
    if (seatedRef.current !== null) standUp();
    setTalking(false);
    const p = findPath(world, pos.current, target);
    path.current = p && p.length ? p : null;
    pending.current = then;
    stuck.current = 0;
    box.current?.focus({ preventScroll: true });
  };

  // The loop: keys or the planned path move you, the camera follows, and the
  // room works out what is in reach.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      let vx = 0;
      let vy = 0;
      const k = keys.current;
      if (k.has("ArrowLeft") || k.has("a")) vx -= 1;
      if (k.has("ArrowRight") || k.has("d")) vx += 1;
      if (k.has("ArrowUp") || k.has("w")) vy -= 1;
      if (k.has("ArrowDown") || k.has("s")) vy += 1;
      if (vx || vy) {
        path.current = null;
        pending.current = null;
      } else if (path.current?.length) {
        const to = path.current[0];
        const dx = to.x - pos.current.x;
        const dy = to.y - pos.current.y;
        const d = Math.hypot(dx, dy);
        if (d < 5) path.current.shift();
        else {
          vx = dx / d;
          vy = dy / d;
        }
      }
      let changed = false;
      const busy = seatedRef.current !== null || talkingRef.current;
      if ((vx || vy) && !busy) {
        const len = Math.hypot(vx, vy);
        const speed = k.size ? SPEED : PATH_SPEED;
        const next = step(world, pos.current, (vx / len) * speed * dt, (vy / len) * speed * dt);
        if (next.x !== pos.current.x || next.y !== pos.current.y) {
          pos.current = next;
          dir.current = Math.atan2(vy, vx);
          stuck.current = 0;
          changed = true;
        } else if (path.current && ++stuck.current > 20) path.current = null;
      }
      if (changed !== moving.current) {
        moving.current = changed;
        changed = true;
      }
      if (path.current && !path.current.length) {
        path.current = null;
        const then = pending.current;
        pending.current = null;
        if (then?.kind === "sit") sit(then.i);
        if (then?.kind === "coach") {
          dir.current = Math.atan2(world.coach.y - pos.current.y, world.coach.x - pos.current.x);
          setTalking(true);
        }
      }
      let best: Near = null;
      let bestD = REACH;
      for (const st of world.stations) {
        const d = Math.hypot(st.seat.x - pos.current.x, st.seat.y - pos.current.y);
        if (d < bestD) {
          bestD = d;
          best = { kind: "station", i: st.i };
        }
      }
      if (Math.hypot(world.coach.x - pos.current.x, world.coach.y - pos.current.y) < REACH + 10) best = { kind: "coach" };
      const nearKey = (x: Near) => (!x ? "" : x.kind === "coach" ? "coach" : `s${x.i}`);
      if (nearKey(near.current) !== nearKey(best)) {
        near.current = best;
        changed = true;
      }
      // The camera eases after you and stops at the walls. The first frame lands on you.
      const { w: cw, h: ch } = camSize.current;
      const tx = Math.max(0, Math.min(WORLD_W - cw, pos.current.x - cw / 2));
      const ty = Math.max(0, Math.min(world.height - ch, pos.current.y - ch * 0.55));
      const ease = snapped.current ? Math.min(1, dt * 6) : 1;
      snapped.current = true;
      const nx = cam.current.x + (tx - cam.current.x) * ease;
      const ny = cam.current.y + (ty - cam.current.y) * ease;
      if (Math.abs(nx - cam.current.x) > 0.05 || Math.abs(ny - cam.current.y) > 0.05) {
        cam.current = { x: nx, y: ny };
        changed = true;
      }
      if (changed) publish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [world, sit, publish]);

  useEffect(
    () => () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    },
    []
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) {
      e.preventDefault();
      if (seatedRef.current !== null) standUp();
      if (talkingRef.current) setTalking(false);
      keys.current.add(key);
    } else if (key === "e" || key === "Enter" || key === " ") {
      e.preventDefault();
      interact();
    } else if (key === "Escape") {
      setTalking(false);
      standUp();
    }
  };
  const onKeyUp = (e: React.KeyboardEvent) => keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);

  const onClick = (e: React.MouseEvent) => {
    box.current?.focus({ preventScroll: true });
    const t = e.target as Element;
    const st = t.closest<SVGGElement>("[data-station]");
    if (st) {
      const i = Number(st.dataset.station);
      if (near.current?.kind === "station" && near.current.i === i) sit(i);
      else walkTo(world.stations[i].seat, { kind: "sit", i });
      return;
    }
    if (t.closest("[data-coach]")) {
      if (near.current?.kind === "coach") faceCoach();
      else walkTo({ x: world.coach.x - 62, y: world.coach.y }, { kind: "coach" });
      return;
    }
    const m = svg.current?.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    if (p.y > WALL_H) walkTo({ x: p.x, y: p.y });
  };

  const n = view.near;
  const focusI = seated ?? (n?.kind === "station" ? n.i : null);
  const shown = focusI !== null ? labs[focusI] : null;
  const me = view.me;
  const hint: CSSProperties = {
    left: `${((me.x - view.cam.x) / view.cw) * 100}%`,
    top: `${((me.y - view.cam.y) / view.ch) * 100}%`,
  };
  const podOf = (i: number) => world.pods.find((p) => p.stations.includes(i));

  return (
    <div className="sw-wrap">
      <div
        ref={box}
        className={`sw${focused ? " is-focused" : ""}`}
        tabIndex={0}
        role="application"
        aria-label="The PurveX Financial SOC. Arrow keys or WASD to walk, E to sit at a workstation or talk to the Coach."
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          keys.current.clear();
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

      <aside className="sw-side" aria-label="Floor guide">
        <svg
          className="sw-map"
          viewBox={`0 0 ${WORLD_W} ${world.height}`}
          role="img"
          aria-label="Map of the floor. Click to walk there."
          onClick={(e) => {
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            walkTo({ x: ((e.clientX - r.left) / r.width) * WORLD_W, y: ((e.clientY - r.top) / r.height) * world.height });
          }}
        >
          <rect width={WORLD_W} height={world.height} className="sw-map__floor" />
          <rect width={WORLD_W} height={WALL_H} className="sw-map__wall" />
          {world.pods.map((p) => (
            <rect key={p.label} {...p.rug} width={p.rug.w} height={p.rug.h} rx="22" className="sw-map__rug" />
          ))}
          {world.stations.map((st, i) => (
            <rect key={i} {...st.desk} width={st.desk.w} height={st.desk.h} rx="8" className={`sw-map__desk${done[i] ? " is-done" : ""}${i === nextUp ? " is-next" : ""}`} />
          ))}
          <circle cx={world.coach.x} cy={world.coach.y} r="30" className="sw-map__coach" />
          <rect x={view.cam.x} y={view.cam.y} width={view.cw} height={view.ch} rx="10" className="sw-map__cam" />
          <circle cx={me.x} cy={me.y} r="30" className="sw-map__me" />
        </svg>

        <div className="sw-progress">
          <span>
            <b>{cleared}</b> of {labs.length} labs cleared
          </span>
          <i style={{ ["--pct" as string]: labs.length ? cleared / labs.length : 0 }} />
        </div>

        {talking || n?.kind === "coach" ? (
          <section className="sw-card sw-card--coach">
            <p className="sw-card__kicker">
              <Headset /> Coach · Tier 2
            </p>
            <h3>{talking ? "What do you need?" : "The Coach is free"}</h3>
            <p className="sw-card__text">Ask where to start, get a workstation briefed before you sit down, or open the full conversation.</p>
            {talking ? (
              <div className="sw-card__asks">
                <button type="button" onClick={() => coach.ask(`I'm on the SOC floor with ${cleared} of ${labs.length} labs done. Which lab should I work next, and what will it train me for?`)}>
                  Which lab should I do next?
                </button>
                {nextUp >= 0 && (
                  <button type="button" onClick={() => coach.ask(`Before I sit down at "${labs[nextUp].title}": what does it teach, and what should I watch for?`)}>
                    Brief me on {trim(labs[nextUp].title, 34)}
                  </button>
                )}
                <button type="button" onClick={() => coach.setModalOpen(true)}>
                  Open the conversation
                </button>
              </div>
            ) : (
              <button type="button" className="sw-card__go" onClick={faceCoach}>
                Talk to the Coach <kbd>E</kbd>
              </button>
            )}
          </section>
        ) : shown && focusI !== null ? (
          <section className="sw-card" style={{ ["--acc" as string]: shown.accent } as CSSProperties}>
            <p className="sw-card__kicker">
              <MapPin /> Workstation {no(focusI)} · {podOf(focusI)?.label}
            </p>
            <h3>{shown.title}</h3>
            <p className="sw-card__text">{shown.blurb}</p>
            <p className="sw-card__meta">
              <span>{shown.skill}</span>
              <span>
                <Clock /> {shown.minutes} min
              </span>
              {done[focusI] && (
                <span className="is-done">
                  <Check /> Done
                </span>
              )}
            </p>
            <button type="button" className="sw-card__go" onClick={() => sit(focusI)} disabled={seated !== null}>
              {seated !== null ? "Signing in…" : done[focusI] ? "Sit down again" : "Sit down"} {seated === null && <kbd>E</kbd>}
            </button>
          </section>
        ) : nextUp >= 0 ? (
          <section className="sw-card" style={{ ["--acc" as string]: labs[nextUp].accent } as CSSProperties}>
            <p className="sw-card__kicker">
              <ArrowRight /> Next up · {podOf(nextUp)?.label}
            </p>
            <h3>{labs[nextUp].title}</h3>
            <p className="sw-card__text">{labs[nextUp].blurb}</p>
            <button type="button" className="sw-card__go sw-card__go--quiet" onClick={() => walkTo(world.stations[nextUp].seat)}>
              <Footprints /> Walk to workstation {no(nextUp)}
            </button>
          </section>
        ) : (
          <section className="sw-card">
            <p className="sw-card__kicker">
              <Check /> Every lab cleared
            </p>
            <h3>The floor is yours</h3>
            <p className="sw-card__text">Sit at any workstation to run a lab again.</p>
          </section>
        )}

        <dl className="sw-keys">
          <div>
            <dt>
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <kbd>←</kbd>
              <kbd>→</kbd>
            </dt>
            <dd>Walk, or WASD</dd>
          </div>
          <div>
            <dt>
              <kbd>E</kbd>
            </dt>
            <dd>Sit down or talk</dd>
          </div>
          <div>
            <dt>Click</dt>
            <dd>Walk to a spot, a desk, or the map</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
