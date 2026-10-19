"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Award, Star, TrendingUp } from "lucide-react";
import { GAMIFY_ON, XP_EVENT, rankFor, sumXp, totalXp, type XpAward } from "@/lib/academy-gamify";
import { confettiFrom } from "@/lib/confetti";
import { useMounted } from "@/lib/use-mounted";
import "./xp-toasts.css";

type Shown = XpAward & { key: number; xp: number; total: number; rank: ReturnType<typeof rankFor>; up: string | null };

// The "+XP" card that rises in the corner when a ticket closes, a check is
// answered or a lab is cleared: what was earned and why, line by line, then
// the rank bar filling toward the next title. Crossing into a new rank turns
// the card into a level-up. Dev only, with the rest of academy-gamify.
export function XpToasts() {
  const mounted = useMounted();
  const [shown, setShown] = useState<Shown[]>([]);
  const seq = useRef(0);
  const rankAt = useRef<number | null>(null);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GAMIFY_ON) return;
    rankAt.current = rankFor(totalXp()).index;
    const on = (e: Event) => {
      const a = (e as CustomEvent<XpAward>).detail;
      const total = totalXp();
      const rank = rankFor(total);
      const up = rankAt.current !== null && rank.index > rankAt.current ? rank.title : null;
      rankAt.current = rank.index;
      const key = ++seq.current;
      setShown((s) => [...s.slice(-2), { ...a, key, xp: sumXp(a.lines), total, rank, up }]);
      if (a.big || up) window.setTimeout(() => confettiFrom(host.current?.lastElementChild as HTMLElement | null, up ? 90 : 60), 120);
      window.setTimeout(() => setShown((s) => s.filter((t) => t.key !== key)), a.big || up ? 6200 : 3800);
    };
    window.addEventListener(XP_EVENT, on);
    return () => window.removeEventListener(XP_EVENT, on);
  }, []);

  if (!GAMIFY_ON || !mounted) return null;
  return createPortal(
    <div className="xp-stack" ref={host} aria-live="polite">
      {shown.map((t) => (
        <div key={t.key} className={`xp-toast${t.big ? " is-big" : ""}${t.up ? " is-up" : ""}`}>
          <div className="xp-toast__head">
            <span className="xp-toast__icon" aria-hidden>
              {t.up ? <TrendingUp /> : t.big ? <Award /> : <Star />}
            </span>
            <span className="xp-toast__title">{t.up ? `Rank up: ${t.up}` : t.title}</span>
            {t.xp > 0 && <b className="xp-toast__xp">+{t.xp} XP</b>}
          </div>
          {t.stars ? (
            <span className="xp-toast__stars" aria-label={`${t.stars} of 3 stars`}>
              {[0, 1, 2].map((i) => (
                <Star key={i} className={i < (t.stars ?? 0) ? "is-on" : undefined} style={{ ["--i" as string]: i }} />
              ))}
            </span>
          ) : null}
          <ul className="xp-toast__lines">
            {t.lines
              .filter((l) => l.label)
              .map((l, i) => (
                <li key={i} style={{ ["--i" as string]: i }}>
                  <span>{l.label}</span>
                  {l.xp !== 0 && <em className={l.xp < 0 ? "is-neg" : undefined}>{l.xp > 0 ? `+${l.xp}` : l.xp}</em>}
                </li>
              ))}
          </ul>
          <div className="xp-toast__rank">
            <span>{t.rank.title}</span>
            <span>{t.rank.next ? `${t.rank.toNext} XP to ${t.rank.next}` : `${t.total} XP`}</span>
          </div>
          <div className="xp-toast__bar">
            <i style={{ ["--pct" as string]: t.rank.pct }} />
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
