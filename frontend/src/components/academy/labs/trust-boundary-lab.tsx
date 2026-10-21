"use client";

import { Fragment, useRef, useState } from "react";
import { Lock, LockOpen, ShieldAlert } from "lucide-react";
import { confettiFrom } from "@/lib/confetti";
import { dropSlotAt, useLabDone, useLabResult, usePointerDrag, useSaved } from "./lab-kit";
import "./trust-boundary-lab.css";

// Week 4 lab: a chain of four nodes -- an attacker outside, then the internal
// network, the file server, and the payroll database -- with three gates
// between them. A perimeter model only guards the first one. The student
// drags three "Verify here" badges onto the three gates to turn the chain
// into Zero Trust, and once every gate is locked, an attacker who got past
// the first one is shown stopping cold at the next.

type Gate = { id: string; label: string; why: string };
const GATES: Gate[] = [
  { id: "g1", label: "Network → File Server", why: "Checks whether this account still has a reason to reach the file server right now, not whether it did an hour ago." },
  { id: "g2", label: "File Server → Payroll DB", why: "Checks whether this specific request has a reason to touch payroll data, even from an account already inside." },
  { id: "g3", label: "Network → Payroll DB (direct)", why: "The shortcut path gets checked too. Zero Trust has no path that skips verification because it looks internal." },
];
const NODES = [
  { id: "attacker", label: "Attacker", sub: "outside" },
  { id: "network", label: "Internal Network", sub: "" },
  { id: "fileserver", label: "File Server", sub: "" },
  { id: "payroll", label: "Payroll DB", sub: "" },
];

interface State {
  locked: string[];
  showAttack: boolean;
}
const START: State = { locked: [], showAttack: false };
const STORE = "academy-lab-trust-boundary-v1";

export function TrustBoundaryLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.locked));
  const [miss, setMiss] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  const allLocked = s.locked.length === GATES.length;
  useLabDone(allLocked, onDone);
  useLabResult("lab-trust-boundary", allLocked, s.locked.length, GATES.length);

  const drop = (id: string, x: number, y: number) => {
    const slot = dropSlotAt(x, y);
    const gate = GATES.find((g) => g.id === slot);
    if (!gate || s.locked.includes(gate.id)) {
      setMiss(id);
      window.setTimeout(() => setMiss((m) => (m === id ? null : m)), 450);
      return;
    }
    const locked = [...s.locked, gate.id];
    setS({ locked, showAttack: s.showAttack });
    setNote(gate.why);
    if (locked.length === GATES.length) window.setTimeout(() => confettiFrom(boardRef.current, 40), 100);
  };
  const drag = usePointerDrag(drop);

  const badgesLeft = GATES.length - s.locked.length;

  return (
    <div className="tbl" ref={boardRef}>
      <p className="tbl__round">Drag a checkpoint onto every gate. A perimeter model only guards the first one.</p>

      <div className="tbl__chain">
        {NODES.map((n, i) => (
          <Fragment key={n.id}>
            <div className={`tbl__node${n.id === "attacker" ? " is-attacker" : ""}`}>
              <span>{n.label}</span>
              {n.sub && <small>{n.sub}</small>}
            </div>
            {i < NODES.length - 1 && i < GATES.length && (
              <div data-slot={GATES[i].id} className={`tbl__gate${s.locked.includes(GATES[i].id) ? " is-locked" : ""}`}>
                {s.locked.includes(GATES[i].id) ? <Lock className="h-4 w-4" aria-hidden /> : <LockOpen className="h-4 w-4" aria-hidden />}
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* the shortcut path, its own gate */}
      <div className="tbl__shortcut">
        <span className="tbl__shortcut__label">Internal Network → Payroll DB, direct</span>
        <div data-slot={GATES[2].id} className={`tbl__gate${s.locked.includes(GATES[2].id) ? " is-locked" : ""}`}>
          {s.locked.includes(GATES[2].id) ? <Lock className="h-4 w-4" aria-hidden /> : <LockOpen className="h-4 w-4" aria-hidden />}
        </div>
      </div>

      {badgesLeft > 0 && (
        <div className="tbl__tray" aria-label="Checkpoints to place">
          {Array.from({ length: badgesLeft }).map((_, i) => (
            <button key={i} type="button" className={`tbl__badge${drag.dragging === `badge-${i}` ? " is-dragging" : ""}${miss === `badge-${i}` ? " is-miss" : ""}`} {...drag.bind(`badge-${i}`)}>
              <ShieldAlert className="h-4 w-4" aria-hidden /> Verify here
            </button>
          ))}
        </div>
      )}

      {note && <p className="tbl__note" aria-live="polite">{note}</p>}

      {allLocked && (
        <div className="tbl__done">
          <p>
            <Lock className="h-4 w-4" aria-hidden /> A perimeter model guards the first gate and trusts everything after it. One compromised account inside, and nothing else stops it reaching Payroll. Every gate here now checks again, so compromising one hop still leaves the next one to beat on its own.
          </p>
        </div>
      )}
    </div>
  );
}
