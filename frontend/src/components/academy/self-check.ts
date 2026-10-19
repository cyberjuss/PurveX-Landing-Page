// Self-check multiple choice inside a lab's markdown. The markdown is injected
// as HTML, so these are wired by delegation rather than rendered as React.
//
// Two kinds, told apart by whether the block carries data-answer:
//   Before You Start -- a prediction. The choice locks and nothing is marked
//     right or wrong, because the point is to commit before the lab tells you.
//   Check Yourself   -- graded. The correct option turns green, a wrong pick
//     turns red, and the explanation is revealed.
//
// Answers persist for the browser session, keyed by the block's data-check id,
// so moving between slides and back does not wipe them.

function keyFor(storageKey: string | undefined, block: HTMLElement): string | null {
  const id = block.dataset.check;
  if (!id) return null;
  return `academy-check:${storageKey ?? "lab"}:${id}`;
}

/** Paint a block as answered. Shared by a fresh click and a session restore. */
function apply(block: HTMLElement, chosen: string): void {
  block.dataset.answered = "1";
  const answer = block.dataset.answer ?? null;
  block.querySelectorAll<HTMLElement>(".ad-check__opt").forEach((o) => {
    o.setAttribute("aria-disabled", "true");
    const i = o.dataset.i;
    o.classList.toggle("is-chosen", i === chosen);
    if (answer !== null) {
      o.classList.toggle("is-correct", i === answer);
      o.classList.toggle("is-wrong", i === chosen && i !== answer);
    }
  });
  const note = block.querySelector<HTMLElement>(".ad-check__note");
  if (note) note.classList.add("is-shown");
}

/**
 * Wire every self-check inside `root`, and restore any already answered this
 * session. Returns a cleanup that removes the listener. Safe to call again on
 * each slide change; it re-restores the newly mounted slide.
 */
export function wireSelfChecks(root: HTMLElement, storageKey?: string): () => void {
  const onClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const opt = target.closest<HTMLElement>(".ad-check__opt");
    if (!opt || !root.contains(opt)) return;
    const block = opt.closest<HTMLElement>(".ad-check");
    if (!block || block.dataset.answered) return;
    const chosen = opt.dataset.i;
    if (chosen === undefined) return;
    apply(block, chosen);
    const k = keyFor(storageKey, block);
    if (k) {
      try {
        window.sessionStorage.setItem(k, chosen);
      } catch {}
    }
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}

/** Re-apply saved answers for the self-checks currently in `root`. */
export function restoreSelfChecks(root: HTMLElement, storageKey?: string): void {
  root.querySelectorAll<HTMLElement>(".ad-check:not([data-answered])").forEach((block) => {
    const k = keyFor(storageKey, block);
    if (!k) return;
    let saved: string | null = null;
    try {
      saved = window.sessionStorage.getItem(k);
    } catch {}
    if (saved === null) return;
    const opt = block.querySelector<HTMLElement>(`.ad-check__opt[data-i="${saved}"]`);
    if (opt) apply(block, saved);
  });
}
