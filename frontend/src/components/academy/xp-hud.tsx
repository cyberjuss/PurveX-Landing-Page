"use client";

import { useEffect, useState } from "react";
import { Flame, Star, Target, Zap } from "lucide-react";
import { RESULTS_CHANGED_EVENT, RESULTS_UPDATED_EVENT } from "@/lib/academy-client";
import { GAMIFY_CHANGED, GAMIFY_ON, XP_EVENT, challengeStats, labStats, type ChallengeStats, type LabStats } from "@/lib/academy-gamify";
import "./xp-toasts.css";

/** Re-reads `read` whenever results or lab XP change. Null until mounted, since storage is browser-only. */
function useLive<T>(read: () => T, deps: unknown[]): T | null {
  const [v, setV] = useState<T | null>(null);
  useEffect(() => {
    if (!GAMIFY_ON) return;
    const update = () => setV(read());
    update();
    const events = [RESULTS_CHANGED_EVENT, RESULTS_UPDATED_EVENT, GAMIFY_CHANGED, XP_EVENT, "focus"];
    events.forEach((e) => window.addEventListener(e, update));
    return () => events.forEach((e) => window.removeEventListener(e, update));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return v;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="xp-hud__stars" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Star key={i} className={i < n ? "is-on" : undefined} />
      ))}
    </span>
  );
}

/** A challenge's XP, its first-try streak and, once cleared, its stars. */
export function ChallengeHud({ ids }: { ids: string[] }) {
  const s = useLive<ChallengeStats>(() => challengeStats(ids), [ids.join(",")]);
  if (!GAMIFY_ON || !s) return null;
  return (
    <div className="xp-hud" aria-label={`${s.earned} of ${s.max} XP`}>
      <span className="xp-hud__xp">
        <Zap aria-hidden className="h-4 w-4" />
        {s.earned}
        <small>/ {s.max} XP</small>
      </span>
      <span className="xp-hud__bar" aria-hidden>
        <i style={{ ["--pct" as string]: s.max ? s.earned / s.max : 0 }} />
      </span>
      <span className="xp-hud__chip">
        <Target aria-hidden /> {s.solved}/{s.total}
      </span>
      {s.streak >= 2 && (
        <span className="xp-hud__chip is-hot">
          <Flame aria-hidden /> {s.streak} first-try streak
        </span>
      )}
      {s.stars > 0 && <Stars n={s.stars} />}
      <span className="xp-hud__dev">Dev</span>
    </div>
  );
}

/** A lab's XP from its checks, how many are answered, and its stars once cleared. */
export function LabHud({ lab, checks }: { lab: string; checks: { id: string; graded: boolean }[] }) {
  const s = useLive<LabStats>(() => labStats(lab, checks), [lab, checks.length]);
  if (!GAMIFY_ON || !s || !checks.length) return null;
  return (
    <div className="xp-hud" aria-label={`${s.earned} of ${s.max} XP`}>
      <span className="xp-hud__xp">
        <Zap aria-hidden className="h-4 w-4" />
        {s.earned}
        <small>/ {s.max} XP</small>
      </span>
      <span className="xp-hud__bar" aria-hidden>
        <i style={{ ["--pct" as string]: s.max ? s.earned / s.max : 0 }} />
      </span>
      {s.graded > 0 && (
        <span className="xp-hud__chip">
          <Target aria-hidden /> {s.answered}/{s.graded} checks
        </span>
      )}
      {s.cleared ? <Stars n={s.stars} /> : null}
      <span className="xp-hud__dev">Dev</span>
    </div>
  );
}
