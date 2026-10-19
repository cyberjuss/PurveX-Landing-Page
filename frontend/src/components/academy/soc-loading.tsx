"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Music, Shirt, VolumeX } from "lucide-react";

const TIPS = [
  "Alex Rivera by the server rack knows every machine on the network.",
  "Marcus on the night shift will tell you what normal looks like at 2 AM.",
  "Dana runs the floor. Ask her how escalations work before your first ticket.",
  "Devon in Compliance explains why three departments are critical.",
  "Sit at a workstation to open its lab. The Coach is at the Tier 2 desk.",
  "Grace sits on the interview panel. Ask her what gets a first SOC job.",
  "Priya on the help desk explains where your tickets come from.",
  "Renee writes the detections. Ask her which event IDs to learn first.",
];
const SHIFT = { day: "Day shift", dusk: "Evening shift", night: "Night shift" } as const;

/**
 * The way in to the 3D floor. While the room loads it shows the firm, a
 * progress bar and a tip; once it is ready, the way in, the option to set up
 * your analyst first, and the music. Entering is a click, which is also what
 * lets the browser start the music.
 *
 * With no props it is only the loading state, for while the 3D code downloads.
 */
export function SocLoading({
  ready = false,
  phase,
  music,
  onMusic,
  onEnter,
  onDress,
}: {
  ready?: boolean;
  phase?: keyof typeof SHIFT;
  music?: boolean;
  onMusic?: () => void;
  onEnter?: () => void;
  onDress?: () => void;
}) {
  const [tip, setTip] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTip((k) => (k + 1) % TIPS.length), 4200);
    return () => window.clearInterval(t);
  }, []);
  const canEnter = ready && onEnter;

  return (
    <div className={`sw-load${canEnter ? " is-ready" : ""}`} onPointerDown={(e) => e.stopPropagation()}>
      <div className="sw-load__inner">
        <div className="sw-load__brand">
          <span className="sw-load__mark" aria-hidden="true">
            P
          </span>
          <div>
            <p className="sw-load__name">PurveX Financial</p>
            <p className="sw-load__sub">Security Operations Center</p>
          </div>
        </div>
        <p className="sw-load__status" aria-live="polite">
          {canEnter ? `Floor ready · ${phase ? SHIFT[phase] : "On shift"}` : "Opening the floor…"}
        </p>
        <div className="sw-load__bar" aria-hidden="true">
          <i />
        </div>
        <p key={tip} className="sw-load__tip">
          {TIPS[tip]}
        </p>
        {canEnter && (
          <div className="sw-load__actions">
            <button type="button" className="sw-load__go" onClick={onEnter} autoFocus>
              Enter the floor <ArrowRight aria-hidden />
            </button>
            {onDress && (
              <button type="button" className="sw-load__alt" onClick={onDress}>
                <Shirt aria-hidden /> Set up your analyst
              </button>
            )}
            {onMusic && (
              <button type="button" className="sw-load__alt" onClick={onMusic} aria-pressed={music}>
                {music ? <Music aria-hidden /> : <VolumeX aria-hidden />} Soft jazz {music ? "on" : "off"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
