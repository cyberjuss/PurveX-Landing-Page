"use client";

import { MessageSquareText } from "lucide-react";
import { coworker } from "./soc-people";

const askCoach = (question: string) => window.dispatchEvent(new CustomEvent("academy:ask-coach", { detail: { question } }));

/**
 * A conversation with a coworker, over the bottom of the room. Their opening
 * line, then the questions you can put to them by click or by number key, and
 * a way to take any answer to the Coach for more depth.
 *
 * Buttons keep focus on the room (mousedown is cancelled), so walking keys
 * still work and walking away ends the conversation.
 */
export function SocTalk({ id, chosen, onPick, onLeave }: { id: string; chosen: number | null; onPick: (k: number) => void; onLeave: () => void }) {
  const c = coworker(id);
  if (!c) return null;
  const topic = chosen !== null ? c.topics[chosen] : null;
  const keep = (e: React.MouseEvent) => e.preventDefault();
  const initials = c.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="sw-talk" role="dialog" aria-label={`Talking with ${c.name}`} onPointerDown={(e) => e.stopPropagation()}>
      <div className="sw-talk__head">
        <span className="sw-talk__badge" aria-hidden="true">
          {initials}
        </span>
        <div>
          <p className="sw-talk__name">{c.name}</p>
          <p className="sw-talk__role">{c.role}</p>
        </div>
        <button type="button" className="sw-talk__leave" onMouseDown={keep} onClick={onLeave}>
          <kbd>Esc</kbd> Leave
        </button>
      </div>
      <p key={chosen ?? -1} className="sw-talk__line">
        {topic ? topic.a : c.hello}
      </p>
      <div className="sw-talk__asks">
        {c.topics.map((t, k) => (
          <button key={t.q} type="button" className={chosen === k ? "is-on" : ""} onMouseDown={keep} onClick={() => onPick(k)} aria-pressed={chosen === k}>
            <kbd>{k + 1}</kbd> {t.q}
          </button>
        ))}
        {topic && (
          <button
            type="button"
            className="sw-talk__deeper"
            onMouseDown={keep}
            onClick={() => askCoach(`${c.name}, the ${c.role} at PurveX Financial, told me: "${topic.a}" Help me understand this better, and tell me what I should watch for as a Tier 1 analyst.`)}
          >
            <MessageSquareText aria-hidden /> Take this to the Coach
          </button>
        )}
      </div>
    </div>
  );
}
