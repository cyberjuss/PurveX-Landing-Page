"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, Database, Loader2, Network, Server, ShieldCheck, Workflow, X, type LucideIcon } from "lucide-react";
import { useHostedLab } from "./hosted-lab-button";
import "./lab-setup-screen.css";

// The screen a student sees while their own PurveX Financial environment is
// being built. A real server has to boot, so this says plainly what is
// happening and how far along it is rather than leaving them on a dead button.
// It can be dismissed: the lab keeps building in the background and the lab
// light in the header carries on showing progress.

// An icon per step, so a step that has not started still says what it is
// rather than sitting behind an identical grey dot.
type Step = { label: string; until: number; icon: LucideIcon };
const FIRST_BOOT: Step[] = [
  { label: "Starting your server", until: 45, icon: Server },
  { label: "Booting Windows", until: 110, icon: Workflow },
  { label: "Starting Active Directory", until: 160, icon: Network },
  { label: "Building PurveX Financial", until: 200, icon: Database },
];
const RESUME: Step[] = [
  { label: "Waking your server", until: 20, icon: Server },
  { label: "Resuming Windows", until: 50, icon: Workflow },
  { label: "Reconnecting to Range", until: 80, icon: ShieldCheck },
];

/** Black in the dark portal, white in the light one. The screen is portaled to
 *  <body>, so the academy's own tokens are out of scope and the theme has to be
 *  read off .academy-bg and carried here. */
function usePortalTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const root = document.querySelector(".academy-bg");
    if (!root) return;
    const read = () => setTheme(root.getAttribute("data-academy-theme") === "dark" ? "dark" : "light");
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["data-academy-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

export function LabSetupScreen() {
  const { status, state } = useHostedLab();
  const theme = usePortalTheme();
  const [hidden, setHidden] = useState(false);
  const starting = state === "starting";

  // Show again the next time a lab starts.
  useEffect(() => {
    if (!starting) setHidden(false);
  }, [starting]);

  const [now, setNow] = useState(() => Date.now());
  const [seenAt] = useState(() => Date.now());
  useEffect(() => {
    if (!starting) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [starting]);

  if (!starting || hidden || !status?.available) return null;

  const steps = status.firstBoot ? FIRST_BOOT : RESUME;
  const total = steps[steps.length - 1].until;
  const from = status.startedAt ? Math.min(Date.parse(status.startedAt), seenAt) : seenAt;
  const elapsed = Math.max(0, (now - from) / 1000);
  const next = steps.findIndex((s) => s.until > elapsed);
  const current = next === -1 ? steps.length - 1 : next;
  // Never shows finished before the lab itself says it is ready.
  const pct = Math.min(94, (elapsed / total) * 100);
  const left = Math.max(1, Math.ceil((total - elapsed) / 60));

  // Portaled to <body>. The lesson wrapper animates with a transform, and a
  // transformed ancestor makes position: fixed resolve against it rather than
  // the viewport, which is why this covered part of the page instead of all
  // of it.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="ls" data-academy-theme={theme} role="status" aria-live="polite">
      <div className="ls__inner">
        <p className="ls__brand">
          <Image src="/logo.png" alt="" width={34} height={34} priority />
          <span>PurveX</span>
          <i aria-hidden="true" />
          <b>Range</b>
        </p>

        <h1 className="ls__title">Building your environment</h1>
        <p className="ls__lede">A Windows domain controller and an Ubuntu desktop, built for you alone.</p>

        <div className="ls__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Setup progress">
          <span style={{ width: `${pct}%` }} />
        </div>

        <ol className="ls__steps">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.label} className={i < current ? "is-done" : i === current ? "is-now" : ""}>
                <span className="ls__mark" aria-hidden="true">
                  {i < current ? <Check /> : i === current ? <Loader2 className="ls__spin" /> : <Icon />}
                </span>
                {s.label}
              </li>
            );
          })}
        </ol>

        <p className="ls__eta">
          <span>{elapsed > total ? "Almost there. Running the last checks." : `About ${left} min left`}</span>
          <em>
            {String(Math.min(current + 1, steps.length)).padStart(2, "0")}
            <i>/{String(steps.length).padStart(2, "0")}</i>
          </em>
        </p>

        <button type="button" className="ls__hide" onClick={() => setHidden(true)}>
          <X aria-hidden="true" /> Keep reading while it builds
        </button>
      </div>
    </div>,
    document.body
  );
}
