"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, GripVertical, RotateCcw } from "lucide-react";
import { confettiFrom } from "@/lib/confetti";
import type { DeckActivity } from "@/lib/lesson-deck";

// Same shuffle on the server and in the browser, so the first paint matches
// and a refresh does not reshuffle the cards under the student's hand.
function seeded<T>(list: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const MOVE_SLOP = 6;

// Pointer-driven drag, so it works with a mouse, a pen and a finger alike.
// Native HTML drag and drop does nothing on a phone. A press that barely
// moves counts as a click, which is how the keyboard and tap path works:
// pick a card, then pick where it goes.
function useDrag(
  onDrop: (id: string, x: number, y: number) => void,
  onHover?: (id: string, x: number, y: number) => void,
  /** Move the element with the pointer. Off for a list that reorders under it instead. */
  follow = true
) {
  const drag = useRef<{ id: string; el: HTMLElement; x: number; y: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const bind = (id: string) => ({
    onPointerDown(e: React.PointerEvent<HTMLElement>) {
      if (e.button !== 0) return;
      drag.current = { id, el: e.currentTarget, x: e.clientX, y: e.clientY, moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e: React.PointerEvent<HTMLElement>) {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < MOVE_SLOP) return;
      if (!d.moved) {
        d.moved = true;
        setDragging(id);
      }
      if (follow) d.el.style.transform = `translate(${dx}px, ${dy}px)`;
      onHover?.(id, e.clientX, e.clientY);
    },
    onPointerUp(e: React.PointerEvent<HTMLElement>) {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      d.el.style.transform = "";
      setDragging(null);
      if (d.moved) {
        // Keep the click that follows a real drag from also selecting the card.
        d.el.dataset.dragged = "1";
        onDrop(id, e.clientX, e.clientY);
      }
    },
    onPointerCancel() {
      if (drag.current) drag.current.el.style.transform = "";
      drag.current = null;
      setDragging(null);
    },
  });

  return { bind, dragging };
}

/** The slot under the pointer, found by a data attribute on it or an ancestor. */
function slotAt(x: number, y: number, attr: string): string | null {
  for (const el of document.elementsFromPoint(x, y)) {
    const hit = (el as HTMLElement).closest?.(`[${attr}]`);
    if (hit) return hit.getAttribute(attr);
  }
  return null;
}

function SortActivity({ activity }: { activity: Extract<DeckActivity, { kind: "sort" }> }) {
  const cards = useMemo(
    () =>
      seeded(
        activity.buckets.flatMap((b, bi) => b.items.map((text, ii) => ({ id: `${bi}-${ii}`, text, bucket: bi }))),
        activity.prompt
      ),
    [activity]
  );
  const match = activity.layout === "match";
  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [note, setNote] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const left = cards.filter((c) => placed[c.id] === undefined);
  const done = left.length === 0;

  function place(id: string, bucket: number) {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setPicked(null);
    if (card.bucket === bucket) {
      const next = { ...placed, [id]: bucket };
      setPlaced(next);
      setNote(match ? `Correct. That is ${card.text}.` : `Correct. ${card.text} goes in ${activity.buckets[bucket].name}.`);
      if (Object.keys(next).length === cards.length) window.setTimeout(() => confettiFrom(rootRef.current, 40), 120);
    } else {
      setMistakes((m) => m + 1);
      setMiss(id);
      setNote(match ? `Not that one. ${card.text} belongs on another line.` : `Not ${activity.buckets[bucket].name}. Try another.`);
      window.setTimeout(() => setMiss((m) => (m === id ? null : m)), 450);
    }
  }

  const { bind, dragging } = useDrag(
    (id, x, y) => {
      setHover(null);
      const slot = slotAt(x, y, "data-bucket");
      if (slot !== null) place(id, Number(slot));
    },
    (_id, x, y) => {
      const slot = slotAt(x, y, "data-bucket");
      setHover(slot === null ? null : Number(slot));
    }
  );

  function reset() {
    setPlaced({});
    setPicked(null);
    setMistakes(0);
    setNote("");
  }

  return (
    <div className="lkd" ref={rootRef}>
      <p className="lkd__prompt">{activity.prompt}</p>
      <p className="lkd__how">
        {match ? "Drag each term onto the line it matches, or tap a term and then a line." : "Drag each card into a box, or tap a card and then a box."}
      </p>

      <div className={`lkd__pool${done ? " is-empty" : ""}`} aria-label="Cards to sort">
        {done ? (
          <span className="lkd__done">
            <Check className="h-4 w-4" /> {match ? "All matched" : "All sorted"}{mistakes ? `, ${mistakes} ${mistakes === 1 ? "miss" : "misses"} on the way` : " on the first try"}.
          </span>
        ) : (
          left.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`lkd__card${picked === c.id ? " is-picked" : ""}${dragging === c.id ? " is-dragging" : ""}${miss === c.id ? " is-miss" : ""}`}
              aria-pressed={picked === c.id}
              {...bind(c.id)}
              onClick={(e) => {
                const el = e.currentTarget;
                if (el.dataset.dragged) {
                  delete el.dataset.dragged;
                  return;
                }
                setPicked(picked === c.id ? null : c.id);
              }}
            >
              <GripVertical className="lkd__grip" aria-hidden />
              {c.text}
            </button>
          ))
        )}
      </div>

      {match ? (
        // Match: one row per definition or scenario, with a slot for its term.
        <div className="lkd__rows">
          {activity.buckets.map((b, bi) => {
            const got = cards.find((c) => placed[c.id] === bi);
            return (
              <div
                key={b.name}
                data-bucket={bi}
                role="button"
                tabIndex={picked && !got ? 0 : -1}
                aria-label={got ? `${b.name}: ${got.text}` : picked ? `Match the card to: ${b.name}` : b.name}
                className={`lkd__row${hover === bi ? " is-over" : ""}${picked && !got ? " is-ready" : ""}${got ? " is-done" : ""}`}
                onClick={() => picked && !got && place(picked, bi)}
                onKeyDown={(e) => {
                  if (picked && !got && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    place(picked, bi);
                  }
                }}
              >
                <span className="lkd__rowtext">{b.name}</span>
                <span className="lkd__slot">
                  {got ? (
                    <span className="lkd__card lkd__card--in">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      {got.text}
                    </span>
                  ) : (
                    <span className="lkd__slotempty">Drop here</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
      <div className="lkd__buckets" style={{ ["--cols" as string]: activity.buckets.length === 4 ? 4 : Math.min(activity.buckets.length, 3) }}>
        {activity.buckets.map((b, bi) => (
          <div
            key={b.name}
            data-bucket={bi}
            role="button"
            tabIndex={picked ? 0 : -1}
            aria-label={picked ? `Put the card in ${b.name}` : b.name}
            className={`lkd__bucket${hover === bi ? " is-over" : ""}${picked ? " is-ready" : ""}`}
            onClick={() => picked && place(picked, bi)}
            onKeyDown={(e) => {
              if (picked && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                place(picked, bi);
              }
            }}
          >
            <span className="lkd__bucketname">{b.name}</span>
            <div className="lkd__placed">
              {cards
                .filter((c) => placed[c.id] === bi)
                .map((c) => (
                  <span key={c.id} className="lkd__card lkd__card--in">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {c.text}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="lkd__foot">
        <span className="lkd__note" aria-live="polite">
          {note}
        </span>
        {Object.keys(placed).length > 0 && (
          <button type="button" className="lkd__reset" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Start over
          </button>
        )}
      </div>
    </div>
  );
}

function OrderActivity({ activity }: { activity: Extract<DeckActivity, { kind: "order" }> }) {
  const start = useMemo(() => {
    const ids = activity.items.map((_, i) => i);
    const mixed = seeded(ids, activity.prompt);
    // Never hand over the answer: a shuffle that came out in order gets rotated.
    return mixed.every((v, i) => v === i) ? [...mixed.slice(1), mixed[0]] : mixed;
  }, [activity]);
  const [order, setOrder] = useState<number[]>(start);
  const [checked, setChecked] = useState(false);
  const [tries, setTries] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const right = order.every((v, i) => v === i);
  const solved = checked && right;

  function move(item: number, to: number) {
    setOrder((prev) => {
      const from = prev.indexOf(item);
      const clamped = Math.max(0, Math.min(prev.length - 1, to));
      if (from === clamped) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(clamped, 0, item);
      return next;
    });
    setChecked(false);
  }

  const { bind, dragging } = useDrag(
    () => {},
    (id, x, y) => {
      const slot = slotAt(x, y, "data-slot");
      if (slot !== null) move(Number(id), Number(slot));
    },
    false
  );

  function check() {
    setChecked(true);
    setTries((t) => t + 1);
    if (right) window.setTimeout(() => confettiFrom(rootRef.current, 40), 120);
  }

  return (
    <div className="lkd" ref={rootRef}>
      <p className="lkd__prompt">{activity.prompt}</p>
      <p className="lkd__how">Drag the steps into order, or use the arrows. Then check.</p>
      <ol className="lkd__list">
        {order.map((item, pos) => {
          const state = checked ? (item === pos ? " is-right" : " is-wrong") : "";
          return (
            <li key={item} data-slot={pos} className={`lkd__step${state}${dragging === String(item) ? " is-dragging" : ""}`}>
              <span className="lkd__num">{pos + 1}</span>
              <span className="lkd__handle" {...bind(String(item))} aria-hidden>
                <GripVertical className="h-4 w-4" />
              </span>
              <span className="lkd__text">{activity.items[item]}</span>
              <span className="lkd__arrows">
                <button type="button" aria-label="Move up" disabled={pos === 0 || solved} onClick={() => move(item, pos - 1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={pos === order.length - 1 || solved}
                  onClick={() => move(item, pos + 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="lkd__foot">
        <span className="lkd__note" aria-live="polite">
          {solved
            ? tries === 1
              ? "In order on the first try."
              : "In order."
            : checked
              ? `${order.filter((v, i) => v === i).length} of ${order.length} in the right place. Move the red ones.`
              : ""}
        </span>
        {solved ? (
          <span className="lkd__done">
            <Check className="h-4 w-4" /> Done
          </span>
        ) : (
          <button type="button" className="rd-cta lkd__check" onClick={check}>
            Check order
          </button>
        )}
      </div>
    </div>
  );
}

export function DragActivity({ activity }: { activity: DeckActivity }) {
  return activity.kind === "sort" ? <SortActivity activity={activity} /> : <OrderActivity activity={activity} />;
}
