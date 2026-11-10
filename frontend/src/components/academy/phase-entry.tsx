import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { stripAnswers } from "@/lib/academy-answers";
import { loadLesson, phaseChallenges, type ContentSection, type WeekDef, type PhaseDef } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { findQuiz } from "@/content/academy/quizzes";
import { extractEssentialQuestion } from "@/lib/markdown";
import { SectionTabs } from "./section-tabs";
import { isDeckable } from "@/lib/lesson-deck";
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
      // Challenges keep their own briefing and title. Do not lift their
      // question to the page or strip it from the tab. Their answers stay on
      // the server.
      if (section.label.startsWith("Challenge:")) {
        return { section: { ...section, markdown: stripAnswers(raw) }, question: null };
      }
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
  const phaseEntries = entriesOf(phase);
  const availableEntries = phaseEntries.filter((e) => e.sections.length > 0);
  const currentIndex = availableEntries.findIndex((e) => e.slug === entry.slug);
  const prevEntry = currentIndex > 0 ? availableEntries[currentIndex - 1] : undefined;
  const nextEntry = currentIndex >= 0 && currentIndex < availableEntries.length - 1 ? availableEntries[currentIndex + 1] : undefined;

  // A CTF-style challenge (e.g. Operation Day One) and a troubleshooting
  // page get their own group in the section nav instead of blending in with
  // the rest, named "Challenge: ..." / "Troubleshooting: ..." by convention.
  // Every lab is itself a challenge now, so there is no separate "Lab:" group.
  const challengeSections = sections.filter((s) => s.label.startsWith("Challenge:"));
  const troubleshootingSections = sections.filter((s) => s.label.startsWith("Troubleshooting:"));
  const otherSections = sections.filter(
    (s) => !s.label.startsWith("Challenge:") && !s.label.startsWith("Troubleshooting:")
  );

  return (
    <div className="rd">
      <RecordLastStop phaseSlug={phase.slug} entrySlug={entry.slug} />
      <header className="rd-mast">
        <div className="ax-entryhead">
          <div className="ax-titleblock">
            <h1>{entry.title}</h1>
            <p>{entry.summary}</p>
          </div>
          {sections.length > 0 && <MarkCompleteButton phaseSlug={phase.slug} entrySlug={entry.slug} />}
        </div>
      </header>

      {/* When the first tab is a slide deck, the question opens it as its own
          slide instead (see LessonDeck). Otherwise it stays here. */}
      {essentialQuestion && !(otherSections[0] && isDeckable(otherSections[0].markdown ?? "") && otherSections[0].label !== "Resources") && (
        <blockquote className="ax-question">
          <span className="rd-kicker">Essential question</span>
          <p>{essentialQuestion}</p>
        </blockquote>
      )}

      {sections.length === 0 ? (
        <>
          <ComingSoon message="Content for this week is still being written. It will appear here as soon as it is ready." />
          {(prevEntry || nextEntry) && (
            <nav className="ax-pager">
              {prevEntry ? (
                <Link href={`/range/${phase.slug}/${prevEntry.slug}`} className="ax-pager__link">
                  <span className="rd-kicker">
                    <ArrowLeft className="h-3 w-3" />
                  </span>
                  <strong>{prevEntry.title}</strong>
                </Link>
              ) : (
                <span />
              )}
              {nextEntry ? (
                <Link href={`/range/${phase.slug}/${nextEntry.slug}`} className="ax-pager__link ax-pager__link--next">
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
      ) : (
        <>
          {(otherSections.length > 0 || challengeSections.length > 0 || troubleshootingSections.length > 0) && (
            <div className="mt-8">
              <SectionTabs
                phaseSlug={phase.slug}
                entrySlug={entry.slug}
                sections={otherSections.map((s) => ({ label: s.label, markdown: s.markdown! }))}
                quiz={quiz}
                challenges={challengeSections.map((s) => ({ label: s.label.replace(/^Challenge:\s*/, ""), markdown: s.markdown! }))}
                allChallenges={phaseChallenges(phase)}
                troubleshooting={troubleshootingSections.map((s) => ({ label: s.label.replace(/^Troubleshooting:\s*/, ""), markdown: s.markdown! }))}
                prevWeek={prevEntry ? { label: prevEntry.title, href: `/range/${phase.slug}/${prevEntry.slug}` } : null}
                nextWeek={nextEntry ? { label: nextEntry.title, href: `/range/${phase.slug}/${nextEntry.slug}` } : null}
                essentialQuestion={essentialQuestion}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
