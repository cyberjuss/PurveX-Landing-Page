"use client";

// Next.js re-mounts template.tsx (unlike layout.tsx) on every navigation,
// which is what makes it the right place for a route-transition animation
// that applies uniformly across the whole site -- both client-side nav and
// a hard refresh get the same fade instead of popping in instantly.
//
// Opacity only, deliberately no transform: several pages (chrome.tsx's
// fixed background layer, scroll-progress bar, and mobile menu overlay)
// use `position: fixed` nested inside what this wraps. A `transform` on an
// ancestor -- even a resting `translateY(0)` after the animation ends --
// creates a new CSS containing block and permanently breaks those fixed
// elements' viewport positioning, not just during the transition. Opacity
// has the same effect only while it's below 1, and this always settles at
// exactly 1, so nothing stays broken once the fade completes.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pvrx-page-enter">{children}</div>
      <style>{`
        @keyframes pvrx-page-enter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .pvrx-page-enter {
          animation: pvrx-page-enter 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .pvrx-page-enter { animation: none; }
        }
      `}</style>
    </>
  );
}
