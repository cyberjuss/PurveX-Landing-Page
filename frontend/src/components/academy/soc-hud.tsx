"use client";

import { useState, type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Clock, Footprints, Headset, Map as MapIcon, Maximize2, Minimize2, Music, Shirt, Users, VolumeX } from "lucide-react";
import { WALL_H, WORLD_W } from "@/lib/soc-world";
import { useCoachMaybe } from "./coach-context";
import { COWORKERS, coworker } from "./soc-people";
import type { SocFloor } from "./use-soc-floor";

const trim = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
export const stationNo = (i: number) => String(i + 1).padStart(2, "0");
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

/** Keep the room focused when a HUD control is clicked, so the keyboard keeps working. */
const keep = (e: React.MouseEvent | React.PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/** A key you can hold down with the mouse or a finger, and it walks like the keyboard. */
function HoldKey({ k, label, children, floor }: { k: string; label: string; children: React.ReactNode; floor: SocFloor }) {
  return (
    <button
      type="button"
      className="sw-pad__key"
      aria-label={label}
      onPointerDown={(e) => {
        keep(e);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        floor.press(k);
      }}
      onPointerUp={() => floor.release(k)}
      onPointerCancel={() => floor.release(k)}
      onLostPointerCapture={() => floor.release(k)}
      onMouseDown={keep}
    >
      {children}
    </button>
  );
}

/**
 * Everything that used to sit beside the room, now over it: a mini-map and
 * progress at the top left, the toolbar and what is in front of you at the top
 * right, the people you can talk to, and a key pad at the bottom left that
 * works by mouse or touch as well as showing the keyboard keys.
 */
export function SocHud({
  floor,
  music,
  onMusic,
  full,
  onFull,
  onDress,
}: {
  floor: SocFloor;
  music: boolean;
  onMusic: () => void;
  full: boolean;
  onFull: () => void;
  onDress: () => void;
}) {
  const coach = useCoachMaybe();
  const ask = (q: string) => (coach ? coach.ask(q) : window.dispatchEvent(new CustomEvent("academy:ask-coach", { detail: { question: q } })));
  const [people, setPeople] = useState(false);
  const [mapOpen, setMapOpen] = useState(true);
  const { labs, world, done, nextUp, cleared, view, seated, talking, talkTo } = floor;
  const n = view.near;
  const focusI = seated ?? (n?.kind === "station" ? n.i : null);
  const shown = focusI !== null ? labs[focusI] : null;
  const podOf = (i: number) => world.pods.find((p) => p.stations.includes(i));
  const personId = talkTo && talkTo !== "coach" ? talkTo : n?.kind === "person" ? n.id : null;
  const person = personId ? coworker(personId) : null;
  const busy = seated !== null || talkTo !== null;

  return (
    <div className="sw-hud" onPointerDown={(e) => e.stopPropagation()}>
      {/* Top left: where you are */}
      <div className="sw-hud__tl">
        {mapOpen && (
          <svg
            className="sw-hud__map"
            viewBox={`0 0 ${WORLD_W} ${world.height}`}
            role="img"
            aria-label="Map of the floor. Click to walk there."
            onMouseDown={keep}
            onClick={(e) => {
              const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              floor.walkTo({ x: ((e.clientX - r.left) / r.width) * WORLD_W, y: ((e.clientY - r.top) / r.height) * world.height });
            }}
          >
            <rect width={WORLD_W} height={world.height} className="sw-hud__map-floor" />
            <rect width={WORLD_W} height={WALL_H} className="sw-hud__map-wall" />
            {world.pods.map((p) => (
              <rect key={p.label} {...p.rug} width={p.rug.w} height={p.rug.h} rx="14" className="sw-hud__map-zone" />
            ))}
            {world.stations.map((st, i) => (
              <rect key={i} {...st.desk} width={st.desk.w} height={st.desk.h} rx="6" className={`sw-hud__map-desk${done[i] ? " is-done" : ""}${i === nextUp ? " is-next" : ""}`} />
            ))}
            <circle cx={world.coach.x} cy={world.coach.y} r="26" className="sw-hud__map-coach" />
            {world.people.map((p) => (
              <circle key={p.id} cx={p.at.x} cy={p.at.y} r="20" className="sw-hud__map-person" />
            ))}
            <g transform={`translate(${view.me.x} ${view.me.y}) rotate(${view.deg})`}>
              <path d="M0 0 L120 -60 A134 134 0 0 1 120 60 Z" className="sw-hud__map-cone" />
              <circle r="28" className="sw-hud__map-me" />
            </g>
          </svg>
        )}
        <div className="sw-hud__progress">
          <span>
            <b>{cleared}</b>/{labs.length} labs cleared
          </span>
          <i style={{ ["--pct" as string]: labs.length ? cleared / labs.length : 0 }} />
        </div>
      </div>

      {/* Top right: tools, then what is in front of you */}
      <div className="sw-hud__tr">
        <div className="sw-hud__tools" role="toolbar" aria-label="Room controls">
          <button type="button" onMouseDown={keep} onClick={() => setMapOpen((v) => !v)} aria-pressed={mapOpen} title="Mini-map">
            <MapIcon aria-hidden />
          </button>
          <button type="button" onMouseDown={keep} onClick={() => setPeople((v) => !v)} aria-pressed={people} title="People on the floor">
            <Users aria-hidden />
          </button>
          <button type="button" onMouseDown={keep} onClick={onDress} title="Your analyst">
            <Shirt aria-hidden />
          </button>
          <button type="button" onMouseDown={keep} onClick={onMusic} aria-pressed={music} title={music ? "Music off" : "Soft jazz"}>
            {music ? <Music aria-hidden /> : <VolumeX aria-hidden />}
          </button>
          <button type="button" onMouseDown={keep} onClick={onFull} title={full ? "Exit full screen" : "Full screen"}>
            {full ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
          </button>
        </div>

        {people ? (
          <section className="sw-hud__card">
            <p className="sw-hud__kicker">
              <Users /> People on the floor
            </p>
            <ul className="sw-hud__people">
              <li>
                <button type="button" onMouseDown={keep} className={talking ? "is-on" : ""} onClick={() => (floor.goToCoach(), setPeople(false))}>
                  <span className="sw-hud__badge is-coach">AI</span>
                  <span>
                    <b>Coach</b>
                    <small>Tier 2 analyst</small>
                  </span>
                </button>
              </li>
              {(
                [
                  ["soc", "The SOC team · getting hired"],
                  ["firm", "Around PurveX · the environment"],
                ] as const
              ).map(([team, title]) => (
                <li key={team}>
                  <p className="sw-hud__group">{title}</p>
                  <ul className="sw-hud__people">
                    {COWORKERS.filter((c) => c.team === team).map((c) => (
                      <li key={c.id}>
                        <button type="button" onMouseDown={keep} className={talkTo === c.id ? "is-on" : ""} onClick={() => (floor.goToPerson(c.id), setPeople(false))}>
                          <span className="sw-hud__badge">{initials(c.name)}</span>
                          <span>
                            <b>{c.name}</b>
                            <small>
                              {c.role} · {c.where.toLowerCase()}
                            </small>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ) : person ? (
          talkTo === person.id ? null : (
            <section className="sw-hud__card">
              <p className="sw-hud__kicker">
                <Users /> {person.role}
              </p>
              <h3>{person.name}</h3>
              <p className="sw-hud__text">{person.hello}</p>
              <button type="button" className="sw-hud__go" onMouseDown={keep} onClick={() => floor.goToPerson(person.id)}>
                Talk to {person.name.split(" ")[0]} <kbd>E</kbd>
              </button>
            </section>
          )
        ) : talking || n?.kind === "coach" ? (
          <section className="sw-hud__card" style={{ ["--acc" as string]: "#8b7dff" } as CSSProperties}>
            <p className="sw-hud__kicker">
              <Headset /> Coach · Tier 2
            </p>
            <h3>{talking ? "What do you need?" : "The Coach is free"}</h3>
            {talking ? (
              <div className="sw-hud__asks">
                <button type="button" onMouseDown={keep} onClick={() => ask(`I'm on the SOC floor with ${cleared} of ${labs.length} labs done. Which lab should I work next, and what will it train me for?`)}>
                  Which lab should I do next?
                </button>
                {nextUp >= 0 && (
                  <button type="button" onMouseDown={keep} onClick={() => ask(`Before I sit down at "${labs[nextUp].title}": what does it teach, and what should I watch for?`)}>
                    Brief me on {trim(labs[nextUp].title, 30)}
                  </button>
                )}
                {coach && (
                  <button type="button" onMouseDown={keep} onClick={() => coach.setModalOpen(true)}>
                    Open the conversation
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="sw-hud__text">Ask where to start, or get a workstation briefed before you sit down.</p>
                <button type="button" className="sw-hud__go" onMouseDown={keep} onClick={floor.faceCoach}>
                  Talk to the Coach <kbd>E</kbd>
                </button>
              </>
            )}
          </section>
        ) : shown && focusI !== null ? (
          <section className="sw-hud__card" style={{ ["--acc" as string]: shown.accent } as CSSProperties}>
            <p className="sw-hud__kicker">
              Workstation {stationNo(focusI)} · {podOf(focusI)?.label}
            </p>
            <h3>{shown.title}</h3>
            <p className="sw-hud__text">{shown.blurb}</p>
            <p className="sw-hud__meta">
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
            <button type="button" className="sw-hud__go" onMouseDown={keep} onClick={() => floor.sit(focusI)} disabled={seated !== null}>
              {seated !== null ? "Signing in…" : done[focusI] ? "Sit down again" : "Sit down"} {seated === null && <kbd>E</kbd>}
            </button>
          </section>
        ) : nextUp >= 0 ? (
          <section className="sw-hud__card sw-hud__card--quiet" style={{ ["--acc" as string]: labs[nextUp].accent } as CSSProperties}>
            <p className="sw-hud__kicker">Next up · {podOf(nextUp)?.label}</p>
            <h3>{labs[nextUp].title}</h3>
            <button type="button" className="sw-hud__go sw-hud__go--quiet" onMouseDown={keep} onClick={() => floor.walkTo(world.stations[nextUp].seat)}>
              <Footprints /> Walk to workstation {stationNo(nextUp)}
            </button>
          </section>
        ) : (
          <section className="sw-hud__card sw-hud__card--quiet">
            <p className="sw-hud__kicker">
              <Check /> Every lab cleared
            </p>
            <h3>The floor is yours</h3>
          </section>
        )}
      </div>

      {/* Bottom left: keys you can press */}
      {talkTo === null && (
        <div className="sw-pad" aria-label="Controls">
          <div className="sw-pad__arrows">
            <span />
            <HoldKey k="ArrowUp" label="Walk forward" floor={floor}>
              <ArrowUp aria-hidden />
            </HoldKey>
            <span />
            <HoldKey k="ArrowLeft" label="Walk left" floor={floor}>
              <ArrowLeft aria-hidden />
            </HoldKey>
            <HoldKey k="ArrowDown" label="Walk back" floor={floor}>
              <ArrowDown aria-hidden />
            </HoldKey>
            <HoldKey k="ArrowRight" label="Walk right" floor={floor}>
              <ArrowRight aria-hidden />
            </HoldKey>
          </div>
          <div className="sw-pad__side">
            <button type="button" className="sw-pad__key sw-pad__key--wide" onMouseDown={keep} onClick={floor.interact} disabled={!n || busy}>
              <kbd>E</kbd> {n?.kind === "coach" || n?.kind === "person" ? "Talk" : "Sit"}
            </button>
            <p className="sw-pad__hint">Drag to turn · Wheel to zoom</p>
          </div>
        </div>
      )}
    </div>
  );
}
