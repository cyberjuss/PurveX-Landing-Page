"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Check, ChevronDown, Clock } from "lucide-react";
import type { LabMeta } from "@/lib/academy-labs";
import { slugify, useAcademyProgress } from "./academy-progress";
import "./lab-map.css";

/** `phase` is e.g. "Phase 2 · Threat Detection & Log Analysis"; week numbers restart in each phase. */
type SocLab = LabMeta & { week?: string; phase?: string };

// The labs drawn as a transit line: one route, a colour per week, each lab a
// station. Finished track is drawn solid, the rest faint, and the next station
// is ringed. Nothing on it that a line diagram would not have.

const LINE_COLOURS = ["#1f5fae", "#0e7f76", "#b8641c", "#7b3f91", "#2e7d3a", "#b23a48", "#56692a", "#3d5a80"];
const KEY_PREF = "purvex.labmap.key";
const ROW = 150;
const TOP = 64;
const TURN = 95;
const R = 22;

const no = (i: number) => String(i + 1).padStart(2, "0");

/** A title broken into at most three lines of about `n` characters. */
function lines(t: string, n: number): string[] {
  const out = [""];
  for (const w of t.split(" ")) {
    const cur = out[out.length - 1];
    if (!cur || (cur + " " + w).length <= n) out[out.length - 1] = cur ? `${cur} ${w}` : w;
    else if (out.length < 3) out.push(w);
    else {
      out[2] = `${out[2]} ${w}`.length > n ? `${out[2].slice(0, n - 1)}…` : `${out[2]} ${w}`;
      break;
    }
  }
  return out;
}

export function LabMap({ labs }: { labs: SocLab[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(4);
  const { isLabDone } = useAcademyProgress();
  const done = labs.map((l) => isLabDone(l.phaseSlug, l.entrySlug, slugify(l.title)));
  const nextUp = done.findIndex((d) => !d);
  const cleared = done.filter(Boolean).length;
  // The station whose card is showing. Hover or focus opens it; leaving closes
  // it after a beat, so the pointer can cross onto the card and press Start.
  const [open, setOpen] = useState<number | null>(null);
  const [keyOpen, setKeyOpen] = useState(true);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(KEY_PREF) === "closed") setKeyOpen(false);
    } catch {}
  }, []);
  const toggleKey = () =>
    setKeyOpen((was) => {
      try {
        localStorage.setItem(KEY_PREF, was ? "closed" : "open");
      } catch {}
      return !was;
    });
  const closing = useRef(0);
  const show = (i: number) => {
    window.clearTimeout(closing.current);
    setOpen(i);
  };
  const hide = () => {
    window.clearTimeout(closing.current);
    closing.current = window.setTimeout(() => setOpen(null), 180);
  };
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest(".lm-stop, .lm-pop")) setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);
  useEffect(() => () => window.clearTimeout(closing.current), []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setCols(el.getBoundingClientRect().width < 680 ? 2 : 4);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = cols === 2;
  const W = narrow ? 560 : 1000;
  const padX = narrow ? 120 : 120;
  const gapX = (W - 2 * padX) / (cols - 1);

  const map = useMemo(() => {
    const at = (k: number) => {
      const r = Math.floor(k / cols);
      const c = k % cols;
      return { x: padX + (r % 2 ? cols - 1 - c : c) * gapX, y: TOP + r * ROW };
    };
    const stops = labs.map((_, i) => at(i));

    // One line per week, in order. Week numbers restart in each phase, so a
    // line belongs to a phase as well as a week.
    const weeks: { label: string; phase: string; first: number; stops: number[]; colour: string; n: number }[] = [];
    labs.forEach((l, i) => {
      const label = l.week ?? "Labs";
      const phase = l.phase ?? "";
      const last = weeks[weeks.length - 1];
      if (last && last.label === label && last.phase === phase) last.stops.push(i);
      else {
        // The line's own number, not the lesson's: a week with no lab draws no
        // line, so numbering a line from its "Week N" title left gaps the
        // moment a phase had a lab-less week (Phase 2's new lesson-only weeks
        // did exactly that -- the map jumped straight from Start to "3").
        // Counting lines already drawn for this phase keeps it gapless and
        // still restarts at 1 per phase.
        const n = weeks.filter((w) => w.phase === phase).length + 1;
        weeks.push({ label, phase, first: i, stops: [i], colour: LINE_COLOURS[weeks.length % LINE_COLOURS.length], n });
      }
    });
    const weekOf = labs.map((_, i) => weeks.find((w) => w.stops.includes(i))!);

    // Track between consecutive stations: straight along a row, and at the end
    // of a row out, down and back in with rounded corners.
    const leg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      if (a.y === b.y) return `M${a.x} ${a.y} L${b.x} ${b.y}`;
      const s = a.x > W / 2 ? 1 : -1;
      const ex = a.x + s * TURN;
      return `M${a.x} ${a.y} L${ex - s * R} ${a.y} Q${ex} ${a.y} ${ex} ${a.y + R} L${ex} ${b.y - R} Q${ex} ${b.y} ${ex - s * R} ${b.y} L${b.x} ${b.y}`;
    };
    const legs = stops.slice(1).map((b, k) => leg(stops[k], b));

    const first = stops[0];
    const last = stops[stops.length - 1];
    const lastRow = Math.floor((labs.length - 1) / cols);
    const outDir = lastRow % 2 ? -1 : 1;
    const start = { x: first.x - 70, y: first.y };
    const end = { x: last.x + outDir * 70, y: last.y };
    return { stops, weeks, weekOf, legs, start, end, outDir, height: last.y + 90 };
  }, [labs, cols, padX, gapX, W]);

  const shown = open !== null ? labs[open] : null;
  const shownWeek = open !== null ? map.weekOf[open] : null;
  // Where the card sits: under the station, or over it on the lower rows, and
  // nudged in from the sides so it never hangs off the map.
  const popStyle = (() => {
    if (open === null) return undefined;
    const p = map.stops[open];
    const below = p.y < map.height * 0.6;
    const fx = p.x / W;
    const shift = fx < 0.22 ? "-12%" : fx > 0.78 ? "-88%" : "-50%";
    return {
      left: `${fx * 100}%`,
      top: `${(p.y / map.height) * 100}%`,
      transform: below ? `translate(${shift}, 60px)` : `translate(${shift}, calc(-100% - 22px))`,
      ["--pop-acc" as string]: map.weekOf[open].colour,
    } as CSSProperties;
  })();

  return (
    <div className="lm-wrap">
      <div className="lm-bar">
        <p className="lm-bar__count">
          {cleared} of {labs.length} complete
          <i style={{ ["--pct" as string]: labs.length ? cleared / labs.length : 0 }} />
        </p>
      </div>

      <div ref={box} className={`lm${narrow ? " lm--narrow" : ""}`}>
        <section className={`lm-key${keyOpen ? "" : " is-closed"}`} aria-label="Map key">
          <button type="button" className="lm-key__title" onClick={toggleKey} aria-expanded={keyOpen} aria-controls="lm-key-body">
            Key
            <ChevronDown aria-hidden />
          </button>
          <div className="lm-key__cols" id="lm-key-body" hidden={!keyOpen}>
            <div>
              <p className="lm-key__head">Lines</p>
              <ul className="lm-key__lines">
                {map.weeks.map((w, k) => (
                  <Fragment key={w.first}>
                  {w.phase && w.phase !== map.weeks[k - 1]?.phase && <li className="lm-key__phase">{w.phase}</li>}
                  <li style={{ ["--line" as string]: w.colour } as CSSProperties}>
                    <svg viewBox="0 0 44 16" className="lm-key__swatch" aria-hidden="true">
                      <path d="M2 8 H42" className="lm-track is-run" />
                    </svg>
                    <span className="lm-key__bullet">{w.n}</span>
                    <span className="lm-key__name">{w.label}</span>
                    <span className="lm-key__count">
                      {w.stops.filter((i) => done[i]).length}/{w.stops.length}
                    </span>
                  </li>
                  </Fragment>
                ))}
              </ul>
            </div>
            <div>
              <p className="lm-key__head">Stations</p>
              <ul className="lm-key__marks">
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="7" className="lm-key__dot" />
                  </svg>
                  Not started
                </li>
                <li style={{ ["--line" as string]: map.weekOf[nextUp >= 0 ? nextUp : 0].colour } as CSSProperties}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" className="lm-key__dot is-next" />
                  </svg>
                  Next lab
                </li>
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="7" className="lm-key__dot is-done" />
                  </svg>
                  Complete
                </li>
                <li style={{ ["--line" as string]: map.weeks[0]?.colour } as CSSProperties}>
                  <svg viewBox="0 0 24 16" className="lm-key__swatch" aria-hidden="true">
                    <path d="M2 8 H11" className="lm-track is-run" />
                    <path d="M13 8 H22" className="lm-track" />
                  </svg>
                  Traveled, then ahead
                </li>
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3 V21" className="lm-key__end" />
                  </svg>
                  Start and Finish
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="lm__stage">
        <svg viewBox={`0 0 ${W} ${map.height}`} className="lm__svg" role="group" aria-label={`Route of the labs. ${cleared} of ${labs.length} complete.`}>
          {/* Track */}
          <path d={`M${map.start.x} ${map.start.y} L${map.stops[0].x} ${map.stops[0].y}`} className="lm-track is-run" style={{ ["--line" as string]: map.weekOf[0].colour } as CSSProperties} />
          {map.legs.map((d, k) => (
            <path key={k} d={d} className={`lm-track${done[k] ? " is-run" : ""}`} style={{ ["--line" as string]: map.weekOf[k + 1].colour } as CSSProperties} />
          ))}
          <path
            d={`M${map.stops[labs.length - 1].x} ${map.stops[labs.length - 1].y} L${map.end.x} ${map.end.y}`}
            className={`lm-track${nextUp < 0 ? " is-run" : ""}`}
            style={{ ["--line" as string]: map.weekOf[labs.length - 1].colour } as CSSProperties}
          />

          {/* Termini */}
          <g className="lm-end">
            <path d={`M${map.start.x} ${map.start.y - 13} V${map.start.y + 13}`} />
            <text x={map.start.x} y={map.start.y - 22} textAnchor="middle">
              Start
            </text>
            <path d={`M${map.end.x} ${map.end.y - 13} V${map.end.y + 13}`} />
            <text x={map.end.x} y={map.end.y - 22} textAnchor="middle">
              Finish
            </text>
          </g>

          {/* A week's number where its line begins */}
          {map.weeks.map((w) => {
            const s = map.stops[w.first];
            return (
              <g key={w.first} transform={`translate(${s.x} ${s.y - 30})`} className="lm-bullet" style={{ ["--line" as string]: w.colour } as CSSProperties}>
                <circle r="11" />
                <text y="4" textAnchor="middle">
                  {w.n}
                </text>
              </g>
            );
          })}

          {/* Stations */}
          {labs.map((l, i) => {
            const p = map.stops[i];
            const isNext = i === nextUp;
            return (
              <g
                key={l.slug}
                transform={`translate(${p.x} ${p.y})`}
                className={`lm-stop${done[i] ? " is-done" : ""}${isNext ? " is-next" : ""}${open === i ? " is-sel" : ""}`}
                style={{ ["--line" as string]: map.weekOf[i].colour } as CSSProperties}
                role="button"
                tabIndex={0}
                aria-expanded={open === i}
                aria-label={`${no(i)} ${l.title}${done[i] ? ", complete" : isNext ? ", next" : ""}`}
                onPointerEnter={(e) => e.pointerType === "mouse" && show(i)}
                onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
                onFocus={() => show(i)}
                onClick={() => (open === i ? setOpen(null) : show(i))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    show(i);
                  }
                }}
              >
                <rect x="-70" y="-22" width="140" height="96" className="lm-stop__hit" />
                <circle r={isNext ? 11 : 8} className="lm-stop__dot" />
                {lines(l.title, narrow ? 17 : 20).map((t, k) => (
                  <text key={k} y={30 + k * 16} textAnchor="middle" className="lm-stop__name">
                    {t}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>

        {shown && shownWeek && open !== null && (
          <div className="lm-pop" style={popStyle} onPointerEnter={() => show(open)} onPointerLeave={(e) => e.pointerType === "mouse" && hide()}>
          <Link
            key={open}
            href={`/range/labs/${shown.slug}`}
            className="sw-card"
            aria-label={`${shown.title}. ${done[open] ? "Run it again." : "Start this lab."}`}
          >
            <p className="sw-card__kicker">
              Stop {no(open)} · {shownWeek.phase ? `${shownWeek.phase.split(" · ")[0]} · ` : ""}
              {shownWeek.label}
            </p>
            <h3>{shown.title}</h3>
            <p className="sw-card__text">{shown.blurb}</p>
            <p className="sw-card__meta">
              <span>{shown.skill}</span>
              <span>
                <Clock /> {shown.minutes} min
              </span>
              {done[open] ? (
                <span className="is-done">
                  <Check /> Complete
                </span>
              ) : open === nextUp ? (
                <span>Next</span>
              ) : null}
            </p>
            <span className="sw-card__go" aria-hidden="true">
              {done[open] ? "Run it again" : "Start this lab"} <ArrowRight />
            </span>
          </Link>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
