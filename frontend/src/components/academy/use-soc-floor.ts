"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LabMeta } from "@/lib/academy-labs";
import { WORLD_W, findPath, layout, step, type Pt } from "@/lib/soc-world";
import { slugify, useAcademyProgress } from "./academy-progress";

const SEAT_KEY = "academy-soc-seat";
const SPEED = 260;
const PATH_SPEED = 430;
const REACH = 78;

export type SocLab = LabMeta & { week?: string };
export type Near = { kind: "station"; i: number } | { kind: "coach" } | null;
type Pending = { kind: "sit"; i: number } | { kind: "coach" } | null;
export type FloorView = { me: Pt; deg: number; walking: boolean; near: Near; path: Pt[]; cam: Pt; cw: number; ch: number };

/**
 * Everything about the SOC floor except how it is drawn: the room, where you
 * are, what is in reach, walking by keys or by a planned path, sitting down,
 * and talking to the Coach. The 2D plan and the 3D office both run on this,
 * so they behave the same and only the picture differs.
 *
 * `cam` is the 2D plan's camera, a window of the room that eases after you.
 * The 3D office ignores it and follows `pos` with its own.
 */
export function useSocFloor(labs: SocLab[]) {
  const router = useRouter();
  const { isLabDone } = useAcademyProgress();
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

  const pos = useRef<Pt>(world.spawn);
  const dir = useRef(-Math.PI / 2);
  /** Which way the camera faces, in radians. The 3D office turns it; keys walk relative to it, so up is always away from the camera. */
  const yaw = useRef(0);
  const keys = useRef(new Set<string>());
  const path = useRef<Pt[] | null>(null);
  const pending = useRef<Pending>(null);
  const stuck = useRef(0);
  const moving = useRef(false);
  const near = useRef<Near>(null);
  const cam = useRef<Pt>({ x: 0, y: 0 });
  const camSize = useRef({ w: 1000, h: 600 });
  const snapped = useRef(false);
  const [view, setView] = useState<FloorView>({ me: world.spawn, deg: -90, walking: false, near: null, path: [], cam: { x: 0, y: 0 }, cw: 1000, ch: 600 });
  const [seated, setSeated] = useState<number | null>(null);
  const [talking, setTalking] = useState(false);
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

  /** The 2D plan tells the floor how big its window is. */
  const setCamSize = useCallback(
    (w: number, h: number) => {
      camSize.current = { w, h };
      publish();
    },
    [publish]
  );

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

  const faceCoach = useCallback(() => {
    dir.current = Math.atan2(world.coach.y - pos.current.y, world.coach.x - pos.current.x);
    setTalking(true);
    publish();
  }, [world, publish]);

  const interact = useCallback(() => {
    const n = near.current;
    if (!n || seatedRef.current !== null) return;
    if (n.kind === "coach") faceCoach();
    else sit(n.i);
  }, [faceCoach, sit]);

  const walkTo = useCallback(
    (target: Pt, then: Pending = null) => {
      if (seatedRef.current !== null) standUp();
      setTalking(false);
      const p = findPath(world, pos.current, target);
      path.current = p && p.length ? p : null;
      pending.current = then;
      stuck.current = 0;
    },
    [world, standUp]
  );

  /** A click on a desk: sit if you are at it, otherwise walk there and sit. */
  const goToStation = useCallback(
    (i: number) => {
      if (near.current?.kind === "station" && near.current.i === i) sit(i);
      else walkTo(world.stations[i].seat, { kind: "sit", i });
    },
    [sit, walkTo, world]
  );

  /** A click on the Coach: talk if close, otherwise walk over first. */
  const goToCoach = useCallback(() => {
    if (near.current?.kind === "coach") faceCoach();
    else walkTo({ x: world.coach.x - 62, y: world.coach.y }, { kind: "coach" });
  }, [faceCoach, walkTo, world]);

  // The loop: keys or the planned path move you, and the room works out what is in reach.
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
      if ((vx || vy) && yaw.current) {
        const c = Math.cos(-yaw.current);
        const sn = Math.sin(-yaw.current);
        [vx, vy] = [vx * c - vy * sn, vx * sn + vy * c];
      }
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

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    },
    [standUp, interact]
  );
  const onKeyUp = useCallback((e: React.KeyboardEvent) => keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key), []);
  const releaseKeys = useCallback(() => keys.current.clear(), []);
  /** Turns the 3D camera, and with it which way the keys walk. */
  const turn = useCallback((by: number) => {
    yaw.current += by;
  }, []);

  return {
    labs,
    world,
    done,
    nextUp,
    cleared,
    view,
    seated,
    talking,
    pos,
    dir,
    moving,
    yaw,
    sit,
    faceCoach,
    walkTo,
    goToStation,
    goToCoach,
    onKeyDown,
    onKeyUp,
    releaseKeys,
    turn,
    setCamSize,
  };
}

export type SocFloor = ReturnType<typeof useSocFloor>;
