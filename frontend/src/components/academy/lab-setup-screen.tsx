"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, Database, Lightbulb, Monitor, Network, Server, ShieldCheck, Workflow, X, type LucideIcon } from "lucide-react";
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
// Measured: a hibernated pod is running at thirteen seconds and answering at
// twenty-six. Eighty made a half-minute resume look like a stall.
const RESUME: Step[] = [
  { label: "Waking your server", until: 12, icon: Server },
  { label: "Resuming Windows", until: 22, icon: Workflow },
  { label: "Reconnecting to Range", until: 32, icon: ShieldCheck },
];

// Something worth reading while the server boots: one desk habit at a time.
const TIPS = [
  "4625 is a failed sign-in · 4740 is a lockout",
  "Check the account before you change it",
  "Disable a leaver · never delete them on day one",
  "Grant access with a group · never one person at a time",
  "Critical first then High then Routine",
  "4728 means someone joined a security group",
  "Read the log before you contain anything",
  "A locked account and a disabled one need different fixes",
];
const TIP_SECONDS = 8;

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

  // Show again the next time a lab starts: reset when a start ends, during
  // render rather than in an effect, so it costs no extra render.
  const [wasStarting, setWasStarting] = useState(starting);
  if (wasStarting !== starting) {
    setWasStarting(starting);
    if (!starting) setHidden(false);
  }

  const [now, setNow] = useState(() => Date.now());
  const [seenAt] = useState(() => Date.now());
  useEffect(() => {
    if (!starting) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [starting]);

  if (!starting || hidden || !status?.available) return null;

  const firstBoot = status.firstBoot;
  const steps = firstBoot ? FIRST_BOOT : RESUME;
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
      <div className="ls__inner ls__inner--split">
        <div className="ls__main">
        <p className="ls__brand">
          <Image src="/logo.png" alt="" width={34} height={34} priority />
          <span>PurveX</span>
          <i aria-hidden="true" />
          <b>Range</b>
        </p>

        <p className="ls__kicker">Building your environment</p>
        <h1 className="ls__title">
          <span className="ls__prompt" aria-hidden="true">&gt;</span>
          <span key={current} className="ls__title-text">{steps[current].label}</span>
          <span className="ls__cursor" aria-hidden="true" />
        </h1>

        <div
          className="ls__meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label="Setup progress"
        >
          <div className="ls__meter-track">
            <div className="ls__meter-fill" style={{ width: `${pct}%` }} />
          </div>
          <em className="ls__meter-pct">{Math.round(pct)}%</em>
        </div>

        <ul className="ls__log" aria-hidden="true">
          {steps.map((s, i) => {
            const Icon = i < current ? Check : s.icon;
            const rowState = i < current ? "done" : i === current ? "now" : "pending";
            // How long the finished step took, so the screen visibly moves.
            const took = Math.round(s.until - (i ? steps[i - 1].until : 0));
            return (
              <li key={s.label} className={`ls__log-row is-${rowState}`}>
                <Icon aria-hidden="true" />
                <span>{s.label}</span>
                {rowState === "done" && <small className="ls__took">{took}s</small>}
              </li>
            );
          })}
        </ul>

        <p className="ls__eta">
          {/* A first build is usually about five minutes, but Active Directory
              can be slow to come up and the whole thing can run to twenty.
              Saying "almost there" for a quarter of an hour reads as broken. */}
          {elapsed <= total
            ? `About ${left} min left`
            : firstBoot
              ? "Taking longer than usual · The first time can take 20 minutes"
              : "Almost there · Running the last checks"}
        </p>

        <button type="button" className="ls__hide" onClick={() => setHidden(true)}>
          <X aria-hidden="true" /> Keep reading while it builds
        </button>
        </div>

        <aside className="ls__side" aria-label="Your environment">
          <p className="ls__kicker">Your environment</p>
          {[
            { name: "dc01", os: "Windows Server 2022", role: "Domain controller · purvexfinancial.local", icon: Server, live: current >= steps.length - 1 ? "on" : current >= 1 ? "boot" : "off" },
            { name: "web01", os: "Ubuntu 24.04", role: "Linux server", icon: Monitor, live: current >= steps.length - 1 ? "on" : current >= 1 ? "boot" : "off" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.name} className={`ls__node is-${m.live}`}>
                <span className="ls__node-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="ls__node-main">
                  <b>{m.name}</b>
                  <small>
                    {m.os} · {m.role}
                  </small>
                </span>
                <span className="ls__node-state">
                  <i aria-hidden="true" />
                  {m.live === "on" ? "Online" : m.live === "boot" ? "Booting" : "Off"}
                </span>
              </div>
            );
          })}
          <div className="ls__tip" key={Math.floor(elapsed / TIP_SECONDS)}>
            <p className="ls__kicker">
              <Lightbulb aria-hidden="true" /> While you wait
            </p>
            <p>{TIPS[Math.floor(elapsed / TIP_SECONDS) % TIPS.length]}</p>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
