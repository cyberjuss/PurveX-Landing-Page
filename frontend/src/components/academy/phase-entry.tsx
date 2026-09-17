import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { loadLesson, type ContentSection, type WeekDef, type PhaseDef } from "@/lib/academy-content";
import { findQuiz } from "@/content/academy/quizzes";
import { Markdown } from "@/lib/markdown";
import { SectionTabs } from "./section-tabs";
import { MarkCompleteButton } from "./mark-complete-button";

export function PhaseEntry({ phase, entry }: { phase: PhaseDef; entry: WeekDef }) {
  const sections = entry.sections
    .map((section: ContentSection) => ({ ...section, markdown: loadLesson(section.file) }))
    .filter((s) => s.markdown && s.markdown.trim().length > 0);
  const quiz = findQuiz(phase.slug, entry.slug);

  // A lab is something you do, not something you read alongside a lesson
  // topic -- leaving it as just another tab next to "Resources" buried it
  // at the same visual weight as reference material. Every lab section is
  // named "Lab: ..." by convention, so that's enough to split it out
  // without needing a new field on the content model.
  const labSections = sections.filter((s) => s.label.startsWith("Lab:"));
  const otherSections = sections.filter((s) => !s.label.startsWith("Lab:"));

  return (
    <div>
      <Link href={`/academy/${phase.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> {phase.label}
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {entry.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{entry.summary}</p>
        </div>
        {sections.length > 0 && <MarkCompleteButton phaseSlug={phase.slug} entrySlug={entry.slug} />}
      </div>

      {sections.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-[var(--pvrx-border-light)] bg-slate-50/60 px-5 py-4 text-sm text-slate-500">
          Content for this week is still being written. Check back soon.
        </p>
      ) : (
        <>
          {otherSections.length > 0 && (
            <div className="mt-8">
              <SectionTabs
                sections={otherSections.map((s) => ({ label: s.label, markdown: s.markdown! }))}
                quiz={quiz}
              />
            </div>
          )}

          {labSections.length > 0 && (
            <div className={otherSections.length > 0 ? "mt-10 flex flex-col gap-6" : "mt-8 flex flex-col gap-6"}>
              {labSections.map((lab) => (
                <div key={lab.file} className="overflow-hidden rounded-2xl border border-[var(--pvrx-border-light)] bg-white shadow-[0_1px_2px_rgba(16,25,46,0.04),0_20px_40px_-32px_rgba(16,25,46,0.18)]">
                  <div className="flex items-center gap-3 border-b border-[var(--pvrx-border-light)] bg-[rgba(106,92,255,0.04)] px-6 py-4 sm:px-8">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(106,92,255,0.1)] text-[#5546e0]">
                      <FlaskConical className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#5546e0]">Hands-on lab</p>
                      <h2 className="font-display text-base font-semibold text-slate-900">
                        {lab.label.replace(/^Lab:\s*/, "")}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <Markdown content={lab.markdown!} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
