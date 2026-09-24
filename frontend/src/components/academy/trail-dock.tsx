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
}: {
  back?: TrailLink | null;
  prev?: { go: () => void; disabled?: boolean } | null;
  next?: { go: () => void; disabled?: boolean } | null;
  forward?: TrailLink | null;
  center?: ReactNode;
}) {
  return (
    <div className="ax-dock">
      <div className="ax-dock__pair">
        <button type="button" onClick={() => back?.go()} disabled={!back} className="ax-dock__btn">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{back ? toLabel(back.label) : "Back"}</span>
        </button>
        <button type="button" onClick={() => prev?.go()} disabled={!prev || prev.disabled} className="ax-dock__btn">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
      </div>
      {center}
      <div className="ax-dock__pair">
        <button type="button" onClick={() => next?.go()} disabled={!next || next.disabled} className="ax-dock__btn">
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => forward?.go()} disabled={!forward} className="ax-dock__btn">
          <span className="hidden sm:inline">{forward ? toLabel(forward.label) : "Next"}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
