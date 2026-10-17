"use client";

import { useMemo } from "react";
import { marked, type Tokens } from "marked";
import { ArrowUpRight, BookOpen, Code2, FileText, Globe, PlayCircle, Quote, Wrench } from "lucide-react";
import "./resources-view.css";

// A week's Resources tab, read from its markdown (a numbered list of links,
// then "Sources for this week's facts" as a list of "**fact:** [source](url)")
// and drawn as reading cards and a sources table instead of a wall of
// underlined text. Anything that does not fit that shape is shown as before.

type Link = { title: string; url: string; host: string };
type Reading = Link & { note: string };
type Source = { fact: string; links: Link[] };

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const linksIn = (tokens: Tokens.Generic[] | undefined): Link[] =>
  (tokens ?? []).flatMap((t) => (t.type === "link" ? [{ title: (t as Tokens.Link).text, url: (t as Tokens.Link).href, host: host((t as Tokens.Link).href) }] : linksIn((t as { tokens?: Tokens.Generic[] }).tokens)));

/** What kind of thing a link is, from where it points, for its icon. */
function kindOf(url: string) {
  const u = url.toLowerCase();
  if (u.endsWith(".pdf") || u.includes("nvlpubs.nist.gov") || u.includes("rfc-editor.org") || u.includes("csrc.nist.gov")) return { Icon: FileText, label: "Standard" };
  if (u.includes("github.com")) return { Icon: Code2, label: "Code" };
  if (u.includes("youtube.com") || u.includes("youtu.be")) return { Icon: PlayCircle, label: "Video" };
  if (u.includes("cyberchef") || u.includes("zaproxy") || u.includes("wireshark.org") || u.includes("hashcat.net/wiki")) return { Icon: Wrench, label: "Tool" };
  if (u.includes("cheatsheet") || u.includes("cheat-sheet") || u.includes("learn.microsoft.com") || u.includes("portswigger.net")) return { Icon: BookOpen, label: "Guide" };
  return { Icon: Globe, label: "Article" };
}

function parse(markdown: string): { readings: Reading[]; sources: Source[] } | null {
  const tokens = marked.lexer(markdown);
  const readings: Reading[] = [];
  const sources: Source[] = [];
  let inSources = false;
  for (const t of tokens) {
    if (t.type === "heading") {
      inSources = /source/i.test(t.text);
      continue;
    }
    if (t.type === "space") continue;
    if (t.type !== "list") return null;
    for (const item of (t as Tokens.List).items) {
      const inline = (item.tokens?.[0] as { tokens?: Tokens.Generic[] } | undefined)?.tokens ?? [];
      const links = linksIn(inline);
      if (!links.length) return null;
      if (inSources) {
        const strong = inline.find((x) => x.type === "strong") as Tokens.Strong | undefined;
        sources.push({ fact: (strong?.text ?? "").replace(/:\s*$/, ""), links });
      } else {
        const first = links[0];
        const note = item.text.replace(/\[[^\]]*\]\([^)]*\)/g, "").replace(/^[\s:–—-]+|[\s]+$/g, "");
        readings.push({ ...first, note });
      }
    }
  }
  return readings.length || sources.length ? { readings, sources } : null;
}

export function ResourcesView({ markdown, fallback }: { markdown: string; fallback: React.ReactNode }) {
  const parsed = useMemo(() => parse(markdown), [markdown]);
  if (!parsed) return <>{fallback}</>;
  const { readings, sources } = parsed;
  return (
    <div className="rs">
      {readings.length > 0 && (
        <section className="rs-sec">
          <p className="rs-kicker">
            <BookOpen aria-hidden /> Read further
          </p>
          <h2 className="rs-title">Picked for this week</h2>
          <ol className="rs-grid">
            {readings.map((r, i) => {
              const { Icon, label } = kindOf(r.url);
              return (
                <li key={r.url + i} style={{ ["--i" as string]: Math.min(i, 4) }}>
                  <a className="rs-card" href={r.url} target="_blank" rel="noreferrer">
                    <span className="rs-card__icon" aria-hidden>
                      <Icon />
                    </span>
                    <span className="rs-card__main">
                      <span className="rs-card__meta">
                        {label} · {r.host}
                      </span>
                      <span className="rs-card__title">{r.title}</span>
                      {r.note && <span className="rs-card__note">{r.note}</span>}
                    </span>
                    <ArrowUpRight className="rs-card__go" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {sources.length > 0 && (
        <section className="rs-sec">
          <p className="rs-kicker">
            <Quote aria-hidden /> Sources
          </p>
          <h2 className="rs-title">Where this week&apos;s facts come from</h2>
          <ul className="rs-sources">
            {sources.map((s, i) => (
              <li key={i}>
                <span className="rs-sources__fact">{s.fact}</span>
                <span className="rs-sources__links">
                  {s.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noreferrer" title={l.title}>
                      <span>{l.title}</span>
                      <small>{l.host}</small>
                      <ArrowUpRight aria-hidden />
                    </a>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
