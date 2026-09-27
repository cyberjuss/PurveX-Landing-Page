"use client";

import { useEffect, useRef, useState } from "react";

export type GalleryShot = { src: string; caption: string };

// Thumbnails for one lab work item. Clicking opens a full-size viewer with
// arrows, arrow keys and swipe.
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
      <div className="pp-gal">
        {shots.map((s, j) => (
          <button key={s.src} type="button" className="pp-gal__thumb" onClick={() => setAt(j)} aria-label={`Open screenshot ${j + 1} of ${shots.length}${s.caption ? `: ${s.caption}` : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
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
        <p className="pp-viewer__cap">
          <span>
            {at === null ? 0 : at + 1} / {shots.length}
          </span>
          {shot?.caption && <span>{shot.caption}</span>}
        </p>
      </dialog>
    </>
  );
}
