import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { loadLesson, type ContentSection, type WeekDef, type PhaseDef } from "@/lib/academy-content";
import { findQuiz } from "@/content/academy/quizzes";
import { extractEssentialQuestion } from "@/lib/markdown";
import { SectionTabs } from "./section-tabs";
import { MarkCompleteButton } from "./mark-complete-button";
import { ComingSoon } from "./coming-soon";

export function PhaseEntry({ phase, entry }: { phase: PhaseDef; entry: WeekDef }) {
  // Every section that has one authored its own Essential Question, but a
  // page only needs to ask it once -- so pull the first one out to show
  // at the top and strip the block from every section's body.
  const parsed = entry.sections
    .map((section: ContentSection) => {
      const raw = loadLesson(section.file);
      if (!raw) return { section: { ...section, markdown: raw }, question: null };
      const { question, rest } = extractEssentialQuestion(raw);
      return { section: { ...section, markdown: rest }, question };
    });
  const essentialQuestion = parsed.find((item) => item.question)?.question ?? null;
  const sections = parsed
    .map((item) => item.section)
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

  // A lab reads differently from a lesson topic, so it gets its own group
  // in the section nav below a divider instead of blending in with the
  // rest. Every lab section is named "Lab: ..." by convention, so that's
  // enough to split it out without needing a new field on the content model.
  // A CTF-style challenge (e.g. Operation Day One) and a troubleshooting
  // page get the same treatment, named "Challenge: ..." / "Troubleshooting:
  // ..." by the same convention.
  const labSections = sections.filter((s) => s.label.startsWith("Lab:"));
  const challengeSections = sections.filter((s) => s.label.startsWith("Challenge:"));
  const troubleshootingSections = sections.filter((s) => s.label.startsWith("Troubleshooting:"));
  const otherSections = sections.filter(
    (s) => !s.label.startsWith("Lab:") && !s.label.startsWith("Challenge:") && !s.label.startsWith("Troubleshooting:")
  );

  return (
    <div>
      {/* /academy/${phase.slug} now redirects straight into this phase's
          first week, so it's not a real "back" destination -- pointing this
          at the course overview instead of back into itself. */}
      <Link href="/academy" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> All phases
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
        <ComingSoon message="Content for this week is still being written. It will appear here as soon as it is ready." />
      ) : (
        <>
          {(otherSections.length > 0 || labSections.length > 0 || challengeSections.length > 0 || troubleshootingSections.length > 0) && (
            <div className="mt-8">
              <SectionTabs
                sections={otherSections.map((s) => ({ label: s.label, markdown: s.markdown! }))}
                quiz={quiz}
                labs={labSections.map((s) => ({ label: s.label.replace(/^Lab:\s*/, ""), markdown: s.markdown! }))}
                challenges={challengeSections.map((s) => ({ label: s.label.replace(/^Challenge:\s*/, ""), markdown: s.markdown! }))}
                troubleshooting={troubleshootingSections.map((s) => ({ label: s.label.replace(/^Troubleshooting:\s*/, ""), markdown: s.markdown! }))}
              />
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
