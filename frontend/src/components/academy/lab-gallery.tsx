"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bug, Check, Fingerprint, FlaskConical, KeyRound, LockKeyhole, Radar, ScanSearch, Search, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import type { LabMeta } from "@/lib/academy-labs";
import { slugify, useAcademyProgress } from "./academy-progress";
import "./lab-gallery.css";

const ICONS: Record<string, LucideIcon> = {
  TriangleAlert, Fingerprint, KeyRound, Radar, Bug, ShieldCheck, LockKeyhole, ScanSearch, FlaskConical,
};

// The Labs page. Plain, neutral cards that read the same in light and dark. One
// accent, used only to mark where you are and where you are going. A search and
// skill filters up top so a growing list stays easy to scan and navigate.
export function LabGallery({ labs }: { labs: LabMeta[] }) {
  const { isLabDone } = useAcademyProgress();
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState<string | null>(null);

  const skills = useMemo(() => [...new Set(labs.map((l) => l.skill))], [labs]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return labs.filter((l) => {
      if (skill && l.skill !== skill) return false;
      if (!q) return true;
      return `${l.title} ${l.blurb} ${l.skill}`.toLowerCase().includes(q);
    });
  }, [labs, query, skill]);

  return (
    <div className="lg">
      <header className="lg__head">
        <div>
          <p className="lg__kicker">Hands-on</p>
          <h1>Labs</h1>
          <p className="lg__sub">Each lab is a real task from the PurveX environment. Open one and work it start to finish on its own page.</p>
        </div>
        <div className="lg__search">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search labs"
            aria-label="Search labs"
          />
        </div>
      </header>

      <div className="lg__filters" role="group" aria-label="Filter by skill">
        <button type="button" className={`lg__chip${skill === null ? " lg__chip--on" : ""}`} onClick={() => setSkill(null)}>
          All <span>{labs.length}</span>
        </button>
        {skills.map((s) => {
          const n = labs.filter((l) => l.skill === s).length;
          return (
            <button key={s} type="button" className={`lg__chip${skill === s ? " lg__chip--on" : ""}`} onClick={() => setSkill(skill === s ? null : s)}>
              {s} <span>{n}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="lg__empty">No labs match that. Clear the search or pick another filter.</p>
      ) : (
        <ol className="lg__grid">
          {shown.map((lab, i) => {
            const Icon = ICONS[lab.icon] ?? FlaskConical;
            const done = isLabDone(lab.phaseSlug, lab.entrySlug, slugify(lab.title));
            return (
              <li key={lab.slug}>
                <Link href={`/range/labs/${lab.slug}`} className="lgc">
                  <span className="lgc__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="lgc__icon" aria-hidden="true"><Icon /></span>
                  <span className="lgc__body">
                    <span className="lgc__title">{lab.title}</span>
                    <span className="lgc__blurb">{lab.blurb}</span>
                    <span className="lgc__meta">
                      <span className="lgc__skill">{lab.skill}</span>
                      <span className="lgc__dot" aria-hidden="true" />
                      <span>{lab.minutes} min</span>
                      {done && <span className="lgc__done"><Check aria-hidden="true" /> Done</span>}
                    </span>
                  </span>
                  <ArrowRight className="lgc__go" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
