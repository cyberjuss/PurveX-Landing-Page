"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type TrailLink = { label: string; go: () => void };

function toLabel(label: string) {
  const week = /^(Week \d+)/i.exec(label);
  return week ? `To ${week[1]}` : `To ${label}`;
}

export function TrailDock({
  back,
  prev,
  next,
  forward,
  center,
  wide,
}: {
  back?: TrailLink | null;
  prev?: { go: () => void; disabled?: boolean; label?: string } | null;
  next?: { go: () => void; disabled?: boolean; label?: string } | null;
  forward?: TrailLink | null;
  center?: ReactNode;
  wide?: boolean;
}) {
  if (!wide) {
    return (
      <nav className="ax-dock ax-dock--slim" aria-label="Continue">
        <button type="button" onClick={() => prev?.go()} disabled={!prev || prev.disabled} className="ax-dock__btn">
          <ChevronLeft className="ax-dock__ico" />
          {prev?.label ?? "Previous"}
        </button>
        <div className="ax-dock__mid">{center}</div>
        <button type="button" onClick={() => next?.go()} disabled={!next || next.disabled} className="ax-dock__btn">
          {next?.label ?? "Next"}
          <ChevronRight className="ax-dock__ico" />
        </button>
      </nav>
    );
  }

  return (
    <nav className="ax-dock" aria-label="Continue">
      <button type="button" onClick={() => back?.go()} disabled={!back} className="ax-dock__btn">
        <ChevronLeft className="ax-dock__ico" />
        {back ? toLabel(back.label) : "Back"}
      </button>
      <button type="button" onClick={() => prev?.go()} disabled={!prev || prev.disabled} className="ax-dock__btn">
        <ChevronLeft className="ax-dock__ico" />
        Previous
      </button>
      <div className="ax-dock__mid">{center}</div>
      <button type="button" onClick={() => next?.go()} disabled={!next || next.disabled} className="ax-dock__btn">
        Next
        <ChevronRight className="ax-dock__ico" />
      </button>
      <button type="button" onClick={() => forward?.go()} disabled={!forward} className="ax-dock__btn">
        {forward ? toLabel(forward.label) : "Next"}
        <ChevronRight className="ax-dock__ico" />
      </button>
    </nav>
  );
}
