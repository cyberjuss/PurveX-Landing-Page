"use client";

import { useState } from "react";
import { Markdown } from "@/lib/markdown";
import { QuizBlock } from "./quiz";
import type { Quiz } from "@/content/academy/quizzes";

interface TabSection {
  label: string;
  markdown: string;
}

export function SectionTabs({ sections, quiz }: { sections: TabSection[]; quiz?: Quiz }) {
  const tabLabels = quiz ? [...sections.map((s) => s.label), "Test yourself"] : sections.map((s) => s.label);
  const [active, setActive] = useState(0);
  const isQuizTab = quiz !== undefined && active === sections.length;

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2 border-b border-[var(--pvrx-border-light)] pb-3">
        {tabLabels.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              active === i
                ? "bg-gradient-to-b from-[#6a5cff] to-[#5546e0] text-white shadow-[0_6px_16px_-6px_rgba(85,70,224,0.55)]"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-6 shadow-[0_1px_2px_rgba(16,25,46,0.04),0_20px_40px_-32px_rgba(16,25,46,0.18)] sm:p-8">
        {isQuizTab ? <QuizBlock quiz={quiz!} /> : <Markdown content={sections[active].markdown} />}
      </div>
    </div>
  );
}
