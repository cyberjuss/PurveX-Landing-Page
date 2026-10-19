"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { WALL_H, WORLD_W, blocked, type Person as SocPerson, type Pt } from "@/lib/soc-world";
import { DEFAULT_AVATAR, loadAvatar, lookOf, saveAvatar, type Avatar } from "./soc-avatar";
import { SocDress } from "./soc-dress";
import { SocHud, stationNo } from "./soc-hud";
import { SoftJazz } from "./soc-jazz";
import { SocLoading } from "./soc-loading";
import { Figure } from "./soc-figure";
import { coworker, type Coworker as CoworkerInfo, type Look } from "./soc-people";
import { SocTalk } from "./soc-talk";
import type { SocFloor } from "./use-soc-floor";
import "./soc-world.css";

// The SOC floor in 3D, seen from over your shoulder. The room comes from
// useSocFloor in plan units (1600 wide); here 100 units are a metre, x stays x
// and the plan's y becomes z. Every screen, the video wall and the skyline are
// drawn onto canvases, because the usual 3D text and texture loaders fetch
// files and spawn workers the site's security policy does not allow.

const M = 0.01;
const CEIL = 3.3;
const BRAND = "#6a5cff";
const v = (p: Pt, y = 0) => new THREE.Vector3(p.x * M, y, p.y * M);

type Palette = {
  floor: string; floorRough: number; zone: string; wall: string; ceil: string; desk: string; frame: string; chair: string; mon: string;
  text: string; text2: string; fog: string; hemi: number; sun: number; env: number;
  sky: Phase; lamp: string; sunColor: string; hemiSky: string; hemiGround: string; strip: string; windowTint: string; ceilGlow: number; former: number; formerColor: string; exposure: number; plant: string;
};
type Phase = "day" | "dusk" | "night";
const DAY: Palette = {
  floor: "#c9ccd1", floorRough: 0.38, zone: "#b9bdc5", wall: "#e4e4e1", ceil: "#efefec", desk: "#f2f2ef", frame: "#2a2d33", chair: "#2b2e35", mon: "#111318",
  text: "#1b1e24", text2: "#5d6370", fog: "#dcdedf", hemi: 0.7, sun: 1.2, env: 0.55,
  sky: "day", lamp: "#fff8ee", sunColor: "#ffffff", hemiSky: "#ffffff", hemiGround: "#c7c9cc", strip: "#ffffff", windowTint: "#ffffff", ceilGlow: 0.75, former: 2.4, formerColor: "#dfe8f5", exposure: 0.95, plant: "#3d6b4b",
};
const DUSK: Palette = {
  floor: "#8b8790", floorRough: 0.32, zone: "#7e7a84", wall: "#c0b8ae", ceil: "#c4bab0", desk: "#ece7e0", frame: "#1f2024", chair: "#2b2d34", mon: "#0e1014",
  text: "#1f2026", text2: "#4d4f58", fog: "#b3a097", hemi: 0.75, sun: 0.6, env: 0.6,
  sky: "dusk", lamp: "#ffd2a1", sunColor: "#ffae73", hemiSky: "#ffd9b8", hemiGround: "#4a3c45", strip: "#ffe2c0", windowTint: "#ffffff", ceilGlow: 0.55, former: 1.8, formerColor: "#f2a36b", exposure: 1.0, plant: "#35603f",
};
const NIGHT: Palette = {
  floor: "#1a1e28", floorRough: 0.28, zone: "#20252f", wall: "#252a36", ceil: "#171a22", desk: "#2b313e", frame: "#0c0d12", chair: "#2c3240", mon: "#05060a",
  text: "#e8eaf2", text2: "#9aa1b8", fog: "#141720", hemi: 1.1, sun: 0.7, env: 0.8,
  sky: "night", lamp: "#d6dcff", sunColor: "#aab4ff", hemiSky: "#9aa3ff", hemiGround: "#07080c", strip: "#9da6d6", windowTint: "#9097ad", ceilGlow: 0.5, former: 1.4, formerColor: "#3b3f8f", exposure: 1.25, plant: "#1f4a33",
};
const PALETTES: Record<Phase, Palette> = { day: DAY, dusk: DUSK, night: NIGHT };

/** The light outside the student's own window: day, dusk (and dawn), or night. */
const phaseAt = (d: Date): Phase => {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 20 || h < 5) return "night";
  if (h >= 17 || h < 7) return "dusk";
  return "day";
};
function usePhase(): Phase {
  const [phase, setPhase] = useState<Phase>(() => phaseAt(new Date()));
  useEffect(() => {
    const t = window.setInterval(() => setPhase(phaseAt(new Date())), 5 * 60_000);
    return () => window.clearInterval(t);
  }, []);
  return phase;
}

/** A small seeded random, so every screen draws the same way each time. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const fontOf = (mono: boolean) =>
  getComputedStyle(document.body).getPropertyValue(mono ? "--font-mono" : "--font-display").trim() || (mono ? "monospace" : "sans-serif");

const SEV = ["#f87171", "#fbbf24", "#60a5fa", "#34d399"];

/** One analyst screen: a SIEM view with a timeline in the lab's colour and a log table. */
const screens = new Map<string, THREE.CanvasTexture>();
function screenTex(accent: string, seed: number) {
  const key = `${accent}|${seed}`;
  const hit = screens.get(key);
  if (hit) return hit;
  const r = rng(seed * 7919 + 13);
  const mono = fontOf(true);
  const t = canvasTex(512, 296, (g) => {
    g.fillStyle = "#070a11";
    g.fillRect(0, 0, 512, 296);
    g.fillStyle = "#0d121d";
    g.fillRect(0, 0, 512, 24);
    g.fillStyle = accent;
    g.fillRect(10, 9, 6, 6);
    g.fillStyle = "#5b6378";
    g.font = `600 10px ${mono}`;
    g.fillText(seed % 2 ? "SIEM / SEARCH" : "EDR / TIMELINE", 24, 16);
    g.fillText("LIVE", 470, 16);
    // Timeline
    const top = 38;
    const ch = 92;
    g.strokeStyle = "#151b28";
    g.lineWidth = 1;
    for (let k = 0; k < 4; k++) {
      g.beginPath();
      g.moveTo(12, top + (k * ch) / 3);
      g.lineTo(500, top + (k * ch) / 3);
      g.stroke();
    }
    const pts: [number, number][] = [];
    let y = 0.5;
    for (let x = 0; x <= 48; x++) {
      y = Math.max(0.08, Math.min(0.95, y + (r() - 0.5) * 0.3 + (x === 33 ? 0.4 : 0)));
      pts.push([12 + x * 10.2, top + ch - y * ch]);
    }
    const grad = g.createLinearGradient(0, top, 0, top + ch);
    grad.addColorStop(0, `${accent}66`);
    grad.addColorStop(1, `${accent}00`);
    g.beginPath();
    g.moveTo(pts[0][0], top + ch);
    pts.forEach(([px, py]) => g.lineTo(px, py));
    g.lineTo(pts[pts.length - 1][0], top + ch);
    g.fillStyle = grad;
    g.fill();
    g.beginPath();
    pts.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.strokeStyle = accent;
    g.lineWidth = 2;
    g.stroke();
    // Log rows
    g.font = `500 10px ${mono}`;
    const rows = ["4625 logon failure", "4720 user created", "4688 process start", "5156 conn allowed", "4672 admin logon", "4104 script block", "4768 TGT request"];
    for (let k = 0; k < 9; k++) {
      const ry = 150 + k * 15;
      if (k % 2) {
        g.fillStyle = "#0b101a";
        g.fillRect(8, ry - 10, 496, 15);
      }
      g.fillStyle = SEV[Math.floor(r() * 4)];
      g.fillRect(14, ry - 6, 5, 5);
      g.fillStyle = "#6c7590";
      g.fillText(`10:${String(10 + k * 3).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`, 26, ry);
      g.fillStyle = "#c3c9da";
      g.fillText(rows[Math.floor(r() * rows.length)], 96, ry);
      g.fillStyle = "#59617a";
      g.fillText(`10.0.${Math.floor(r() * 4)}.${Math.floor(r() * 250)}`, 300, ry);
      g.fillStyle = "#1a2132";
      g.fillRect(400, ry - 8, 30 + r() * 70, 10);
    }
  });
  screens.set(key, t);
  return t;
}

/** The video wall: a threat map, the alert queue and how many labs are cleared. */
function wallTex(cleared: number, total: number) {
  const mono = fontOf(true);
  const display = fontOf(false);
  return canvasTex(2400, 520, (g) => {
    g.fillStyle = "#04060b";
    g.fillRect(0, 0, 2400, 520);
    const panel = (x: number, w: number, title: string) => {
      g.fillStyle = "#080c15";
      g.fillRect(x, 12, w, 496);
      g.strokeStyle = "#141b2b";
      g.lineWidth = 2;
      g.strokeRect(x + 1, 13, w - 2, 494);
      g.fillStyle = "#7d86a6";
      g.font = `700 22px ${mono}`;
      g.fillText(title, x + 28, 56);
    };
    // Threat map: a dotted world and live arcs.
    panel(12, 1100, "GLOBAL THREAT MAP");
    const land: [number, number, number][] = [
      [0.2, 0.36, 0.13], [0.27, 0.68, 0.09], [0.48, 0.32, 0.08], [0.52, 0.6, 0.1], [0.7, 0.34, 0.16], [0.82, 0.72, 0.07],
    ];
    const isLand = (u: number, w: number) => land.some(([cx, cy, rr]) => (u - cx) ** 2 / (rr * 1.6) ** 2 + (w - cy) ** 2 / rr ** 2 < 1);
    g.fillStyle = "#26304a";
    for (let x = 0; x < 100; x++)
      for (let y = 0; y < 40; y++) {
        const u = x / 100;
        const w = y / 40;
        if (isLand(u, w)) g.fillRect(40 + u * 1040, 80 + w * 410, 4, 4);
      }
    const hub: [number, number] = [40 + 0.24 * 1040, 80 + 0.36 * 410];
    [
      [0.7, 0.3, "#f87171"], [0.52, 0.58, "#fbbf24"], [0.8, 0.7, "#f87171"], [0.48, 0.3, "#60a5fa"], [0.66, 0.42, "#f87171"],
    ].forEach(([u, w, c]) => {
      const p: [number, number] = [40 + (u as number) * 1040, 80 + (w as number) * 410];
      g.strokeStyle = c as string;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(p[0], p[1]);
      g.quadraticCurveTo((p[0] + hub[0]) / 2, Math.min(p[1], hub[1]) - 120, hub[0], hub[1]);
      g.stroke();
      g.fillStyle = c as string;
      g.beginPath();
      g.arc(p[0], p[1], 7, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = BRAND;
    g.beginPath();
    g.arc(hub[0], hub[1], 10, 0, Math.PI * 2);
    g.fill();
    // Alert queue
    panel(1124, 820, "ALERT QUEUE");
    const alerts = [
      ["P1", "4625 x40  brute force  alex.rivera", 0],
      ["P1", "New domain admin  svc-backup-job", 0],
      ["P2", "SYN burst from 10.0.1.23", 1],
      ["P2", "Hash mismatch  vpn-client.msi", 1],
      ["P3", "Impossible travel  j.chen", 2],
      ["P3", "Disabled AV  WS-FIN-07", 2],
    ] as const;
    alerts.forEach(([p, text, s], k) => {
      const y = 108 + k * 64;
      g.fillStyle = k % 2 ? "#0a0f1a" : "#0c1220";
      g.fillRect(1144, y - 34, 780, 54);
      g.fillStyle = SEV[s];
      g.fillRect(1144, y - 34, 6, 54);
      g.font = `800 22px ${mono}`;
      g.fillText(p, 1166, y);
      g.fillStyle = "#c9cfe0";
      g.font = `500 22px ${mono}`;
      g.fillText(text, 1220, y);
    });
    // Labs cleared
    panel(1956, 432, "LABS CLEARED");
    g.fillStyle = "#ffffff";
    g.font = `800 150px ${display}`;
    g.fillText(String(cleared), 1990, 290);
    const cw = g.measureText(String(cleared)).width;
    g.fillStyle = "#59617a";
    g.font = `700 54px ${display}`;
    g.fillText(`/ ${total}`, 2004 + cw, 290);
    g.fillStyle = "#151b2b";
    g.fillRect(1990, 360, 360, 10);
    g.fillStyle = "#34d399";
    g.fillRect(1990, 360, total ? (360 * cleared) / total : 0, 10);
  });
}

/** A city through the windows: clear by day, a sunset at dusk, lit up at night. */
const SKY: Record<Phase, { stops: string[]; far: string; near: string; lit: number; win: string[] }> = {
  day: { stops: ["#9fb6d1", "#e3e9ef"], far: "#8d9bb0", near: "#6f7f96", lit: 0.12, win: ["#c9d4e3"] },
  dusk: { stops: ["#2c2a5c", "#b0607a", "#f6a66a"], far: "#3a2f52", near: "#2b2440", lit: 0.2, win: ["#ffcf8a", "#ffb870"] },
  night: { stops: ["#070a18", "#1b1636"], far: "#0f1222", near: "#0a0c16", lit: 0.32, win: ["#f5d38a", "#f5d38a", "#f5d38a", "#9cc3ff"] },
};
function skylineTex(phase: Phase) {
  const s = SKY[phase];
  return canvasTex(1024, 512, (g) => {
    const sky = g.createLinearGradient(0, 0, 0, 512);
    s.stops.forEach((c, k) => sky.addColorStop(k / (s.stops.length - 1), c));
    g.fillStyle = sky;
    g.fillRect(0, 0, 1024, 512);
    if (phase === "dusk") {
      const sun = g.createRadialGradient(700, 430, 10, 700, 430, 220);
      sun.addColorStop(0, "rgba(255, 214, 150, 0.9)");
      sun.addColorStop(1, "rgba(255, 170, 110, 0)");
      g.fillStyle = sun;
      g.fillRect(0, 0, 1024, 512);
    }
    const r = rng(phase === "night" ? 7 : phase === "dusk" ? 5 : 9);
    for (let layer = 0; layer < 2; layer++) {
      let x = -20;
      while (x < 1024) {
        const w = 40 + r() * 70;
        const h = (layer ? 140 : 220) + r() * (layer ? 160 : 200);
        g.fillStyle = layer ? s.near : s.far;
        g.fillRect(x, 512 - h, w, h);
        if (phase !== "day" || layer) {
          for (let wy = 512 - h + 10; wy < 500; wy += 14)
            for (let wx = x + 6; wx < x + w - 8; wx += 11)
              if (r() < s.lit) {
                g.fillStyle = s.win[Math.floor(r() * s.win.length)];
                g.fillRect(wx, wy, 5, 7);
              }
        }
        x += w + 4;
      }
    }
  });
}

/** Acoustic slats for the back wall. */
function slatTex(dark: boolean) {
  const t = canvasTex(256, 64, (g) => {
    g.fillStyle = dark ? "#151821" : "#d9d6cf";
    g.fillRect(0, 0, 256, 64);
    for (let x = 0; x < 256; x += 16) {
      g.fillStyle = dark ? "#1d212c" : "#c4b9a6";
      g.fillRect(x, 0, 11, 64);
    }
  });
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** A label drawn on a canvas, as a texture. */
function useLabel(text: string, opts: { size?: number; weight?: number; color: string; mono?: boolean; spacing?: number }) {
  const { size = 64, weight = 700, color, mono = false, spacing = 0 } = opts;
  return useMemo(() => {
    const c = document.createElement("canvas");
    const fam = fontOf(mono);
    const style = (g: CanvasRenderingContext2D) => {
      g.font = `${weight} ${size}px ${fam}`;
      if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
    };
    const probe = c.getContext("2d")!;
    style(probe);
    c.width = Math.ceil(probe.measureText(text).width + spacing + 8);
    c.height = Math.round(size * 1.5);
    const g = c.getContext("2d")!;
    style(g);
    g.fillStyle = color;
    g.textBaseline = "middle";
    g.fillText(text, 4, c.height / 2);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { tex: t, aspect: c.width / c.height };
  }, [text, size, weight, color, mono, spacing]);
}

/** Text lying on the floor (or flat on a wall when `wall`), left-aligned at `at`. */
function Label({ text, at, h, color, mono, weight, wall, center, spacing, onTop }: { text: string; at: THREE.Vector3; h: number; color: string; mono?: boolean; weight?: number; wall?: boolean; center?: boolean; spacing?: number; onTop?: boolean }) {
  const { tex, aspect } = useLabel(text, { color, mono, weight, spacing });
  const w = h * aspect;
  return (
    <mesh position={[at.x + (center ? 0 : w / 2), at.y, at.z]} rotation={wall ? [0, 0, 0] : [-Math.PI / 2, 0, 0]} renderOrder={onTop ? 4 : 2}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} depthTest={!onTop} toneMapped={false} />
    </mesh>
  );
}

const COACH: Look = { skin: "#8d6248", hair: "#121014", shirt: "#d9dce4", jacket: "#2a2550", trousers: "#1c1f27", build: "masc", hairStyle: "short" };

/** You: follows the floor's position and heading every frame, and places the prompt over your head. */
function You({ floor, placeTag, look, face }: { floor: SocFloor; placeTag: (x: number, y: number) => void; look: Look; face: number | null }) {
  const g = useRef<THREE.Group>(null);
  const seated = floor.seated !== null;
  const head = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    if (!g.current) return;
    head.copy(g.current.position).add(new THREE.Vector3(0, 2.15, 0)).project(camera);
    placeTag(((head.x + 1) / 2) * size.width, ((1 - head.y) / 2) * size.height);
    const p = floor.pos.current;
    g.current.position.lerp(new THREE.Vector3(p.x * M, 0, p.y * M), 0.5);
    const d = face ?? floor.dir.current;
    const want = Math.atan2(Math.cos(d), Math.sin(d));
    let diff = want - g.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    g.current.rotation.y += diff * 0.2;
  });
  return (
    <group ref={g}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[0.34, 40]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <Figure look={look} walking={floor.moving} seated={seated} typing={seated} />
    </group>
  );
}

/**
 * A coworker. They face their own way until you come close or start talking,
 * then turn to you, and a name card shows over their head while you are near.
 */
function Coworker({ floor, spot, info, pal, talking, near }: { floor: SocFloor; spot: SocPerson; info: CoworkerInfo; pal: Palette; talking: boolean; near: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!g.current) return;
    const p = floor.pos.current;
    const close = Math.hypot(p.x - spot.at.x, p.y - spot.at.y) < 230;
    const want = talking || close ? Math.atan2(p.x - spot.at.x, p.y - spot.at.y) : spot.face;
    let diff = want - g.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    g.current.rotation.y += diff * 0.08;
  });
  const showCard = near || talking || Math.hypot(floor.view.me.x - spot.at.x, floor.view.me.y - spot.at.y) < 620;
  const cardW = Math.max(info.name.length * 0.074, info.role.length * 0.052) + 0.34;
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        floor.goToPerson(spot.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <group ref={g} position={v(spot.at)} rotation={[0, spot.face, 0]}>
        {!spot.seated && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <circleGeometry args={[0.32, 40]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        )}
        {spot.seated && (
          <group rotation={[0, Math.PI, 0]}>
            <Chair x={0} z={-0.04} pal={pal} />
          </group>
        )}
        <Figure look={info.look} seated={spot.seated} typing={spot.seated && !talking} />
      </group>
      {showCard && (
        <Billboard position={[spot.at.x * M, spot.seated ? 1.72 : 2.12, spot.at.y * M]}>
          <mesh renderOrder={3}>
            <planeGeometry args={[cardW, 0.27]} />
            <meshBasicMaterial color="#0b0d14" transparent opacity={near || talking ? 0.94 : 0.78} toneMapped={false} depthTest={false} />
          </mesh>
          <mesh position={[-cardW / 2 + 0.012, 0, 0.001]} renderOrder={3}>
            <planeGeometry args={[0.024, 0.27]} />
            <meshBasicMaterial color={near || talking ? "#8b7dff" : "#3a3f50"} toneMapped={false} depthTest={false} />
          </mesh>
          <Label text={info.name} at={new THREE.Vector3(0.01, 0.05, 0.002)} h={0.11} color="#ffffff" wall center weight={650} onTop />
          <Label text={info.role.toUpperCase()} at={new THREE.Vector3(0.01, -0.065, 0.002)} h={0.07} color="#9aa1b8" wall center mono spacing={2} onTop />
        </Billboard>
      )}
    </group>
  );
}

/** Which way the plan direction `d` faces, as a camera yaw from behind. */
const yawOf = (d: number) => Math.atan2(-Math.cos(d), -Math.sin(d));

/**
 * The camera stands behind you, over your shoulder, and turns with the yaw you
 * drag; the wheel moves it closer or further. Sitting down or starting a
 * conversation swings it round behind you, so you see the screen or the person
 * you are facing. It stays inside the room and under the ceiling.
 */
function FollowCam({ floor, zoom, height, dress }: { floor: SocFloor; zoom: React.RefObject<number>; height: number; dress: { a: number; clear: number } | null }) {
  const look = useRef(new THREE.Vector3());
  const yawNow = useRef(floor.yaw.current);
  const frame = floor.seated !== null || floor.talkTo !== null;
  useFrame(({ camera }, dt) => {
    const k = Math.min(1, dt * 4);
    if (dress !== null) {
      // Dressing: stand in front of you, with you to the left of the panel.
      const p = floor.pos.current;
      const d = dress.a;
      const fx = Math.cos(d);
      const fz = Math.sin(d);
      const room = (o: number, s: number, lo: number, hi: number) => (s > 1e-4 ? (hi - o) / s : s < -1e-4 ? (lo - o) / s : Infinity);
      const dist = Math.max(0.9, Math.min(2.2, dress.clear * M, room(p.x * M, fx, 0.4, WORLD_W * M - 0.4), room(p.y * M, fz, WALL_H * M + 0.4, height * M - 0.4)));
      camera.position.lerp(new THREE.Vector3(p.x * M + fx * dist, 1.5, p.y * M + fz * dist), k);
      look.current.lerp(new THREE.Vector3(p.x * M + fz * 0.45, 1.05, p.y * M - fx * 0.45), k);
      camera.lookAt(look.current);
      return;
    }
    if (frame) {
      let d = yawOf(floor.dir.current) - floor.yaw.current;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      floor.turn(d * Math.min(1, dt * 3));
    }
    const p = floor.pos.current;
    const z = zoom.current;
    let dy = floor.yaw.current - yawNow.current;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    yawNow.current += dy * Math.min(1, dt * 8);
    const a = yawNow.current;
    const seated = floor.seated !== null;
    const target = new THREE.Vector3(p.x * M, seated ? 1.05 : 1.32, p.y * M);
    // A touch to the right of you, so you are framed rather than dead centre.
    const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)).multiplyScalar(0.35);
    // With a wall behind you the camera comes in along its own line rather
    // than being pushed sideways or overhead, and drops as it comes in, so it
    // stays over your shoulder instead of looking down on your head.
    const ox = target.x + side.x;
    const oz = target.z + side.z;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const room = (o: number, s: number, lo: number, hi: number) => (s > 1e-4 ? (hi - o) / s : s < -1e-4 ? (lo - o) / s : Infinity);
    const full = (seated ? 2.3 : 3.6) * z;
    // The side and front walls are see-through from outside, so the camera may
    // stand a little beyond them; only the back wall, with the screens on it, holds it in.
    const dist = Math.max(0.6, Math.min(full, room(ox, sx, -2.2, WORLD_W * M + 2.2), room(oz, sz, WALL_H * M + 0.4, height * M + 2.2)));
    const lift = ((seated ? 1.55 : 1.75) + 1.15 * z - target.y) * (dist / full);
    const want = new THREE.Vector3(ox + sx * dist, Math.min(CEIL - 0.25, target.y + 0.45 + lift), oz + sz * dist);
    // Aim past you, at where you are heading, so you are in the frame rather than filling it.
    const ahead = seated ? 0.6 : 1.6;
    target.set(ox - sx * ahead, seated ? 1.05 : 1.25, oz - sz * ahead);
    camera.position.lerp(want, k);
    look.current.lerp(target, k);
    camera.lookAt(look.current);
  });
  return null;
}

function Pulse({ children, speed = 3, amount = 0.25 }: { children: React.ReactNode; speed?: number; amount?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * speed) * amount);
  });
  return <group ref={g}>{children}</group>;
}

/** A sit-stand desk: a slab top on a dark frame, with a light strip along the front edge. */
function Desk({ x, z, w, d, pal, strip }: { x: number; z: number; w: number; d: number; pal: Palette; strip?: string | null }) {
  return (
    <group position={[x + w / 2, 0, z + d / 2]}>
      <RoundedBox args={[w, 0.04, d]} radius={0.012} position={[0, 0.74, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={pal.desk} roughness={0.42} metalness={0.05} />
      </RoundedBox>
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (w / 2 - 0.12), 0, 0]}>
          <mesh position={[0, 0.36, 0]} castShadow>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            <meshStandardMaterial color={pal.frame} roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <boxGeometry args={[0.07, 0.03, d - 0.06]} />
            <meshStandardMaterial color={pal.frame} roughness={0.35} metalness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.69, -d / 2 + 0.05]}>
        <boxGeometry args={[w - 0.3, 0.08, 0.02]} />
        <meshStandardMaterial color={pal.frame} roughness={0.4} metalness={0.5} />
      </mesh>
      {strip && (
        <mesh position={[0, 0.716, d / 2 + 0.001]}>
          <planeGeometry args={[w - 0.04, 0.008]} />
          <meshBasicMaterial color={strip} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/** A slim monitor on an arm, showing a live console. */
function Monitor({ x, z, tex, bright, pal, w = 0.62 }: { x: number; z: number; tex: THREE.Texture; bright: boolean; pal: Palette; w?: number }) {
  const h = w * 0.578;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, -0.03]} castShadow>
        <boxGeometry args={[0.03, 0.3, 0.03]} />
        <meshStandardMaterial color={pal.frame} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.765, -0.03]}>
        <boxGeometry args={[0.2, 0.012, 0.14]} />
        <meshStandardMaterial color={pal.frame} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[w + 0.016, h + 0.016, 0.02]} />
        <meshStandardMaterial color={pal.mon} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 0.0105]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} color={bright ? "#ffffff" : "#8a8f9c"} />
      </mesh>
    </group>
  );
}

/** A task chair: seat, mesh back, column and a five-star base. */
function Chair({ x, z, pal }: { x: number; z: number; pal: Palette }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[0.48, 0.07, 0.46]} radius={0.03} position={[0, 0.48, 0]} castShadow>
        <meshStandardMaterial color={pal.chair} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.44, 0.56, 0.04]} radius={0.02} position={[0, 0.84, 0.23]} rotation={[-0.08, 0, 0]} castShadow>
        <meshStandardMaterial color={pal.chair} roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.42, 12]} />
        <meshStandardMaterial color={pal.frame} roughness={0.25} metalness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => (
        <mesh key={k} position={[Math.sin((k * Math.PI * 2) / 5) * 0.14, 0.05, Math.cos((k * Math.PI * 2) / 5) * 0.14]} rotation={[0, (k * Math.PI * 2) / 5, 0]}>
          <boxGeometry args={[0.03, 0.025, 0.28]} />
          <meshStandardMaterial color={pal.frame} roughness={0.25} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ floor, pal, dark, dragged, placeTag, look, face }: { floor: SocFloor; pal: Palette; dark: boolean; dragged: React.RefObject<boolean>; placeTag: (x: number, y: number) => void; look: Look; face: number | null }) {
  const { world, labs, done, nextUp, cleared, view, seated, talking } = floor;
  const W = WORLD_W * M;
  const H = world.height * M;
  const wallZ = WALL_H * M;
  const n = view.near;
  const focusI = seated ?? (n?.kind === "station" ? n.i : null);

  const wall = useMemo(() => wallTex(cleared, labs.length), [cleared, labs.length]);
  const sky = useMemo(() => skylineTex(pal.sky), [pal.sky]);
  const slats = useMemo(() => {
    const t = slatTex(dark);
    t.repeat.set(W / 1.6, 1);
    return t;
  }, [dark, W]);

  const onFloor = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (dragged.current) return;
    if (e.point.z * 100 > WALL_H) floor.walkTo({ x: e.point.x * 100, y: e.point.z * 100 });
  };

  const windowsAlong = (len: number) => Array.from({ length: Math.max(1, Math.floor(len / 3.4)) }, (_, k) => 1.9 + k * 3.4);

  return (
    <>
      <color attach="background" args={[pal.ceil]} />
      <fog attach="fog" args={[pal.fog, 14, 34]} />
      <Environment resolution={256} frames={1} environmentIntensity={pal.env}>
        {[-6, -2, 2, 6].map((z) => (
          <Lightformer key={z} form="rect" intensity={pal.former} position={[0, 4, z]} rotation-x={Math.PI / 2} scale={[12, 0.4, 1]} />
        ))}
        <Lightformer form="rect" intensity={pal.former / 2} color={pal.formerColor} position={[0, 1.5, -8]} scale={[20, 3, 1]} />
      </Environment>
      <hemisphereLight args={[pal.hemiSky, pal.hemiGround, pal.hemi]} />
      <directionalLight
        position={[W * 0.3, 10, H * 0.2]}
        intensity={pal.sun}
        color={pal.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {focusI !== null && (
        <pointLight position={[world.stations[focusI].seat.x * M, 1.3, world.stations[focusI].desk.y * M + 0.3]} color={labs[focusI].accent} intensity={dark ? 3 : 1.2} distance={2.6} />
      )}
      {world.pods.map((p) => (
        <pointLight key={p.label} position={[(p.rug.x + p.rug.w / 2) * M, 2.5, (p.rug.y + p.rug.h / 2) * M]} intensity={dark ? 4 : pal.sky === "dusk" ? 3 : 2} distance={9} decay={1.6} color={pal.lamp} />
      ))}

      {/* Ceiling, with linear light strips running the length of the room */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[W / 2, CEIL, H / 2]}>
        <planeGeometry args={[W + 1, H + 1]} />
        <meshStandardMaterial color={pal.ceil} emissive={pal.ceil} emissiveIntensity={pal.ceilGlow} roughness={0.95} />
      </mesh>
      {Array.from({ length: Math.floor((H - wallZ) / 1.8) }, (_, k) => (
        <mesh key={k} position={[W / 2, CEIL - 0.015, wallZ + 1 + k * 1.8]}>
          <boxGeometry args={[W - 1.6, 0.02, 0.035]} />
          <meshBasicMaterial color={pal.strip} toneMapped={false} />
        </mesh>
      ))}

      {/* Side and front walls, each with windows on the city. They are one-sided,
          facing in: from inside they are walls, and when the camera stands
          behind one to keep you in frame, it looks straight through. */}
      {[
        [0, 1],
        [W, -1],
      ].map(([x, face]) => (
        <group key={x}>
          <mesh position={[x, CEIL / 2, (wallZ + H) / 2]} rotation={[0, face > 0 ? Math.PI / 2 : -Math.PI / 2, 0]} receiveShadow>
            <planeGeometry args={[H - wallZ, CEIL]} />
            <meshStandardMaterial color={pal.wall} roughness={0.9} />
          </mesh>
          {windowsAlong(H - wallZ).map((wz) => (
            <group key={wz} position={[x + face * 0.004, 1.75, wallZ + wz]} rotation={[0, face > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
              <mesh>
                <planeGeometry args={[2.8, 2]} />
                <meshBasicMaterial map={sky} toneMapped={false} color={pal.windowTint} />
              </mesh>
              {[-0.7, 0, 0.7].map((mx) => (
                <mesh key={mx} position={[mx * 2, 0, 0.005]}>
                  <planeGeometry args={[0.05, 2]} />
                  <meshStandardMaterial color={pal.frame} metalness={0.6} roughness={0.3} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      <mesh position={[W / 2, CEIL / 2, H]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[W, CEIL]} />
        <meshStandardMaterial color={pal.wall} roughness={0.9} />
      </mesh>
      {[0.25, 0.5, 0.75].map((f) => (
        <mesh key={f} position={[W * f, 1.75, H - 0.004]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.2, 2]} />
          <meshBasicMaterial map={sky} toneMapped={false} color={pal.windowTint} />
        </mesh>
      ))}

      {/* Ground beyond the walls, for when the camera stands outside them */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, -0.02, H / 2]}>
        <planeGeometry args={[W + 12, H + 12]} />
        <meshStandardMaterial color={pal.zone} roughness={1} />
      </mesh>

      {/* Floor: polished concrete, with each week's zone in carpet tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, H / 2]} receiveShadow onClick={onFloor}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={pal.floor} roughness={pal.floorRough} metalness={0.1} />
      </mesh>
      {world.pods.map((p) => {
        const r = p.rug;
        const doneN = p.stations.filter((i) => done[i]).length;
        const cx = (r.x + r.w / 2) * M;
        const cz = (r.y + r.h / 2) * M;
        return (
          <group key={p.label}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.003, cz]} receiveShadow onClick={onFloor}>
              <planeGeometry args={[r.w * M, r.h * M]} />
              <meshStandardMaterial color={pal.zone} roughness={1} />
            </mesh>
            {/* A thin brand line along the zone's front edge */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.005, (r.y + r.h) * M]}>
              <planeGeometry args={[r.w * M, 0.012]} />
              <meshBasicMaterial color={BRAND} toneMapped={false} transparent opacity={dark ? 0.9 : 0.6} />
            </mesh>
            <Label text={p.label.toUpperCase()} at={new THREE.Vector3((r.x + 24) * M, 0.008, (r.y + 26) * M)} h={0.15} color={pal.text2} mono spacing={5} />
            <Label text={`${doneN}/${p.stations.length} CLEARED`} at={new THREE.Vector3((r.x + r.w - 220) * M, 0.008, (r.y + 26) * M)} h={0.13} color={pal.text2} mono spacing={3} />
          </group>
        );
      })}

      {/* Back wall: slats, the sign, the video wall */}
      <mesh position={[W / 2, CEIL / 2, wallZ - 0.06]} receiveShadow>
        <boxGeometry args={[W + 0.32, CEIL, 0.12]} />
        <meshStandardMaterial color={pal.wall} roughness={0.9} />
      </mesh>
      <mesh position={[W / 2, CEIL / 2, wallZ + 0.001]}>
        <planeGeometry args={[W, CEIL]} />
        <meshStandardMaterial map={slats} roughness={0.85} />
      </mesh>
      <group position={[1.2, 2.45, wallZ + 0.02]}>
        <mesh position={[0.18, 0, 0]}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshBasicMaterial color={BRAND} toneMapped={false} />
        </mesh>
        <Label text="P" at={new THREE.Vector3(0.18, 0, 0.002)} h={0.26} color="#ffffff" wall center weight={800} />
        <Label text="PurveX Financial" at={new THREE.Vector3(0.44, 0.06, 0)} h={0.26} color={pal.text} wall weight={700} />
        <Label text="SECURITY OPERATIONS CENTER" at={new THREE.Vector3(0.45, -0.13, 0)} h={0.1} color={pal.text2} wall mono spacing={5} />
      </group>
      <group position={[W / 2 + 0.6, 1.85, wallZ + 0.03]}>
        <mesh>
          <boxGeometry args={[7.6, 1.72, 0.05]} />
          <meshStandardMaterial color="#020306" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[7.5, 1.625]} />
          <meshBasicMaterial map={wall} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.9, 0.08]}>
          <boxGeometry args={[7.7, 0.02, 0.16]} />
          <meshStandardMaterial color={pal.frame} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Workstations */}
      {world.stations.map((s, i) => {
        const l = labs[i];
        const on = focusI === i;
        const x = s.desk.x * M;
        const z = s.desk.y * M;
        const w = s.desk.w * M;
        const d = s.desk.h * M;
        const strip = on ? l.accent : done[i] ? "#34d399" : i === nextUp ? "#fbbf24" : null;
        return (
          <group
            key={l.slug}
            onClick={(e) => {
              e.stopPropagation();
              if (!dragged.current) floor.goToStation(i);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <Desk x={x} z={z} w={w} d={d} pal={pal} strip={strip} />
            <Monitor x={x + w / 2 - 0.34} z={z + 0.18} tex={screenTex(l.accent, i * 2)} bright={on} pal={pal} />
            <Monitor x={x + w / 2 + 0.34} z={z + 0.18} tex={screenTex(l.accent, i * 2 + 1)} bright={on} pal={pal} />
            <RoundedBox args={[0.44, 0.015, 0.13]} radius={0.005} position={[x + w / 2, 0.768, z + d - 0.16]} castShadow>
              <meshStandardMaterial color={pal.mon} roughness={0.5} />
            </RoundedBox>
            {seated !== i && <Chair x={s.seat.x * M} z={s.seat.y * M} pal={pal} />}
            {i === nextUp && !done[i] && (
              <Pulse speed={3.5} amount={0.25}>
                <mesh position={[x + w - 0.1, 0.77, z + d - 0.08]}>
                  <sphereGeometry args={[0.02, 16, 12]} />
                  <meshBasicMaterial color="#fbbf24" toneMapped={false} />
                </mesh>
              </Pulse>
            )}
            <Label text={stationNo(i)} at={new THREE.Vector3(x + 0.06, 0.762, z + d - 0.09)} h={0.07} color={pal.text2} mono />
            {/* A sign over the desks near you, above the screens so it never covers them. */}
            {face === null && seated !== i && (on || Math.hypot(s.seat.x - view.me.x, s.seat.y - view.me.y) < 560) && (
              <Billboard position={[x + w / 2, 1.78, z + 0.18]}>
                <mesh renderOrder={1}>
                  <planeGeometry args={[Math.min(1.9, 0.07 * Math.min(l.title.length, 32) + 0.3), on ? 0.22 : 0.18]} />
                  <meshBasicMaterial color={dark ? "#0b0d14" : "#14161c"} transparent opacity={on ? 0.94 : 0.78} toneMapped={false} />
                </mesh>
                <mesh position={[-Math.min(1.9, 0.07 * Math.min(l.title.length, 32) + 0.3) / 2 + 0.012, 0, 0.001]} renderOrder={1}>
                  <planeGeometry args={[0.024, on ? 0.22 : 0.18]} />
                  <meshBasicMaterial color={on ? l.accent : done[i] ? "#34d399" : "#3a3f50"} toneMapped={false} />
                </mesh>
                <Label text={l.title.length > 32 ? `${l.title.slice(0, 31)}…` : l.title} at={new THREE.Vector3(0.01, 0, 0.002)} h={on ? 0.13 : 0.11} color="#ffffff" wall center weight={600} />
              </Billboard>
            )}
          </group>
        );
      })}

      {/* The Coach */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          if (!dragged.current) floor.goToCoach();
        }}
      >
        <Desk x={world.coachDesk.x * M} z={world.coachDesk.y * M} w={world.coachDesk.w * M} d={world.coachDesk.h * M} pal={pal} strip={n?.kind === "coach" || talking ? "#8b7dff" : null} />
        <Monitor x={(world.coachDesk.x + world.coachDesk.w / 2) * M} z={world.coachDesk.y * M + 0.18} tex={screenTex("#8b7dff", 90)} bright pal={pal} w={0.86} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[world.coach.x * M, 0.004, world.coach.y * M]}>
          <circleGeometry args={[0.32, 40]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.2} depthWrite={false} />
        </mesh>
        <group position={v(world.coach)} rotation={[0, Math.PI, 0]}>
          <Figure look={COACH} headset />
        </group>
        <Billboard position={[world.coach.x * M, 2.12, world.coach.y * M]}>
          <mesh renderOrder={3}>
            <planeGeometry args={[1.06, 0.27]} />
            <meshBasicMaterial color="#0b0d14" transparent opacity={n?.kind === "coach" || talking ? 0.94 : 0.8} toneMapped={false} depthTest={false} />
          </mesh>
          <mesh position={[-0.518, 0, 0.001]} renderOrder={3}>
            <planeGeometry args={[0.024, 0.27]} />
            <meshBasicMaterial color="#8b7dff" toneMapped={false} depthTest={false} />
          </mesh>
          <Label text="Coach" at={new THREE.Vector3(0.01, 0.05, 0.002)} h={0.11} color="#ffffff" wall center weight={650} onTop />
          <Label text="TIER 2 ANALYST · AI" at={new THREE.Vector3(0.01, -0.065, 0.002)} h={0.07} color="#c7c1ff" wall center mono spacing={2} onTop />
        </Billboard>
      </group>

      {/* The night shift's desk; Marcus sits at it */}
      <Desk x={world.colleagueDesk.x * M} z={world.colleagueDesk.y * M} w={world.colleagueDesk.w * M} d={world.colleagueDesk.h * M} pal={pal} />
      <Monitor x={(world.colleagueDesk.x + world.colleagueDesk.w / 2 - 34) * M} z={world.colleagueDesk.y * M + 0.18} tex={screenTex("#34d399", 77)} bright pal={pal} />
      <Monitor x={(world.colleagueDesk.x + world.colleagueDesk.w / 2 + 34) * M} z={world.colleagueDesk.y * M + 0.18} tex={screenTex("#60a5fa", 78)} bright pal={pal} />

      {/* Coworkers */}
      {world.people.map((p) => {
        const info = coworker(p.id);
        if (!info) return null;
        return <Coworker key={p.id} floor={floor} spot={p} info={info} pal={pal} talking={floor.talkTo === p.id} near={n?.kind === "person" && n.id === p.id} />;
      })}

      {/* Server rack, planters, the coffee point, the door */}
      <group position={[(world.rack.x + world.rack.w / 2) * M, 0, (world.rack.y + world.rack.h / 2) * M]}>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[world.rack.w * M + 0.32, 2.1, world.rack.h * M]} />
          <meshStandardMaterial color="#07080c" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[-(world.rack.w * M + 0.32) / 2 - 0.001, 1.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[world.rack.h * M - 0.1, 2]} />
          <meshStandardMaterial color="#0e1018" roughness={0.6} metalness={0.4} transparent opacity={0.9} />
        </mesh>
        {Array.from({ length: 24 }, (_, i) => (
          <Pulse key={i} speed={2 + (i % 5)} amount={0.5}>
            <mesh position={[-(world.rack.w * M + 0.32) / 2 - 0.004, 0.25 + (i % 12) * 0.15, -0.6 + Math.floor(i / 12) * 1.2 + (i % 3) * 0.08]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.03, 0.012]} />
              <meshBasicMaterial color={i % 5 ? "#34d399" : "#60a5fa"} toneMapped={false} />
            </mesh>
          </Pulse>
        ))}
      </group>
      {world.plants.map((p, i) => (
        <group key={i} position={v(p)}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.17, 0.6, 32]} />
            <meshStandardMaterial color={pal.frame} roughness={0.5} metalness={0.3} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <mesh key={k} position={[Math.sin(k) * 0.08, 0.95 + (k % 3) * 0.14, Math.cos(k) * 0.08]} rotation={[Math.sin(k * 2) * 0.5, k, Math.cos(k) * 0.4]} castShadow>
              <coneGeometry args={[0.07, 0.75, 6]} />
              <meshStandardMaterial color={pal.plant} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
      <Desk x={world.coffee.x * M} z={world.coffee.y * M} w={world.coffee.w * M} d={world.coffee.h * M} pal={pal} />
      <RoundedBox args={[0.3, 0.42, 0.3]} radius={0.02} position={[(world.coffee.x + 34) * M, 0.97, (world.coffee.y + 22) * M]} castShadow>
        <meshStandardMaterial color="#16181d" roughness={0.3} metalness={0.7} />
      </RoundedBox>
      <mesh position={[(world.door.x + world.door.w / 2) * M, 1.1, world.height * M - 0.005]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[world.door.w * M, 2.2]} />
        <meshStandardMaterial color={pal.frame} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Where you are heading */}
      {view.path.map((p, i) =>
        i % 4 ? null : (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[p.x * M, 0.012, p.y * M]}>
            <circleGeometry args={[0.03, 16]} />
            <meshBasicMaterial color={BRAND} toneMapped={false} />
          </mesh>
        )
      )}

      <You floor={floor} placeTag={placeTag} look={look} face={face} />
    </>
  );
}

/** The plan direction from `p` with the most open floor, preferring the way you already face. */
function clearestAngle(world: SocFloor["world"], p: Pt, facing: number): { a: number; clear: number } {
  let best = { a: facing, clear: 90 };
  let bestScore = -Infinity;
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    let clear = 0;
    for (let s = 20; s <= 240; s += 10) {
      if (blocked(world, { x: p.x + Math.cos(a) * s, y: p.y + Math.sin(a) * s }, 8)) break;
      clear = s;
    }
    const score = clear - Math.abs(Math.atan2(Math.sin(a - facing), Math.cos(a - facing))) * 8;
    if (score > bestScore) {
      bestScore = score;
      best = { a, clear };
    }
  }
  return best;
}

/** Says when the scene has drawn a few frames, so the loading screen can step aside. */
function Ready({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const told = useRef(false);
  useFrame(() => {
    if (told.current) return;
    if (++frames.current >= 3) {
      told.current = true;
      onReady();
    }
  });
  return null;
}

const MUSIC_KEY = "academy-soc-music";

export function SocOffice3D({ floor }: { floor: SocFloor }) {
  const phase = usePhase();
  const pal = PALETTES[phase];
  const dark = phase === "night";
  const box = useRef<HTMLDivElement>(null);
  const zoom = useRef(1);
  const drag = useRef<{ x: number; moved: number } | null>(null);
  const dragged = useRef(false);
  const tag = useRef<HTMLSpanElement>(null);
  const n = floor.view.near;
  const seated = floor.seated !== null;
  const talkTo = floor.talkTo;
  const withCoworker = talkTo !== null && talkTo !== "coach" ? talkTo : null;
  const [topic, setTopic] = useState<{ who: string; k: number } | null>(null);
  const chosen = topic && topic.who === withCoworker ? topic.k : null;
  const placeTag = useCallback((x: number, y: number) => {
    const el = tag.current;
    if (el) el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  }, []);
  const [focused, setFocused] = useState(false);

  // Your analyst, the intro, the music and full screen.
  const [avatar, setAvatar] = useState<Avatar>(DEFAULT_AVATAR);
  const [dress, setDress] = useState(false);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [music, setMusic] = useState(false);
  const [full, setFull] = useState(false);
  const jazz = useRef<SoftJazz | null>(null);
  const look = useMemo(() => lookOf(avatar), [avatar]);

  useEffect(() => {
    // Saved choices live in this browser, so they arrive after the first paint.
    setAvatar(loadAvatar());
    try {
      setMusic(window.localStorage.getItem(MUSIC_KEY) === "on");
    } catch {}
    const onFull = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", onFull);
    return () => {
      document.removeEventListener("fullscreenchange", onFull);
      jazz.current?.stop();
    };
  }, []);

  const playMusic = (on: boolean) => {
    if (on) {
      jazz.current ??= new SoftJazz();
      jazz.current.start();
    } else jazz.current?.stop();
  };
  const toggleMusic = () => {
    const on = !music;
    setMusic(on);
    try {
      window.localStorage.setItem(MUSIC_KEY, on ? "on" : "off");
    } catch {}
    if (entered) playMusic(on);
  };
  const enter = (thenDress = false) => {
    setEntered(true);
    if (music) playMusic(true);
    if (thenDress) openDress();
    box.current?.focus({ preventScroll: true });
  };
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void box.current?.requestFullscreen?.().catch(() => {});
  };
  const changeAvatar = (update: (a: Avatar) => Avatar) =>
    setAvatar((prev) => {
      const next = update(prev);
      saveAvatar(next);
      return next;
    });
  // While dressing you turn to face the camera, which stands wherever there is
  // most open floor around you, so no desk or screen is in the way.
  const [dressAngle, setDressAngle] = useState({ a: 0, clear: 220 });
  const openDress = () => {
    setDressAngle(clearestAngle(floor.world, floor.pos.current, floor.dir.current));
    setDress(true);
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // The wheel moves the camera in and out rather than scrolling the page while you are in the room.
    const onWheel = (e: WheelEvent) => {
      if ((e.target as Element).closest(".sw-dress")) return;
      e.preventDefault();
      zoom.current = Math.max(0.55, Math.min(1.7, zoom.current * (e.deltaY > 0 ? 1.08 : 0.92)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const nearName = n?.kind === "person" ? coworker(n.id)?.name.split(" ")[0] : null;

  return (
    <div
      ref={box}
      className={`sw sw--3d is-${phase}${focused ? " is-focused" : ""}${full ? " is-full" : ""}`}
      tabIndex={0}
      role="application"
      aria-label="The PurveX Financial SOC. Arrow keys or WASD to walk, E to sit at a workstation or talk to someone, drag to turn the camera, the mouse wheel to zoom."
      onKeyDown={(e) => {
        if (!entered || dress) return;
        // In a conversation, the number keys ask the questions.
        const k = Number(e.key) - 1;
        if (withCoworker && k >= 0 && k < (coworker(withCoworker)?.topics.length ?? 0)) {
          e.preventDefault();
          setTopic({ who: withCoworker, k });
          return;
        }
        floor.onKeyDown(e);
      }}
      onKeyUp={floor.onKeyUp}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (box.current?.contains(e.relatedTarget as Node)) return;
        setFocused(false);
        floor.releaseKeys();
      }}
      onPointerDown={(e) => {
        box.current?.focus({ preventScroll: true });
        drag.current = { x: e.clientX, moved: 0 };
        dragged.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || !e.buttons || dress) return;
        const dx = e.clientX - d.x;
        d.x = e.clientX;
        d.moved += Math.abs(dx);
        // Drag to turn the camera around you. A real drag, not a wobbly click.
        if (d.moved > 6) {
          dragged.current = true;
          floor.turn(-dx * 0.006);
        }
      }}
      onPointerUp={() => {
        drag.current = null;
        // Let the click that ends a drag see the flag, then clear it.
        window.setTimeout(() => (dragged.current = false), 0);
      }}
    >
      <Canvas
        shadows="percentage"
        dpr={[1, 1.75]}
        camera={{ fov: 54, position: [2, 3, 16], near: 0.1, far: 60 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: pal.exposure }}
      >
        <Scene floor={floor} pal={pal} dark={dark} dragged={dragged} placeTag={placeTag} look={look} face={dress ? dressAngle.a : null} />
        <FollowCam floor={floor} zoom={zoom} height={floor.world.height} dress={dress ? dressAngle : null} />
        <Ready onReady={() => setReady(true)} />
      </Canvas>

      {entered && !dress && (
        <>
          <span ref={tag} className={`sw-key sw-key--3d${seated ? " sw-key--signin" : ""}`} hidden={!((n || seated) && !talkTo)}>
            {seated ? (
              "Signing in…"
            ) : (
              <>
                <kbd>E</kbd> {n?.kind === "coach" ? "Talk to the Coach" : nearName ? `Talk to ${nearName}` : "Sit down"}
              </>
            )}
          </span>
          <SocHud floor={floor} music={music} onMusic={toggleMusic} full={full} onFull={toggleFull} onDress={openDress} />
          {withCoworker && <SocTalk id={withCoworker} chosen={chosen} onPick={(k) => setTopic({ who: withCoworker, k })} onLeave={floor.stopTalking} />}
          {!focused && <span className="sw-wake">Click the room to walk</span>}
        </>
      )}
      {dress && <SocDress avatar={avatar} onChange={changeAvatar} onDone={() => setDress(false)} />}
      {!entered && <SocLoading ready={ready} phase={phase} music={music} onMusic={toggleMusic} onEnter={() => enter()} onDress={() => enter(true)} />}
    </div>
  );
}

