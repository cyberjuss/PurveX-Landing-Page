"use client";

import { useEffect, useRef, useState } from "react";

export type GalleryShot = { src: string; caption: string };

// One cover image for a work item, with a count. Clicking opens a full-size
// viewer with arrows, arrow keys and swipe.
export function ProofGallery({ title, shots }: { title: string; shots: GalleryShot[] }) {
  const [at, setAt] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (at !== null && !d.open) d.showModal();
    if (at === null && d.open) d.close();
  }, [at]);

  if (!shots.length) return null;
  const go = (k: number) => setAt((k + shots.length) % shots.length);
  const shot = at === null ? null : shots[at];

  return (
    <>
      <button type="button" className="pp-cover" onClick={() => setAt(0)} aria-label={`View ${shots.length} screenshots: ${title}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {shots[0].src && <img src={shots[0].src} alt="" loading="lazy" />}
        <span className="pp-cover__count">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="14" height="12" rx="1.5" />
            <path d="M7 19h12a2 2 0 0 0 2-2V9" />
            <path d="m6 14 3-3 3 3 2-2 3 3" />
          </svg>
          {shots.length}
        </span>
      </button>
      <dialog
        ref={dialog}
        className="pp-viewer"
        aria-label={title}
        onClose={() => setAt(null)}
        onClick={(e) => e.target === dialog.current && setAt(null)}
        onKeyDown={(e) => {
          if (at === null) return;
          if (e.key === "ArrowLeft") go(at - 1);
          if (e.key === "ArrowRight") go(at + 1);
        }}
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (startX.current === null || at === null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="pp-viewer__bar">
          <span>{title}</span>
          <button type="button" onClick={() => setAt(null)} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="pp-viewer__stage">
          {shots.length > 1 && (
            <button type="button" className="pp-viewer__nav pp-viewer__nav--prev" onClick={() => at !== null && go(at - 1)} aria-label="Previous screenshot">
              ‹
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {shot && <img src={shot.src} alt={shot.caption || title} />}
          {shots.length > 1 && (
            <button type="button" className="pp-viewer__nav pp-viewer__nav--next" onClick={() => at !== null && go(at + 1)} aria-label="Next screenshot">
              ›
            </button>
          )}
        </div>
        <div className="pp-viewer__cap">
          <span>
            {at === null ? 0 : at + 1} / {shots.length}
          </span>
          {shot?.caption && <span>{shot.caption}</span>}
        </div>
        {shots.length > 1 && (
          <div className="pp-viewer__strip">
            {shots.map((s, j) => (
              <button key={s.src || j} type="button" className={j === at ? "is-on" : ""} onClick={() => setAt(j)} aria-label={`Screenshot ${j + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.src && <img src={s.src} alt="" />}
              </button>
            ))}
          </div>
        )}
      </dialog>
    </>
  );
}
