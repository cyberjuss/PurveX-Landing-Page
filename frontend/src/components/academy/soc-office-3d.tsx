"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { WALL_H, WORLD_W, type Pt } from "@/lib/soc-world";
import { useAcademyTheme } from "@/lib/use-academy-theme";
import { stationNo } from "./soc-guide";
import type { SocFloor } from "./use-soc-floor";
import "./soc-world.css";

// The SOC floor in 3D. The room comes from useSocFloor in plan units (1600
// wide); here 100 units are a metre, x stays x and the plan's y becomes z.
// Labels are drawn onto canvases with the page's own fonts, because the
// usual 3D text library fetches fonts and spawns workers the site's
// security policy does not allow.

const M = 0.01;
const v = (p: Pt, y = 0) => new THREE.Vector3(p.x * M, y, p.y * M);

type Palette = {
  floor: string; rug: string; wall: string; desk: string; deskEdge: string; chair: string; mon: string; screenOff: string;
  text: string; text2: string; sky: string; skyline: string; frame: string; head: string; hair: string; pants: string;
  sun: number; hemi: number; fog: string;
};
const DAY: Palette = {
  floor: "#e9ecf2", rug: "#dfe2f6", wall: "#dde2ea", desk: "#ffffff", deskEdge: "#cfd5e1", chair: "#9aa3b8", mon: "#1d2230", screenOff: "#2b3142",
  text: "#1e2333", text2: "#5b6478", sky: "#a9c6ee", skyline: "#8fa3c2", frame: "#bfc6d6", head: "#e6d3c1", hair: "#2b2737", pants: "#39405a",
  sun: 1.6, hemi: 0.9, fog: "#e9ecf2",
};
const NIGHT: Palette = {
  floor: "#1a1d2a", rug: "#22254a", wall: "#141724", desk: "#3a4055", deskEdge: "#4b5370", chair: "#4c5474", mon: "#07080d", screenOff: "#141826",
  text: "#e7e9f4", text2: "#9aa1bd", sky: "#121a40", skyline: "#05060c", frame: "#262b40", head: "#e6d3c1", hair: "#1c1828", pants: "#2a2f45",
  sun: 0.9, hemi: 0.75, fog: "#1a1d2a",
};

/** A label drawn on a canvas, as a texture. Re-drawn only when its text or colour changes. */
function useLabel(text: string, opts: { size?: number; weight?: number; color: string; mono?: boolean; spacing?: number }) {
  const { size = 64, weight = 700, color, mono = false, spacing = 0 } = opts;
  return useMemo(() => {
    const c = document.createElement("canvas");
    const fam = getComputedStyle(document.body).getPropertyValue(mono ? "--font-mono" : "--font-display").trim() || (mono ? "monospace" : "sans-serif");
    const style = (g: CanvasRenderingContext2D) => {
      g.font = `${weight} ${size}px ${fam}`;
      if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
    };
    // Measure first, so the canvas is exactly as wide as its text and a
    // centred label is centred on the words, not on empty canvas.
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
    t.anisotropy = 4;
    return { tex: t, aspect: c.width / c.height };
  }, [text, size, weight, color, mono, spacing]);
}

/** Text lying on the floor (or flat on a wall when `wall`), left-aligned at `at`. */
function Label({ text, at, h, color, mono, weight, wall, center, spacing, onTop }: { text: string; at: THREE.Vector3; h: number; color: string; mono?: boolean; weight?: number; wall?: boolean; center?: boolean; spacing?: number; onTop?: boolean }) {
  const { tex, aspect } = useLabel(text, { color, mono, weight, spacing });
  const w = h * aspect;
  return (
    <mesh position={[at.x + (center ? 0 : w / 2), at.y, at.z]} rotation={wall ? [0, 0, 0] : [-Math.PI / 2, 0, 0]} renderOrder={onTop ? 10 : 2}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} depthTest={!onTop} toneMapped={false} />
    </mesh>
  );
}

/** A person: legs, body, arms, head. Faces +z. Walking swings the limbs; sitting folds the legs. */
function Person({ shirt, pal, walking, seated, typing, headset }: { shirt: string; pal: Palette; walking?: React.RefObject<boolean>; seated?: boolean; typing?: boolean; headset?: boolean }) {
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const walk = walking?.current ? Math.sin(t * 10) * 0.6 : 0;
    if (legL.current) legL.current.rotation.x = seated ? -Math.PI / 2 : walk;
    if (legR.current) legR.current.rotation.x = seated ? -Math.PI / 2 : -walk;
    const tap = typing ? Math.sin(t * 22) * 0.12 : 0;
    if (armL.current) armL.current.rotation.x = typing ? -1.25 + tap : -walk * 0.8;
    if (armR.current) armR.current.rotation.x = typing ? -1.25 - tap : walk * 0.8;
  });
  const skin = pal.head;
  return (
    <group position={[0, seated ? -0.42 : 0, 0]}>
      {[
        [legL, -0.1],
        [legR, 0.1],
      ].map(([ref, x], i) => (
        <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.86, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.68, 4, 10]} />
            <meshStandardMaterial color={pal.pants} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.46, 6, 14]} />
        <meshStandardMaterial color={shirt} roughness={0.65} />
      </mesh>
      {[
        [armL, -0.27],
        [armR, 0.27],
      ].map(([ref, x], i) => (
        <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 1.42, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.48, 4, 10]} />
            <meshStandardMaterial color={shirt} roughness={0.65} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.66, 0]} castShadow>
        <sphereGeometry args={[0.15, 24, 18]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.7, -0.02]} scale={[1.04, 0.9, 1.06]}>
        <sphereGeometry args={[0.15, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={pal.hair} roughness={0.9} />
      </mesh>
      {headset && (
        <mesh position={[0, 1.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.17, 0.018, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#c7cbe0" metalness={0.3} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

/** You: follows the floor's position and heading every frame, and places the E tag over your head. */
function You({ floor, pal, placeTag }: { floor: SocFloor; pal: Palette; placeTag: (x: number, y: number) => void }) {
  const g = useRef<THREE.Group>(null);
  const seated = floor.seated !== null;
  const head = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    if (!g.current) return;
    // The tag is an ordinary element over the canvas; this keeps it above your head.
    head.copy(g.current.position).add(new THREE.Vector3(0, 2.2, 0)).project(camera);
    placeTag(((head.x + 1) / 2) * size.width, ((1 - head.y) / 2) * size.height);
    const p = floor.pos.current;
    g.current.position.lerp(new THREE.Vector3(p.x * M, 0, p.y * M), 0.5);
    const d = floor.dir.current;
    const want = Math.atan2(Math.cos(d), Math.sin(d));
    let diff = want - g.current.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    g.current.rotation.y += diff * 0.25;
  });
  return (
    <group ref={g}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.32, 0.36, 40]} />
        <meshBasicMaterial color="#6b5cf0" transparent opacity={0.7} />
      </mesh>
      <Person shirt="#5546e0" pal={pal} walking={floor.moving} seated={seated} typing={seated} />
    </group>
  );
}

/** The camera stays behind and above you, easing after you; the wheel zooms. */
function FollowCam({ floor, zoom }: { floor: SocFloor; zoom: React.RefObject<number> }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const p = floor.pos.current;
    const z = zoom.current;
    const target = new THREE.Vector3(p.x * M, 0.8, p.y * M);
    const want = target.clone().add(new THREE.Vector3(0, 6.2 * z, 6.4 * z));
    const k = Math.min(1, dt * 4);
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

function Desk({ x, z, w, d, pal }: { x: number; z: number; w: number; d: number; pal: Palette }) {
  return (
    <group position={[x + w / 2, 0, z + d / 2]}>
      <RoundedBox args={[w, 0.05, d]} radius={0.02} position={[0, 0.74, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={pal.desk} roughness={0.55} />
      </RoundedBox>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (w / 2 - 0.06), 0.36, 0]} castShadow>
          <boxGeometry args={[0.04, 0.72, d - 0.08]} />
          <meshStandardMaterial color={pal.deskEdge} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Monitor({ x, z, on, accent, pal }: { x: number; z: number; on: boolean; accent: string; pal: Palette }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.86, 0]} castShadow>
        <boxGeometry args={[0.05, 0.22, 0.05]} />
        <meshStandardMaterial color={pal.mon} />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <boxGeometry args={[0.66, 0.4, 0.035]} />
        <meshStandardMaterial color={pal.mon} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.08, 0.019]}>
        <planeGeometry args={[0.6, 0.34]} />
        <meshStandardMaterial color={on ? accent : pal.screenOff} emissive={on ? accent : "#000"} emissiveIntensity={on ? 1.1 : 0} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Chair({ x, z, pal }: { x: number; z: number; pal: Palette }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[0.48, 0.08, 0.46]} radius={0.03} position={[0, 0.48, 0]} castShadow>
        <meshStandardMaterial color={pal.chair} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.46, 0.5, 0.07]} radius={0.03} position={[0, 0.78, 0.22]} castShadow>
        <meshStandardMaterial color={pal.chair} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.44, 10]} />
        <meshStandardMaterial color={pal.mon} />
      </mesh>
    </group>
  );
}

function Scene({ floor, pal, dark, placeTag }: { floor: SocFloor; pal: Palette; dark: boolean; placeTag: (x: number, y: number) => void }) {
  const { world, labs, done, nextUp, cleared, view, seated, talking } = floor;
  const W = WORLD_W * M;
  const H = world.height * M;
  const wallZ = WALL_H * M;
  const n = view.near;
  const focusI = seated ?? (n?.kind === "station" ? n.i : null);

  const onFloor = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.point.z * 100 > WALL_H) floor.walkTo({ x: e.point.x * 100, y: e.point.z * 100 });
  };

  return (
    <>
      <color attach="background" args={[pal.fog]} />
      <fog attach="fog" args={[pal.fog, 14, 30]} />
      <hemisphereLight args={[dark ? "#5a5f9a" : "#ffffff", dark ? "#0b0c14" : "#cfd6e4", pal.hemi]} />
      <directionalLight
        position={[W * 0.35, 12, H * 0.25]}
        intensity={pal.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />
      {focusI !== null && (
        <pointLight position={[world.stations[focusI].seat.x * M, 1.4, world.stations[focusI].desk.y * M + 0.4]} color={labs[focusI].accent} intensity={dark ? 6 : 2.5} distance={3.5} />
      )}

      {/* Ceiling lights over the pods */}
      {world.pods.map((p) => (
        <pointLight key={p.label} position={[(p.rug.x + p.rug.w / 2) * M, 3.2, (p.rug.y + p.rug.h / 2) * M]} intensity={dark ? 7 : 2} distance={9} decay={1.6} color={dark ? "#c9d2ff" : "#ffffff"} />
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, 0, H / 2]} receiveShadow onClick={onFloor}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={pal.floor} roughness={0.95} />
      </mesh>
      <gridHelper args={[Math.max(W, H), Math.round(Math.max(W, H) / 0.8), pal.deskEdge, pal.deskEdge]} position={[W / 2, 0.002, H / 2]} material-transparent material-opacity={dark ? 0.12 : 0.35} />

      {/* Pods */}
      {world.pods.map((p) => {
        const r = p.rug;
        const doneN = p.stations.filter((i) => done[i]).length;
        return (
          <group key={p.label}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(r.x + r.w / 2) * M, 0.004, (r.y + r.h / 2) * M]} receiveShadow onClick={onFloor}>
              <planeGeometry args={[r.w * M, r.h * M]} />
              <meshStandardMaterial color={pal.rug} roughness={1} />
            </mesh>
            <Label text={p.label.toUpperCase()} at={new THREE.Vector3((r.x + 24) * M, 0.01, (r.y + 26) * M)} h={0.17} color={pal.text2} mono spacing={4} />
            <Label text={`${doneN}/${p.stations.length} done`} at={new THREE.Vector3((r.x + r.w - 190) * M, 0.01, (r.y + 26) * M)} h={0.15} color={pal.text2} mono />
          </group>
        );
      })}

      {/* Back wall, windows, sign, video wall */}
      <mesh position={[W / 2, 1.6, wallZ - 0.06]} receiveShadow>
        <boxGeometry args={[W, 3.2, 0.12]} />
        <meshStandardMaterial color={pal.wall} roughness={0.9} />
      </mesh>
      {[
        [0.3, 1.9],
        [12.5, 3.2],
      ].map(([x, w], i) => (
        <group key={i}>
          <mesh position={[x + w / 2, 1.95, wallZ + 0.001]}>
            <planeGeometry args={[w, 1.25]} />
            <meshBasicMaterial color={pal.sky} toneMapped={false} />
          </mesh>
          {Array.from({ length: Math.floor(w / 0.22) }, (_, b) => {
            const bh = 0.2 + (((b * 37 + i * 11) % 34) / 34) * 0.42;
            return (
              <mesh key={b} position={[x + 0.11 + b * 0.22, 1.33 + bh / 2, wallZ + 0.002]}>
                <planeGeometry args={[0.2, bh]} />
                <meshBasicMaterial color={pal.skyline} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      ))}
      <mesh position={[2.68, 2.32, wallZ + 0.01]}>
        <boxGeometry args={[0.36, 0.36, 0.02]} />
        <meshStandardMaterial color="#5546e0" emissive="#5546e0" emissiveIntensity={0.4} />
      </mesh>
      <Label text="P" at={new THREE.Vector3(2.68, 2.32, wallZ + 0.025)} h={0.3} color="#ffffff" wall center weight={800} />
      <Label text="PurveX Financial" at={new THREE.Vector3(2.98, 2.4, wallZ + 0.01)} h={0.3} color={pal.text} wall />
      <Label text="SECURITY OPERATIONS CENTER" at={new THREE.Vector3(2.99, 2.17, wallZ + 0.01)} h={0.12} color={pal.text2} wall mono spacing={4} />
      <group position={[5.6, 0, wallZ + 0.02]}>
        {[
          [0, 2.2, "THREAT MAP"],
          [2.3, 2.2, "ALERT QUEUE"],
          [4.6, 1.5, "LABS CLEARED"],
        ].map(([x, w, label]) => (
          <group key={label as string}>
            <mesh position={[(x as number) + (w as number) / 2, 1.95, 0]}>
              <boxGeometry args={[w as number, 1.05, 0.04]} />
              <meshStandardMaterial color="#0d1020" emissive="#151a3a" emissiveIntensity={0.6} />
            </mesh>
            <Label text={label as string} at={new THREE.Vector3((x as number) + 0.12, 2.36, 0.03)} h={0.1} color="#8b93b5" wall mono spacing={3} />
          </group>
        ))}
        {[
          [0.4, 1.7],
          [0.9, 1.95],
          [1.5, 2.0],
          [1.9, 1.8],
        ].map(([x, y], i) => (
          <Pulse key={i} speed={2 + i * 0.4} amount={0.35}>
            <mesh position={[x, y, 0.03]}>
              <sphereGeometry args={[0.035, 12, 8]} />
              <meshBasicMaterial color="#f87171" toneMapped={false} />
            </mesh>
          </Pulse>
        ))}
        {["4625 ×40  alex.rivera", "New admin  svc-backup-job", "SYN burst  10.0.1.23", "Hash mismatch  vpn-client"].map((t, i) => (
          <Label key={t} text={t} at={new THREE.Vector3(2.42, 2.17 - i * 0.17, 0.03)} h={0.1} color={["#fca5a5", "#fcd34d", "#93c5fd", "#fca5a5"][i]} wall mono />
        ))}
        <Label text={`${cleared} / ${labs.length}`} at={new THREE.Vector3(4.72, 1.86, 0.03)} h={0.42} color="#ffffff" wall weight={800} />
      </group>

      {/* Workstations */}
      {world.stations.map((s, i) => {
        const l = labs[i];
        const on = focusI === i;
        const x = s.desk.x * M;
        const z = s.desk.y * M;
        const w = s.desk.w * M;
        const d = s.desk.h * M;
        return (
          <group
            key={l.slug}
            onClick={(e) => {
              e.stopPropagation();
              floor.goToStation(i);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <Desk x={x} z={z} w={w} d={d} pal={pal} />
            <Monitor x={x + w / 2 - 0.36} z={z + 0.16} on={on || done[i]} accent={on ? l.accent : "#2f9e72"} pal={pal} />
            <Monitor x={x + w / 2 + 0.36} z={z + 0.16} on={on} accent={l.accent} pal={pal} />
            <mesh position={[x + w / 2, 0.775, z + d - 0.18]} castShadow>
              <boxGeometry args={[0.5, 0.02, 0.15]} />
              <meshStandardMaterial color={pal.mon} roughness={0.5} />
            </mesh>
            {seated !== i && <Chair x={s.seat.x * M} z={s.seat.y * M} pal={pal} />}
            {done[i] && (
              <mesh position={[x + w - 0.16, 0.8, z + d - 0.14]}>
                <sphereGeometry args={[0.05, 16, 12]} />
                <meshStandardMaterial color="#2f9e72" emissive="#2f9e72" emissiveIntensity={0.8} />
              </mesh>
            )}
            {i === nextUp && !done[i] && (
              <Pulse speed={4} amount={0.3}>
                <mesh position={[x + w - 0.16, 0.8, z + d - 0.14]}>
                  <sphereGeometry args={[0.05, 16, 12]} />
                  <meshStandardMaterial color="#f5a524" emissive="#f5a524" emissiveIntensity={1} />
                </mesh>
              </Pulse>
            )}
            <Label text={stationNo(i)} at={new THREE.Vector3(x + 0.08, 0.769, z + d - 0.12)} h={0.09} color={pal.text2} mono />
            <Label text={l.title.length > 32 ? `${l.title.slice(0, 31)}…` : l.title} at={new THREE.Vector3(s.label.x * M, 0.01, s.label.y * M)} h={on ? 0.2 : 0.17} color={on ? pal.text : pal.text2} center weight={on ? 700 : 600} onTop />
          </group>
        );
      })}

      {/* The Coach */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          floor.goToCoach();
        }}
      >
        <Desk x={world.coachDesk.x * M} z={world.coachDesk.y * M} w={world.coachDesk.w * M} d={world.coachDesk.h * M} pal={pal} />
        <Monitor x={(world.coachDesk.x + world.coachDesk.w / 2) * M} z={world.coachDesk.y * M + 0.16} on accent="#8b7dff" pal={pal} />
        <Pulse speed={2} amount={0.1}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[world.coach.x * M, 0.012, world.coach.y * M]}>
            <ringGeometry args={[0.38, 0.46, 48]} />
            <meshBasicMaterial color="#8b7dff" transparent opacity={n?.kind === "coach" || talking ? 0.9 : 0.45} />
          </mesh>
        </Pulse>
        <group position={v(world.coach)} rotation={[0, Math.PI, 0]}>
          <Person shirt="#6b5cf0" pal={pal} headset />
        </group>
        <Label text="Coach · Tier 2" at={new THREE.Vector3(world.coach.x * M, 0.012, (world.coach.y + 66) * M)} h={0.2} color={pal.text} center weight={700} />
      </group>

      {/* A colleague on the night shift */}
      <Desk x={world.colleagueDesk.x * M} z={world.colleagueDesk.y * M} w={world.colleagueDesk.w * M} d={world.colleagueDesk.h * M} pal={pal} />
      <Monitor x={(world.colleagueDesk.x + world.colleagueDesk.w / 2 - 36) * M} z={world.colleagueDesk.y * M + 0.16} on accent="#2f9e72" pal={pal} />
      <Monitor x={(world.colleagueDesk.x + world.colleagueDesk.w / 2 + 36) * M} z={world.colleagueDesk.y * M + 0.16} on accent="#3b9eff" pal={pal} />
      <group position={v(world.colleague)} rotation={[0, Math.PI, 0]}>
        <Person shirt="#2f9e72" pal={pal} seated typing />
      </group>
      <Label text="Night shift" at={new THREE.Vector3(world.colleague.x * M, 0.012, (world.colleague.y + 56) * M)} h={0.15} color={pal.text2} center mono />

      {/* Rack, plants, coffee, the door */}
      <mesh position={[(world.rack.x + world.rack.w / 2) * M, 1.05, (world.rack.y + world.rack.h / 2) * M]} castShadow>
        <boxGeometry args={[world.rack.w * M + 0.3, 2.1, world.rack.h * M]} />
        <meshStandardMaterial color="#0f1220" roughness={0.5} metalness={0.3} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <Pulse key={i} speed={3 + (i % 4)} amount={0.4}>
          <mesh position={[(world.rack.x - 3) * M, 0.4 + i * 0.16, (world.rack.y + 30 + (i % 3) * 60) * M]}>
            <boxGeometry args={[0.01, 0.025, 0.04]} />
            <meshBasicMaterial color={i % 4 ? "#34d399" : "#60a5fa"} toneMapped={false} />
          </mesh>
        </Pulse>
      ))}
      {world.plants.map((p, i) => (
        <group key={i} position={v(p)}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.12, 0.44, 16]} />
            <meshStandardMaterial color={pal.chair} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <icosahedronGeometry args={[0.32, 1]} />
            <meshStandardMaterial color="#3f8f60" roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
      <Desk x={world.coffee.x * M} z={world.coffee.y * M} w={world.coffee.w * M} d={world.coffee.h * M} pal={pal} />
      <mesh position={[(world.coffee.x + 32) * M, 0.95, (world.coffee.y + 22) * M]} castShadow>
        <boxGeometry args={[0.28, 0.4, 0.28]} />
        <meshStandardMaterial color={pal.mon} roughness={0.4} />
      </mesh>
      <Label text="Coffee" at={new THREE.Vector3((world.coffee.x + world.coffee.w / 2) * M, 0.012, (world.coffee.y + 74) * M)} h={0.14} color={pal.text2} center mono />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(world.door.x + world.door.w / 2) * M, 0.006, (world.height - 30) * M]}>
        <planeGeometry args={[world.door.w * M, 0.5]} />
        <meshStandardMaterial color="#5546e0" roughness={0.9} />
      </mesh>
      <Label text="Entrance" at={new THREE.Vector3((world.door.x + world.door.w / 2) * M, 0.012, (world.height - 64) * M)} h={0.15} color={pal.text2} center mono />

      {/* Where you are heading */}
      {view.path.map((p, i) =>
        i % 3 ? null : (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[p.x * M, 0.015, p.y * M]}>
            <circleGeometry args={[0.04, 12]} />
            <meshBasicMaterial color="#6b5cf0" />
          </mesh>
        )
      )}

      <You floor={floor} pal={pal} placeTag={placeTag} />
    </>
  );
}

export function SocOffice3D({ floor }: { floor: SocFloor }) {
  const dark = useAcademyTheme() === "dark";
  const pal = dark ? NIGHT : DAY;
  const box = useRef<HTMLDivElement>(null);
  const zoom = useRef(1);
  const tag = useRef<HTMLSpanElement>(null);
  const n = floor.view.near;
  const seated = floor.seated !== null;
  const placeTag = useCallback((x: number, y: number) => {
    const el = tag.current;
    if (el) el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  }, []);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    box.current?.focus({ preventScroll: true });
    const el = box.current;
    if (!el) return;
    // The wheel zooms the room rather than scrolling the page while you are in it.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom.current = Math.max(0.55, Math.min(1.7, zoom.current * (e.deltaY > 0 ? 1.08 : 0.92)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={box}
      className={`sw sw--3d${focused ? " is-focused" : ""}`}
      tabIndex={0}
      role="application"
      aria-label="The PurveX Financial SOC in 3D. Arrow keys or WASD to walk, E to sit at a workstation or talk to the Coach, the mouse wheel to zoom."
      onKeyDown={floor.onKeyDown}
      onKeyUp={floor.onKeyUp}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        floor.releaseKeys();
      }}
      onPointerDown={() => box.current?.focus({ preventScroll: true })}
    >
      <Canvas shadows="percentage" dpr={[1, 1.75]} camera={{ fov: 42, position: [2, 7, 16], near: 0.1, far: 80 }} gl={{ antialias: true }}>
        <Scene floor={floor} pal={pal} dark={dark} placeTag={placeTag} />
        <FollowCam floor={floor} zoom={zoom} />
      </Canvas>
      <span ref={tag} className={`sw-key sw-key--3d${seated ? " sw-key--signin" : ""}`} hidden={!((n || seated) && !floor.talking)}>
        {seated ? (
          "Signing in…"
        ) : (
          <>
            <kbd>E</kbd> {n?.kind === "coach" ? "Talk" : "Sit down"}
          </>
        )}
      </span>
      {!focused && <span className="sw-wake">Click the room to walk</span>}
    </div>
  );
}
