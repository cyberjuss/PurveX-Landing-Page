"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
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

const STEPS = ["Name the storage", "Work the dump", "Rank and respond", "Debrief"];

interface State {
  step: number;
  kinds: Record<string, Kind>;
  reused: string[];
  recovered: Record<string, string>;
  decoded: string;
  order: string[];
  response?: string;
  checked: [boolean, boolean, boolean];
}
const START: State = { step: 0, kinds: {}, reused: [], recovered: {}, decoded: "", order: ["v1", "v2", "v3", "v4"], checked: [false, false, false] };
const STORE = "academy-lab-password-table-v1";

// Every password here is plain ASCII, so btoa gives standard Base64.
const b64 = (v: string) => btoa(v);

export function PasswordTableLab() {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.order) && v.order.length === 4 && Array.isArray(v.checked));
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
  const check = (i: 0 | 1 | 2) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));

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
    return { kinds, work: reuse + rec + dec, respond: rank + resp, total: kinds + reuse + rec + dec + rank + resp };
  }, [s]);

  const reached = [true, s.checked[0], s.checked[1], s.checked[2]];
  const valueFor = (g: Gen, u: string) =>
    g.kind === "encoding" ? b64(PW[u]) : g.kind === "encryption" ? (enc[u] ?? "").slice(0, 32).toUpperCase() : g.kind === "hash" ? plain[u] : salted[u];

  return (
    <section className="rt" aria-label="The Leaked Password Table lab">
      <Stepper steps={STEPS} step={s.step} done={[...s.checked, false]} reached={reached} onGo={go} />

      {s.step === 0 && (
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
            status={GENS.map((g): DotStatus => (s.checked[0] ? (s.kinds[g.id] === g.kind ? "right" : "wrong") : s.kinds[g.id] ? "answered" : "open"))}
          >
            {(() => {
              const g = GENS[deck.card];
              const done = s.checked[0];
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
            {s.checked[0] ? (
              <>
                <p className="rt-tally">
                  <b>{score.kinds} of 4</b> named correctly
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(1)}>
                  Work the dump
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{GENS.filter((g) => s.kinds[g.id]).length} of 4 named</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={GENS.some((g) => !s.kinds[g.id])} onClick={() => check(0)}>
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
                            disabled={s.checked[1]}
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
            {s.checked[1] && (
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
                    disabled={s.checked[1]}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="Type the password that hashes to their value"
                    onChange={(e) => void tryRecover(u, e.target.value)}
                  />
                </div>
                {s.recovered[u] && !s.checked[1] && (
                  <span className={`lk-note ${recoverOk[u] ? "is-good" : "is-bad"}`}>{recoverOk[u] ? "That hashes to their value. Confirmed." : "That does not hash to their value yet."}</span>
                )}
              </label>
            ))}
            {s.checked[1] && (
              <Verdict right={RECOVER.every((u) => s.recovered[u] === PW[u])}>
                jamie.torres uses Purvex123 and taylor.osei uses Welcome2026. A hash cannot be reversed, but a weak password can be guessed, hashed and compared. Real attackers run lists with millions of entries through tools such as hashcat,
                and fast unsalted hashes let them test billions of guesses a second.
              </Verdict>
            )}
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
                <input type="text" value={s.decoded} disabled={s.checked[1]} spellCheck={false} autoComplete="off" onChange={(e) => patch({ decoded: e.target.value })} />
              </div>
            </label>
            {s.checked[1] && (
              <Verdict right={s.decoded.trim() === PW[DECODE_USER]}>
                It decodes straight to {PW[DECODE_USER]}. No key, no guessing, no tool beyond a decoder. Encoding changes how data looks, not who can read it.
              </Verdict>
            )}
          </div>

          <footer className="rt-foot">
            {s.checked[1] ? (
              <>
                <p className="rt-tally">
                  <b>{score.work} of 4</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(2)}>
                  Rank and respond
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">Answer all three, then check</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!s.reused.length || RECOVER.some((u) => !s.recovered[u]) || !s.decoded.trim()} onClick={() => check(1)}>
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
            <h3>Which method holds up, and what do you do now?</h3>
            <p>Rank the four generations from safest at the top to most dangerous at the bottom, then pick PurveX&apos;s response.</p>
          </header>
          <ol className="rt-rank">
            {s.order.map((id, i) => {
              const g = GENS.find((x) => x.id === id)!;
              const done = s.checked[2];
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
          {s.checked[2] && (
            <p className="rt-lesson">
              Salted hashing is safest because nothing can be reversed and every hash is unique. Plain hashing is next: strong passwords survive, weak ones fall to a guess list. Encryption with the key on the same server is worse, because
              one stolen key reveals every password. Base64 is last, because it protects nothing at all.
            </p>
          )}
          <div className="lk-q">
            <b>Eight PurveX staff had {VENDOR} accounts. What do you do?</b>
            <Options label="Response" options={RESPONSE} value={s.response} answer={s.checked[2] ? "reset" : undefined} disabled={s.checked[2]} onPick={(response) => patch({ response })} />
            {s.checked[2] && (
              <Verdict right={s.response === "reset"}>
                People reuse passwords, so a vendor breach is a PurveX risk. Reset first, starting with the passwords you proved are exposed, and add MFA so a leaked password alone is not enough. Never log in with someone&apos;s
                leaked password to test it, and never send passwords by email.
              </Verdict>
            )}
          </div>
          <footer className="rt-foot">
            {s.checked[2] ? (
              <>
                <p className="rt-tally">
                  <b>{score.respond} of 5</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(3)}>
                  See the debrief
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">Use the arrows to reorder</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!s.response} onClick={() => check(2)}>
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
            <div className={`rt-grade rt-grade--${score.total >= 11 ? "high" : score.total >= 8 ? "medium" : "low"}`}>
              <b>{score.total}</b>
              <small>of 13</small>
            </div>
            <div>
              <h3>{score.total >= 11 ? "You would handle this breach" : score.total >= 8 ? "Solid start" : "Worth another pass"}</h3>
              <p>
                Named {score.kinds} of 4 · Worked {score.work} of 4 · Ranked and responded {score.respond} of 5
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
