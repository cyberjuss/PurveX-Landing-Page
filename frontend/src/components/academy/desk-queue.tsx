"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Flame, Headset, Radio } from "lucide-react";
import { useMounted } from "@/lib/use-mounted";

// The Desk: today's case, this week's investigation and the shift as one
// service-desk queue, laid out the way a ticketing tool shows a real one.

export type DeskTone = "new" | "open" | "blocked" | "done" | "missed";

export type DeskTicket = {
  key: string;
  /** INC-1327, SEC-48: a ticket number the way a queue shows one. */
  number: string;
  priority: 1 | 2 | 3 | 4;
  type: string;
  title: string;
  summary: string;
  requester: string;
  due: string;
  state: { label: string; tone: DeskTone };
  action?: ReactNode;
  error?: string | null;
  tour?: string;
};

const PRIORITY: Record<DeskTicket["priority"], string> = { 1: "Critical", 2: "High", 3: "Routine", 4: "Low" };

function LiveClock() {
  // The server has no idea of the viewer's time zone, so the time shows once in the browser.
  const mounted = useMounted();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(t);
  }, []);
  return <span className="dk-clock">{mounted ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "––:––"}</span>;
}

export function DeskQueue({
  tickets,
  shift,
  streak,
  week,
  level,
  rank,
  tools,
  footer,
}: {
  tickets: DeskTicket[];
  /** The clock-in action for a full shift, or the way to unlock one. */
  shift: { href: string; label: string; note: string; locked: boolean };
  streak: number;
  week: { day: string; label: string; date: string; done: boolean; today: boolean }[];
  level: string;
  rank: { title: string; href: string } | null;
  /** Buttons that sit at the head of the desk, beside the clock. */
  tools?: ReactNode;
  footer?: ReactNode;
}) {
  const open = tickets.filter((t) => t.state.tone !== "done" && t.state.tone !== "missed");
  const closed = tickets.length - open.length;
  // Highest priority first, the way a queue is worked.
  const sorted = [...tickets].sort((a, b) => Number(a.state.tone === "done" || a.state.tone === "missed") - Number(b.state.tone === "done" || b.state.tone === "missed") || a.priority - b.priority);

  return (
    <div className="dk">
      <header className="dk-head">
        <div className="dk-head__id">
          <span className="dk-mark" aria-hidden>
            <Headset className="h-5 w-5" />
          </span>
          <div>
            <span className="dk-kicker">PurveX Financial · Service Desk</span>
            <h1>The Desk</h1>
          </div>
        </div>
        <div className="dk-head__live">
          <span className="dk-status">
            <i aria-hidden />
            Off shift
          </span>
          <LiveClock />
          {tools}
        </div>
      </header>

      <section className={`dk-clockin${shift.locked ? " is-locked" : ""}`} data-tour="shift">
        <div className="dk-clockin__text">
          <span className="dk-kicker">
            <Radio className="h-3.5 w-3.5" /> Live shift · 30 minutes
          </span>
          <strong>Clock in and work the queue as incidents land</strong>
          <p>{shift.note}</p>
        </div>
        <a className="dk-clockin__go" href={shift.href}>
          {shift.label} <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      <dl className="dk-kpis">
        <div>
          <dt>Streak</dt>
          <dd>
            <Flame className="h-4 w-4" /> {streak} {streak === 1 ? "day" : "days"}
          </dd>
          <span className="dk-week" aria-label="Last seven days, oldest on the left">
            {week.map((d) => (
              <i key={d.day} title={`${d.label} ${d.date}`} className={`${d.done ? "is-done" : ""}${d.today ? " is-today" : ""}`} />
            ))}
          </span>
        </div>
        <div>
          <dt>Open</dt>
          <dd>{open.length}</dd>
          <span className="dk-kpis__note">in your queue</span>
        </div>
        <div>
          <dt>Closed</dt>
          <dd>{closed}</dd>
          <span className="dk-kpis__note">this cycle</span>
        </div>
        <div>
          <dt>Case level</dt>
          <dd className="dk-kpis__word">{level}</dd>
          <span className="dk-kpis__note">set by your recent answers</span>
        </div>
        <div>
          <dt>Rank</dt>
          <dd className="dk-kpis__word">{rank ? <Link href={rank.href}>{rank.title}</Link> : "Unranked"}</dd>
          <span className="dk-kpis__note">from finished challenges</span>
        </div>
      </dl>

      <section className="dk-queue" aria-label="Your queue">
        <div className="dk-queue__bar">
          <h2>My queue</h2>
          <span>
            {open.length} open · sorted by priority
          </span>
        </div>
        <div className="dk-row dk-row--head" aria-hidden>
          <span>Priority</span>
          <span>Ticket</span>
          <span>Requested by</span>
          <span>Due</span>
          <span>State</span>
          <span />
        </div>
        <ul>
          {sorted.map((t) => (
            <li key={t.key} className={`dk-row dk-row--p${t.priority} is-${t.state.tone}`} data-tour={t.tour}>
              <span className="dk-pri">
                <b>P{t.priority}</b>
                <small>{PRIORITY[t.priority]}</small>
              </span>
              <span className="dk-ticket">
                <span className="dk-ticket__meta">
                  <code>{t.number}</code> · {t.type}
                </span>
                <strong>{t.title}</strong>
                <span className="dk-ticket__sum">{t.summary}</span>
                {t.error && <span className="dk-ticket__err">{t.error}</span>}
              </span>
              <span className="dk-cell" data-label="Requested by">
                {t.requester}
              </span>
              <span className="dk-cell" data-label="Due">
                <Clock3 className="h-3.5 w-3.5" /> {t.due}
              </span>
              <span className="dk-cell" data-label="State">
                <em className={`dk-state dk-state--${t.state.tone}`}>{t.state.label}</em>
              </span>
              <span className="dk-act">{t.action}</span>
            </li>
          ))}
        </ul>
      </section>
      {footer}
    </div>
  );
}
