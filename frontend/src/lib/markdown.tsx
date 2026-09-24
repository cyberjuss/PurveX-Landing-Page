import { marked } from "marked";

// Content here is entirely authored by the site owner (checked into the
// repo, same trust level as any other page copy) -- never user-submitted --
// so rendering marked's HTML output directly is the same trust model the
// rest of the site already uses for its own JSX, no sanitizer needed.
marked.setOptions({ gfm: true, breaks: false });

function markCommandParagraphs(html: string) {
  return html.replace(/<p>\s*(<code\b[\s\S]*?<\/code>)\s*<\/p>/gi, '<p class="ad-cmd">$1</p>');
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const html = markCommandParagraphs(marked.parse(content, { async: false }) as string);
  return <div className={`academy-prose ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export interface MarkdownSlide {
  label: string;
  markdown: string;
}

const ESSENTIAL_QUESTION_RE =
  /<div class="academy-question">\s*<span class="academy-question__tag">Essential Question<\/span>\s*<p>([\s\S]*?)<\/p>\s*<\/div>/;

// A week's page can chain several sections (an Overview tab plus one or
// more labs), and each was authored with its own Essential Question block
// at the top. Left in place, a student sees that same callout repeated
// down the page. This pulls the first one out to show once at the page
// level and strips the block from every section's markdown, collapsing
// a doubled "---" divider left behind where one wrapped the block on
// both sides.
export function extractEssentialQuestion(markdown: string): { question: string | null; rest: string } {
  const match = ESSENTIAL_QUESTION_RE.exec(markdown);
  if (!match) return { question: null, rest: markdown };
  const rest = (markdown.slice(0, match.index) + markdown.slice(match.index + match[0].length))
    .replace(/---\s*\n+\s*---/g, "---")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { question: match[1].trim(), rest };
}

// Splits a lab's markdown on its own ## / ### headings so it can be shown
// as a slide-through carousel instead of one long scroll. Everything
// before the first heading (title/tool line, the Essential Question) is
// its own lead-in slide. Skips heading matches inside fenced code blocks,
// and drops any heading that turns out to have no body under it (a bare
// structural label isn't worth a slide of its own).
export function splitMarkdownIntoSlides(markdown: string): MarkdownSlide[] {
  const chunks: { heading: string | null; lines: string[] }[] = [{ heading: null, lines: [] }];
  let inFence = false;
  // Some lesson files are saved with Windows line endings -- splitting on
  // "\n" alone leaves a trailing "\r" on every line, and "." doesn't match
  // "\r" in JS regex, so the heading pattern's trailing "$" never lands and
  // no heading ever matches. Normalizing first is what makes those files
  // split into slides at all instead of collapsing into one.
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const headingMatch = !inFence ? /^(#{2,3})\s+(.*)$/.exec(line) : null;
    if (headingMatch) {
      chunks.push({ heading: headingMatch[2].replace(/\*\*/g, "").trim(), lines: [line] });
    } else {
      chunks[chunks.length - 1].lines.push(line);
    }
  }

  return chunks
    .map((c) => ({ label: c.heading ?? "Overview", markdown: c.lines.join("\n").trim() }))
    .filter((c, i) => {
      const withHeadingStripped = chunks[i].heading ? c.markdown.split("\n").slice(1).join("\n").trim() : c.markdown;
      return withHeadingStripped.length > 0;
    });
}
