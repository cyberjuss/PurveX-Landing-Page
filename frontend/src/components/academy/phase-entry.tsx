import Link from "next/link";
import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import { loadLesson, type ContentSection, type WeekDef, type PhaseDef } from "@/lib/academy-content";
import { findQuiz } from "@/content/academy/quizzes";
import { extractEssentialQuestion, splitMarkdownIntoSlides } from "@/lib/markdown";
import { SectionTabs } from "./section-tabs";
import { MarkCompleteButton } from "./mark-complete-button";
import { LabCarousel } from "./lab-carousel";

export function PhaseEntry({ phase, entry }: { phase: PhaseDef; entry: WeekDef }) {
  // Every section that has one authored its own Essential Question, but a
  // page only needs to ask it once -- so pull the first one out to show
  // at the top and strip the block from every section's body.
  let essentialQuestion: string | null = null;
  const sections = entry.sections
    .map((section: ContentSection) => {
      const raw = loadLesson(section.file);
      if (!raw) return { ...section, markdown: raw };
      const { question, rest } = extractEssentialQuestion(raw);
      if (question && !essentialQuestion) essentialQuestion = question;
      return { ...section, markdown: rest };
    })
    .filter((s) => s.markdown && s.markdown.trim().length > 0);
  const quiz = findQuiz(phase.slug, entry.slug);

  // Only chain to entries that actually have content -- an entry still
  // marked "Coming soon" isn't clickable in the sidebar either, so jumping
  // to one here would just be a dead end. Cross-phase chaining is left out
  // deliberately: every later phase is currently all "Coming soon," so
  // there's nothing real to link to yet.
  const phaseEntries = [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];
  const availableEntries = phaseEntries.filter((e) => e.sections.length > 0);
  const currentIndex = availableEntries.findIndex((e) => e.slug === entry.slug);
  const prevEntry = currentIndex > 0 ? availableEntries[currentIndex - 1] : undefined;
  const nextEntry = currentIndex >= 0 && currentIndex < availableEntries.length - 1 ? availableEntries[currentIndex + 1] : undefined;

  // A lab is something you do, not something you read alongside a lesson
  // topic -- leaving it as just another tab next to "Resources" buried it
  // at the same visual weight as reference material. Every lab section is
  // named "Lab: ..." by convention, so that's enough to split it out
  // without needing a new field on the content model.
  const labSections = sections
    .filter((s) => s.label.startsWith("Lab:"))
    .map((s) => ({ ...s, anchorId: s.file.split("/").pop()!.replace(/\.md$/, "") }));
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

      {essentialQuestion && (
        <div className="academy-prose mt-6">
          <div className="academy-question">
            <span className="academy-question__tag">Essential Question</span>
            <p>{essentialQuestion}</p>
          </div>
        </div>
      )}

      {sections.length === 0 ? (
        <p className="mt-8 rounded-md border border-[var(--pvrx-border-light)] bg-slate-50/60 px-5 py-4 text-sm text-slate-500">
          Content for this week is still being written. Check back soon.
        </p>
      ) : (
        <>
          {otherSections.length > 0 && (
            <div className="mt-8">
              <SectionTabs
                sections={otherSections.map((s) => ({ label: s.label, markdown: s.markdown! }))}
                quiz={quiz}
                labs={labSections.map((s) => ({ label: s.label.replace(/^Lab:\s*/, ""), anchorId: s.anchorId }))}
              />
            </div>
          )}

          {labSections.length > 0 && (
            <div className={otherSections.length > 0 ? "mt-10 flex flex-col gap-6" : "mt-8 flex flex-col gap-6"}>
              {labSections.map((lab) => (
                <div
                  key={lab.file}
                  id={lab.anchorId}
                  className="scroll-mt-24 overflow-hidden rounded-md border border-[var(--pvrx-border-light)] bg-white shadow-[0_1px_2px_rgba(16,25,46,0.04),0_20px_40px_-32px_rgba(16,25,46,0.18)]"
                >
                  <div className="flex items-center gap-3 border-b border-[var(--pvrx-border-light)] bg-[rgba(106,92,255,0.04)] px-6 py-4 sm:px-8">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[rgba(106,92,255,0.1)] text-[#5546e0]">
                      <FlaskConical className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#5546e0]">Hands-on lab</p>
                      <h2 className="font-display text-base font-semibold text-slate-900">
                        {lab.label.replace(/^Lab:\s*/, "")}
                      </h2>
                    </div>
                  </div>
                  <LabCarousel slides={splitMarkdownIntoSlides(lab.markdown!)} />
                </div>
              ))}
            </div>
          )}

          {(prevEntry || nextEntry) && (
            <div className="mt-10 flex items-stretch gap-3 border-t border-[var(--pvrx-border-light)] pt-6">
              {prevEntry ? (
                <Link
                  href={`/academy/${phase.slug}/${prevEntry.slug}`}
                  className="group flex flex-1 items-center gap-3 rounded-md border border-[var(--pvrx-border-light)] bg-white p-4 shadow-[0_1px_2px_rgba(16,25,46,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_48px_-30px_rgba(15,23,42,0.25)]"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-[#5546e0]" />
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">Previous</span>
                    <span className="block truncate text-sm font-semibold text-slate-900">{prevEntry.title}</span>
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextEntry ? (
                <Link
                  href={`/academy/${phase.slug}/${nextEntry.slug}`}
                  className="group flex flex-1 items-center justify-end gap-3 rounded-md border border-[var(--pvrx-border-light)] bg-white p-4 text-right shadow-[0_1px_2px_rgba(16,25,46,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_48px_-30px_rgba(15,23,42,0.25)]"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">Next</span>
                    <span className="block truncate text-sm font-semibold text-slate-900">{nextEntry.title}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#5546e0]" />
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
