"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { accountFirstName, type AcademyStudent } from "./academy-account";

const WELCOME_PENDING = "academy-welcome-pending";

export function markAcademyWelcome() {
  try {
    sessionStorage.setItem(WELCOME_PENDING, "1");
  } catch {}
}

export function takeAcademyWelcome() {
  try {
    if (sessionStorage.getItem(WELCOME_PENDING) !== "1") return false;
    sessionStorage.removeItem(WELCOME_PENDING);
    return true;
  } catch {
    return false;
  }
}

function clockNow() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function AcademyWelcome({ student, onDone }: { student: AcademyStudent; onDone: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [clock, setClock] = useState(clockNow);
  const name = accountFirstName(student);
  const desk = (student.id || "desk").slice(0, 4).toUpperCase();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const tick = window.setInterval(() => setClock(clockNow()), 1000);
    const end = window.setTimeout(onDone, 3700);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(end);
    };
  }, [onDone]);

  if (!mounted) return null;

  return createPortal(
    <div className="ax-hello" role="status" aria-live="polite">
      <div className="ax-hello__print" aria-hidden="true" />
      <div className="ax-hello__card">
        <p className="ax-hello__kicker">PurveX Academy</p>
        <i className="ax-hello__rule" aria-hidden="true" />
        <h2>{name ? `Welcome, ${name}` : "Welcome"}</h2>
        <p className="ax-hello__lead">Your desk is open.</p>
        <dl className="ax-hello__meta">
          <div>
            <dt>Desk</dt>
            <dd>Live · {desk}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{clock}</dd>
          </div>
        </dl>
      </div>
    </div>,
    document.body
  );
}
