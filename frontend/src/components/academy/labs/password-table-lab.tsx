"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Lock, LockOpen, Play, RotateCcw } from "lucide-react";
import {
  CHEF_FROM_BASE64,
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
// ways over the years. Students name each method, then work the dump with
// real tools: spot reuse from identical hashes, recover weak passwords by
// hashing a short common list, and decode the Base64 generation in
// CyberChef. The vendor and every password are fictional.

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
  "alex.rivera": "tree + team",
  "priya.nair": "season and year!",
  "devon.brooks": "season and year!",
  "morgan.lee": "my dept #1",
  "sam.whitfield": "season + year",
  "jamie.torres": "company 123",
  "taylor.osei": "welcome",
  "riley.kwan": "four random words",
};
const SAMPLE = ["priya.nair", "devon.brooks", "morgan.lee"];

type Kind = "encoding" | "encryption" | "hash" | "salted";
const KINDS: { key: Kind; text: string }[] = [
  { key: "encoding", text: "Encoding. Anyone can reverse it, no key needed." },
  { key: "encryption", text: "Encryption. Reversible by anyone who has the key." },
  { key: "hash", text: "Hash without salt. One-way, but the same password always gives the same hash." },
  { key: "salted", text: "Salted hash. One-way, and a unique salt makes every user's hash different." },
];

interface Gen {
  id: string;
  tag: string;
  year: string;
  title: string;
  note: string;
  kind: Kind;
  why: string;
}
const GENS: Gen[] = [
  {
    id: "v1",
    tag: "1",
    year: "2014",
    title: "The first portal",
    note: "The column is called pwd_b64. Some values end in = signs, and every value uses only letters, numbers, + and /.",
    kind: "encoding",
    why: "That is Base64. It turns data into safe-to-send text, and anyone can turn it back. There is no key and no secret. Storing a password this way is the same as storing it in plain text.",
  },
  {
    id: "v2",
    tag: "2",
    year: "2017",
    title: "The upgrade",
    note: "The column is called pwd_enc, and the vendor says it is protected with AES using a key stored in the app's config file on the same server. Look at the values for the three users, and at the hint column.",
    kind: "encryption",
    why: "It is encryption, so it can be reversed with the key, and the key sat on the same server the attackers took. Worse, the same password gives the same output, so you can see who shares one, and the hints give the rest away. This is what happened to Adobe in 2013.",
  },
  {
    id: "v3",
    tag: "3",
    year: "2020",
    title: "The fix",
    note: "The column is called pwd_sha256. Every value is 64 characters. Compare the three users' values.",
    kind: "hash",
    why: "A SHA-256 hash cannot be turned back into the password. But without a salt, the same password gives the same hash for everyone, so reuse shows at a glance, and a common password can be found by hashing a list of guesses. This is what happened to LinkedIn in 2012.",
  },
  {
    id: "v4",
    tag: "4",
    year: "2023",
    title: "Done properly",
    note: "Two columns: salt and pwd_hash. Each user has a different salt, and the hash is taken of salt plus password.",
    kind: "salted",
    why: "The salt makes every hash unique, so identical passwords no longer look identical and a list of pre-computed guesses is useless. Real systems also use a deliberately slow hash such as bcrypt or Argon2, so each guess costs an attacker real time.",
  },
];
const BEST_ORDER = ["v4", "v3", "v2", "v1"];

const RESPONSE = [
  { key: "ignore", text: "Nothing. It was the vendor's breach, not ours." },
  { key: "tryit", text: "Try the recovered passwords on the staff members' PurveX accounts to see which still work." },
  { key: "reset", text: "Tell the affected staff, force a password reset for anyone who may have reused a leaked password at PurveX, starting with the ones you recovered, and turn on MFA." },
  { key: "email", text: "Email every staff member their leaked password so they know what was exposed." },
];

// ---- step 1: a live sandbox with real AES-256-GCM and SHA-256 ----

const NOTE_KEY = "Harbor-Kettle-19";
const NOTE_WORD = "ORBIT";
const NOTE_TEXT = `Rotate the LedgerLine service key tonight. Code word: ${NOTE_WORD}.`;
const SALT_WHY = [
  { key: "secret", text: "The salt is a secret password that attackers cannot see." },
  { key: "input", text: "Each user gets a different salt added to the password before hashing, so the input is different." },
  { key: "random", text: "SHA-256 gives a random result every time you run it." },
];

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromB64 = (v: string) => Uint8Array.from(atob(v), (c) => c.charCodeAt(0));

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

function CryptoSandbox() {
  const [pw, setPw] = useState("Summer2026!");
  const [key, setKey] = useState("my-secret-key");
  const [tryKey, setTryKey] = useState("");
  const [cipher, setCipher] = useState("");
  const [opened, setOpened] = useState<string | null | undefined>(undefined);
  const [salt, setSalt] = useState(false);
  const [hash, setHash] = useState("");
  const [pairs, setPairs] = useState<{ priya: string; devon: string }>({ priya: "", devon: "" });
  const [decoded, setDecoded] = useState(false);

  useEffect(() => {
    let live = true;
    const t = window.setTimeout(async () => {
      const [c, h] = await Promise.all([aesEncrypt(key, pw), sha256Hex(pw)]);
      if (live) {
        setCipher(c);
        setHash(h);
        setOpened(undefined);
        setDecoded(false);
      }
    }, 180);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [pw, key]);

  useEffect(() => {
    let live = true;
    Promise.all([sha256Hex((salt ? SALT["priya.nair"] : "") + pw), sha256Hex((salt ? SALT["devon.brooks"] : "") + pw)]).then(([priya, devon]) => {
      if (live) setPairs({ priya, devon });
    });
    return () => {
      live = false;
    };
  }, [pw, salt]);

  const encoded = (() => {
    try {
      return btoa(pw);
    } catch {
      return "Use plain letters, numbers and symbols";
    }
  })();

  return (
    <div className="lk-sandbox">
      <label className="lk-field">
        Type any password
        <div>
          <input type="text" value={pw} onChange={(e) => setPw(e.target.value)} spellCheck={false} autoComplete="off" />
        </div>
      </label>
      <div className="lk-sandbox__grid">
        <article className="lk-panel">
          <header>
            <b>Encoding</b>
            <small>Base64</small>
          </header>
          <code>{encoded}</code>
          <button type="button" className="lk-mini" onClick={() => setDecoded(true)}>
            <LockOpen aria-hidden="true" /> Decode it
          </button>
          {decoded && <p className="lk-note is-bad">Back to {pw}. No key needed. Anyone can do this.</p>}
        </article>
        <article className="lk-panel">
          <header>
            <b>Encryption</b>
            <small>AES-256</small>
          </header>
          <label className="lk-panel__key">
            Key
            <input type="text" value={key} onChange={(e) => setKey(e.target.value)} spellCheck={false} autoComplete="off" />
          </label>
          <code>{cipher || "…"}</code>
          <div className="lk-panel__try">
            <input type="text" value={tryKey} placeholder="Key to decrypt with" onChange={(e) => setTryKey(e.target.value)} spellCheck={false} autoComplete="off" />
            <button type="button" className="lk-mini" disabled={!tryKey || !cipher} onClick={async () => setOpened(await aesDecrypt(tryKey, cipher))}>
              <Lock aria-hidden="true" /> Decrypt
            </button>
          </div>
          {opened === null && <p className="lk-note is-bad">Wrong key. AES refuses to open it.</p>}
          {typeof opened === "string" && <p className="lk-note is-good">Right key. Back to {opened}.</p>}
          <p className="lk-note">Edit the password and the output changes. So does encrypting the same password twice, because each run adds a random starting value.</p>
        </article>
        <article className="lk-panel">
          <header>
            <b>Hashing</b>
            <small>SHA-256</small>
          </header>
          <code>{hash || "…"}</code>
          <button type="button" className="lk-mini" disabled title="There is nothing to reverse with">
            <LockOpen aria-hidden="true" /> Reverse it
          </button>
          <p className="lk-note">There is no reverse button because there is no reverse. The only attack is to guess a password, hash the guess and compare.</p>
        </article>
      </div>
      <article className="lk-panel lk-panel--wide">
        <header>
          <b>Salt</b>
          <label className="lk-switch">
            <input type="checkbox" checked={salt} onChange={(e) => setSalt(e.target.checked)} />
            <span>Add a salt per user</span>
          </label>
        </header>
        <table className="lk-table">
          <tbody>
            <tr>
              <td>priya.nair{salt && <small> + {SALT["priya.nair"]}</small>}</td>
              <td>
                <code>{pairs.priya}</code>
              </td>
            </tr>
            <tr>
              <td>devon.brooks{salt && <small> + {SALT["devon.brooks"]}</small>}</td>
              <td>
                <code>{pairs.devon}</code>
              </td>
            </tr>
          </tbody>
        </table>
        <p className={`lk-note ${pairs.priya && pairs.priya === pairs.devon ? "is-bad" : "is-good"}`}>
          {pairs.priya && pairs.priya === pairs.devon ? "Same password, same hash. Anyone holding the table can see they share it." : "Same password, different hashes. The table no longer shows who shares a password."}
        </p>
      </article>
    </div>
  );
}

/** Alex's note, encrypted for real when the lab opens. Only the key in the ticket opens it. */
function SecretNote() {
  const [packed, setPacked] = useState("");
  const [tryKey, setTryKey] = useState("");
  const [out, setOut] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    aesEncrypt(NOTE_KEY, NOTE_TEXT).then((c) => live && setPacked(c));
    return () => {
      live = false;
    };
  }, []);
  return (
    <div className="lk-note-box">
      <code>{packed || "…"}</code>
      <div className="lk-panel__try">
        <input type="text" value={tryKey} placeholder="Key" onChange={(e) => setTryKey(e.target.value)} spellCheck={false} autoComplete="off" />
        <button type="button" className="lk-mini" disabled={!tryKey || !packed} onClick={async () => setOut(await aesDecrypt(tryKey, packed))}>
          <Lock aria-hidden="true" /> Decrypt
        </button>
      </div>
      {out === null && <p className="lk-note is-bad">Wrong key. Check the ticket and try again. Keys are exact, including capitals.</p>}
      {typeof out === "string" && <p className="lk-note is-good">{out}</p>}
    </div>
  );
}

/** After the check: replay the guess list against the 2020 table, the way a cracking tool runs. */
function AttackReplay({ table }: { table: Record<string, string> }) {
  const [running, setRunning] = useState(false);
  const [pos, setPos] = useState(-1);
  const [guessHash, setGuessHash] = useState("");
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
      setGuessHash(h);
      const matched = USERS.filter((u) => table[u] === h);
      if (matched.length) setHits((prev) => ({ ...prev, ...Object.fromEntries(matched.map((u) => [u, word])) }));
      i += 1;
      timer.current = window.setTimeout(tick, 650);
    };
    void tick();
  };
  return (
    <div className="lk-replay">
      <div className="lk-replay__bar">
        <b>Replay the attack</b>
        <button type="button" className="lk-mini" disabled={running} onClick={run}>
          <Play aria-hidden="true" /> {pos < 0 ? "Run the guess list" : "Run it again"}
        </button>
      </div>
      {pos >= 0 && (
        <p className="lk-note">
          {pos < list.length ? (
            <>
              Guess {pos + 1} of {list.length}: <b>{list[pos]}</b> → <code>{guessHash.slice(0, 16)}…</code>
            </>
          ) : (
            `Done. ${Object.keys(hits).length} of ${USERS.length} accounts fell to ${list.length} guesses. Real tools try billions a second.`
          )}
        </p>
      )}
      <ul className="lk-replay__rows">
        {USERS.map((u) => (
          <li key={u} className={hits[u] ? "is-hit" : ""}>
            <span>{u}</span>
            <b>{hits[u] ?? "not found"}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS = ["See the difference", "Name the storage", "Work the dump", "Rank and respond", "Debrief"];

interface State {
  step: number;
  kinds: Record<string, Kind>;
  reused: string[];
  recovered: Record<string, string>;
  decoded: string;
  order: string[];
  response?: string;
  noteWord: string;
  saltWhy?: string;
  checked: [boolean, boolean, boolean, boolean];
}
const START: State = { step: 0, kinds: {}, reused: [], recovered: {}, decoded: "", order: ["v1", "v2", "v3", "v4"], noteWord: "", checked: [false, false, false, false] };
const STORE = "academy-lab-password-table-v2";

// Every password here is plain ASCII, so btoa gives standard Base64.
const b64 = (v: string) => btoa(v);

export function PasswordTableLab() {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.order) && v.order.length === 4 && Array.isArray(v.checked) && v.checked.length === 4);
  // Unsalted, "encrypted" (the same input always gives the same output, like the ECB mode Adobe used) and salted values.
  const plain = useHashes(Object.fromEntries(USERS.map((u) => [u, PW[u]])));
  const enc = useHashes(Object.fromEntries(USERS.map((u) => [u, `ledgerline-app-key|${PW[u]}`])));
  const salted = useHashes(Object.fromEntries(USERS.map((u) => [u, SALT[u] + PW[u]])));
  const deck = useDeck(GENS.length);
  const [recoverOk, setRecoverOk] = useState<Record<string, boolean>>({});

  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const go = (step: number) => {
    patch({ step });
    deck.reset();
    document.querySelector(".rt")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const check = (i: 0 | 1 | 2 | 3) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));

  // A recovered password is checked by hashing it, the same way an attacker confirms a guess.
  const tryRecover = async (user: string, guess: string) => {
    const next = { ...s.recovered, [user]: guess };
    patch({ recovered: next });
    const h = guess ? await sha256Hex(guess) : "";
    setRecoverOk((prev) => ({ ...prev, [user]: Boolean(guess) && h === plain[user] }));
  };

  const score = useMemo(() => {
    const kinds = GENS.filter((g) => s.kinds[g.id] === g.kind).length;
    const reuse = s.reused.length === REUSED.length && REUSED.every((u) => s.reused.includes(u)) ? 1 : 0;
    const rec = RECOVER.filter((u) => s.recovered[u] === PW[u]).length;
    const dec = s.decoded.trim() === PW[DECODE_USER] ? 1 : 0;
    const rank = s.order.filter((id, i) => BEST_ORDER[i] === id).length;
    const resp = s.response === "reset" ? 1 : 0;
    const sandbox = (s.noteWord.trim().toUpperCase() === NOTE_WORD ? 1 : 0) + (s.saltWhy === "input" ? 1 : 0);
    return { sandbox, kinds, work: reuse + rec + dec, respond: rank + resp, total: sandbox + kinds + reuse + rec + dec + rank + resp };
  }, [s]);

  const reached = [true, s.checked[0], s.checked[1], s.checked[2], s.checked[3]];
  const valueFor = (g: Gen, u: string) =>
    g.kind === "encoding" ? b64(PW[u]) : g.kind === "encryption" ? (enc[u] ?? "").slice(0, 32).toUpperCase() : g.kind === "hash" ? plain[u] : salted[u];

  return (
    <section className="rt" aria-label="The Leaked Password Table lab">
      <Stepper steps={STEPS} step={s.step} done={[...s.checked, false]} reached={reached} onGo={go} />

      {s.step === 0 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>Three ways to hide a password</h3>
            <p>
              Before the breach, get a feel for the three methods. Type a password and watch what each one does to it. Then try to get the password back out of each. That one test is the whole difference.
            </p>
          </header>
          <CryptoSandbox />
          <div className="lk-q">
            <b>Alex Rivera left you an encrypted note. The key is in your ticket: {NOTE_KEY}. Decrypt it and type the code word.</b>
            <SecretNote />
            <label className="lk-field">
              Code word
              <div>
                <input type="text" value={s.noteWord} disabled={s.checked[0]} spellCheck={false} autoComplete="off" onChange={(e) => patch({ noteWord: e.target.value })} />
              </div>
            </label>
            {s.checked[0] && (
              <Verdict right={s.noteWord.trim().toUpperCase() === NOTE_WORD}>
                The code word is {NOTE_WORD}. With the right key, encryption gives you back exactly what went in. With any other key you get an error, not a near miss. That is why the key is the thing to protect.
              </Verdict>
            )}
          </div>
          <div className="lk-q">
            <b>In the salt panel, Priya and Devon use the same password. Why do their hashes stop matching when you switch the salt on?</b>
            <Options label="Why salt works" options={SALT_WHY} value={s.saltWhy} answer={s.checked[0] ? "input" : undefined} disabled={s.checked[0]} onPick={(saltWhy) => patch({ saltWhy })} />
            {s.checked[0] && (
              <Verdict right={s.saltWhy === "input"}>
                Each user gets their own random salt, and the salt is added to the password before hashing. Different input, different fingerprint. The salt is not secret. It just makes every hash unique.
              </Verdict>
            )}
          </div>
          <footer className="rt-foot">
            {s.checked[0] ? (
              <>
                <p className="rt-tally">
                  <b>{score.sandbox} of 2</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(1)}>
                  Open the breach
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">Decrypt the note and answer the salt question</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!s.noteWord.trim() || !s.saltWhy} onClick={() => check(0)}>
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
            <h3>How did they store it?</h3>
            <p>
              {VENDOR} changed how it stored passwords three times, and the dump holds all four generations. Here are the same three staff members in each one. Name the method before you touch the data. It decides what an attacker can do
              with it.
            </p>
          </header>
          <Deck
            tags={GENS.map((g) => g.tag)}
            titles={GENS.map((g) => `${g.year}: ${g.title}`)}
            index={deck.card}
            dir={deck.dir}
            onGo={deck.show}
            status={GENS.map((g): DotStatus => (s.checked[1] ? (s.kinds[g.id] === g.kind ? "right" : "wrong") : s.kinds[g.id] ? "answered" : "open"))}
          >
            {(() => {
              const g = GENS[deck.card];
              const done = s.checked[1];
              const right = s.kinds[g.id] === g.kind;
              return (
                <div className={`rt-ticket${done ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <div className="rt-ticket__head">
                    <span className="rt-tag">{g.tag}</span>
                    <div>
                      <b>
                        {g.year}: {g.title}
                      </b>
                      <p>{g.note}</p>
                    </div>
                  </div>
                  <div className="lk-scroll">
                    <table className="lk-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          {g.kind === "salted" && <th>Salt</th>}
                          <th>Stored value</th>
                          {g.kind === "encryption" && <th>Hint</th>}
                        </tr>
                      </thead>
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
                              <code>{valueFor(g, u) || "computing…"}</code>
                            </td>
                            {g.kind === "encryption" && <td>{HINT[u]}</td>}
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
                      deck.next((i) => Boolean(kinds[GENS[i].id]));
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
                  <b>{score.kinds} of 4</b> named correctly
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
            <h3>What can an attacker get?</h3>
            <p>
              You are on the defending side. Before you tell anyone to change a password, find out exactly what the dump gives away. Work it the way an attacker would, with the same free tools, and without logging in to anything.
            </p>
          </header>

          <div className="lk-q">
            <b>1. The 2020 table. Which staff members share the same password? Tick them.</b>
            <div className="lk-scroll">
              <table className="lk-table">
                <thead>
                  <tr>
                    <th />
                    <th>User</th>
                    <th>pwd_sha256</th>
                  </tr>
                </thead>
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
                          <code>{plain[u] ?? "computing…"}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {s.checked[2] && (
              <Verdict right={s.reused.length === REUSED.length && REUSED.every((u) => s.reused.includes(u))}>
                Priya Nair, Devon Brooks and Sam Whitfield have the identical hash, so they use the identical password. You did not crack anything to learn that. No salt means reuse is visible to anyone holding the table.
              </Verdict>
            )}
          </div>

          <div className="lk-q">
            <b>2. Two accounts use passwords from this list of common passwords. Hash each one and find their passwords.</b>
            <div className="lk-hashout">
              <code>{COMMON.join("   ")}</code>
              <CopyButton text={COMMON.join("\n")} label="Copy list" />
            </div>
            <p className="lk-note">
              In CyberChef you can paste the whole list, one word per line, and add the Fork operation before SHA2 to hash every line at once. That is how analysts test a password list in seconds.
            </p>
            <HashTool mode="text" />
            {RECOVER.map((u) => (
              <label key={u} className="lk-field">
                Password for {u}
                <div>
                  <input
                    type="text"
                    value={s.recovered[u] ?? ""}
                    disabled={s.checked[2]}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="Type the password that hashes to their value"
                    onChange={(e) => void tryRecover(u, e.target.value)}
                  />
                </div>
                {s.recovered[u] && !s.checked[2] && (
                  <span className={`lk-note ${recoverOk[u] ? "is-good" : "is-bad"}`}>{recoverOk[u] ? "That hashes to their value. Confirmed." : "That does not hash to their value yet."}</span>
                )}
              </label>
            ))}
            {s.checked[2] && (
              <Verdict right={RECOVER.every((u) => s.recovered[u] === PW[u])}>
                jamie.torres uses Purvex123 and taylor.osei uses Welcome2026. A hash cannot be reversed, but a weak password can be guessed, hashed and compared. Real attackers run lists with millions of entries through tools such as hashcat,
                and fast unsalted hashes let them test billions of guesses a second.
              </Verdict>
            )}
            {s.checked[2] && <AttackReplay table={plain} />}
          </div>

          <div className="lk-q">
            <b>3. The 2014 table stored {DECODE_USER}&apos;s password like this. Decode it in CyberChef and type the password.</b>
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
              The decoded password
              <div>
                <input type="text" value={s.decoded} disabled={s.checked[2]} spellCheck={false} autoComplete="off" onChange={(e) => patch({ decoded: e.target.value })} />
              </div>
            </label>
            {s.checked[2] && (
              <Verdict right={s.decoded.trim() === PW[DECODE_USER]}>
                It decodes straight to {PW[DECODE_USER]}. No key, no guessing, no tool beyond a decoder. Encoding changes how data looks, not who can read it.
              </Verdict>
            )}
          </div>

          <footer className="rt-foot">
            {s.checked[2] ? (
              <>
                <p className="rt-tally">
                  <b>{score.work} of 4</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(3)}>
                  Rank and respond
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">Answer all three, then check</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!s.reused.length || RECOVER.some((u) => !s.recovered[u]) || !s.decoded.trim()} onClick={() => check(2)}>
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
            <h3>Which method holds up, and what do you do now?</h3>
            <p>Rank the four generations from safest at the top to most dangerous at the bottom, then pick PurveX&apos;s response.</p>
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
                    {g.year}: {KINDS.find((k) => k.key === g.kind)!.text.split(".")[0]}
                    {done && !right && <small>Belongs at number {BEST_ORDER.indexOf(id) + 1}</small>}
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
          {s.checked[3] && (
            <p className="rt-lesson">
              Salted hashing is safest because nothing can be reversed and every hash is unique. Plain hashing is next: strong passwords survive, weak ones fall to a guess list. Encryption with the key on the same server is worse, because
              one stolen key reveals every password. Base64 is last, because it protects nothing at all.
            </p>
          )}
          <div className="lk-q">
            <b>Eight PurveX staff had {VENDOR} accounts. What do you do?</b>
            <Options label="Response" options={RESPONSE} value={s.response} answer={s.checked[3] ? "reset" : undefined} disabled={s.checked[3]} onPick={(response) => patch({ response })} />
            {s.checked[3] && (
              <Verdict right={s.response === "reset"}>
                People reuse passwords, so a vendor breach is a PurveX risk. Reset first, starting with the passwords you proved are exposed, and add MFA so a leaked password alone is not enough. Never log in with someone&apos;s
                leaked password to test it, and never send passwords by email.
              </Verdict>
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
                Sandbox {score.sandbox} of 2 · Named {score.kinds} of 4 · Worked {score.work} of 4 · Ranked and responded {score.respond} of 5
              </p>
            </div>
          </header>
          <div className="lk-scroll">
            <table className="lk-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Reversible?</th>
                  <th>Needs a key?</th>
                  <th>Use it for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Encoding (Base64)</td>
                  <td>Yes, by anyone</td>
                  <td>No</td>
                  <td>Formatting data. Never for secrets.</td>
                </tr>
                <tr>
                  <td>Encryption (AES)</td>
                  <td>Yes, with the key</td>
                  <td>Yes</td>
                  <td>Data you must read again: files, disks, traffic.</td>
                </tr>
                <tr>
                  <td>Hashing (SHA-256)</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Proving a file did not change.</td>
                </tr>
                <tr>
                  <td>Salted slow hash (bcrypt, Argon2)</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Storing passwords.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="lk-real">
            <b>It happened for real</b>
            <p>
              Adobe (2013) encrypted passwords instead of hashing them, with identical passwords producing identical output and the hints stored in plain text. LinkedIn (2012) stored unsalted hashes, and most were cracked soon after the
              leak. Both are why salted, slow hashing is the standard today.
            </p>
          </div>
          <footer className="rt-foot">
            <p className="rt-tally">Passwords are hashed with a salt. Secrets you need back are encrypted. Base64 is never security.</p>
            <button type="button" className="rt-btn" onClick={() => setS(START)}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}
