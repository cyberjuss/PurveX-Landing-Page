"use client";

import Link from "next/link";
import { ArrowUpRight, Bug, Clock, Fingerprint, FlaskConical, KeyRound, LockKeyhole, Radar, ScanSearch, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import type { LabMeta } from "@/lib/academy-labs";
import { slugify, useAcademyProgress } from "./academy-progress";
import "./lab-gallery.css";

const ICONS: Record<string, LucideIcon> = {
  TriangleAlert, Fingerprint, KeyRound, Radar, Bug, ShieldCheck, LockKeyhole, ScanSearch, FlaskConical,
};

// The Labs page: every lab as its own card, each a door to its own page. Dark
// cyber cards with a glowing icon, generous spacing, no grey. Not grouped, so
// nothing feels clogged together.
export function LabGallery({ labs }: { labs: LabMeta[] }) {
  const { isLabDone } = useAcademyProgress();
  return (
    <div className="lg">
      <header className="lg__head">
        <p className="lg__kicker"><ShieldCheck aria-hidden="true" /> Hands-on</p>
        <h1>Labs</h1>
        <p className="lg__sub">Every lab is a real task from the PurveX environment. Pick one and work it start to finish on its own page.</p>
      </header>

      <div className="lg__grid">
        {labs.map((lab) => {
          const Icon = ICONS[lab.icon] ?? FlaskConical;
          const done = isLabDone(lab.phaseSlug, lab.entrySlug, slugify(lab.title));
          return (
            <Link
              key={lab.slug}
              href={`/range/labs/${lab.slug}`}
              className="lgc"
              style={{ ["--lab-accent" as string]: lab.accent }}
            >
              <span className="lgc__glow" aria-hidden="true" />
              <span className="lgc__icon" aria-hidden="true"><Icon /></span>
              <span className="lgc__body">
                <span className="lgc__title">{lab.title}</span>
                <span className="lgc__blurb">{lab.blurb}</span>
              </span>
              <span className="lgc__foot">
                <span className="lgc__tag">{lab.skill}</span>
                <span className="lgc__time"><Clock aria-hidden="true" /> {lab.minutes} min</span>
                {done && <span className="lgc__done">Done</span>}
              </span>
              <ArrowUpRight className="lgc__go" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
