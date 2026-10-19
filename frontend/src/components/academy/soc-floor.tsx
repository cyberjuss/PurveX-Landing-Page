"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Clock, DoorOpen } from "lucide-react";
import type { LabMeta } from "@/lib/academy-labs";
import { accountInitials, useAcademyAccount } from "./academy-account";
import { slugify, useAcademyProgress } from "./academy-progress";
import { PersonSeated, PersonStanding } from "./soc-person";
import "./soc-floor.css";

const SEAT_KEY = "academy-soc-seat";

/** One workstation: a desk, two monitors in the lab's accent, and a chair, or you in it. */
function StationArt({ accent, on, seated, initials }: { accent: string; on: boolean; seated: boolean; initials: string }) {
  return (
    <svg viewBox="0 0 200 128" className={`soc-desk${on ? " is-on" : ""}`} style={{ ["--acc" as string]: accent }} aria-hidden>
      {/* monitors */}
      {[34, 104].map((x, i) => (
        <g key={x}>
          <rect x={x + 26} y="50" width="10" height="12" className="soc-desk__stand" />
          <rect x={x} y="8" width="62" height="44" rx="3" className="soc-desk__bezel" />
          <rect x={x + 4} y="12" width="54" height="36" rx="1.5" className="soc-desk__screen" />
          <g className="soc-desk__lines" style={{ ["--d" as string]: `${i * 0.35}s` }}>
            {[0, 1, 2, 3, 4].map((r) => (
              <rect key={r} x={x + 9} y={17 + r * 6.5} width={[34, 22, 40, 28, 16][(r + i) % 5]} height="2.6" rx="1.3" />
            ))}
          </g>
        </g>
      ))}
      {/* desk */}
      <path d="M8 62 H192 L200 74 H0 Z" className="soc-desk__top" />
      <rect x="0" y="74" width="200" height="8" className="soc-desk__edge" />
      <rect x="74" y="64" width="52" height="7" rx="2" className="soc-desk__keys" />
      {/* chair, or you in it */}
      {seated ? (
        <g transform="translate(100 90) scale(0.68)">
          <PersonSeated initials={initials} pose="typing" />
        </g>
      ) : (
        <g className="soc-desk__chair">
          <rect x="78" y="86" width="44" height="34" rx="9" />
          <rect x="96" y="118" width="8" height="8" />
        </g>
      )}
    </svg>
  );
}

// The SOC floor: the room the labs live in. A video wall along the back, a
// workstation per lab, and the student at the door. Clicking a station walks
// them over, sits them down and switches the screens on, then opens the lab.
export function SocFloor({ labs }: { labs: LabMeta[] }) {
  const router = useRouter();
  const student = useAcademyAccount();
  const initials = accountInitials(student);
  const { isLabDone } = useAcademyProgress();
  const floor = useRef<HTMLDivElement>(null);
  const door = useRef<HTMLDivElement>(null);
  const stations = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [walking, setWalking] = useState(false);
  const [seated, setSeated] = useState<string | null>(null);
  const [going, setGoing] = useState<string | null>(null);
  const [ms, setMs] = useState(0);

  const nextUp = labs.find((l) => !isLabDone(l.phaseSlug, l.entrySlug, slugify(l.title)))?.slug ?? null;

  // Where a point on an element sits inside the floor, for the walker.
  const at = (el: Element | null, fx: number, fy: number) => {
    const f = floor.current?.getBoundingClientRect();
    const r = el?.getBoundingClientRect();
    if (!f || !r) return null;
    return { x: r.left - f.left + r.width * fx, y: r.top - f.top + r.height * fy };
  };

  // Start at the door, or back in the chair you last sat in.
  useEffect(() => {
    let last: string | null = null;
    try {
      last = window.localStorage.getItem(SEAT_KEY);
    } catch {}
    const frame = window.requestAnimationFrame(() => {
      if (last && stations.current[last]) setSeated(last);
      else setPos(at(door.current, 0.5, 0.2));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function sitAt(slug: string) {
    if (going) return;
    const target = at(stations.current[slug], 0.5, 0.62);
    if (!target) return;
    // Getting up from a chair starts the walk from it; otherwise from where you stand.
    const from = seated ? at(stations.current[seated], 0.5, 0.62) : pos;
    const start = from ?? at(door.current, 0.5, 0.2);
    if (!start) return;
    const dist = Math.hypot(target.x - start.x, target.y - start.y);
    const dur = Math.round(Math.min(1700, Math.max(650, dist * 1.5)));
    setGoing(slug);
    setSeated(null);
    setPos(start);
    setMs(0);
    setWalking(true);
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        setMs(dur);
        setPos(target);
      })
    );
    window.setTimeout(() => {
      setWalking(false);
      setSeated(slug);
      try {
        window.localStorage.setItem(SEAT_KEY, slug);
      } catch {}
      window.setTimeout(() => router.push(`/range/labs/${slug}`), 1100);
    }, dur);
  }

  const walker: CSSProperties | undefined = pos ? { transform: `translate(${pos.x}px, ${pos.y}px)`, transitionDuration: `${ms}ms` } : undefined;

  return (
    <div className="soc">
      <div className="soc-wall" aria-hidden>
        <div className="soc-wall__screen soc-wall__screen--map">
          <span className="soc-wall__label">Threat map</span>
          <svg viewBox="0 0 300 120">
            <path d="M20 70 q30 -40 70 -20 t70 0 t60 -10 t60 20" className="soc-wall__arc" />
            <path d="M40 90 q60 -70 140 -40 t90 10" className="soc-wall__arc soc-wall__arc--2" />
            {[[40, 90], [90, 50], [160, 50], [222, 42], [270, 62]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" className="soc-wall__dot" style={{ ["--i" as string]: i }} />
            ))}
          </svg>
        </div>
        <div className="soc-wall__screen soc-wall__screen--queue">
          <span className="soc-wall__label">Alert queue</span>
          <div className="soc-wall__clip">
          <ul>
            {["4625 x40 · alex.rivera", "New admin · svc-backup-job", "SYN burst · 10.0.1.23", "Hash mismatch · vpn-client", "Sign-in 02:14 · WM-WKS07", "4740 lockout · riley.kwan"].map((t, i) => (
              <li key={i} style={{ ["--i" as string]: i }}>
                <i className={`is-${["p1", "p2", "p3"][i % 3]}`} />
                {t}
              </li>
            ))}
          </ul>
          </div>
        </div>
        <div className="soc-wall__screen soc-wall__screen--stat">
          <span className="soc-wall__label">Labs cleared</span>
          <b>
            {labs.filter((l) => isLabDone(l.phaseSlug, l.entrySlug, slugify(l.title))).length}
            <small>/{labs.length}</small>
          </b>
        </div>
      </div>

      <div className="soc-floor" ref={floor}>
        <div className="soc-grid">
          {labs.map((l, i) => {
            const done = isLabDone(l.phaseSlug, l.entrySlug, slugify(l.title));
            const here = seated === l.slug;
            return (
              <button
                key={l.slug}
                type="button"
                ref={(el) => {
                  stations.current[l.slug] = el;
                }}
                className={`soc-station${here ? " is-here" : ""}${going === l.slug ? " is-going" : ""}${done ? " is-done" : ""}${nextUp === l.slug ? " is-next" : ""}`}
                style={{ ["--acc" as string]: l.accent, ["--i" as string]: i } as CSSProperties}
                onClick={() => sitAt(l.slug)}
                aria-label={`${l.title}. ${l.skill}, about ${l.minutes} minutes${done ? ", done" : ""}. Sit down here.`}
              >
                <span className="soc-station__no">{String(i + 1).padStart(2, "0")}</span>
                {nextUp === l.slug && !here && <span className="soc-station__beacon">Next up</span>}
                <StationArt accent={l.accent} on={here || done || going === l.slug} seated={here} initials={initials} />
                <span className="soc-station__plate">
                  <span className="soc-station__lamp" aria-hidden />
                  <span className="soc-station__title">{l.title}</span>
                  <span className="soc-station__meta">
                    {l.skill} · <Clock aria-hidden /> {l.minutes} min
                  </span>
                </span>
                <span className="soc-station__tip" aria-hidden>
                  {l.blurb}
                </span>
              </button>
            );
          })}
        </div>

        <div className="soc-door" ref={door} aria-hidden>
          <DoorOpen /> Entrance
        </div>

        {pos && !seated && (
          <div className={`soc-walker${walking ? " is-walking" : ""}`} style={walker} aria-hidden>
            <PersonStanding initials={initials} walking={walking} />
          </div>
        )}
      </div>

      <p className="soc-hint" aria-live="polite">
        {going ? `Sitting down at ${labs.find((l) => l.slug === going)?.title}…` : "Pick a workstation. You will walk over, sit down and the lab opens on its screens."}
      </p>
    </div>
  );
}
