"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { labLine, localDay, scoreLabel, streakLine, type DrillStatus } from "@/components/academy/drill-runner";
import { academyFetch } from "@/lib/academy-client";

export const DRILL_PATH = "/academy/drill";

// Home-page nudge: today's drill, the streak, and how stale their lab is.
export function DrillCard() {
  const [status, setStatus] = useState<DrillStatus | null>(null);

  useEffect(() => {
    academyFetch(`/academy/api/drill?day=${localDay()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStatus(d))
      .catch(() => {});
  }, []);

  if (!status) return null;
  const { stats, lab } = status;
  const staleLab = lab.synced && lab.days !== null && lab.days >= 7;

  return (
    <Link href={DRILL_PATH} className="dr-home">
      <span className="dr-home__flame">
        <Flame className="h-5 w-5" />
        <b>{stats.streak}</b>
      </span>
      <span className="dr-home__main">
        <span className="rd-kicker">{stats.today ? "Daily scenario · done" : "Daily scenario"}</span>
        <strong>{stats.today ? `${scoreLabel(stats.today)} today` : "A scenario built from your lab"}</strong>
        <em>{staleLab ? labLine(lab) : streakLine(stats)}</em>
      </span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
