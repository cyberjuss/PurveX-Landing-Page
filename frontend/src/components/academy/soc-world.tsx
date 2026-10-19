"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Headset, Keyboard, MousePointerClick, X } from "lucide-react";
import type { LabMeta } from "@/lib/academy-labs";
import { WALL_H, WORLD_W, findPath, layout, step, type Pt } from "@/lib/soc-world";
import { accountInitials, useAcademyAccount } from "./academy-account";
import { slugify, useAcademyProgress } from "./academy-progress";
import { useCoach } from "./coach-context";
import "./soc-world.css";

const SEAT_KEY = "academy-soc-seat";
const SPEED = 260;
const PATH_SPEED = 430;
const REACH = 78;

type Near = { kind: "station"; i: number } | { kind: "coach" } | null;
type Pending = { kind: "sit"; i: number } | { kind: "coach" } | null;

/** Deterministic noise, so the skyline is the same on every visit. */
const rand = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/** Someone seen from above. Faces +x; the caller rotates. */
function TopDownPerson({ walking, typing, shirt, headset }: { walking?: boolean; typing?: boolean; shirt: string; headset?: boolean }) {
  return (
    <g className={`tdp${walking ? " is-walking" : ""}${typing ? " is-typing" : ""}`}>
      <ellipse cx="0" cy="3" rx="20" ry="22" className="tdp__shadow" />
      <circle cx="3" cy="-18" r="6.5" fill={shirt} className="tdp__arm tdp__arm--l" />
      <circle cx="3" cy="18" r="6.5" fill={shirt} className="tdp__arm tdp__arm--r" />
      <ellipse cx="-2" cy="0" rx="11" ry="19" fill={shirt} />
      <circle cx="2" cy="0" r="11" className="tdp__head" />
      <circle cx="-2" cy="0" r="10.4" className="tdp__hair" />
      {headset && (
        <>
          <path d="M-2 -12 A12 12 0 0 1 -2 12" className="tdp__headset" />
          <path d="M4 10 q8 0 9 -6" className="tdp__headset" />
        </>
      )}
    </g>
  );
}

// The PurveX Financial SOC as a room to walk around. Arrow keys or WASD walk,
// a click walks you there around the desks, and E (or Enter) sits you down at
// the workstation in front of you or talks to the Coach. Every lab is a desk;
// sitting at one switches its screens on and opens the lab.
export function SocWorld({ labs }: { labs: LabMeta[] }) {
  const router = useRouter();
  const initials = accountInitials(useAcademyAccount());
  const { isLabDone } = useAcademyProgress();
  const coach = useCoach();
  const world = useMemo(() => layout(labs.length), [labs.length]);
  const done = labs.map((l) => isLabDone(l.phaseSlug, l.entrySlug, slugify(l.title)));
  const nextUp = done.findIndex((d) => !d);

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
  // What the frame shows, published from the refs the loop moves.
  const cam = useRef<Pt>({ x: 0, y: 0 });
  const camSize = useRef({ w: 1100, h: 640 });
  const snapped = useRef(false);
  const [view, setView] = useState<{ me: Pt; deg: number; walking: boolean; near: Near; path: Pt[]; cam: Pt; cw: number; ch: number }>({
    me: world.spawn,
    deg: -90,
    walking: false,
    near: null,
    path: [],
    cam: { x: 0, y: 0 },
    cw: 1100,
    ch: 640,
  });
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
  const [seated, setSeated] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [talking, setTalking] = useState(false);
  const [focused, setFocused] = useState(false);
  const seatedRef = useRef<number | null>(null);
  const talkingRef = useRef(false);
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    seatedRef.current = seated;
  }, [seated]);
  useEffect(() => {
    talkingRef.current = talking;
  }, [talking]);

  // The camera shows a window of the room about 1100 units wide, shaped like the box.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const aspect = r.height / Math.max(1, r.width);
      let w = r.width < 700 ? 720 : Math.min(980, WORLD_W);
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
      setLeaving(true);
      publish();
      try {
        window.localStorage.setItem(SEAT_KEY, labs[i].slug);
      } catch {}
      leaveTimer.current = window.setTimeout(() => router.push(`/range/labs/${labs[i].slug}`), 1400);
    },
    [world, labs, router, publish]
  );

  const standUp = useCallback(() => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    setLeaving(false);
    if (seatedRef.current !== null) {
      const s = world.stations[seatedRef.current];
      pos.current = { x: s.seat.x, y: s.seat.y + 30 };
      dir.current = Math.PI / 2;
    }
    setSeated(null);
    publish();
  }, [world, publish]);

  const interact = () => {
    const n = near.current;
    if (!n || seatedRef.current !== null) return;
    if (n.kind === "coach") {
      dir.current = Math.atan2(world.coach.y - pos.current.y, world.coach.x - pos.current.x);
      setTalking(true);
    } else sit(n.i);
  };

  const walkTo = (target: Pt, then: Pending = null) => {
      if (seatedRef.current !== null) standUp();
      setTalking(false);
      const p = findPath(world, pos.current, target);
      path.current = p && p.length ? p : null;
      pending.current = then;
      stuck.current = 0;
  };

  // The loop: keys or the planned path move you, the room tells you what is in reach.
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
        const speed = keys.current.size ? SPEED : PATH_SPEED;
        const next = step(world, pos.current, (vx / len) * speed * dt, (vy / len) * speed * dt);
        if (next.x !== pos.current.x || next.y !== pos.current.y) {
          pos.current = next;
          dir.current = Math.atan2(vy, vx);
          stuck.current = 0;
          changed = true;
        } else if (path.current && ++stuck.current > 20) path.current = null;
      }
      const walking = changed;
      if (walking !== moving.current) {
        moving.current = walking;
        changed = true;
      }
      // Arrived somewhere with something to do there.
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
      // What is close enough to use.
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
      // The camera eases after you, and stops at the walls.
      const { w: cw, h: ch } = camSize.current;
      const tx = Math.max(0, Math.min(WORLD_W - cw, pos.current.x - cw / 2));
      const ty = Math.max(0, Math.min(world.height - ch, pos.current.y - ch * 0.55));
      // The first frame lands on you rather than gliding in from the corner.
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

  useEffect(() => () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
  }, []);

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

  // Where a click lands, in room units.
  const toWorld = (e: React.MouseEvent): Pt | null => {
    const m = svg.current?.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

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
      if (near.current?.kind === "coach") setTalking(true);
      else walkTo({ x: world.coach.x - 62, y: world.coach.y }, { kind: "coach" });
      return;
    }
    const p = toWorld(e);
    if (p && p.y > WALL_H) walkTo(p);
  };

  const n = view.near;
  const nearLab = n?.kind === "station" ? labs[n.i] : null;
  const pct = (p: Pt): CSSProperties => ({
    left: `${Math.max(24, Math.min(76, ((p.x - view.cam.x) / view.cw) * 100))}%`,
    top: `${Math.max(4, Math.min(80, ((p.y - view.cam.y) / view.ch) * 100))}%`,
  });
  const me = view.me;
  const deg = view.deg;
  const lit = (i: number) => seated === i || (n?.kind === "station" && n.i === i);
  const cleared = done.filter(Boolean).length;

  return (
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
          <linearGradient id="sw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1030" />
            <stop offset="1" stopColor="#2a1d4d" />
          </linearGradient>
          <radialGradient id="sw-pool">
            <stop offset="0" stopColor="#fff" stopOpacity="0.10" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sw-vignette" cx="0.5" cy="0.55" r="0.75">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>
          <pattern id="sw-carpet" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" className="sw__carpet" />
            <path d="M0 0 H80 M0 0 V80" className="sw__carpet-line" />
          </pattern>
        </defs>

        {/* Floor and the pools of light under the desks */}
        <rect x="0" y={WALL_H} width={WORLD_W} height={world.height - WALL_H} fill="url(#sw-carpet)" />
        {world.stations.map((s) => (
          <ellipse key={s.i} cx={s.desk.x + s.desk.w / 2} cy={s.desk.y + 60} rx="190" ry="120" fill="url(#sw-pool)" />
        ))}

        {/* The back wall: windows on the city, the sign, the video wall */}
        <rect x="0" y="0" width={WORLD_W} height={WALL_H} className="sw__wall" />
        {[
          [24, 200],
          [1236, 340],
        ].map(([wx, ww], wi) => (
          <g key={wi}>
            <rect x={wx} y="22" width={ww} height="112" fill="url(#sw-sky)" />
            {Array.from({ length: Math.floor(ww / 26) }, (_, b) => {
              const bh = 34 + rand(wi * 50 + b) * 66;
              const bx = wx + b * 26 + 2;
              return (
                <g key={b}>
                  <rect x={bx} y={134 - bh} width="22" height={bh} className="sw__building" />
                  {Array.from({ length: Math.floor(bh / 12) }, (_, r) =>
                    [0, 1].map((col) =>
                      rand(wi * 999 + b * 31 + r * 7 + col) > 0.55 ? (
                        <rect key={`${r}-${col}`} x={bx + 4 + col * 9} y={134 - bh + 6 + r * 12} width="4" height="5" className={`sw__lit${rand(b + r + col) > 0.85 ? " is-twinkle" : ""}`} />
                      ) : null
                    )
                  )}
                </g>
              );
            })}
            <rect x={wx} y="22" width={ww} height="112" className="sw__glass" />
          </g>
        ))}
        <g transform="translate(250 40)">
          <rect width="34" height="34" rx="4" className="sw__logo" />
          <text x="17" y="24" textAnchor="middle" className="sw__logo-p">
            P
          </text>
          <text x="46" y="16" className="sw__sign">
            PurveX Financial
          </text>
          <text x="46" y="32" className="sw__sign-sub">
            Security Operations Center
          </text>
        </g>
        <g transform="translate(520 24)" className="sw__videowall">
          <rect width="230" height="118" className="sw__vw" />
          <text x="10" y="16" className="sw__vw-label">
            THREAT MAP
          </text>
          <path d="M14 90 q40 -50 90 -20 t110 -10" className="sw__arc" />
          <path d="M20 100 q70 -70 190 -40" className="sw__arc sw__arc--2" />
          {[
            [30, 92],
            [96, 64],
            [150, 58],
            [206, 78],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" className="sw__ping" style={{ ["--i" as string]: i }} />
          ))}
          <clipPath id="sw-qclip">
            <rect x="0" y="22" width="230" height="92" />
          </clipPath>
          <g transform="translate(240 0)">
            <rect width="230" height="118" className="sw__vw" />
            <text x="10" y="16" className="sw__vw-label">
              ALERT QUEUE
            </text>
            <g clipPath="url(#sw-qclip)"><g className="sw__queue">
              {["4625 x40 alex.rivera", "New admin svc-backup-job", "SYN burst 10.0.1.23", "Hash mismatch vpn-client", "Sign-in 02:14 WM-WKS07", "4740 lockout riley.kwan", "4625 x40 alex.rivera", "New admin svc-backup-job"].map((t, i) => (
                <g key={i} transform={`translate(10 ${32 + i * 16})`}>
                  <rect width="6" height="6" y="-6" className={`sw__sev is-${["p1", "p2", "p3"][i % 3]}`} />
                  <text x="12" className="sw__qtext">
                    {t}
                  </text>
                </g>
              ))}
            </g></g>
          </g>
          <g transform="translate(480 0)">
            <rect width="180" height="118" className="sw__vw" />
            <text x="10" y="16" className="sw__vw-label">
              LABS CLEARED
            </text>
            <text x="12" y="80" className="sw__big">
              {cleared}
              <tspan className="sw__big-of">/{labs.length}</tspan>
            </text>
          </g>
        </g>

        {/* The right of the room: rack, plants, coffee */}
        <g>
          <rect {...world.rack} width={world.rack.w} height={world.rack.h} className="sw__rack" />
          {Array.from({ length: Math.floor(world.rack.h / 16) }, (_, i) => (
            <circle key={i} cx={world.rack.x + 10 + (i % 2) * 12} cy={world.rack.y + 10 + i * 16} r="2.4" className="sw__led" style={{ ["--i" as string]: i % 7 }} />
          ))}
        </g>
        {world.plants.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <circle r="18" className="sw__pot" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} rx="16" ry="6" transform={`rotate(${a + i * 17}) translate(9 0)`} className="sw__leaf" />
            ))}
          </g>
        ))}
        <g>
          <rect {...world.coffee} width={world.coffee.w} height={world.coffee.h} rx="4" className="sw__counter" />
          <rect x={world.coffee.x + 14} y={world.coffee.y + 6} width="34" height="30" rx="3" className="sw__machine" />
          <circle cx={world.coffee.x + 100} cy={world.coffee.y + 22} r="9" className="sw__mug" />
          <path d={`M${world.coffee.x + 26} ${world.coffee.y + 2} q4 -10 0 -18 M${world.coffee.x + 36} ${world.coffee.y + 2} q4 -10 0 -18`} className="sw__steam" />
          <text x={world.coffee.x + 75} y={world.coffee.y + 66} textAnchor="middle" className="sw__floorlabel">
            Coffee
          </text>
        </g>
        {/* Entrance */}
        <rect {...world.door} width={world.door.w} height={world.door.h} className="sw__door" />
        <text x={world.door.x + world.door.w / 2} y={world.height - 22} textAnchor="middle" className="sw__floorlabel">
          Entrance
        </text>

        {/* Workstations, one per lab */}
        {world.stations.map((s, i) => {
          const l = labs[i];
          const on = lit(i);
          return (
            <g key={l.slug} data-station={i} className={`sw-st${on ? " is-on" : ""}${done[i] ? " is-done" : ""}${i === nextUp ? " is-next" : ""}`} style={{ ["--acc" as string]: l.accent } as CSSProperties}>
              <rect x={s.desk.x - 14} y={s.desk.y - 14} width={s.desk.w + 28} height="180" className="sw-st__hit" />
              {on && <rect x={s.desk.x - 10} y={s.desk.y - 10} width={s.desk.w + 20} height="170" className="sw-st__ring" />}
              <polygon points={`${s.desk.x + 30},${s.desk.y + 18} ${s.desk.x + 200},${s.desk.y + 18} ${s.desk.x + 230},${s.desk.y + 130} ${s.desk.x},${s.desk.y + 130}`} className="sw-st__glow" />
              <rect x={s.desk.x} y={s.desk.y} width={s.desk.w} height={s.desk.h} rx="5" className="sw-st__desk" />
              {[40, 126].map((mx) => (
                <g key={mx}>
                  <rect x={s.desk.x + mx} y={s.desk.y + 6} width="64" height="12" rx="2" className="sw-st__mon" />
                  <rect x={s.desk.x + mx + 3} y={s.desk.y + 14} width="58" height="3" className="sw-st__screen" />
                </g>
              ))}
              <rect x={s.desk.x + 86} y={s.desk.y + 34} width="58" height="14" rx="2" className="sw-st__keys" />
              <rect x={s.desk.x + 154} y={s.desk.y + 36} width="10" height="14" rx="5" className="sw-st__keys" />
              <circle cx={s.desk.x + 30} cy={s.desk.y + 40} r="8" className="sw-st__mug" />
              {seated !== i && (
                <g transform={`translate(${s.seat.x} ${s.seat.y})`}>
                  <circle r="19" className="sw-st__chair" />
                  <path d="M-16 12 a19 19 0 0 0 32 0" className="sw-st__chairback" />
                </g>
              )}
              <g transform={`translate(${s.label.x} ${s.label.y})`}>
                <circle cx={-(Math.min(l.title.length, 30) * 3.9) - 12} cy="-5" r="5" className="sw-st__lamp" />
                <text textAnchor="middle" className="sw-st__title">
                  {l.title.length > 30 ? `${l.title.slice(0, 29)}…` : l.title}
                </text>
                <text y="18" textAnchor="middle" className="sw-st__meta">
                  {l.skill} · {l.minutes} min{done[i] ? " · done" : ""}
                </text>
              </g>
              {i === nextUp && (
                <g transform={`translate(${s.desk.x + s.desk.w - 20} ${s.desk.y - 6})`} className="sw-st__beacon">
                  <rect x="-44" y="-12" width="66" height="20" rx="2" />
                  <text x="-11" y="2" textAnchor="middle">
                    NEXT UP
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* The Coach's desk and the Coach */}
        <g data-coach className={`sw-coach${n?.kind === "coach" || talking ? " is-near" : ""}`}>
          <rect x={world.coachDesk.x - 20} y={world.coachDesk.y - 20} width={world.coachDesk.w + 40} height="200" className="sw-st__hit" />
          <rect {...world.coachDesk} width={world.coachDesk.w} height={world.coachDesk.h} rx="5" className="sw-st__desk" />
          <rect x={world.coachDesk.x + 50} y={world.coachDesk.y + 6} width="100" height="12" rx="2" className="sw-st__mon" />
          <rect x={world.coachDesk.x + 53} y={world.coachDesk.y + 14} width="94" height="3" className="sw-coach__screen" />
          <text x={world.coachDesk.x + 100} y={world.coachDesk.y + 46} textAnchor="middle" className="sw__floorlabel">
            Tier 2 · Coach
          </text>
          <g transform={`translate(${world.coach.x} ${world.coach.y}) rotate(-90)`} className="sw-coach__body">
            <TopDownPerson shirt="#8b7dff" headset />
          </g>
          <g transform={`translate(${world.coach.x + 88} ${world.coach.y - 22})`} className="sw-coach__bubble">
            <rect x="-62" y="-18" width="124" height="26" rx="13" />
            <text y="0" textAnchor="middle">
              {talking ? "Go ahead" : "Stuck? Come talk."}
            </text>
          </g>
        </g>

        {/* A colleague on the night shift */}
        <g>
          <rect {...world.colleagueDesk} width={world.colleagueDesk.w} height={world.colleagueDesk.h} rx="5" className="sw-st__desk" />
          {[40, 106].map((mx) => (
            <rect key={mx} x={world.colleagueDesk.x + mx} y={world.colleagueDesk.y + 6} width="56" height="12" rx="2" className="sw-st__mon is-on" />
          ))}
          <g transform={`translate(${world.colleague.x} ${world.colleague.y}) rotate(-90)`}>
            <TopDownPerson shirt="#2fbf71" typing />
          </g>
          <text x={world.colleague.x} y={world.colleague.y + 46} textAnchor="middle" className="sw__floorlabel">
            Tier 1 · night shift
          </text>
        </g>

        {/* Where you are heading */}
        {view.path.map((p, i) => (i % 2 ? null : <circle key={i} cx={p.x} cy={p.y} r="3" className="sw__trail" />))}

        {/* You */}
        <g transform={`translate(${me.x} ${me.y})`} className="sw-me">
          <g transform={`rotate(${deg})`}>
            <TopDownPerson walking={view.walking} typing={seated !== null} shirt="var(--rd-accent)" />
          </g>
          <g transform="translate(0 -40)" className="sw-me__tag">
            <rect x="-26" y="-11" width="52" height="18" rx="9" />
            <text y="2" textAnchor="middle">
              You · {initials}
            </text>
          </g>
        </g>

        <rect x="0" y="0" width={WORLD_W} height={world.height} fill="url(#sw-vignette)" pointerEvents="none" />
      </svg>

      {/* What you can do from here */}
      {nearLab && seated === null && (
        <div className="sw-prompt" style={pct({ x: world.stations[(n as { i: number }).i].seat.x, y: world.stations[(n as { i: number }).i].seat.y + 40 })}>
          <span className="sw-prompt__key">E</span>
          <span>
            <b>Sit down: {nearLab.title}</b>
            <small>{nearLab.blurb}</small>
          </span>
        </div>
      )}
      {n?.kind === "coach" && !talking && (
        <div className="sw-prompt" style={pct({ x: world.coach.x - 40, y: world.coach.y + 46 })}>
          <span className="sw-prompt__key">E</span>
          <span>
            <b>Talk to the Coach</b>
          </span>
        </div>
      )}
      {seated !== null && leaving && (
        <div className="sw-login" style={pct({ x: world.stations[seated].desk.x + 115, y: world.stations[seated].desk.y - 26 })}>
          Signing in to {labs[seated].title}…
        </div>
      )}

      {talking && (
        <div className="sw-talk" role="dialog" aria-label="The Coach" onClick={(e) => e.stopPropagation()}>
          <span className="sw-talk__face" aria-hidden>
            <Headset />
          </span>
          <div className="sw-talk__body">
            <b>Coach</b>
            <p>Evening. Pick a desk and I will tell you what it is training you for, or ask me where to start.</p>
            <div className="sw-talk__asks">
              <button
                type="button"
                onClick={() => {
                  coach.ask(`I'm on the SOC floor. ${cleared} of ${labs.length} labs are done. Which lab should I work next, and what will it train me for?`);
                  setTalking(false);
                }}
              >
                Which lab should I do next?
              </button>
              {nextUp >= 0 && (
                <button
                  type="button"
                  onClick={() => {
                    coach.ask(`Before I sit down at "${labs[nextUp].title}": what does it teach, and what should I watch for?`);
                    setTalking(false);
                  }}
                >
                  Brief me on {labs[nextUp].title}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  coach.setModalOpen(true);
                  setTalking(false);
                }}
              >
                Open the chat
              </button>
            </div>
          </div>
          <button type="button" className="sw-talk__x" aria-label="Walk away" onClick={() => setTalking(false)}>
            <X />
          </button>
        </div>
      )}

      <svg
        className="sw-map"
        viewBox={`0 0 ${WORLD_W} ${world.height}`}
        aria-hidden
        onClick={(e) => {
          e.stopPropagation();
          box.current?.focus({ preventScroll: true });
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          walkTo({ x: ((e.clientX - r.left) / r.width) * WORLD_W, y: ((e.clientY - r.top) / r.height) * world.height });
        }}
      >
        <rect width={WORLD_W} height={world.height} className="sw-map__floor" />
        <rect width={WORLD_W} height={WALL_H} className="sw-map__wall" />
        {world.stations.map((st, i) => (
          <rect key={i} {...st.desk} width={st.desk.w} height={st.desk.h} className={`sw-map__desk${done[i] ? " is-done" : ""}${i === nextUp ? " is-next" : ""}`} />
        ))}
        <rect {...world.coachDesk} width={world.coachDesk.w} height={world.coachDesk.h} className="sw-map__coach" />
        <rect x={view.cam.x} y={view.cam.y} width={view.cw} height={view.ch} className="sw-map__cam" />
        <circle cx={view.me.x} cy={view.me.y} r="34" className="sw-map__me" />
      </svg>
      <div className="sw-hud" aria-hidden>
        <span>
          <Keyboard /> Arrows or WASD to walk
        </span>
        <span>
          <b>E</b> sit or talk
        </span>
        <span>
          <MousePointerClick /> click to walk there
        </span>
      </div>
      {!focused && <div className="sw-wake">Click the floor to take control</div>}
    </div>
  );
}
