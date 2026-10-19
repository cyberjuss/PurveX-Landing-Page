"use client";

import type { CSSProperties } from "react";
import { ArrowRight, Check, Clock, Footprints, Headset, MapPin } from "lucide-react";
import { WALL_H, WORLD_W } from "@/lib/soc-world";
import { useCoach } from "./coach-context";
import type { SocFloor } from "./use-soc-floor";

const trim = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
export const stationNo = (i: number) => String(i + 1).padStart(2, "0");

// The words that go with the SOC floor, whichever way it is drawn: a map you
// can click to walk, progress, what is in front of you with the one thing to
// do about it, the Coach's questions, and the controls.
export function SocGuide({ floor, mapFrame }: { floor: SocFloor; mapFrame?: boolean }) {
  const coach = useCoach();
  const { labs, world, done, nextUp, cleared, view, seated, talking } = floor;
  const n = view.near;
  const focusI = seated ?? (n?.kind === "station" ? n.i : null);
  const shown = focusI !== null ? labs[focusI] : null;
  const podOf = (i: number) => world.pods.find((p) => p.stations.includes(i));

  return (
    <aside className="sw-side" aria-label="Floor guide">
      <svg
        className="sw-map"
        viewBox={`0 0 ${WORLD_W} ${world.height}`}
        role="img"
        aria-label="Map of the floor. Click to walk there."
        onClick={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          floor.walkTo({ x: ((e.clientX - r.left) / r.width) * WORLD_W, y: ((e.clientY - r.top) / r.height) * world.height });
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
        {mapFrame && <rect x={view.cam.x} y={view.cam.y} width={view.cw} height={view.ch} rx="10" className="sw-map__cam" />}
        <circle cx={view.me.x} cy={view.me.y} r="30" className="sw-map__me" />
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
            <button type="button" className="sw-card__go" onClick={floor.faceCoach}>
              Talk to the Coach <kbd>E</kbd>
            </button>
          )}
        </section>
      ) : shown && focusI !== null ? (
        <section className="sw-card" style={{ ["--acc" as string]: shown.accent } as CSSProperties}>
          <p className="sw-card__kicker">
            <MapPin /> Workstation {stationNo(focusI)} · {podOf(focusI)?.label}
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
          <button type="button" className="sw-card__go" onClick={() => floor.sit(focusI)} disabled={seated !== null}>
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
          <button type="button" className="sw-card__go sw-card__go--quiet" onClick={() => floor.walkTo(world.stations[nextUp].seat)}>
            <Footprints /> Walk to workstation {stationNo(nextUp)}
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
  );
}
