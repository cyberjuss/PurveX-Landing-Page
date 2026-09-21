import { marked } from "marked";

// Content here is entirely authored by the site owner (checked into the
// repo, same trust level as any other page copy) -- never user-submitted --
// so rendering marked's HTML output directly is the same trust model the
// rest of the site already uses for its own JSX, no sanitizer needed.
marked.setOptions({ gfm: true, breaks: false });

export function Markdown({ content, className }: { content: string; className?: string }) {
  const html = marked.parse(content, { async: false }) as string;
  return <div className={`academy-prose ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export interface MarkdownSlide {
  label: string;
  markdown: string;
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
  for (const line of markdown.split("\n")) {
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
