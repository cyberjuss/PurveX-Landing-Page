import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadLesson, type ContentSection, type WeekDef, type PhaseDef } from "@/lib/academy-content";
import { findQuiz } from "@/content/academy/quizzes";
import { SectionTabs } from "./section-tabs";

export function PhaseEntry({ phase, entry }: { phase: PhaseDef; entry: WeekDef }) {
  const sections = entry.sections
    .map((section: ContentSection) => ({ ...section, markdown: loadLesson(section.file) }))
    .filter((s) => s.markdown && s.markdown.trim().length > 0);
  const quiz = findQuiz(phase.slug, entry.slug);

  return (
    <div>
      <Link href={`/academy/${phase.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> {phase.label}
      </Link>

      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {entry.title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{entry.summary}</p>

      {sections.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-[var(--pvrx-border-light)] bg-slate-50/60 px-5 py-4 text-sm text-slate-500">
          Content for this week is still being written — check back soon.
        </p>
      ) : (
        <div className="mt-8">
          <SectionTabs
            sections={sections.map((s) => ({ label: s.label, markdown: s.markdown! }))}
            quiz={quiz}
          />
        </div>
      )}
    </div>
  );
}
