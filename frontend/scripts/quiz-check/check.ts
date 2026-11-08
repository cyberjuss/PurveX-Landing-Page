/**
 * Does every quiz actually test the week it is filed under?
 *
 *   npm run check:quiz
 *
 * A quiz is keyed by phaseSlug and weekSlug, matched against a week by
 * findQuiz(phase.slug, entry.slug). Nothing ever checked that the key names
 * a real entry, which is how a whole quiz once ended up filed under
 * home-lab-desk while testing home-lab-setup and home-lab-directory's
 * content instead, and home-lab-desk itself had no quiz at all.
 *
 * Pure structure, no database and no content judgment: option counts,
 * correctIndex in range, no duplicate options, and every key naming an
 * entry that exists.
 */
import { phases } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { quizzes } from "@/content/academy/quizzes";

let failures = 0;
function t(name: string, ok: boolean, detail = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "\x1b[32mok  \x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const realKeys = new Set(phases.flatMap((p) => entriesOf(p).map((e) => `${p.slug}:${e.slug}`)));

const seen = new Set<string>();
for (const quiz of quizzes) {
  const key = `${quiz.phaseSlug}:${quiz.weekSlug}`;
  t(`${key} names a real entry`, realKeys.has(key));
  t(`${key} is not a duplicate key`, !seen.has(key));
  seen.add(key);
  t(`${key} has at least one question`, quiz.questions.length > 0);

  quiz.questions.forEach((q, i) => {
    const label = `${key} question ${i + 1}`;
    t(`${label} has at least two options`, q.options.length >= 2);
    t(`${label}'s correctIndex is in range`, q.correctIndex >= 0 && q.correctIndex < q.options.length, `${q.correctIndex} of ${q.options.length}`);
    t(`${label} has no duplicate options`, new Set(q.options).size === q.options.length);
    t(`${label} has question and explanation text`, Boolean(q.question?.trim()) && Boolean(q.explanation?.trim()));
  });
}

console.log(`\n${quizzes.length} quizzes, ${quizzes.reduce((n, q) => n + q.questions.length, 0)} questions.`);
console.log(failures ? `\n\x1b[31m${failures} failed\x1b[0m` : "\n\x1b[32mall passed\x1b[0m");
process.exit(failures ? 1 : 0);
