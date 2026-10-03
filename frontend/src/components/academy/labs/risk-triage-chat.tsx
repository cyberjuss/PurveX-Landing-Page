"use client";

import { useEffect, useMemo, useState } from "react";
import { CornerUpLeft, RotateCcw } from "lucide-react";
import { useOptionalCoach } from "../coach-context";
import { LOST_ASK } from "./lab-brief";
import { useLabDone, useLabResult } from "./lab-kit";
import { ChatShell, Chip, ChipRow, Mine, Says, SendAction } from "./lab-chat";

// Monday Morning Risk Triage, played as a guided chat with Alex, the student's
// IT lead. Alex sends the tickets one at a time; the student answers by tapping
// choices, which appear as their own replies. Same scoring as before, delivered
// as a conversation instead of a form.

type Cia = "c" | "i" | "a";
type Level = 1 | 2 | 3;

interface Ticket {
  id: string; tag: string; title: string; from: string; report: string;
  dept: string; critical: boolean; data: string;
  cia: Cia; ciaWhy: string;
  likelihood: Level; likelihoodWhy: string; impact: Level; impactWhy: string;
}

const TICKETS: Ticket[] = [
  { id: "printer", tag: "A", title: "Lobby printer drops offline", from: "Riley Kwan, Operations", report: "The lobby printer goes offline most afternoons. Visitors cannot print their forms, so the front desk walks them to the printer upstairs.", dept: "Operations", critical: false, data: "None. It prints visitor forms.", cia: "a", ciaWhy: "Nothing leaked and nothing changed. The printer is not there when people need it. That is a lockout.", likelihood: 3, likelihoodWhy: "It already fails most afternoons. This one is close to certain.", impact: 1, impactWhy: "There is a working printer upstairs, and no client data or money is involved. It is an annoyance, not a business problem." },
  { id: "backup", tag: "B", title: "File server backup failing for three weeks", from: "Alex Rivera, IT", report: "The nightly backup of the file server has failed every night for three weeks. The server itself runs fine. Nobody noticed until this morning.", dept: "Every department", critical: true, data: "All five departments' files, including client records and the firm's ledgers.", cia: "a", ciaWhy: "No one can see or change anything they should not. If the server fails, the files cannot come back. That is a lockout waiting to happen.", likelihood: 2, likelihoodWhy: "The server is healthy today. A disk failure or ransomware is not certain, but every night without a good copy keeps the window open.", impact: 3, impactWhy: "Every department saves its work on that server. One failure without a backup loses client files for good." },
  { id: "folder", tag: "C", title: "Client balances folder open to the whole firm", from: "Devon Brooks, Compliance", report: "During a review I opened the Wealth Management share from my own Compliance account. The client balances spreadsheet opened without a prompt. Every account at the firm can read that folder.", dept: "Wealth Management", critical: true, data: "Account and portfolio data: client account numbers, holdings and balances.", cia: "c", ciaWhy: "The numbers are still right and the file still opens. The wrong people can see it. That is a leak.", likelihood: 3, likelihoodWhy: "Every account at the firm can already open it. No skill is needed, only a curious user or one stolen password.", impact: 3, impactWhy: "Client balances are regulated client data. A leak means telling clients and regulators, and Wealth Management is one of the firm's critical departments." },
  { id: "fees", tag: "D", title: "Operations can edit the fee schedule", from: "Jordan Ellis, Finance", report: "The fee schedule that sets what clients are billed can be edited by everyone in Operations. Only Finance should change it. I check invoices against it once a month.", dept: "Finance and Accounting", critical: true, data: "The rates clients are billed. Owned by Finance, open to Operations' two users.", cia: "i", ciaWhy: "The file is not exposed outside the firm and it stays available. The danger is a silent change to the numbers clients are billed on. That is a lie.", likelihood: 2, likelihoodWhy: "Only one department has the extra access, and a bad change needs a mistake or bad intent from someone inside it.", impact: 2, impactWhy: "A wrong fee bills clients incorrectly, but Jordan's monthly invoice check limits how long an error runs before someone catches it." },
];

const BY_ID = Object.fromEntries(TICKETS.map((t) => [t.id, t])) as Record<string, Ticket>;
const ANSWER_ORDER = [...TICKETS].sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact).map((t) => t.id);
const CIA: { key: Cia; label: string; hint: string }[] = [
  { key: "c", label: "Confidentiality", hint: "a leak" },
  { key: "i", label: "Integrity", hint: "a lie" },
  { key: "a", label: "Availability", hint: "a lockout" },
];
const CIA_NAME: Record<Cia, string> = { c: "Confidentiality", i: "Integrity", a: "Availability" };
const LEVELS: { key: Level; label: string }[] = [{ key: 1, label: "Low" }, { key: 2, label: "Medium" }, { key: 3, label: "High" }];
const LEVEL_NAME: Record<Level, string> = { 1: "Low", 2: "Medium", 3: "High" };
const STEPS = ["Name the failure", "Score the risk", "Rank the fixes", "Debrief"];

interface State { step: number; cia: Record<string, Cia>; likelihood: Record<string, Level>; impact: Record<string, Level>; order: string[]; checked: [boolean, boolean, boolean]; }
const START: State = { step: 0, cia: {}, likelihood: {}, impact: {}, order: TICKETS.map((t) => t.id), checked: [false, false, false] };
const STORE = "academy-lab-risk-triage-chat-v1";

function loadSaved(): State {
  if (typeof window === "undefined") return START;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? "null") as State | null;
    if (saved && Array.isArray(saved.order) && saved.order.length === TICKETS.length && saved.order.every((id) => BY_ID[id])) return saved;
  } catch {}
  return START;
}

export function RiskTriageLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useState<State>(loadSaved);
  const [ranks, setRanks] = useState<string[]>([]);
  const coach = useOptionalCoach();
  useLabDone(s.checked.every(Boolean), onDone);

  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(s)); }, [s]);

  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const checkStep = (i: 0 | 1 | 2) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));
  const goStep = (step: number) => setS((prev) => ({ ...prev, step }));
  const pickCia = (id: string, v: Cia) => patch({ cia: { ...s.cia, [id]: v } });
  const pickLevel = (kind: "likelihood" | "impact", id: string, v: Level) => patch({ [kind]: { ...s[kind], [id]: v } } as Partial<State>);

  const score = useMemo(() => {
    const cia = TICKETS.filter((t) => s.cia[t.id] === t.cia).length;
    const lik = TICKETS.filter((t) => s.likelihood[t.id] === t.likelihood).length;
    const imp = TICKETS.filter((t) => s.impact[t.id] === t.impact).length;
    const rank = s.order.filter((id, i) => ANSWER_ORDER[i] === id).length;
    return { cia, scoring: lik + imp, rank, total: cia + lik + imp + rank };
  }, [s]);
  useLabResult("lab-risk-triage", s.checked.every(Boolean), score.total, 16);

  const reset = () => { setRanks([]); setS(START); };
  const done = [s.checked[0], s.checked[1], s.checked[2], s.checked[2]];
  const signal = `${s.step}:${Object.keys(s.cia).length}:${Object.keys(s.likelihood).length}:${Object.keys(s.impact).length}:${s.checked.join("")}:${ranks.length}`;

  // ---- step 0: name the failure -------------------------------------------
  const cur0 = TICKETS.findIndex((t) => !s.cia[t.id]);
  const lastVisible0 = cur0 === -1 ? TICKETS.length - 1 : cur0;

  // ---- step 1: score -------------------------------------------------------
  const scored = (t: Ticket) => !!(s.likelihood[t.id] && s.impact[t.id]);
  const cur1 = TICKETS.findIndex((t) => !scored(t));
  const lastVisible1 = cur1 === -1 ? TICKETS.length - 1 : cur1;

  // ---- step 2: rank (tap to order) ----------------------------------------
  const placeRank = (id: string) => setRanks((r) => (r.includes(id) ? r : [...r, id]));
  const remaining = TICKETS.filter((t) => !ranks.includes(t.id));

  const thread = (
    <>
        {s.step === 0 && (
          <>
            <Says>Morning. Four problems came in over the weekend and we can only start one fix today. First, let&rsquo;s name what actually broke on each. I&rsquo;ll send them one at a time.</Says>
            {TICKETS.slice(0, lastVisible0 + 1).map((t) => {
              const pick = s.cia[t.id];
              const right = pick === t.cia;
              return (
                <div key={t.id}>
                  <Says><b>Ticket {t.tag} — {t.title}.</b> {t.report} Which part of the job broke here?</Says>
                  {pick && <Mine>{CIA_NAME[pick]}</Mine>}
                  {s.checked[0] && pick && (
                    <Says tone={right ? "right" : "wrong"}>{right ? t.ciaWhy : `It is ${CIA_NAME[t.cia].toLowerCase()}. ${t.ciaWhy}`}</Says>
                  )}
                </div>
              );
            })}
            {cur0 === -1 && !s.checked[0] && <Says>That&rsquo;s all four. Want me to check them?</Says>}
            {s.checked[0] && <Says>You named <b>{score.cia} of 4</b> correctly. Next, let&rsquo;s size the risk on each.</Says>}
          </>
        )}

        {s.step === 1 && (
          <>
            <Says>
              Now rate each one. Size both against the firm, not against how loud the ticket is.
              <ul className="lc-list">
                <li><b>Likelihood</b> — how likely it is to hurt the firm. Low needs a rare chain of events, medium needs a trigger, high is anyone today.</li>
                <li><b>Impact</b> — how much it costs when it does. Low is an inconvenience, high is regulated data or damage you cannot undo.</li>
              </ul>
            </Says>
            {TICKETS.slice(0, lastVisible1 + 1).map((t) => {
              const l = s.likelihood[t.id];
              const im = s.impact[t.id];
              const lRight = l === t.likelihood;
              const iRight = im === t.impact;
              return (
                <div key={t.id}>
                  <Says><b>Ticket {t.tag} — {t.title}.</b> {t.critical ? "This touches a critical department. " : ""}Data at stake: {t.data}</Says>
                  {l && im && <Mine>Likelihood {LEVEL_NAME[l]} · Impact {LEVEL_NAME[im]} · risk {l * im}</Mine>}
                  {s.checked[1] && l && im && (
                    <>
                      <Says tone={lRight ? "right" : "wrong"}>Likelihood {LEVEL_NAME[t.likelihood]}. {t.likelihoodWhy}</Says>
                      <Says tone={iRight ? "right" : "wrong"}>Impact {LEVEL_NAME[t.impact]}. {t.impactWhy}</Says>
                    </>
                  )}
                </div>
              );
            })}
            {cur1 === -1 && !s.checked[1] && <Says>Good. Want me to check your ratings?</Says>}
            {s.checked[1] && <Says><b>{score.scoring} of 8</b> ratings match. Last part: the order you&rsquo;d work them.</Says>}
          </>
        )}

        {s.step === 2 && (
          <>
            <Says>Here is where it counts. Tap the tickets in the order you would actually work them, highest risk first. Risk is likelihood times impact, not how loud or how often a ticket comes in.</Says>
            {ranks.map((id, i) => (
              <Mine key={id}>{i + 1}. {BY_ID[id].title}</Mine>
            ))}
            {ranks.length === 4 && !s.checked[2] && <Says>That&rsquo;s your order. Check it?</Says>}
            {s.checked[2] && (
              <>
                {ranks.map((id, i) => {
                  const right = ANSWER_ORDER[i] === id;
                  return <Says key={id} tone={right ? "right" : "wrong"}>{i + 1}. {BY_ID[id].title}{right ? "" : ` — belongs at ${ANSWER_ORDER.indexOf(id) + 1}`}</Says>;
                })}
                <Says>The printer fails more often than anything else here and still ranks last. How often something breaks does not set priority. Likelihood and impact together do.</Says>
                <Says>You placed <b>{score.rank} of 4</b> correctly.</Says>
              </>
            )}
          </>
        )}

        {s.step === 3 && (
          <>
            <Says>Here&rsquo;s the wrap-up. You scored <b>{score.total} of 16</b> — named {score.cia} of 4, rated {score.scoring} of 8, ranked {score.rank} of 4. {score.total >= 13 ? "That&rsquo;s ready for the real queue." : score.total >= 9 ? "Solid start." : "Worth another pass."}</Says>
            {ANSWER_ORDER.map((id, i) => {
              const t = BY_ID[id];
              return <Says key={id}><b>{i + 1}. {t.title}</b> — {CIA_NAME[t.cia]}, likelihood {LEVEL_NAME[t.likelihood]}, impact {LEVEL_NAME[t.impact]}. {t.ciaWhy}</Says>;
            })}
            <Says>Start the morning with the client balances folder, then fix the backup. Nice work.</Says>
          </>
        )}
    </>
  );

  // composer: the current input, as chat chips or a send action
  const composer = (
    <>
        {s.step === 0 && (cur0 !== -1 ? (
          <ChipRow label={`Ticket ${TICKETS[cur0].tag}: which job broke?`}>
            {CIA.map((c) => <Chip key={c.key} onClick={() => pickCia(TICKETS[cur0].id, c.key)}>{c.label}<small>{c.hint}</small></Chip>)}
          </ChipRow>
        ) : !s.checked[0] ? (
          <SendAction onClick={() => checkStep(0)}>Check my answers</SendAction>
        ) : (
          <SendAction onClick={() => goStep(1)}>Continue to scoring →</SendAction>
        ))}

        {s.step === 1 && (cur1 !== -1 ? (
          <div className="lc-levels">
            <ChipRow label="Likelihood">
              {LEVELS.map((l) => <Chip key={l.key} active={s.likelihood[TICKETS[cur1].id] === l.key} onClick={() => pickLevel("likelihood", TICKETS[cur1].id, l.key)}>{l.label}</Chip>)}
            </ChipRow>
            <ChipRow label="Impact">
              {LEVELS.map((l) => <Chip key={l.key} active={s.impact[TICKETS[cur1].id] === l.key} onClick={() => pickLevel("impact", TICKETS[cur1].id, l.key)}>{l.label}</Chip>)}
            </ChipRow>
          </div>
        ) : !s.checked[1] ? (
          <SendAction onClick={() => checkStep(1)}>Check my ratings</SendAction>
        ) : (
          <SendAction onClick={() => goStep(2)}>Continue to ranking →</SendAction>
        ))}

        {s.step === 2 && (ranks.length < 4 ? (
          <ChipRow list label={`Pick #${ranks.length + 1} to work`}>
            {remaining.map((t) => <Chip key={t.id} onClick={() => placeRank(t.id)}>{t.title}</Chip>)}
            {ranks.length > 0 && <button type="button" className="lc-undo" onClick={() => setRanks((r) => r.slice(0, -1))}><CornerUpLeft aria-hidden="true" /> Undo</button>}
          </ChipRow>
        ) : !s.checked[2] ? (
          <div className="lc-actions">
            <button type="button" className="lc-undo" onClick={() => setRanks([])}><RotateCcw aria-hidden="true" /> Redo order</button>
            <SendAction onClick={() => { patch({ order: ranks }); checkStep(2); }}>Check my order</SendAction>
          </div>
        ) : (
          <SendAction onClick={() => goStep(3)}>See the debrief →</SendAction>
        ))}

        {s.step === 3 && (
          <SendAction onClick={reset} subtle><RotateCcw aria-hidden="true" /> Try again</SendAction>
        )}
    </>
  );

  return (
    <ChatShell
      role="Your IT lead"
      steps={STEPS}
      step={s.step}
      done={done}
      onAsk={coach?.enabled ? () => coach.ask(LOST_ASK) : undefined}
      signal={signal}
      thread={thread}
      composer={composer}
      label="Monday Morning Risk Triage, guided chat"
    />
  );
}
