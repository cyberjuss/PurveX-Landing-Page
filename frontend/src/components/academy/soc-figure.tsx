"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Build, HairStyle, Look } from "./soc-people";

// The people on the SOC floor, built from simple solids in code (the site
// cannot load model files). Adult proportions, a torso turned on a lathe from
// a real silhouette, tapered limbs with knees and elbows, a face, tailored
// clothes and a handful of hair styles. Faces +z, feet on y = 0.

type Profile = [number, number][];

/** The silhouette of each build, from the waist (y = 0) up to the base of the neck. */
const TORSO: Record<Build, Profile> = {
  masc: [[0, 0], [0.158, 0], [0.162, 0.06], [0.172, 0.17], [0.188, 0.29], [0.2, 0.38], [0.204, 0.44], [0.188, 0.5], [0.13, 0.545], [0.06, 0.56], [0, 0.56]],
  fem: [[0, 0], [0.142, 0], [0.14, 0.07], [0.15, 0.18], [0.176, 0.28], [0.182, 0.34], [0.168, 0.42], [0.172, 0.46], [0.162, 0.5], [0.118, 0.54], [0.055, 0.552], [0, 0.552]],
  neutral: [[0, 0], [0.15, 0], [0.152, 0.065], [0.162, 0.175], [0.182, 0.29], [0.192, 0.37], [0.19, 0.44], [0.176, 0.5], [0.124, 0.543], [0.058, 0.556], [0, 0.556]],
};
/** Hips and seat, from the top of the legs to the waist. */
const PELVIS: Record<Build, Profile> = {
  masc: [[0, 0], [0.15, 0], [0.16, 0.06], [0.16, 0.12], [0.157, 0.17], [0, 0.17]],
  fem: [[0, 0], [0.155, 0], [0.168, 0.06], [0.16, 0.12], [0.141, 0.17], [0, 0.17]],
  neutral: [[0, 0], [0.152, 0], [0.163, 0.06], [0.16, 0.12], [0.149, 0.17], [0, 0.17]],
};
const DEPTH: Record<Build, number> = { masc: 0.58, fem: 0.6, neutral: 0.59 };

/** Proportions per build: shoulder half-width, arm and leg thickness, and overall height. */
export const BUILD: Record<Build, { shoulder: number; limb: number; scale: number }> = {
  masc: { shoulder: 0.205, limb: 1, scale: 1 },
  fem: { shoulder: 0.178, limb: 0.88, scale: 0.955 },
  neutral: { shoulder: 0.192, limb: 0.94, scale: 0.98 },
};

/** The radius of a profile at height y, read off its straight segments. */
function radiusAt(p: Profile, y: number): number {
  for (let k = 1; k < p.length; k++) {
    const [x0, y0] = p[k - 1];
    const [x1, y1] = p[k];
    if (y >= y0 && y <= y1 && y1 > y0) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return p[1][0];
}

const lathe = new Map<string, THREE.LatheGeometry>();
function latheOf(key: string, p: Profile) {
  let g = lathe.get(key);
  if (!g) {
    g = new THREE.LatheGeometry(
      p.map(([x, y]) => new THREE.Vector2(x, y)),
      40
    );
    lathe.set(key, g);
  }
  return g;
}

/** The open V of a jacket, where the shirt shows. */
const vee = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.05, 0.17);
  s.lineTo(0.05, 0.17);
  s.lineTo(0, -0.04);
  s.closePath();
  return new THREE.ShapeGeometry(s);
})();

const shade = (c: string, k: number) => `#${new THREE.Color(c).multiplyScalar(k).getHexString()}`;

/** Hair on a head whose skull is centred at y = 1.72. */
function Hair({ style, color }: { style: HairStyle; color: string }) {
  const mat = <meshStandardMaterial color={color} roughness={0.85} />;
  const top = (s: number, theta: number) => (
    <mesh position={[0, 1.722, -0.004]} scale={[0.9 * s, 0.99 * s, 0.98 * s]}>
      <sphereGeometry args={[0.106, 40, 24, 0, Math.PI * 2, 0, Math.PI * theta]} />
      {mat}
    </mesh>
  );
  const back = (low: number) => (
    <mesh position={[0, 1.72, -0.004]} scale={[0.9, 1, 0.98]}>
      <sphereGeometry args={[0.107, 40, 24, Math.PI, Math.PI, Math.PI * 0.3, Math.PI * low]} />
      {mat}
    </mesh>
  );
  if (style === "buzz") return <>{top(0.985, 0.4)}{back(0.32)}</>;
  if (style === "short")
    return (
      <>
        {top(1, 0.42)}
        {back(0.36)}
        <mesh position={[0.012, 1.792, 0.052]} rotation={[0.35, 0, -0.18]} scale={[0.82, 0.3, 0.52]}>
          <sphereGeometry args={[0.1, 28, 16]} />
          {mat}
        </mesh>
      </>
    );
  if (style === "bun")
    return (
      <>
        {top(1, 0.46)}
        {back(0.36)}
        <mesh position={[0, 1.79, -0.1]}>
          <sphereGeometry args={[0.046, 24, 16]} />
          {mat}
        </mesh>
      </>
    );
  if (style === "long")
    return (
      <>
        {top(1.02, 0.46)}
        {back(0.5)}
        <RoundedBox args={[0.19, 0.34, 0.05]} radius={0.022} position={[0, 1.6, -0.07]} rotation={[0.12, 0, 0]}>
          {mat}
        </RoundedBox>
        {[-1, 1].map((sx) => (
          <RoundedBox key={sx} args={[0.03, 0.24, 0.07]} radius={0.014} position={[sx * 0.091, 1.645, -0.005]} rotation={[0, 0, sx * -0.05]}>
            {mat}
          </RoundedBox>
        ))}
      </>
    );
  // curly
  return (
    <>
      {top(1.1, 0.48)}
      {back(0.44)}
      {Array.from({ length: 10 }, (_, k) => {
        const a = (k / 10) * Math.PI * 2;
        return (
          <mesh key={k} position={[Math.cos(a) * 0.085, 1.78 + Math.sin(a * 2) * 0.012, Math.sin(a) * 0.08 - 0.01]}>
            <sphereGeometry args={[0.038, 16, 12]} />
            {mat}
          </mesh>
        );
      })}
    </>
  );
}

type Pair = [THREE.Group | null, THREE.Group | null];
type Limbs = { thigh: Pair; shin: Pair; arm: Pair; fore: Pair };

/**
 * A person. Walking swings the legs and arms; sitting folds hip and knee;
 * typing brings the forearms to the keyboard. Standing still, they breathe,
 * shift their weight, glance about and blink.
 */
export function Figure({ look, walking, seated, typing, headset }: { look: Look; walking?: React.RefObject<boolean>; seated?: boolean; typing?: boolean; headset?: boolean }) {
  const build = look.build ?? "masc";
  const B = BUILD[build];
  const limbs = useRef<Limbs>({ thigh: [null, null], shin: [null, null], arm: [null, null], fore: [null, null] });
  const put = (part: keyof Limbs, k: 0 | 1) => (el: THREE.Group | null) => {
    limbs.current[part][k] = el;
  };
  const chest = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const phase = useRef(0);
  // Each person idles on their own clock, so a room of them does not move in step.
  const seed = useMemo(() => [...(look.skin + look.shirt + look.hair)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 997, 7) / 10, [look.skin, look.shirt, look.hair]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + seed;
    const moving = Boolean(walking?.current);
    if (moving) phase.current += dt * 8.5;
    const s = moving ? Math.sin(phase.current) : 0;
    const L = limbs.current;
    for (const k of [0, 1] as const) {
      const side = k ? -1 : 1;
      const th = L.thigh[k];
      const sh = L.shin[k];
      const a = L.arm[k];
      const f = L.fore[k];
      if (th) th.rotation.x = seated ? -Math.PI / 2 : -s * side * 0.48;
      if (sh) sh.rotation.x = seated ? Math.PI / 2 : moving ? Math.max(0, Math.sin(phase.current * side + 1.2)) * 0.65 : 0.02;
      const tap = typing ? Math.sin(t * 20 + k * 1.7) * 0.05 : 0;
      if (a) {
        a.rotation.x = typing ? -0.55 + tap : s * side * 0.38 + (moving ? 0 : Math.sin(t * 0.7 + k) * 0.02);
        a.rotation.z = side * 0.06;
      }
      if (f) f.rotation.x = typing ? -1.0 : moving ? -0.3 : -0.14;
    }
    if (chest.current) chest.current.scale.y = 1 + Math.sin(t * 1.4) * 0.007;
    if (hips.current) hips.current.rotation.z = moving || seated ? 0 : Math.sin(t * 0.45) * 0.018;
    if (head.current) {
      head.current.rotation.y = moving || typing ? 0 : Math.sin(t * 0.31) * 0.16;
      head.current.rotation.x = typing ? 0.18 : Math.sin(t * 0.23) * 0.03;
    }
    // A blink every few seconds.
    if (eyes.current) eyes.current.scale.y = (t % 4.3) < 0.12 ? 0.15 : 1;
  });

  const top = look.jacket ?? look.shirt;
  const cloth = (c: string, rough = 0.86) => <meshStandardMaterial color={c} roughness={rough} />;
  const skin = <meshStandardMaterial color={look.skin} roughness={0.52} />;
  const lip = shade(look.skin, 0.78);
  const brow = shade(look.hair, 0.9);
  const depth = DEPTH[build];
  // How far the front of the torso stands out at height y above the waist.
  const zAt = (y: number) => radiusAt(TORSO[build], y) * depth;

  return (
    <group position={[0, seated ? 0.5 - 0.93 * B.scale : 0, 0]} scale={B.scale}>
      <group ref={hips}>
        {/* Legs: tapered trousers with a knee, and leather shoes */}
        {([0, 1] as const).map((k) => (
          <group key={k} ref={put("thigh", k)} position={[k ? -0.092 : 0.092, 0.93, 0]}>
            <mesh position={[0, -0.215, 0]} castShadow>
              <cylinderGeometry args={[0.08 * B.limb, 0.06 * B.limb, 0.43, 20]} />
              {cloth(look.trousers)}
            </mesh>
            <group ref={put("shin", k)} position={[0, -0.43, 0]}>
              <mesh>
                <sphereGeometry args={[0.06 * B.limb, 16, 12]} />
                {cloth(look.trousers)}
              </mesh>
              <mesh position={[0, -0.215, 0]} castShadow>
                <cylinderGeometry args={[0.058 * B.limb, 0.05 * B.limb, 0.43, 20]} />
                {cloth(look.trousers)}
              </mesh>
              <group position={[0, -0.44, 0.04]}>
                <RoundedBox args={[0.092, 0.07, 0.24]} radius={0.03} position={[0, 0.01, 0]} castShadow>
                  <meshStandardMaterial color="#17130f" roughness={0.38} metalness={0.05} />
                </RoundedBox>
                <mesh position={[0, -0.025, 0.005]}>
                  <boxGeometry args={[0.096, 0.016, 0.245]} />
                  <meshStandardMaterial color="#3a3029" roughness={0.7} />
                </mesh>
              </group>
            </group>
          </group>
        ))}
        {/* Hips, belt and buckle */}
        <mesh position={[0, 0.86, 0]} scale={[1, 1, 0.64]} geometry={latheOf(`p-${build}`, PELVIS[build])} castShadow>
          {cloth(look.trousers)}
        </mesh>
        <mesh position={[0, 1.015, 0]} scale={[1, 1, depth + 0.02]}>
          <cylinderGeometry args={[TORSO[build][1][0] + 0.006, TORSO[build][1][0] + 0.006, 0.035, 40, 1, true]} />
          <meshStandardMaterial color="#1a1613" roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.015, TORSO[build][1][0] * (depth + 0.02) + 0.003]}>
          <boxGeometry args={[0.032, 0.026, 0.006]} />
          <meshStandardMaterial color="#a7a19a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Torso: shirt, or a jacket open over the shirt */}
        <group ref={chest} position={[0, 1.0, 0]}>
          <mesh scale={[1, 1, depth]} geometry={latheOf(`t-${build}`, TORSO[build])} castShadow>
            {cloth(top)}
          </mesh>
          {look.jacket ? (
            <>
              <mesh geometry={vee} position={[0, 0.34, zAt(0.42) + 0.004]}>
                <meshStandardMaterial color={look.shirt} roughness={0.7} />
              </mesh>
              {/* Lapels: a darker edge along each side of the V */}
              {[-1, 1].map((sx) => (
                <mesh key={sx} position={[sx * 0.04, 0.42, zAt(0.42) + 0.006]} rotation={[0, 0, sx * -0.24]}>
                  <boxGeometry args={[0.018, 0.2, 0.006]} />
                  {cloth(shade(top, 0.7), 0.7)}
                </mesh>
              ))}
              {[0.2, 0.12].map((y) => (
                <mesh key={y} position={[0, y, zAt(y) + 0.004]}>
                  <sphereGeometry args={[0.009, 10, 8]} />
                  <meshStandardMaterial color="#121214" roughness={0.4} />
                </mesh>
              ))}
            </>
          ) : (
            <>

              {[0.36, 0.27, 0.18, 0.09].map((y) => (
                <mesh key={y} position={[0, y, zAt(y) + 0.003]}>
                  <sphereGeometry args={[0.006, 8, 6]} />
                  <meshStandardMaterial color="#d8d6d0" roughness={0.4} />
                </mesh>
              ))}
            </>
          )}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * (B.shoulder - 0.012), 0.47, 0]} scale={[1, 0.85, 0.9]} castShadow>
              <sphereGeometry args={[0.066 * B.limb, 20, 14]} />
              {cloth(top)}
            </mesh>
          ))}
        </group>

        {/* Arms: sleeve to the elbow, forearm, cuff, hand with a thumb */}
        {([0, 1] as const).map((k) => {
          const side = k ? -1 : 1;
          return (
            <group key={k} ref={put("arm", k)} position={[side * (B.shoulder + 0.03), 1.48, 0]}>
              <mesh position={[0, -0.15, 0]} castShadow>
                <cylinderGeometry args={[0.054 * B.limb, 0.046 * B.limb, 0.3, 18]} />
                {cloth(top)}
              </mesh>
              <group ref={put("fore", k)} position={[0, -0.3, 0]}>
                <mesh>
                  <sphereGeometry args={[0.046 * B.limb, 14, 10]} />
                  {cloth(top)}
                </mesh>
                <mesh position={[0, -0.125, 0]} castShadow>
                  <cylinderGeometry args={[0.045 * B.limb, 0.038 * B.limb, 0.25, 18]} />
                  {cloth(top)}
                </mesh>
                {look.jacket && (
                  <mesh position={[0, -0.255, 0]}>
                    <cylinderGeometry args={[0.037 * B.limb, 0.037 * B.limb, 0.022, 16]} />
                    {cloth(look.shirt, 0.7)}
                  </mesh>
                )}
                <group position={[0, -0.32, 0.004]}>
                  <RoundedBox args={[0.055 * B.limb, 0.085, 0.028]} radius={0.012} castShadow>
                    {skin}
                  </RoundedBox>
                  <mesh position={[side * -0.026, 0.012, 0.012]} rotation={[0.2, 0, side * 0.5]}>
                    <capsuleGeometry args={[0.009, 0.03, 4, 8]} />
                    {skin}
                  </mesh>
                </group>
              </group>
            </group>
          );
        })}

        {/* Neck and collar */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.046, 0.054, 0.13, 18]} />
          {skin}
        </mesh>
        <mesh position={[0, 1.565, 0]} scale={[1, 1, 0.95]}>
          <cylinderGeometry args={[0.062, 0.068, 0.045, 24, 1, true, Math.PI * 0.12, Math.PI * 1.76]} />
          <meshStandardMaterial color={look.shirt} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * 0.026, 1.552, 0.052]} rotation={[-0.35, 0, sx * 0.75]}>
            <boxGeometry args={[0.04, 0.026, 0.004]} />
            <meshStandardMaterial color={look.shirt} roughness={0.7} />
          </mesh>
        ))}

        {/* Head: skull, jaw, ears, face, hair. Pivots at the neck. */}
        <group ref={head} position={[0, 1.6, 0]}>
          <group position={[0, -1.6, 0]}>
            <mesh position={[0, 1.72, 0]} scale={[0.88, 1, 0.96]} castShadow>
              <sphereGeometry args={[0.1, 40, 28]} />
              {skin}
            </mesh>
            <mesh position={[0, 1.672, 0.004]} scale={[0.74, 0.62, 0.78]}>
              <sphereGeometry args={[0.085, 32, 20]} />
              {skin}
            </mesh>
            {[-1, 1].map((sx) => (
              <mesh key={sx} position={[sx * 0.087, 1.712, -0.004]} scale={[0.45, 1, 0.75]}>
                <sphereGeometry args={[0.022, 14, 10]} />
                {skin}
              </mesh>
            ))}
            <mesh position={[0, 1.7, 0.094]} rotation={[0.25, 0, 0]} scale={[0.75, 1, 1]}>
              <capsuleGeometry args={[0.011, 0.028, 4, 10]} />
              {skin}
            </mesh>
            <group ref={eyes} position={[0, 1.728, 0]}>
              {[-1, 1].map((sx) => (
                <mesh key={sx} position={[sx * 0.032, 0, 0.088]} scale={[1, 0.7, 0.5]}>
                  <sphereGeometry args={[0.0105, 12, 8]} />
                  <meshStandardMaterial color="#17120f" roughness={0.25} />
                </mesh>
              ))}
            </group>
            {[-1, 1].map((sx) => (
              <mesh key={sx} position={[sx * 0.033, 1.75, 0.087]} rotation={[0, sx * 0.25, sx * -0.08]}>
                <boxGeometry args={[0.03, 0.0065, 0.008]} />
                <meshStandardMaterial color={brow} roughness={0.9} />
              </mesh>
            ))}
            <mesh position={[0, 1.667, 0.085]}>
              <boxGeometry args={[0.03, 0.0055, 0.006]} />
              <meshStandardMaterial color={lip} roughness={0.6} />
            </mesh>
            <Hair style={look.hairStyle ?? "short"} color={look.hair} />
            {headset && (
              <group position={[0, 1.725, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.106, 0.008, 8, 32, Math.PI]} />
                  <meshStandardMaterial color="#1b1d23" metalness={0.6} roughness={0.35} />
                </mesh>
                {[-1, 1].map((sx) => (
                  <mesh key={sx} position={[sx * 0.095, -0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.022, 20]} />
                    <meshStandardMaterial color="#1b1d23" metalness={0.5} roughness={0.4} />
                  </mesh>
                ))}
                <mesh position={[0.07, -0.06, 0.06]} rotation={[0.6, 0.6, 0]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.09, 8]} />
                  <meshStandardMaterial color="#1b1d23" />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}
