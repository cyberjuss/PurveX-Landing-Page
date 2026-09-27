"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Lock, LockOpen, Play, RotateCcw } from "lucide-react";
import {
  CHEF_FROM_BASE64,
  CHEF_SHA256,
  CopyButton,
  Deck,
  HashTool,
  Options,
  sha256Hex,
  Stepper,
  useDeck,
  useHashes,
  useSaved,
  Verdict,
  type DotStatus,
} from "./lab-kit";

// Week 2 lab: a vendor breach dump that stored the same staff passwords four
// ways over the years. One idea per card, so a beginner is never holding
// more than one thing at once. The vendor and every password are fictional.

const VENDOR = "LedgerLine";

// Fictional passwords. Three people reuse one, and two are on the common list.
const PW: Record<string, string> = {
  "alex.rivera": "Trillium-Ops-2291",
  "priya.nair": "Summer2026!",
  "devon.brooks": "Summer2026!",
  "morgan.lee": "Compliance#1",
  "sam.whitfield": "Summer2026!",
  "jamie.torres": "Purvex123",
  "taylor.osei": "Welcome2026",
  "riley.kwan": "Blue-Kettle-Orbit-58",
};
const USERS = Object.keys(PW);
const REUSED = ["priya.nair", "devon.brooks", "sam.whitfield"];
const COMMON = ["Password1", "Qwerty!23", "Welcome2026", "Purvex123", "Letmein!", "Admin2026"];
const RECOVER = ["jamie.torres", "taylor.osei"] as const;
const DECODE_USER = "morgan.lee";

// A per-user salt, the way a well-built system stores one next to each hash.
const SALT: Record<string, string> = {
  "alex.rivera": "q8Zr1v",
  "priya.nair": "Lm4Xe0",
  "devon.brooks": "7cTpWa",
  "morgan.lee": "Hs2Kq9",
  "sam.whitfield": "Bn6Yd3",
  "jamie.torres": "Rf0Ju5",
  "taylor.osei": "Ve8Mn1",
  "riley.kwan": "Gk3Ls7",
};
// The 2017 generation's hint column, stored in plain text next to the encrypted password.
const HINT: Record<string, string> = {
  "priya.nair": "season and year!",
  "devon.brooks": "season and year!",
  "morgan.lee": "my dept #1",
};
const SAMPLE = ["priya.nair", "devon.brooks", "morgan.lee"];

type Kind = "encoding" | "encryption" | "hash" | "salted";
const KINDS: { key: Kind; text: string; short: string }[] = [
  { key: "encoding", text: "Encoding. Anyone can reverse it.", short: "Encoding" },
  { key: "encryption", text: "Encryption. Reversible with the key.", short: "Encryption" },
  { key: "hash", text: "Hash, no salt. One-way, but equal passwords give equal hashes.", short: "Hash, no salt" },
  { key: "salted", text: "Salted hash. One-way, and every hash is unique.", short: "Salted hash" },
];

interface Gen {
  id: string;
  tag: string;
  year: string;
  column: string;
  clue: string;
  kind: Kind;
  why: string;
}
const GENS: Gen[] = [
  {
    id: "v1",
    tag: "1",
    year: "2014",
    column: "pwd_b64",
    clue: "Letters, numbers, + and /. Some end in =.",
    kind: "encoding",
    why: "Base64. No key, no secret. Anyone can turn it back.",
  },
  {
    id: "v2",
    tag: "2",
    year: "2017",
    column: "pwd_enc",
    clue: "AES, with the key in a config file on the same server. Note the hints.",
    kind: "encryption",
    why: "Encryption, and the key was stolen with the data. Same password, same output, plus readable hints. Adobe, 2013.",
  },
  {
    id: "v3",
    tag: "3",
    year: "2020",
    column: "pwd_sha256",
    clue: "Always 64 characters. Compare the rows.",
    kind: "hash",
    why: "One-way, but with no salt equal passwords show equal hashes, and weak ones can be guessed. LinkedIn, 2012.",
  },
  {
    id: "v4",
    tag: "4",
    year: "2023",
    column: "salt + pwd_hash",
    clue: "A different salt per user, hashed together with the password.",
    kind: "salted",
    why: "Every hash is unique, so reuse is hidden and guess lists fail. The standard today, ideally with a slow hash such as bcrypt.",
  },
];
const BEST_ORDER = ["v4", "v3", "v2", "v1"];

const RESPONSE = [
  { key: "ignore", text: "Nothing. It was the vendor's breach." },
  { key: "tryit", text: "Try the recovered passwords on their PurveX accounts." },
  { key: "reset", text: "Force resets for affected staff, recovered ones first, and turn on MFA." },
  { key: "email", text: "Email each person their leaked password." },
];

const NOTE_KEY = "Harbor-Kettle-19";
const NOTE_WORD = "ORBIT";
const NOTE_TEXT = `Rotate the LedgerLine service key tonight. Code word: ${NOTE_WORD}.`;
const SALT_WHY = [
  { key: "secret", text: "The salt is a secret attackers cannot see." },
  { key: "input", text: "Each user's own salt changes what gets hashed." },
  { key: "random", text: "SHA-256 gives a random result each time." },
];

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromB64 = (v: string) => Uint8Array.from(atob(v), (c) => c.charCodeAt(0));
// Every password here is plain ASCII, so btoa gives standard Base64.
const b64 = (v: string) => {
  try {
    return btoa(v);
  } catch {
    return "Use plain letters, numbers and symbols";
  }
};

// A key made from a passphrase (PBKDF2), then AES-256-GCM, the way real tools do it.
async function keyFrom(passphrase: string) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new TextEncoder().encode("purvex-academy-lab"), iterations: 100_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
async function aesEncrypt(passphrase: string, text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFrom(passphrase), new TextEncoder().encode(text)));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv);
  out.set(ct, iv.length);
  return toB64(out);
}
/** Null when the key is wrong. AES-GCM refuses to decrypt instead of returning garbage. */
async function aesDecrypt(passphrase: string, packed: string) {
  try {
    const raw = fromB64(packed.trim());
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.slice(0, 12) }, await keyFrom(passphrase), raw.slice(12));
    return new TextDecoder().decode(pt);
  } catch {
    return null;
  }
}

const STEPS = ["Try it", "Name it", "Work the dump", "Respond", "Debrief"];
const TRY_CARDS = [
  { tag: "1", title: "Encode" },
  { tag: "2", title: "Encrypt" },
  { tag: "3", title: "Hash" },
  { tag: "4", title: "Salt" },
];
const WORK_CARDS = [
  { tag: "A", title: "Spot reuse" },
  { tag: "B", title: "Guess weak ones" },
  { tag: "C", title: "Decode" },
];

interface State {
  step: number;
  seen: string[];
  noteWord: string;
  saltWhy?: string;
  kinds: Record<string, Kind>;
  reused: string[];
  recovered: Record<string, string>;
  decoded: string;
  order: string[];
  response?: string;
  checked: [boolean, boolean, boolean, boolean];
}
const START: State = { step: 0, seen: [], noteWord: "", kinds: {}, reused: [], recovered: {}, decoded: "", order: ["v1", "v2", "v3", "v4"], checked: [false, false, false, false] };
const STORE = "academy-lab-password-table-v3";

export function PasswordTableLab() {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.order) && v.order.length === 4 && Array.isArray(v.checked) && v.checked.length === 4 && Array.isArray(v.seen));
  const plain = useHashes(Object.fromEntries(USERS.map((u) => [u, PW[u]])));
  // Deterministic like the ECB mode Adobe used: the same password always gives the same output.
  const enc = useHashes(Object.fromEntries(SAMPLE.map((u) => [u, `ledgerline-app-key|${PW[u]}`])));
  const salted = useHashes(Object.fromEntries(SAMPLE.map((u) => [u, SALT[u] + PW[u]])));
  const tryDeck = useDeck(TRY_CARDS.length);
  const nameDeck = useDeck(GENS.length);
  const workDeck = useDeck(WORK_CARDS.length);
  const [recoverOk, setRecoverOk] = useState<Record<string, boolean>>({});

  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const go = (step: number) => {
    patch({ step });
    tryDeck.reset();
    nameDeck.reset();
    workDeck.reset();
    document.querySelector(".rt")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const check = (i: 0 | 1 | 2 | 3) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));
  const see = (id: string) => setS((prev) => (prev.seen.includes(id) ? prev : { ...prev, seen: [...prev.seen, id] }));

  const tryRecover = async (user: string, guess: string) => {
    patch({ recovered: { ...s.recovered, [user]: guess } });
    const h = guess ? await sha256Hex(guess) : "";
    setRecoverOk((prev) => ({ ...prev, [user]: Boolean(guess) && h === plain[user] }));
  };

  const noteRight = s.noteWord.trim().toUpperCase() === NOTE_WORD;
  const reuseRight = s.reused.length === REUSED.length && REUSED.every((u) => s.reused.includes(u));
  const decodeRight = s.decoded.trim() === PW[DECODE_USER];
  const score = useMemo(() => {
    const tryIt = (noteRight ? 1 : 0) + (s.saltWhy === "input" ? 1 : 0);
    const kinds = GENS.filter((g) => s.kinds[g.id] === g.kind).length;
    const work = (reuseRight ? 1 : 0) + RECOVER.filter((u) => s.recovered[u] === PW[u]).length + (decodeRight ? 1 : 0);
    const respond = s.order.filter((id, i) => BEST_ORDER[i] === id).length + (s.response === "reset" ? 1 : 0);
    return { tryIt, kinds, work, respond, total: tryIt + kinds + work + respond };
  }, [s, noteRight, reuseRight, decodeRight]);

  const tryDone = [s.seen.includes("encode"), Boolean(s.noteWord.trim()), s.seen.includes("hash"), Boolean(s.saltWhy)];
  const workDone = [s.reused.length > 0, RECOVER.every((u) => s.recovered[u]), Boolean(s.decoded.trim())];
  const workRight = [reuseRight, RECOVER.every((u) => s.recovered[u] === PW[u]), decodeRight];
  const reached = [true, s.checked[0], s.checked[1], s.checked[2], s.checked[3]];

  return (
    <section className="rt" aria-label="The Leaked Password Table lab">
      <Stepper steps={STEPS} step={s.step} done={[...s.checked, false]} reached={reached} onGo={go} />

      {s.step === 0 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>Three ways to hide a password</h3>
            <p>One test tells them apart: can you get the password back?</p>
          </header>
          <Deck
            tags={TRY_CARDS.map((c) => c.tag)}
            titles={TRY_CARDS.map((c) => c.title)}
            index={tryDeck.card}
            dir={tryDeck.dir}
            onGo={tryDeck.show}
            status={TRY_CARDS.map((_, i): DotStatus => (s.checked[0] && (i === 1 || i === 3) ? ((i === 1 ? noteRight : s.saltWhy === "input") ? "right" : "wrong") : tryDone[i] ? "answered" : "open"))}
          >
            {tryDeck.card === 0 && <EncodeCard onDone={() => see("encode")} />}
            {tryDeck.card === 1 && (
              <NoteCard
                word={s.noteWord}
                locked={s.checked[0]}
                right={noteRight}
                onWord={(noteWord) => patch({ noteWord })}
              />
            )}
            {tryDeck.card === 2 && <HashCard onSeen={() => see("hash")} />}
            {tryDeck.card === 3 && (
              <SaltCard value={s.saltWhy} locked={s.checked[0]} onPick={(saltWhy) => patch({ saltWhy })} />
            )}
          </Deck>
          <footer className="rt-foot">
            {s.checked[0] ? (
              <>
                <p className="rt-tally">
                  <b>{score.tryIt} of 2</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(1)}>
                  Open the breach
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{tryDone.filter(Boolean).length} of 4 cards done</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!tryDone.every(Boolean)} onClick={() => check(0)}>
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
            <h3>How did {VENDOR} store it?</h3>
            <p>The dump holds four generations. Name each one.</p>
          </header>
          <Deck
            tags={GENS.map((g) => g.tag)}
            titles={GENS.map((g) => g.year)}
            index={nameDeck.card}
            dir={nameDeck.dir}
            onGo={nameDeck.show}
            status={GENS.map((g): DotStatus => (s.checked[1] ? (s.kinds[g.id] === g.kind ? "right" : "wrong") : s.kinds[g.id] ? "answered" : "open"))}
          >
            {(() => {
              const g = GENS[nameDeck.card];
              const done = s.checked[1];
              const right = s.kinds[g.id] === g.kind;
              const value = (u: string) => (g.kind === "encoding" ? b64(PW[u]) : g.kind === "encryption" ? (enc[u] ?? "").slice(0, 32).toUpperCase() : g.kind === "hash" ? plain[u] : salted[u]);
              return (
                <div className={`rt-ticket${done ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <div className="lk-card-head">
                    <b>
                      {g.year} · <code>{g.column}</code>
                    </b>
                    <small>{g.clue}</small>
                  </div>
                  <div className="lk-scroll">
                    <table className="lk-table">
                      <tbody>
                        {SAMPLE.map((u) => (
                          <tr key={u}>
                            <td>{u}</td>
                            {g.kind === "salted" && (
                              <td>
                                <code>{SALT[u]}</code>
                              </td>
                            )}
                            <td>
                              <code>{value(u) || "…"}</code>
                            </td>
                            {g.kind === "encryption" && <td className="lk-hint">hint: {HINT[u]}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Options
                    label={`Storage method, ${g.year}`}
                    options={KINDS}
                    value={s.kinds[g.id]}
                    answer={done ? g.kind : undefined}
                    disabled={done}
                    onPick={(v) => {
                      const kinds = { ...s.kinds, [g.id]: v as Kind };
                      patch({ kinds });
                      nameDeck.next((i) => Boolean(kinds[GENS[i].id]));
                    }}
                  />
                  {done && <Verdict right={right}>{g.why}</Verdict>}
                </div>
              );
            })()}
          </Deck>
          <footer className="rt-foot">
            {s.checked[1] ? (
              <>
                <p className="rt-tally">
                  <b>{score.kinds} of 4</b> named
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(2)}>
                  Work the dump
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{GENS.filter((g) => s.kinds[g.id]).length} of 4 named</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={GENS.some((g) => !s.kinds[g.id])} onClick={() => check(1)}>
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
            <h3>What does the dump give away?</h3>
            <p>Three quick jobs, done with an attacker&apos;s free tools. You never log in to anything.</p>
          </header>
          <Deck
            tags={WORK_CARDS.map((c) => c.tag)}
            titles={WORK_CARDS.map((c) => c.title)}
            index={workDeck.card}
            dir={workDeck.dir}
            onGo={workDeck.show}
            status={WORK_CARDS.map((_, i): DotStatus => (s.checked[2] ? (workRight[i] ? "right" : "wrong") : workDone[i] ? "answered" : "open"))}
          >
            {workDeck.card === 0 && (
              <div className={`rt-ticket${s.checked[2] ? (reuseRight ? " is-right" : " is-wrong") : ""}`}>
                <div className="lk-card-head">
                  <b>Who shares a password?</b>
                  <small>The 2020 table. Tick everyone whose hash matches someone else&apos;s.</small>
                </div>
                <div className="lk-scroll">
                  <table className="lk-table">
                    <tbody>
                      {USERS.map((u) => {
                        const on = s.reused.includes(u);
                        return (
                          <tr key={u} className={on ? "is-picked" : ""}>
                            <td>
                              <input
                                type="checkbox"
                                aria-label={`${u} shares a password`}
                                checked={on}
                                disabled={s.checked[2]}
                                onChange={() => patch({ reused: on ? s.reused.filter((x) => x !== u) : [...s.reused, u] })}
                              />
                            </td>
                            <td>{u}</td>
                            <td>
                              <code>{plain[u] ?? "…"}</code>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {s.checked[2] && <Verdict right={reuseRight}>Priya, Devon and Sam share one. No cracking needed, because there is no salt.</Verdict>}
              </div>
            )}
            {workDeck.card === 1 && (
              <div className={`rt-ticket${s.checked[2] ? (workRight[1] ? " is-right" : " is-wrong") : ""}`}>
                <div className="lk-card-head">
                  <b>Two people use a common password</b>
                  <small>Hash each word on the list and find their match in the table.</small>
                </div>
                <div className="lk-hashout">
                  <code>{COMMON.join("  ")}</code>
                  <CopyButton text={COMMON.join("\n")} label="Copy list" />
                </div>
                <p>
                  <a className="lk-mini" href={CHEF_SHA256} target="_blank" rel="noreferrer">
                    Open CyberChef with SHA-256 ready
                  </a>
                </p>
                <HashTool mode="text" />
                {RECOVER.map((u) => (
                  <label key={u} className="lk-field">
                    {u}
                    <div>
                      <input
                        type="text"
                        value={s.recovered[u] ?? ""}
                        disabled={s.checked[2]}
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="Their password"
                        onChange={(e) => void tryRecover(u, e.target.value)}
                      />
                    </div>
                    {s.recovered[u] && !s.checked[2] && recoverOk[u] && <span className="lk-note is-good">Confirmed. It hashes to their value.</span>}
                  </label>
                ))}
                {s.checked[2] && (
                  <>
                    <Verdict right={workRight[1]}>Purvex123 and Welcome2026. A hash cannot be reversed, but a weak password can be guessed.</Verdict>
                    <AttackReplay table={plain} />
                  </>
                )}
              </div>
            )}
            {workDeck.card === 2 && (
              <div className={`rt-ticket${s.checked[2] ? (decodeRight ? " is-right" : " is-wrong") : ""}`}>
                <div className="lk-card-head">
                  <b>Decode {DECODE_USER}&apos;s 2014 password</b>
                  <small>Paste it into CyberChef&apos;s From Base64.</small>
                </div>
                <div className="lk-hashout">
                  <code>{b64(PW[DECODE_USER])}</code>
                  <CopyButton text={b64(PW[DECODE_USER])} />
                </div>
                <p>
                  <a className="lk-mini" href={CHEF_FROM_BASE64} target="_blank" rel="noreferrer">
                    Open CyberChef with From Base64 ready
                  </a>
                </p>
                <label className="lk-field">
                  Decoded password
                  <div>
                    <input type="text" value={s.decoded} disabled={s.checked[2]} spellCheck={false} autoComplete="off" onChange={(e) => patch({ decoded: e.target.value })} />
                  </div>
                </label>
                {s.checked[2] && <Verdict right={decodeRight}>{PW[DECODE_USER]}. No key and no guessing. Encoding hides nothing.</Verdict>}
              </div>
            )}
          </Deck>
          <footer className="rt-foot">
            {s.checked[2] ? (
              <>
                <p className="rt-tally">
                  <b>{score.work} of 4</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(3)}>
                  Respond
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{workDone.filter(Boolean).length} of 3 jobs done</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!workDone.every(Boolean)} onClick={() => check(2)}>
                  Check answers
                </button>
              </>
            )}
          </footer>
        </div>
      )}

      {s.step === 3 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>Rank it, then respond</h3>
            <p>Safest method at the top.</p>
          </header>
          <ol className="rt-rank">
            {s.order.map((id, i) => {
              const g = GENS.find((x) => x.id === id)!;
              const done = s.checked[3];
              const right = BEST_ORDER[i] === id;
              const move = (d: -1 | 1) => {
                const next = [...s.order];
                [next[i], next[i + d]] = [next[i + d], next[i]];
                patch({ order: next });
              };
              return (
                <li key={id} className={`rt-rank__row${done ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <span className="rt-rank__pos">{i + 1}</span>
                  <span className="rt-tag">{g.tag}</span>
                  <span className="rt-rank__title">
                    {KINDS.find((k) => k.key === g.kind)!.short} <small>{g.year}</small>
                    {done && !right && <small>Belongs at {BEST_ORDER.indexOf(id) + 1}</small>}
                  </span>
                  <span />
                  <span className="rt-rank__move">
                    <button type="button" aria-label={`Move ${g.year} up`} disabled={done || i === 0} onClick={() => move(-1)}>
                      <ArrowUp aria-hidden="true" />
                    </button>
                    <button type="button" aria-label={`Move ${g.year} down`} disabled={done || i === s.order.length - 1} onClick={() => move(1)}>
                      <ArrowDown aria-hidden="true" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="lk-q">
            <b>Eight PurveX staff had {VENDOR} accounts. First move?</b>
            <Options label="Response" options={RESPONSE} value={s.response} answer={s.checked[3] ? "reset" : undefined} disabled={s.checked[3]} onPick={(response) => patch({ response })} />
            {s.checked[3] && (
              <Verdict right={s.response === "reset"}>People reuse passwords, so their breach is our risk. Never test leaked passwords, and never send them by email.</Verdict>
            )}
          </div>
          <footer className="rt-foot">
            {s.checked[3] ? (
              <>
                <p className="rt-tally">
                  <b>{score.respond} of 5</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(4)}>
                  See the debrief
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">Use the arrows to reorder</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!s.response} onClick={() => check(3)}>
                  Check answers
                </button>
              </>
            )}
          </footer>
        </div>
      )}

      {s.step === 4 && (
        <div className="rt-body">
          <header className="rt-head rt-head--result">
            <div className={`rt-grade rt-grade--${score.total >= 13 ? "high" : score.total >= 9 ? "medium" : "low"}`}>
              <b>{score.total}</b>
              <small>of 15</small>
            </div>
            <div>
              <h3>{score.total >= 13 ? "You would handle this breach" : score.total >= 9 ? "Solid start" : "Worth another pass"}</h3>
              <p>
                Tried {score.tryIt} of 2 · Named {score.kinds} of 4 · Worked {score.work} of 4 · Responded {score.respond} of 5
              </p>
            </div>
          </header>
          <div className="lk-scroll">
            <table className="lk-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Reversible?</th>
                  <th>Use it for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Encoding (Base64)</td>
                  <td>Yes, by anyone</td>
                  <td>Formatting. Never secrets.</td>
                </tr>
                <tr>
                  <td>Encryption (AES)</td>
                  <td>Yes, with the key</td>
                  <td>Data you need back.</td>
                </tr>
                <tr>
                  <td>Hash (SHA-256)</td>
                  <td>No</td>
                  <td>Proving a file did not change.</td>
                </tr>
                <tr>
                  <td>Salted slow hash (bcrypt)</td>
                  <td>No</td>
                  <td>Storing passwords.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer className="rt-foot">
            <p className="rt-tally">Adobe (2013) encrypted passwords. LinkedIn (2012) skipped the salt. Both leaked millions.</p>
            <button type="button" className="rt-btn" onClick={() => setS(START)}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}

// ---- the "Try it" cards: one method per card ----

function CardHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="lk-card-head">
      <b>{title}</b>
      <small>{sub}</small>
    </div>
  );
}

function EncodeCard({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("Summer2026!");
  const [open, setOpen] = useState(false);
  return (
    <div className="rt-ticket">
      <CardHead title="Encoding (Base64)" sub="Type a password, then try to get it back." />
      <input className="lk-input" type="text" value={pw} onChange={(e) => (setPw(e.target.value), setOpen(false))} spellCheck={false} autoComplete="off" aria-label="Password" />
      <code className="lk-out">{b64(pw)}</code>
      <button
        type="button"
        className="lk-mini"
        onClick={() => {
          setOpen(true);
          onDone();
        }}
      >
        <LockOpen aria-hidden="true" /> Decode it
      </button>
      {open && <p className="lk-note is-bad">Back to {pw}. No key needed. Anyone can do this.</p>}
    </div>
  );
}

function NoteCard({ word, locked, right, onWord }: { word: string; locked: boolean; right: boolean; onWord: (v: string) => void }) {
  const [packed, setPacked] = useState("");
  const [key, setKey] = useState("");
  const [out, setOut] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    aesEncrypt(NOTE_KEY, NOTE_TEXT).then((c) => live && setPacked(c));
    return () => {
      live = false;
    };
  }, []);
  return (
    <div className={`rt-ticket${locked ? (right ? " is-right" : " is-wrong") : ""}`}>
      <CardHead title="Encryption (AES-256)" sub={`Alex sent an encrypted note. The key in your ticket is ${NOTE_KEY}. Try a wrong key first.`} />
      <code className="lk-out">{packed || "…"}</code>
      <div className="lk-panel__try">
        <input type="text" value={key} placeholder="Key" onChange={(e) => setKey(e.target.value)} spellCheck={false} autoComplete="off" aria-label="Key" />
        <button type="button" className="lk-mini" disabled={!key || !packed} onClick={async () => setOut(await aesDecrypt(key, packed))}>
          <Lock aria-hidden="true" /> Decrypt
        </button>
      </div>
      {out === null && <p className="lk-note is-bad">Wrong key. AES refuses to open it.</p>}
      {typeof out === "string" && <p className="lk-note is-good">{out}</p>}
      <label className="lk-field">
        Code word
        <div>
          <input type="text" value={word} disabled={locked} spellCheck={false} autoComplete="off" onChange={(e) => onWord(e.target.value)} />
        </div>
      </label>
      {locked && <Verdict right={right}>Right key, exact message. Any other key, nothing. Protect the key.</Verdict>}
    </div>
  );
}

function HashCard({ onSeen }: { onSeen: () => void }) {
  const [pw, setPw] = useState("Summer2026!");
  const [hash, setHash] = useState("");
  useEffect(() => {
    onSeen();
    // Marks the card seen once. onSeen is stable enough for this lab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    let live = true;
    sha256Hex(pw).then((h) => live && setHash(h));
    return () => {
      live = false;
    };
  }, [pw]);
  return (
    <div className="rt-ticket">
      <CardHead title="Hashing (SHA-256)" sub="Type a password. Then look for a way back." />
      <input className="lk-input" type="text" value={pw} onChange={(e) => setPw(e.target.value)} spellCheck={false} autoComplete="off" aria-label="Password" />
      <code className="lk-out">{hash || "…"}</code>
      <button type="button" className="lk-mini" disabled title="There is nothing to reverse with">
        <LockOpen aria-hidden="true" /> Reverse it
      </button>
      <p className="lk-note">There is no way back. Attackers can only guess, hash the guess and compare.</p>
    </div>
  );
}

function SaltCard({ value, locked, onPick }: { value?: string; locked: boolean; onPick: (v: string) => void }) {
  const [salt, setSalt] = useState(false);
  const [pair, setPair] = useState({ priya: "", devon: "" });
  useEffect(() => {
    let live = true;
    const pw = PW["priya.nair"];
    Promise.all([sha256Hex((salt ? SALT["priya.nair"] : "") + pw), sha256Hex((salt ? SALT["devon.brooks"] : "") + pw)]).then(([priya, devon]) => {
      if (live) setPair({ priya, devon });
    });
    return () => {
      live = false;
    };
  }, [salt]);
  const same = Boolean(pair.priya) && pair.priya === pair.devon;
  return (
    <div className={`rt-ticket${locked ? (value === "input" ? " is-right" : " is-wrong") : ""}`}>
      <CardHead title="Salt" sub="Priya and Devon share a password. Flip the switch." />
      <label className="lk-switch">
        <input type="checkbox" checked={salt} onChange={(e) => setSalt(e.target.checked)} />
        <span>Add a salt per user</span>
      </label>
      <div className="lk-pair">
        <span>priya.nair</span>
        <code className={same ? "is-same" : ""}>{pair.priya.slice(0, 24)}…</code>
        <span>devon.brooks</span>
        <code className={same ? "is-same" : ""}>{pair.devon.slice(0, 24)}…</code>
      </div>
      <p className={`lk-note ${same ? "is-bad" : "is-good"}`}>{same ? "Identical. Anyone can see they share it." : "Different. The reuse is hidden."}</p>
      <div className="lk-q">
        <b>Why did they split?</b>
        <Options label="Why salt works" options={SALT_WHY} value={value} answer={locked ? "input" : undefined} disabled={locked} onPick={onPick} />
      </div>
    </div>
  );
}

/** After the check: replay the guess list against the 2020 table, the way a cracking tool runs. */
function AttackReplay({ table }: { table: Record<string, string> }) {
  const [running, setRunning] = useState(false);
  const [pos, setPos] = useState(-1);
  const [hits, setHits] = useState<Record<string, string>>({});
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const list = [...COMMON, "Summer2026!"];
  const run = () => {
    setRunning(true);
    setHits({});
    let i = 0;
    const tick = async () => {
      if (i >= list.length) {
        setRunning(false);
        setPos(list.length);
        return;
      }
      const word = list[i];
      const h = await sha256Hex(word);
      setPos(i);
      const matched = USERS.filter((u) => table[u] === h);
      if (matched.length) setHits((prev) => ({ ...prev, ...Object.fromEntries(matched.map((u) => [u, word])) }));
      i += 1;
      timer.current = window.setTimeout(tick, 550);
    };
    void tick();
  };
  return (
    <div className="lk-replay">
      <div className="lk-replay__bar">
        <b>{pos < 0 ? "Watch the attack" : pos < list.length ? `Trying ${list[pos]}…` : `${Object.keys(hits).length} of ${USERS.length} cracked with ${list.length} guesses`}</b>
        <button type="button" className="lk-mini" disabled={running} onClick={run}>
          <Play aria-hidden="true" /> {pos < 0 ? "Run" : "Again"}
        </button>
      </div>
      <ul className="lk-replay__rows">
        {USERS.map((u) => (
          <li key={u} className={hits[u] ? "is-hit" : ""}>
            <span>{u}</span>
            <b>{hits[u] ?? "·"}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
