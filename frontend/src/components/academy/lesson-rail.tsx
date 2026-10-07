"use client";

import { useEffect, useRef, useState } from "react";

// "On this page" for a lesson section. The lesson column is a reading measure,
// which on a wide screen left a third of the window empty; this puts the
// section's own shape in that space rather than stretching the prose into it.
//
// It reads the rendered headings out of the DOM instead of re-parsing the
// markdown: the page already hides all but the current mission, so what the
// student can actually see is the only honest source for this list.

type Head = { id: string; text: string; sub: boolean };

export function LessonRail({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
  const [heads, setHeads] = useState<Head[]>([]);
  const [here, setHere] = useState<string>("");
  const raf = useRef(0);

  useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const read = () => {
      const found: Head[] = [];
      root.querySelectorAll<HTMLElement>(".academy-prose h2[id], .academy-prose h3[id]").forEach((h) => {
        // Skip anything the pager has folded away: a list of headings the
        // student cannot scroll to is worse than no list.
        if (h.closest(".ad-mission--off, .ad-brief--off, [hidden]")) return;
        if (!h.offsetParent && h.offsetHeight === 0) return;
        found.push({ id: h.id, text: h.textContent?.trim() ?? "", sub: h.tagName === "H3" });
      });
      setHeads((prev) =>
        prev.length === found.length && prev.every((p, i) => p.id === found[i].id) ? prev : found
      );
    };

    read();
    const obs = new MutationObserver(() => {
      window.cancelAnimationFrame(raf.current);
      raf.current = window.requestAnimationFrame(read);
    });
    obs.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
    return () => {
      obs.disconnect();
      window.cancelAnimationFrame(raf.current);
    };
  }, [scope]);

  // Which heading the reader is under. rootMargin pulls the trigger line to
  // just below the sticky section tabs, so the highlight changes when the
  // heading reaches the top of the readable area rather than the viewport.
  useEffect(() => {
    if (heads.length < 2) return;
    const els = heads.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setHere(hit.target.id);
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: 0 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [heads]);

  // One heading is the whole section, so a contents list for it says nothing.
  if (heads.length < 2) return null;

  return (
    <aside className="ax-rail" aria-label="On this page">
      <div className="ax-rail__inner">
        <p className="ax-rail__head">On this page</p>
        <nav className="ax-rail__nav">
          {heads.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`ax-rail__link${h.sub ? " ax-rail__link--sub" : ""}${here === h.id ? " ax-rail__link--on" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (!el) return;
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                setHere(h.id);
                history.replaceState(null, "", `#${h.id}`);
              }}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
