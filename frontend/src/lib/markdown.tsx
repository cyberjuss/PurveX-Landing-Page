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
