import type { Metadata } from "next";
import TrainingPage, { type CourseOutline } from "@/components/purvex-landing-page/training-page";
import { phases } from "@/lib/academy-content";

const title = "Cybersecurity Training";
const description =
  "Students build a working company network, work real tickets against it, and finish with a readiness score a hiring manager can read.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

// The syllabus is read from the same content the Academy portal serves, so
// the marketing page cannot drift from the course. Only titles, lesson names,
// and whether a week has lessons yet cross over; lesson files stay server-side.
const SKIP = new Set(["Overview", "Resources"]);

function outline(): CourseOutline {
  return phases.map((p) => ({
    label: p.label,
    title: p.title,
    entries: [...p.weeks, ...(p.homeLab ? [p.homeLab] : [])].map((w) => ({
      title: w.title.replace(" — ", ": "),
      summary: w.summary,
      live: w.sections.length > 0,
      lessons: w.sections.map((s) => s.label.replace(/ — .*$/, "")).filter((l) => !SKIP.has(l)),
    })),
  }));
}

export default function Page() {
  return <TrainingPage outline={outline()} />;
}
