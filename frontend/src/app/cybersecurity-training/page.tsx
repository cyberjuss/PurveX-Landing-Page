import type { Metadata } from "next";
import TrainingPage, { type CourseOutline } from "@/components/purvex-landing-page/training-page";
import { phases } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { isPhaseLocked, PHASE_PREVIEW } from "@/lib/academy-locks";

const title = "Cybersecurity Training";
const description =
  "Hands-on cybersecurity training. Students practice on their own company network, get help from an AI coach, and finish with proof employers trust.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

// The syllabus is read from the same content the Academy portal serves, so
// the marketing page cannot drift from the course. Only titles, summaries and
// whether a phase is open cross over; lesson files stay server-side.
const PHASE_SUMMARY: Record<string, string> = {
  "phase-1": "Security basics, encryption, networking and access control, then a real Windows domain you build and run yourself.",
};

// "Week 4 — Access Control" -> "Access Control", "Home Lab — Set Up" -> "Set Up".
const after = (title: string) => title.split(" — ").slice(1).join(" — ") || title;

function outline(): CourseOutline {
  return phases.map((p) => {
    const preview = PHASE_PREVIEW[p.slug];
    const written = entriesOf(p).some((e) => e.sections.length > 0);
    // The Home Lab is several sittings in the portal, shown here as one item.
    // Anything else after the weeks is the phase's capstone challenges.
    const labs = (p.homeLabs ?? []).filter((h) => h.sections.length > 0 && h.title.startsWith("Home Lab"));
    const capstones = (p.homeLabs ?? []).filter((h) => h.sections.length > 0 && !h.title.startsWith("Home Lab"));
    return {
      label: p.label,
      title: p.title,
      status: !written ? "planned" : isPhaseLocked(p.slug) ? "soon" : "open",
      summary: PHASE_SUMMARY[p.slug] ?? preview?.summary ?? "",
      // A phase with nothing written yet shows what it will cover instead.
      points: written ? [] : (preview?.points ?? []),
      weeks: p.weeks
        .filter((w) => w.sections.length > 0)
        .map((w, i) => ({ no: Number(/^Week (\d+)/.exec(w.title)?.[1] ?? i + 1), title: after(w.title), summary: w.summary })),
      homeLab: labs.length
        ? {
            parts: labs.map((h) => after(h.title)),
            summary: "Build PurveX Financial's Windows domain on your own machine, then run its help desk: accounts, groups, policy and a real ticket queue.",
          }
        : null,
      capstones: capstones.map((c) => ({ title: "Real attack campaigns", summary: c.summary })),
    };
  });
}

export default function Page() {
  return <TrainingPage outline={outline()} />;
}
