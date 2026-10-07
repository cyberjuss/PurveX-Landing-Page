"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Clock, Gauge, KeyRound, MonitorPlay, Server, Timer, X, type LucideIcon } from "lucide-react";
import "./lab-briefing.css";

// What a student needs to know before their first hosted lab. It stands
// between the first "Start my lab" and the start itself, so reading it is on
// the way rather than a notice to dismiss. Afterwards it is a link in the lab
// panel.
//
// Every number here comes from the lab's own config by way of the status
// payload, so the briefing cannot drift from what the lab actually does.

const KEY = "purvex.lab.brief.v1";

export const labBriefed = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    // Private windows and blocked site data throw. Showing the briefing twice
    // is a far smaller problem than a start button that never starts.
    return false;
  }
};

export const markLabBriefed = (): void => {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {}
};

type Point = { Icon: LucideIcon; title: string; body: string };

function points(sessionHours: number, monthlyHours: number | null): Point[] {
  const list: Point[] = [
    {
      Icon: Server,
      title: "Two machines, yours alone",
      body: "A Windows Server 2022 domain controller running purvexfinancial.local, and an Ubuntu 24.04 desktop, on a private network nobody else shares.",
    },
    {
      Icon: MonitorPlay,
      title: "They open in a new tab",
      body: "Both machines run inside your browser, no download and no VPN. Allow pop-ups for this site or the tab will not open.",
    },
    {
      Icon: Timer,
      title: "The first build takes a few minutes",
      body: "A real server has to boot and build the domain. Resuming later takes about a minute. You can keep reading Range while it works.",
    },
    {
      Icon: Clock,
      title: `It stops itself after ${sessionHours} ${sessionHours === 1 ? "hour" : "hours"}`,
      body: "Everything you changed is saved. Resume picks the lab up exactly where you left it, so a stop costs you nothing.",
    },
  ];
  if (monthlyHours) {
    list.push({
      Icon: Gauge,
      title: `${monthlyHours} lab hours a month`,
      body: "Stop the lab yourself when you are done and the rest of that session goes back on your balance. Only the time it is actually running counts.",
    });
  }
  list.push({
    Icon: KeyRound,
    title: "The Ubuntu password is in the panel",
    body: "The desktop opens already signed in. When a command asks for a sudo password, open the lab panel and reveal it there.",
  });
  return list;
}

export function LabBriefing({
  sessionHours,
  monthlyHours,
  onStart,
  onClose,
  starting,
}: {
  sessionHours: number;
  monthlyHours: number | null;
  /** Absent when the briefing is reopened to be read rather than to start a lab. */
  onStart?: () => void;
  onClose: () => void;
  starting?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-labelledby="lb-title">
      <div className="lb__scrim" onClick={onClose} />
      <div className="lb__panel" ref={panel} tabIndex={-1}>
        <header className="lb__head">
          <div>
            <p className="lb__kicker">Your hosted lab</p>
            <h2 className="lb__title" id="lb-title">Before you begin</h2>
          </div>
          <button type="button" className="lb__x" onClick={onClose} aria-label="Close">
            <X className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </header>

        <ul className="lb__points">
          {points(sessionHours, monthlyHours).map(({ Icon, title, body }) => (
            <li key={title}>
              <span className="lb__mark" aria-hidden>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <footer className="lb__foot">
          {onStart ? (
            <>
              <button type="button" className="lb__go" onClick={onStart} disabled={starting}>
                {starting ? "Starting" : "Start my lab"}
              </button>
              <button type="button" className="lb__ghost" onClick={onClose}>
                Not yet
              </button>
            </>
          ) : (
            <button type="button" className="lb__go" onClick={onClose}>
              Got it
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
