import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { phase1Weeks, phase1HomeLab, loadLesson, type ContentSection } from "@/lib/academy-content";
import { Markdown } from "@/lib/markdown";

export function generateStaticParams() {
  return [...phase1Weeks.map((w) => ({ slug: w.slug })), { slug: phase1HomeLab.slug }];
}

function findEntry(slug: string) {
  if (slug === phase1HomeLab.slug) return phase1HomeLab;
  return phase1Weeks.find((w) => w.slug === slug);
}

export default async function Phase1EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findEntry(slug);
  if (!entry) notFound();

  const sections = entry.sections
    .map((section: ContentSection) => ({ ...section, markdown: loadLesson(section.file) }))
    .filter((s) => s.markdown && s.markdown.trim().length > 0);

  return (
    <div>
      <Link href="/academy/phase-1" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Phase 1
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
        <div className="mt-8 flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.file} className="rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold text-slate-900">{section.label}</h2>
              <Markdown content={section.markdown!} className="mt-3" />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
