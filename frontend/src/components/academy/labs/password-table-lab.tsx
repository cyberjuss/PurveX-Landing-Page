"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Ban, ExternalLink, Lock, LockOpen, Play, RotateCcw } from "lucide-react";
import {
  CHEF_FROM_BASE64,
  CHEF_SHA256,
  CopyButton,
  Deck,
  Guide,
  HashTool,
  Narrator,
  Morph,
  Takeaway,
  nextHint,
  Options,
  sha256Hex,
  Stepper,
  useDeck,
  useHashes,
  labPassed,
  useLabDone,
  useLabPass,
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
    why: "Encryption, but the key sat on the same server and was stolen with the data. Equal passwords also gave equal output, and the hints were readable, the two mistakes behind Adobe's 2013 breach.",
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
    why: "Every hash is unique, so reuse is hidden and precomputed tables fail. Weak passwords can still be guessed one user at a time, which is why the standard is a slow salted hash such as bcrypt or Argon2.",
  },
];

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

const STEPS = ["Try it", "Name it", "Work the dump", "Debrief"];
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
  { tag: "D", title: "First move" },
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
  response?: string;
  checked: [boolean, boolean, boolean];
}
const START: State = { step: 0, seen: [], noteWord: "", kinds: {}, reused: [], recovered: {}, decoded: "", checked: [false, false, false] };
const STORE = "academy-lab-password-table-v4";

export function PasswordTableLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.checked) && v.checked.length === 3 && Array.isArray(v.seen));
  useLabDone(s.checked.every(Boolean), onDone);
  const plain = useHashes(Object.fromEntries(USERS.map((u) => [u, PW[u]])));
  // Deterministic like the ECB mode Adobe used: the same password always gives the same output.
  const enc = useHashes(Object.fromEntries(SAMPLE.map((u) => [u, `ledgerline-app-key|${PW[u]}`])));
  const salted = useHashes(Object.fromEntries(SAMPLE.map((u) => [u, SALT[u] + PW[u]])));
  const tryDeck = useDeck(TRY_CARDS.length);
  const nameDeck = useDeck(GENS.length);
  const workDeck = useDeck(WORK_CARDS.length);
  const [recoverOk, setRecoverOk] = useState<Record<string, boolean>>({});
  // Walkthrough progress that does not need saving: copied a value, opened CyberChef.
  const [did, setDid] = useState<Record<string, boolean>>({});
  const mark = (k: string) => setDid((d) => ({ ...d, [k]: true }));

  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const go = (step: number) => {
    patch({ step });
    tryDeck.reset();
    nameDeck.reset();
    workDeck.reset();
    document.querySelector(".rt")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const check = (i: 0 | 1 | 2) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));
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
    const work = (reuseRight ? 1 : 0) + RECOVER.filter((u) => s.recovered[u] === PW[u]).length + (decodeRight ? 1 : 0) + (s.response === "reset" ? 1 : 0);
    return { tryIt, kinds, work, total: tryIt + kinds + work };
  }, [s, noteRight, reuseRight, decodeRight]);
  useLabPass("lab-password-table", labPassed(s.checked.every(Boolean), score.total, 11));

  const tryDone = [s.seen.includes("encode"), Boolean(s.noteWord.trim()), s.seen.includes("hash"), Boolean(s.saltWhy)];
  const anyRecovered = RECOVER.some((u) => s.recovered[u]);
  const workDone = [s.reused.length > 0, RECOVER.every((u) => s.recovered[u]), Boolean(s.decoded.trim()), Boolean(s.response)];
  const workRight = [reuseRight, RECOVER.every((u) => s.recovered[u] === PW[u]), decodeRight, s.response === "reset"];
  const reached = [true, s.checked[0], s.checked[1], s.checked[2]];

  return (
    <section className="rt" aria-label="The Leaked Password Table lab">
      <Stepper steps={STEPS} step={s.step} done={[...s.checked, false]} reached={reached} onGo={go} />

      {s.step === 0 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>Three ways to hide a password</h3>
            <Narrator>Try each one before you meet all four in the leaked table. The test: can you get the password back?</Narrator>
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
                <p className="rt-tally">{nextHint(tryDone, TRY_CARDS.map((c) => `card ${c.tag}, ${c.title}`))}</p>
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
            <Narrator>The dump holds four generations. Name each one.</Narrator>
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
                <p className="rt-tally">{nextHint(GENS.map((g) => Boolean(s.kinds[g.id])), GENS.map((g) => `the ${g.year} table`))}</p>
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
            <Narrator>Four short jobs with free tools. You never log in to anything.</Narrator>
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
                <CardHead title="Two people use a common password" sub="Guess, hash, compare. The way attackers crack hashes." />
                <Guide
                  showAll
                  steps={[
                    {
                      title: "Copy the common password list",
                      done: Boolean(did.listCopied || did.chefHash || anyRecovered),
                      body: (
                        <div className="lk-hashout">
                          <code>{COMMON.join("  ")}</code>
                          <CopyButton text={COMMON.join("\n")} label="Copy list" onCopied={() => mark("listCopied")} />
                        </div>
                      ),
                    },
                    {
                      title: "Hash each word in CyberChef",
                      done: Boolean(did.chefHash || anyRecovered),
                      body: (
                        <>
                          <a className="lk-mini" href={CHEF_SHA256} target="_blank" rel="noreferrer" onClick={() => mark("chefHash")}>
                            <ExternalLink aria-hidden="true" /> Open CyberChef with SHA-256 ready
                          </a>
                          <HashTool mode="text" />
                        </>
                      ),
                    },
                    {
                      title: "Type the word whose hash matches each person",
                      done: RECOVER.every((u) => s.recovered[u]),
                      body: RECOVER.map((u) => (
                        <label key={u} className="lk-field">
                          {u}
                          <code className="lk-hash">{plain[u] ?? "…"}</code>
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
                      )),
                    },
                  ]}
                />
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
                <CardHead title={`Decode ${DECODE_USER}'s 2014 password`} sub="It is only Base64." />
                <Guide
                  showAll
                  steps={[
                    {
                      title: "Copy the stored value",
                      done: Boolean(did.b64Copied || did.chefB64 || s.decoded),
                      body: (
                        <div className="lk-hashout">
                          <code>{b64(PW[DECODE_USER])}</code>
                          <CopyButton text={b64(PW[DECODE_USER])} onCopied={() => mark("b64Copied")} />
                        </div>
                      ),
                    },
                    {
                      title: "Paste it into CyberChef's From Base64",
                      done: Boolean(did.chefB64 || s.decoded),
                      body: (
                        <a className="lk-mini" href={CHEF_FROM_BASE64} target="_blank" rel="noreferrer" onClick={() => mark("chefB64")}>
                          <ExternalLink aria-hidden="true" /> Open CyberChef with From Base64 ready
                        </a>
                      ),
                    },
                    {
                      title: "Type the password CyberChef shows",
                      done: Boolean(s.decoded.trim()),
                      body: (
                        <label className="lk-field">
                          <span className="sr-only">Decoded password</span>
                          <div>
                            <input type="text" value={s.decoded} disabled={s.checked[2]} placeholder="Decoded password" spellCheck={false} autoComplete="off" onChange={(e) => patch({ decoded: e.target.value })} />
                          </div>
                        </label>
                      ),
                    },
                  ]}
                />
                {s.checked[2] && <Verdict right={decodeRight}>{PW[DECODE_USER]}. No key and no guessing. Encoding hides nothing.</Verdict>}
              </div>
            )}
            {workDeck.card === 3 && (
              <div className={`rt-ticket${s.checked[2] ? (workRight[3] ? " is-right" : " is-wrong") : ""}`}>
                <CardHead title="Your first move" sub={`Eight PurveX staff had ${VENDOR} accounts.`} />
                <Options label="First move" options={RESPONSE} value={s.response} answer={s.checked[2] ? "reset" : undefined} disabled={s.checked[2]} onPick={(response) => patch({ response })} />
                {s.checked[2] && <Verdict right={workRight[3]}>People reuse passwords, so their breach is our risk. Never test leaked passwords, and never send them by email.</Verdict>}
              </div>
            )}
          </Deck>
          <footer className="rt-foot">
            {s.checked[2] ? (
              <>
                <p className="rt-tally">
                  <b>{score.work} of 5</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(3)}>
                  See the debrief
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint(workDone, WORK_CARDS.map((c) => `card ${c.tag}, ${c.title}`))}</p>
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
          <header className="rt-head rt-head--result">
            <div className={`rt-grade rt-grade--${score.total >= 10 ? "high" : score.total >= 7 ? "medium" : "low"}`}>
              <b>{score.total}</b>
              <small>of 11</small>
            </div>
            <div>
              <h3>{score.total >= 10 ? "You would handle this breach" : score.total >= 7 ? "Solid start" : "Worth another pass"}</h3>
              <p>
                Tried {score.tryIt} of 2 · Named {score.kinds} of 4 · Worked {score.work} of 5
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

// ---- the "Try it" cards: one method per card, walked through step by step ----

function CardHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="lk-card-head">
      <b>{title}</b>
      {sub && <small>{sub}</small>}
    </div>
  );
}

/** Before and after, side by side, with the step between them. */
function Flow({
  left,
  leftLabel,
  step,
  blocked = false,
  right,
  rightLabel,
  rightClass = "is-dark",
}: {
  left: ReactNode;
  leftLabel: string;
  step: string;
  blocked?: boolean;
  right: ReactNode;
  rightLabel: string;
  rightClass?: string;
}) {
  return (
    <div className="lk-flow">
      <div className="lk-flow__box">
        <small>{leftLabel}</small>
        <code className={leftLabel === "Your password" ? "" : "is-dark"}>{left}</code>
      </div>
      <div className={`lk-flow__arrow${blocked ? " is-no" : ""}`} aria-hidden="true">
        {blocked ? <Ban /> : <ArrowRight />}
        {step}
      </div>
      <div className="lk-flow__box">
        <small>{rightLabel}</small>
        <code className={rightClass} aria-live="polite">
          {right}
        </code>
      </div>
    </div>
  );
}

function EncodeCard({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [play, setPlay] = useState(0);
  const encoded = b64(pw);
  return (
    <div className="rt-ticket">
      <CardHead title="Encoding (Base64)" />
      <Guide
        steps={[
          {
            title: "Make up a password",
            done: Boolean(pw),
            body: (
              <>
                <input className="lk-input" type="text" value={pw} placeholder="Make one up, like Summer2026!" onChange={(e) => (setPw(e.target.value), setPlay(0))} spellCheck={false} autoComplete="off" aria-label="Password" />
                {pw && <Flow left={pw} leftLabel="Your password" step="Encode" right={encoded} rightLabel="Base64" />}
              </>
            ),
          },
          {
            title: "Click Decode. Can you get it back?",
            done: play > 0,
            body: (
              <>
                <button
                  type="button"
                  className="lk-mini"
                  onClick={() => {
                    setPlay((n) => n + 1);
                    onDone();
                  }}
                >
                  <LockOpen aria-hidden="true" /> Decode it
                </button>
                {play > 0 && (
                  <Flow left={encoded} leftLabel="Base64" step="Decode, no key" right={<Morph from={encoded} to={pw} play={play} />} rightLabel="Back to" rightClass="is-back" />
                )}
              </>
            ),
          },
        ]}
      />
      {play > 0 && <Takeaway afterMorph>Encoding is not protection. Anyone can reverse it, with no key. A Base64 password in a script or a leaked table is a leaked password.</Takeaway>}
    </div>
  );
}

function NoteCard({ word, locked, right, onWord }: { word: string; locked: boolean; right: boolean; onWord: (v: string) => void }) {
  const [packed, setPacked] = useState("");
  // Step 1 tries a made-up key, step 2 the real one. Each has its own box.
  const [guess, setGuess] = useState("");
  const [guessOut, setGuessOut] = useState<string | null | undefined>(undefined);
  const [key, setKey] = useState("");
  const [out, setOut] = useState<string | null | undefined>(undefined);
  const [play, setPlay] = useState(0);
  const opened = typeof out === "string";
  useEffect(() => {
    let live = true;
    aesEncrypt(NOTE_KEY, NOTE_TEXT).then((c) => live && setPacked(c));
    return () => {
      live = false;
    };
  }, []);
  const decrypt = async () => {
    const r = await aesDecrypt(key.trim(), packed);
    if (r !== null) setPlay((n) => n + 1);
    setOut(r);
  };
  return (
    <div className={`rt-ticket${locked ? (right ? " is-right" : " is-wrong") : ""}`}>
      <CardHead title="Encryption (AES-256)" sub="Alex from IT sent you this encrypted note." />
      <code className="lk-out">{packed || "…"}</code>
      <Guide
        steps={[
          {
            title: "Try a made-up key first",
            done: guessOut !== undefined || opened || Boolean(word),
            body: (
              <>
                <KeyTry
                  value={guess}
                  placeholder="Make one up, like Blue-Door-7"
                  disabled={!packed}
                  onChange={setGuess}
                  onTry={async () => setGuessOut(await aesDecrypt(guess.trim(), packed))}
                />
                {guessOut === null && <Flow left={`${packed.slice(0, 18)}…`} leftLabel="Encrypted" step="Wrong key" blocked right="Refused. Nothing comes out." rightLabel="Result" rightClass="is-blocked" />}
              </>
            ),
          },
          {
            title: `Now type the key from your ticket, ${NOTE_KEY}, and decrypt`,
            done: opened || Boolean(word),
            body: (
              <>
                <KeyTry value={key} placeholder={NOTE_KEY} disabled={!packed || opened} onChange={setKey} onTry={() => void decrypt()} />
                {out === null && <p className="lk-note is-bad">Not the key. Type {NOTE_KEY} exactly. Capitals and dashes count.</p>}
                {opened && <Flow left={`${packed.slice(0, 18)}…`} leftLabel="Encrypted" step="Right key" right={<Morph from={packed} to={out} play={play} />} rightLabel="The note" rightClass="is-open" />}
              </>
            ),
          },
          {
            title: "Type the code word from the note",
            done: Boolean(word.trim()),
            body: (
              <label className="lk-field">
                <span className="sr-only">Code word</span>
                <div>
                  <input type="text" value={word} disabled={locked} placeholder="Code word" spellCheck={false} autoComplete="off" onChange={(e) => onWord(e.target.value)} />
                </div>
              </label>
            ),
          },
        ]}
      />
      {opened && <Takeaway afterMorph>Encryption comes back only with the key. It is only as safe as where the key is kept. A key stored next to the data protects nothing.</Takeaway>}
      {locked && <Verdict right={right}>Right key, exact message. Any other key, nothing.</Verdict>}
    </div>
  );
}

// A key box with a Decrypt button. Enter also decrypts.
function KeyTry({ value, placeholder, disabled, onChange, onTry }: { value: string; placeholder: string; disabled: boolean; onChange: (v: string) => void; onTry: () => void }) {
  const ready = Boolean(value.trim()) && !disabled;
  return (
    <div className="lk-panel__try">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && ready && onTry()}
        spellCheck={false}
        autoComplete="off"
        aria-label="Key"
      />
      <button type="button" className="lk-mini" disabled={!ready} onClick={onTry}>
        <Lock aria-hidden="true" /> Decrypt
      </button>
    </div>
  );
}

function HashCard({ onSeen }: { onSeen: () => void }) {
  const [pw, setPw] = useState("");
  const [hash, setHash] = useState("");
  const [tried, setTried] = useState(false);
  useEffect(() => {
    let live = true;
    sha256Hex(pw).then((h) => live && setHash(h));
    return () => {
      live = false;
    };
  }, [pw]);
  return (
    <div className="rt-ticket">
      <CardHead title="Hashing (SHA-256)" />
      <Guide
        steps={[
          {
            title: "Make up a password",
            done: Boolean(pw),
            body: (
              <>
                <input className="lk-input" type="text" value={pw} placeholder="Make one up, like Summer2026!" onChange={(e) => (setPw(e.target.value), setTried(false))} spellCheck={false} autoComplete="off" aria-label="Password" />
                {pw && <Flow left={pw} leftLabel="Your password" step="SHA-256" right={hash} rightLabel="Hash" />}
              </>
            ),
          },
          {
            title: "Try to reverse it",
            done: tried,
            body: (
              <>
                <button
                  type="button"
                  className="lk-mini"
                  onClick={() => {
                    setTried(true);
                    onSeen();
                  }}
                >
                  <LockOpen aria-hidden="true" /> Reverse it
                </button>
                {tried && <Flow left={`${hash.slice(0, 18)}…`} leftLabel="Hash" step="Reverse" blocked right="No way back. There is no key." rightLabel="Result" rightClass="is-blocked" />}
              </>
            ),
          },
        ]}
      />
      {tried && <Takeaway>A hash has no way back. Attackers can only guess, hash each guess and compare, so weak passwords still fall.</Takeaway>}
    </div>
  );
}

function SaltCard({ value, locked, onPick }: { value?: string; locked: boolean; onPick: (v: string) => void }) {
  const [salt, setSalt] = useState(false);
  const [flipped, setFlipped] = useState(false);
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
      <CardHead title="Salt" sub="Priya and Devon use the same password." />
      <div className="lk-pair">
        <span>priya.nair</span>
        <code className={same ? "is-same" : ""}>{pair.priya.slice(0, 24)}…</code>
        <span>devon.brooks</span>
        <code className={same ? "is-same" : ""}>{pair.devon.slice(0, 24)}…</code>
      </div>
      <Guide
        steps={[
          {
            title: "Add a salt and watch the hashes",
            done: flipped || Boolean(value),
            body: (
              <>
                <label className="lk-switch">
                  <input
                    type="checkbox"
                    checked={salt}
                    onChange={(e) => {
                      setSalt(e.target.checked);
                      if (e.target.checked) setFlipped(true);
                    }}
                  />
                  <span>Add a salt per user</span>
                </label>
                <p className={`lk-note ${same ? "is-bad" : "is-good"}`}>{same ? "Identical. Anyone can see they share it." : "Different. The reuse is hidden."}</p>
              </>
            ),
          },
          {
            title: "Why did they split?",
            done: Boolean(value),
            body: <Options label="Why salt works" options={SALT_WHY} value={value} answer={locked ? "input" : undefined} disabled={locked} onPick={onPick} />,
          },
        ]}
      />
      {value && <Takeaway>A salt makes the same password hash differently for every user. It hides reuse and forces attackers to crack each person separately.</Takeaway>}
    </div>
  );
}

/** After the check: replay the guess list against the 2020 table, the way Hashcat or John the Ripper runs a dictionary attack. */
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
      <p className="lk-note">A dictionary attack, the way the open-source crackers Hashcat and John the Ripper run one, at billions of guesses a second.</p>
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
