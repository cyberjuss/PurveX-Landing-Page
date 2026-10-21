"use client";

import { useRef, useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { confettiFrom } from "@/lib/confetti";
import { dropSlotAt, useLabDone, useLabResult, usePointerDrag, useSaved } from "./lab-kit";
import "./baseline-map-lab.css";

// Week 4 lab: three real clusters, not a list. Each round scatters four
// items around a drawn "normal" cloud -- two that actually belong in it, two
// that don't -- and the student drags each one into the cloud or out to the
// alert zone. The cloud fills in as items land correctly, so by the end of
// a round the board itself shows what the round's baseline actually is.

type Item = { id: string; text: string; fits: boolean; why: string };
type Round = { id: string; title: string; items: Item[] };

const ROUNDS: Round[] = [
  {
    id: "signin",
    title: "Sign-in pattern",
    items: [
      { id: "s1", text: "A night-shift admin signs in at 3 AM from their usual workstation", fits: true, why: "Routine for this specific account's own shift." },
      { id: "s2", text: "An employee signs in from the same laptop they use every day, during business hours", fits: true, why: "Same device, same hours, nothing unusual." },
      { id: "s3", text: "A help desk account that has never worked nights signs in at 3 AM from a device it's never used", fits: false, why: "Wrong account, wrong hour, wrong device -- three mismatches at once." },
      { id: "s4", text: "An account signs in from two countries nine minutes apart", fits: false, why: "No one travels that fast. One of those two sign-ins isn't the real user." },
    ],
  },
  {
    id: "file",
    title: "File-access pattern",
    items: [
      { id: "f1", text: "A payroll clerk opens a handful of payroll records during business hours", fits: true, why: "Exactly the job this account is supposed to do." },
      { id: "f2", text: "An engineer reads and edits files inside their own team's project folder", fits: true, why: "Their own folder, their own normal workload." },
      { id: "f3", text: "A help desk account reads every file on a file share in under a minute", fits: false, why: "No human reads a whole share that fast. That's a script." },
      { id: "f4", text: "An account that has never touched the finance share copies its entire contents overnight", fits: false, why: "New access pattern, bulk copy, off-hours -- a real baseline break." },
    ],
  },
  {
    id: "process",
    title: "Process-execution pattern",
    items: [
      { id: "p1", text: "A scheduled backup task launches its usual backup executable every night at 1 AM", fits: true, why: "Same task, same time, every night -- that's its baseline." },
      { id: "p2", text: "A user opens their usual browser and office apps during the day", fits: true, why: "Ordinary daytime use on this host." },
      { id: "p3", text: "Microsoft Word spawns a PowerShell process that then reaches out to the internet", fits: false, why: "Word has no legitimate reason to launch PowerShell at all." },
      { id: "p4", text: "An unfamiliar executable launches from a temp folder right after a user opened an email attachment", fits: false, why: "Classic delivery pattern: attachment opened, then something launches from temp." },
    ],
  },
];

interface State {
  solved: Record<string, boolean[]>; // roundId -> which items (by index into round.items) are placed correctly
}
const START: State = { solved: {} };
const STORE = "academy-lab-baseline-map-v1";

export function BaselineMapLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => typeof v.solved === "object");
  const [miss, setMiss] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  const solvedFor = (roundId: string) => s.solved[roundId] ?? [];
  const roundDone = (round: Round) => solvedFor(round.id).filter(Boolean).length === round.items.length;
  const curRoundIdx = ROUNDS.findIndex((r) => !roundDone(r));
  const round = curRoundIdx === -1 ? ROUNDS[ROUNDS.length - 1] : ROUNDS[curRoundIdx];

  const allDone = ROUNDS.every(roundDone);
  const totalSolved = ROUNDS.reduce((n, r) => n + solvedFor(r.id).filter(Boolean).length, 0);
  const totalItems = ROUNDS.reduce((n, r) => n + r.items.length, 0);
  useLabDone(allDone, onDone);
  useLabResult("lab-baseline-map", allDone, totalSolved, totalItems);

  const drop = (id: string, x: number, y: number) => {
    const slot = dropSlotAt(x, y); // "fits" or "outlier"
    const idx = round.items.findIndex((it) => it.id === id);
    if (idx === -1 || solvedFor(round.id)[idx]) return;
    const item = round.items[idx];
    const right = (slot === "fits" && item.fits) || (slot === "outlier" && !item.fits);
    if (right) {
      const arr = s.solved[round.id] ? [...s.solved[round.id]] : round.items.map(() => false);
      arr[idx] = true;
      const solved = { ...s.solved, [round.id]: arr };
      setS({ solved });
      setNote(item.why);
      if (arr.filter(Boolean).length === round.items.length) window.setTimeout(() => confettiFrom(boardRef.current, 30), 100);
    } else {
      setMiss(id);
      setNote(slot === "fits" ? "That one doesn't fit the baseline -- look again at what's actually normal here." : "That one does fit the baseline -- it's the other two that don't belong.");
      window.setTimeout(() => setMiss((m) => (m === id ? null : m)), 450);
    }
  };
  const drag = usePointerDrag(drop);

  const pool = round.items.filter((_, i) => !solvedFor(round.id)[i]);
  const fitsPlaced = round.items.filter((it, i) => it.fits && solvedFor(round.id)[i]);
  const outliersPlaced = round.items.filter((it, i) => !it.fits && solvedFor(round.id)[i]);

  return (
    <div className="bml" ref={boardRef}>
      <p className="bml__round">
        Round {Math.max(curRoundIdx, 0) + 1} of {ROUNDS.length} — {round.title}
      </p>

      <div className="bml__board">
        <div className="bml__cloud" data-slot="fits" aria-label="Fits the baseline">
          <span className="bml__zonelabel">Fits the baseline</span>
          <div className="bml__bubbles">
            {fitsPlaced.map((it) => (
              <span key={it.id} className="bml__bubble is-ok">
                <Check className="h-3.5 w-3.5" aria-hidden /> {it.text}
              </span>
            ))}
          </div>
        </div>
        <div className="bml__alert" data-slot="outlier" aria-label="Outlier">
          <span className="bml__zonelabel">Outlier</span>
          <div className="bml__bubbles">
            {outliersPlaced.map((it) => (
              <span key={it.id} className="bml__bubble is-bad">
                <TriangleAlert className="h-3.5 w-3.5" aria-hidden /> {it.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {pool.length > 0 && (
        <div className="bml__tray" aria-label="Items to sort">
          {pool.map((it) => (
            <button key={it.id} type="button" className={`bml__card${drag.dragging === it.id ? " is-dragging" : ""}${miss === it.id ? " is-miss" : ""}`} {...drag.bind(it.id)}>
              {it.text}
            </button>
          ))}
        </div>
      )}

      {note && <p className="bml__note" aria-live="polite">{note}</p>}

      {allDone && (
        <p className="bml__done">
          <Check className="h-4 w-4" aria-hidden /> Same shape every time: establish what normally happens, for whom and when, then flag whatever breaks that pattern. That repeatable shape is the actual skill, not any one example above.
        </p>
      )}
    </div>
  );
}
