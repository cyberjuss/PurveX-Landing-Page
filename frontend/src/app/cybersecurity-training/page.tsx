import type { Metadata } from "next";
import TrainingPage, { type CourseOutline } from "@/components/purvex-landing-page/training-page";
import { phases } from "@/lib/academy-content";

const title = "Cybersecurity Training";
const description =
  "Think Like a SOC Analyst 101: a cohort course with its own student portal. Lessons, a live Active Directory lab, graded missions, and a readiness score a hiring manager can read.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

// The syllabus is read from the same content the Academy portal serves, so
// the marketing page can't drift from the course. Only titles and whether a
// week has lessons yet cross over; lesson files stay server-side.
function outline(): CourseOutline {
  return phases.map((p) => ({
    label: p.label,
    title: p.title,
    entries: [...p.weeks, ...(p.homeLab ? [p.homeLab] : [])].map((w) => ({
      title: w.title,
      summary: w.summary,
      live: w.sections.length > 0,
    })),
  }));
}

export default function Page() {
  return <TrainingPage outline={outline()} />;
}
