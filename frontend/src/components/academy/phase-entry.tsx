import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { loadLesson, type ContentSection, type WeekDef, type PhaseDef } from "@/lib/academy-content";
import { findQuiz } from "@/content/academy/quizzes";
import { extractEssentialQuestion } from "@/lib/markdown";
import { SectionTabs } from "./section-tabs";
import { MarkCompleteButton } from "./mark-complete-button";
import { ComingSoon } from "./coming-soon";
import { RecordLastStop } from "./academy-progress";

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

  const entryNumber = phaseEntries.findIndex((e) => e.slug === entry.slug) + 1;

  return (
    <div className="rd">
      <RecordLastStop phaseSlug={phase.slug} entrySlug={entry.slug} />
      <header className="rd-mast">
        <div className="rd-meta">
          <span>
            {entry === phase.homeLab ? "Home lab" : `${String(entryNumber).padStart(2, "0")} of ${String(phaseEntries.length).padStart(2, "0")}`}
          </span>
        </div>
        <div className="ax-entryhead">
          <div className="ax-titleblock">
            <h1>{entry.title}</h1>
            <p>{entry.summary}</p>
          </div>
          {sections.length > 0 && <MarkCompleteButton phaseSlug={phase.slug} entrySlug={entry.slug} />}
        </div>
      </header>

      {essentialQuestion && (
        <blockquote className="ax-question">
          <span className="rd-kicker">Essential question</span>
          <p>{essentialQuestion}</p>
        </blockquote>
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
            <nav className="ax-pager">
              {prevEntry ? (
                <Link href={`/academy/${phase.slug}/${prevEntry.slug}`} className="ax-pager__link">
                  <span className="rd-kicker">
                    <ArrowLeft className="h-3 w-3" /> Previous
                  </span>
                  <strong>{prevEntry.title}</strong>
                </Link>
              ) : (
                <span />
              )}
              {nextEntry ? (
                <Link href={`/academy/${phase.slug}/${nextEntry.slug}`} className="ax-pager__link ax-pager__link--next">
                  <span className="rd-kicker">
                    Next <ArrowRight className="h-3 w-3" />
                  </span>
                  <strong>{nextEntry.title}</strong>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
