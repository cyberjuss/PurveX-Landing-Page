"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Deck, labPassed, Narrator, nextHint, Options, Stepper, useDeck, useLabDone, useLabPass, useSaved, Verdict, Guide, Takeaway, type DotStatus } from "./lab-kit";
import { PythonCell } from "./python-cell";

// Week 4 lab: a night of sign-in events from PurveX's domain controller and
// MFA service. Four incidents hide in it. The student names each pattern,
// finds the row that proves it, counts the log with real Python, and picks
// the first response. Attacker addresses come from the ranges reserved for
// documentation (RFC 5737), so none of them is a real host.

type Row = { time: string; event: string; account: string; source: string; detail: string };

const SPRAY_IP = "203.0.113.45";
const PHONE_IP = "10.20.4.33";
const MFA_IP = "198.51.100.23";
const SPRAYED = ["alex.rivera", "devon.brooks", "morgan.lee", "sam.whitfield", "jamie.torres", "priya.nair", "riley.kwan"];

const pad = (n: number) => String(n).padStart(2, "0");

const SPRAY: Row[] = [
  ...SPRAYED.map((a, i) => ({ time: `01:52:${pad(10 + i * 4)}`, event: "4625", account: a, source: SPRAY_IP, detail: "Failed, wrong password (0xC000006A)" })),
  { time: "01:52:44", event: "4624", account: "taylor.osei", source: SPRAY_IP, detail: "Success, logon type 3 (network)" },
];
const PHONE: Row[] = [
  { time: "07:58:02", event: "4723", account: "riley.kwan", source: "10.20.4.18", detail: "User changed their own password" },
  ...Array.from({ length: 10 }, (_, i) => ({ time: `08:${pad(i * 4)}:15`, event: "4625", account: "riley.kwan", source: PHONE_IP, detail: "Failed, wrong password (0xC000006A)" })),
  { time: "08:36:15", event: "4740", account: "riley.kwan", source: PHONE_IP, detail: "Account locked out" },
  { time: "08:40:15", event: "4625", account: "riley.kwan", source: PHONE_IP, detail: "Failed, account locked (0xC0000234)" },
  { time: "08:44:15", event: "4625", account: "riley.kwan", source: PHONE_IP, detail: "Failed, account locked (0xC0000234)" },
];
const MFA: Row[] = [
  ...[3, 5, 7, 9, 11].map((m) => ({ time: `02:${pad(m)}:30`, event: "MFA", account: "jamie.torres", source: MFA_IP, detail: "Password correct, push denied by user" })),
  { time: "02:13:30", event: "MFA", account: "jamie.torres", source: MFA_IP, detail: "Password correct, push approved by user" },
  { time: "02:13:34", event: "4624", account: "jamie.torres", source: MFA_IP, detail: "Success, logon type 3 (network)" },
];
const SERVICE: Row[] = [
  { time: "01:00:03", event: "4624", account: "svc-backup-job", source: "FS01", detail: "Success, logon type 5 (service)" },
  { time: "03:07:41", event: "4624", account: "svc-backup-job", source: "10.20.1.57", detail: "Success, logon type 10 (Remote Desktop)" },
  { time: "03:07:41", event: "4672", account: "svc-backup-job", source: "10.20.1.57", detail: "Special privileges assigned to new logon" },
];
// An ordinary morning, so the counts are not handed to the student.
const NORMAL: Row[] = [
  { time: "07:31:09", event: "4624", account: "sam.whitfield", source: "10.20.2.21", detail: "Success, logon type 2 (keyboard)" },
  { time: "07:44:52", event: "4624", account: "jordan.ellis", source: "10.20.5.14", detail: "Success, logon type 2 (keyboard)" },
  { time: "08:02:37", event: "4625", account: "morgan.lee", source: "10.20.3.12", detail: "Failed, wrong password (0xC000006A)" },
  { time: "08:02:49", event: "4624", account: "morgan.lee", source: "10.20.3.12", detail: "Success, logon type 2 (keyboard)" },
  { time: "08:15:20", event: "4624", account: "priya.nair", source: "10.20.1.57", detail: "Success, logon type 2 (keyboard)" },
];
const LOG: Row[] = [...SPRAY, ...PHONE, ...MFA, ...SERVICE, ...NORMAL].sort((a, b) => a.time.localeCompare(b.time));
const CSV = "time,event,account,source,detail\n" + LOG.map((r) => [r.time, r.event, r.account, r.source, `"${r.detail}"`].join(",")).join("\n") + "\n";

type Pattern = "spray" | "brute" | "stale" | "fatigue" | "service";
const PATTERNS: { key: Pattern; text: string }[] = [
  { key: "spray", text: "Password spray: one password tried against many accounts" },
  { key: "brute", text: "Brute force: many passwords tried against one account" },
  { key: "stale", text: "A device still using an old password" },
  { key: "fatigue", text: "MFA fatigue: prompts until someone approves one" },
  { key: "service", text: "A service account used by a person" },
];

interface Incident {
  id: string;
  tag: string;
  title: string;
  rows: Row[];
  pattern: Pattern;
  /** Index into rows of the event that proves it. */
  proof: number;
  patternWhy: string;
  proofWhy: string;
  prompt: string;
  options: { key: string; text: string }[];
  answer: string;
  responseWhy: string;
}

const INCIDENTS: Incident[] = [
  {
    id: "spray",
    tag: "A",
    title: "Failures from one address at 01:52",
    rows: SPRAY,
    pattern: "spray",
    proof: SPRAY.length - 1,
    patternWhy: "Seven different accounts, one wrong password each, seconds apart, all from one address. That is one password tried across many accounts.",
    proofWhy: "The last row: the same address signed in as taylor.osei. The spray found a working password.",
    prompt: "The spray ended in a successful sign-in. What do you do first?",
    options: [
      { key: "block", text: "Block the address. The other attempts failed, so nothing was lost." },
      { key: "contain", text: "Treat taylor.osei as compromised: reset it, end its sessions, check what it did after 01:52 and escalate." },
      { key: "lockall", text: "Lock every account in the domain until the morning." },
      { key: "email", text: "Email the seven targeted users to change their passwords." },
    ],
    answer: "contain",
    responseWhy: "A success from the attacking address means the attacker holds a working account. Contain that account first, then find out what it touched.",
  },
  {
    id: "phone",
    tag: "B",
    title: "riley.kwan locked out at 08:36",
    rows: PHONE,
    pattern: "stale",
    proof: 0,
    patternWhy: "One account, steady failures every four minutes from one internal device, starting right after a password change. That is a phone or app retrying the old password.",
    proofWhy: "The first row: Riley changed the password at 07:58 from the laptop. The failures start two minutes later from another device.",
    prompt: "What is the right fix?",
    options: [
      { key: "escalate", text: "Escalate to security as an attack on Riley's account." },
      { key: "fix", text: "Verify Riley on the number on file, unlock the account and update the password saved on the phone." },
      { key: "disable", text: "Disable Riley's account until it is investigated." },
    ],
    answer: "fix",
    responseWhy: "Nothing here points outside the firm. The phone keeps retrying the old password, so it will lock Riley out again until it gets the new one.",
  },
  {
    id: "mfa",
    tag: "C",
    title: "Push prompts for jamie.torres at 02:03",
    rows: MFA,
    pattern: "fatigue",
    proof: 5,
    patternWhy: "The password was correct every time, then prompt after prompt at two in the morning until one was approved. The attacker already had the password.",
    proofWhy: "The approved push at 02:13. One tap let the attacker in, and the sign-in follows four seconds later.",
    prompt: "What do you do first?",
    options: [
      { key: "remind", text: "Remind Jamie to deny prompts they did not start." },
      { key: "contain", text: "Reset Jamie's password, revoke active sessions, review the 02:13 sign-in and escalate." },
      { key: "nothing", text: "Nothing. Jamie approved the sign-in." },
    ],
    answer: "contain",
    responseWhy: "The approval means the attacker is signed in as Jamie. A reminder protects the next sign-in, not this one. Cut the session and change the password.",
  },
  {
    id: "service",
    tag: "D",
    title: "svc-backup-job signs in twice",
    rows: SERVICE,
    pattern: "service",
    proof: 1,
    patternWhy: "The 01:00 logon is the nightly job, logon type 5. At 03:07 someone opened a Remote Desktop session with the same account and got admin rights.",
    proofWhy: "Logon type 10 is Remote Desktop. A backup job never sits at a desktop, so a person used its password.",
    prompt: "What do you do?",
    options: [
      { key: "ignore", text: "Nothing. The account signs in every night." },
      { key: "escalate", text: "Escalate, find out who was at 10.20.1.57, reset the account's password and block interactive sign-in for it." },
      { key: "delete", text: "Delete the service account." },
    ],
    answer: "escalate",
    responseWhy: "Someone has the service account's password and used it interactively. Escalate, then stop the account from ever signing in at a desktop. Deleting it breaks the backups and loses evidence.",
  },
];

// Worked out from the log itself, so the answers always match the data.
const FAILS = LOG.filter((r) => r.event === "4625");
const COUNT = Object.entries(FAILS.reduce<Record<string, number>>((m, r) => ((m[r.source] = (m[r.source] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
const SPREAD = Object.entries(FAILS.reduce<Record<string, Set<string>>>((m, r) => ((m[r.source] ??= new Set()).add(r.account), m), {})).map(([s, set]) => [s, set.size] as const).sort((a, b) => b[1] - a[1]);
const SOURCES = [...new Set(FAILS.map((r) => r.source))].sort();
const MOST_FAILS = COUNT[0][0];
const MOST_ACCOUNTS = SPREAD[0][0];

const STARTER = `import csv
from collections import Counter, defaultdict

rows = list(csv.DictReader(open("signin.csv")))
failed = [r for r in rows if r["event"] == "4625"]

# 1. How many failed sign-ins came from each source?
print("Failures per source:")
for source, n in Counter(r["source"] for r in failed).most_common():
    print(" ", source, n)

# 2. How many different accounts did each source try?
tried = defaultdict(set)
for r in failed:
    tried[r["source"]].add(r["account"])
print("Accounts tried per source:")
for source, accounts in tried.items():
    print(" ", source, len(accounts))
`;

const STEPS = ["Name the pattern", "Count it in Python", "Make the call", "Debrief"];

interface State {
  step: number;
  pattern: Record<string, Pattern>;
  proof: Record<string, number>;
  q: { fails?: string; accounts?: string };
  ran: boolean;
  response: Record<string, string>;
  checked: [boolean, boolean, boolean];
}
const START: State = { step: 0, pattern: {}, proof: {}, q: {}, ran: false, response: {}, checked: [false, false, false] };
const STORE = "academy-lab-signin-log-v1";

export function SigninLogLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.checked) && v.checked.length === 3 && typeof v.pattern === "object");
  const deck1 = useDeck(INCIDENTS.length);
  const deck3 = useDeck(INCIDENTS.length);
  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const check = (i: 0 | 1 | 2) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));
  const go = (step: number) => {
    patch({ step });
    deck1.reset();
    deck3.reset();
    document.querySelector(".rt")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const score = useMemo(() => {
    const named = INCIDENTS.filter((i) => s.pattern[i.id] === i.pattern).length + INCIDENTS.filter((i) => s.proof[i.id] === i.proof).length;
    const counted = (s.q.fails === MOST_FAILS ? 1 : 0) + (s.q.accounts === MOST_ACCOUNTS ? 1 : 0);
    const calls = INCIDENTS.filter((i) => s.response[i.id] === i.answer).length;
    return { named, counted, calls, total: named + counted + calls };
  }, [s]);
  const done = s.checked.every(Boolean);
  useLabDone(done, onDone);
  useLabPass("lab-signin-log", labPassed(done, score.total, 14));

  const card1Done = (i: Incident) => Boolean(s.pattern[i.id]) && s.proof[i.id] !== undefined;
  const reached = [true, s.checked[0], s.checked[1], s.checked[2]];

  return (
    <section className="rt" aria-label="Read the Sign-In Log lab">
      <Stepper steps={STEPS} step={s.step} done={[...s.checked, false]} reached={reached} onGo={go} />

      {s.step === 0 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>What happened overnight?</h3>
            <Narrator>Four things in last night&apos;s log need a look. For each one, name the pattern, then click the row that proves it.</Narrator>
          </header>
          <Deck
            tags={INCIDENTS.map((i) => i.tag)}
            titles={INCIDENTS.map((i) => i.title)}
            index={deck1.card}
            dir={deck1.dir}
            onGo={deck1.show}
            status={INCIDENTS.map((i): DotStatus => (s.checked[0] ? (s.pattern[i.id] === i.pattern && s.proof[i.id] === i.proof ? "right" : "wrong") : card1Done(i) ? "answered" : "open"))}
          >
            {(() => {
              const inc = INCIDENTS[deck1.card];
              const checked = s.checked[0];
              const right = s.pattern[inc.id] === inc.pattern && s.proof[inc.id] === inc.proof;
              return (
                <div className={`rt-ticket${checked ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <div className="lk-card-head">
                    <b>{inc.title}</b>
                    <small>Security log from DC01 and the MFA service. Read it top to bottom.</small>
                  </div>
                  <EventKey rows={inc.rows} />
                  <LogTable
                    rows={inc.rows}
                    picked={s.proof[inc.id]}
                    answer={checked ? inc.proof : undefined}
                    onPick={
                      checked
                        ? undefined
                        : (n) => {
                            const proof = { ...s.proof, [inc.id]: n };
                            patch({ proof });
                            deck1.next((k) => Boolean(s.pattern[INCIDENTS[k].id]) && proof[INCIDENTS[k].id] !== undefined);
                          }
                    }
                  />
                  <Guide
                    showAll
                    steps={[
                      {
                        title: "What is happening?",
                        done: Boolean(s.pattern[inc.id]),
                        body: (
                          <Options
                            label={`Pattern for ${inc.title}`}
                            options={PATTERNS}
                            value={s.pattern[inc.id]}
                            answer={checked ? inc.pattern : undefined}
                            disabled={checked}
                            onPick={(v) => {
                              const pattern = { ...s.pattern, [inc.id]: v as Pattern };
                              patch({ pattern });
                              deck1.next((n) => Boolean(pattern[INCIDENTS[n].id]) && s.proof[INCIDENTS[n].id] !== undefined);
                            }}
                          />
                        ),
                      },
                      {
                        title: "Which row proves it? Click it in the log above.",
                        done: s.proof[inc.id] !== undefined,
                        body:
                          s.proof[inc.id] !== undefined ? (
                            <p className="lk-note">
                              You picked {inc.rows[s.proof[inc.id]].time}, event {inc.rows[s.proof[inc.id]].event}, {inc.rows[s.proof[inc.id]].account}.
                            </p>
                          ) : (
                            <p className="lk-note">Look for the moment the story turns: where the attack worked, or where the trouble started.</p>
                          ),
                      },
                    ]}
                  />
                  {checked && (
                    <div className="rt-why">
                      <Verdict right={s.pattern[inc.id] === inc.pattern}>{inc.patternWhy}</Verdict>
                      <Verdict right={s.proof[inc.id] === inc.proof}>{inc.proofWhy}</Verdict>
                    </div>
                  )}
                </div>
              );
            })()}
          </Deck>
          <footer className="rt-foot">
            {s.checked[0] ? (
              <>
                <p className="rt-tally">
                  <b>{INCIDENTS.filter((i) => s.pattern[i.id] === i.pattern).length + INCIDENTS.filter((i) => s.proof[i.id] === i.proof).length} of 8</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(1)}>
                  Count it in Python
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint(INCIDENTS.map(card1Done), INCIDENTS.map((i) => `incident ${i.tag}`))}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!INCIDENTS.every(card1Done)} onClick={() => check(0)}>
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
            <h3>Which source is the attacker?</h3>
            <Narrator>Count the whole night with Python. Run the script as it is, then answer from what it prints.</Narrator>
          </header>
          <Guide
            showAll
            steps={[
              {
                title: "Run the script over signin.csv",
                done: s.ran,
                body: (
                  <>
                    <PythonCell initial={STARTER} files={{ "signin.csv": CSV }} onRun={(_, ok) => ok && !s.ran && patch({ ran: true })} />
                    <details className="lk-more">
                      <summary>Python blocked on this computer? See the whole log</summary>
                      <LogTable rows={LOG} tall />
                    </details>
                  </>
                ),
              },
              {
                title: "Which source has the most failed sign-ins?",
                done: Boolean(s.q.fails),
                body: (
                  <Options
                    label="Most failed sign-ins"
                    options={SOURCES.map((v) => ({ key: v, text: v }))}
                    value={s.q.fails}
                    answer={s.checked[1] ? MOST_FAILS : undefined}
                    disabled={s.checked[1]}
                    onPick={(fails) => patch({ q: { ...s.q, fails } })}
                  />
                ),
              },
              {
                title: "Which source tried the most different accounts?",
                done: Boolean(s.q.accounts),
                body: (
                  <Options
                    label="Most accounts tried"
                    options={SOURCES.map((v) => ({ key: v, text: v }))}
                    value={s.q.accounts}
                    answer={s.checked[1] ? MOST_ACCOUNTS : undefined}
                    disabled={s.checked[1]}
                    onPick={(accounts) => patch({ q: { ...s.q, accounts } })}
                  />
                ),
              },
            ]}
          />
          {s.checked[1] && (
            <div className="rt-why">
              <Verdict right={s.q.fails === MOST_FAILS}>
                {MOST_FAILS} has the most failures, {COUNT[0][1]}. That is Riley&apos;s phone retrying one account.
              </Verdict>
              <Verdict right={s.q.accounts === MOST_ACCOUNTS}>
                {MOST_ACCOUNTS} tried {SPREAD[0][1]} different accounts, one failure each. That is the spray.
              </Verdict>
              <Takeaway>Counting failures alone points at the noisiest device, not the attacker. A spray shows up as many accounts from one source, a few tries each.</Takeaway>
            </div>
          )}
          <footer className="rt-foot">
            {s.checked[1] ? (
              <>
                <p className="rt-tally">
                  <b>{score.counted} of 2</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(2)}>
                  Make the call
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint([Boolean(s.q.fails), Boolean(s.q.accounts)], ["most failed sign-ins", "most accounts tried"])}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!s.q.fails || !s.q.accounts} onClick={() => check(1)}>
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
            <h3>What do you do first?</h3>
            <Narrator>One first move for each incident. Contain what is live before you tidy up.</Narrator>
          </header>
          <Deck
            tags={INCIDENTS.map((i) => i.tag)}
            titles={INCIDENTS.map((i) => i.title)}
            index={deck3.card}
            dir={deck3.dir}
            onGo={deck3.show}
            status={INCIDENTS.map((i): DotStatus => (s.checked[2] ? (s.response[i.id] === i.answer ? "right" : "wrong") : s.response[i.id] ? "answered" : "open"))}
          >
            {(() => {
              const inc = INCIDENTS[deck3.card];
              const checked = s.checked[2];
              const right = s.response[inc.id] === inc.answer;
              return (
                <div className={`rt-ticket${checked ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <div className="lk-q">
                    <b>
                      {inc.tag}. {inc.title}
                    </b>
                    <p className="lk-note">{PATTERNS.find((p) => p.key === inc.pattern)?.text}</p>
                    <b>{inc.prompt}</b>
                    <Options
                      label={inc.prompt}
                      options={inc.options}
                      value={s.response[inc.id]}
                      answer={checked ? inc.answer : undefined}
                      disabled={checked}
                      onPick={(v) => {
                        const response = { ...s.response, [inc.id]: v };
                        patch({ response });
                        deck3.next((n) => Boolean(response[INCIDENTS[n].id]));
                      }}
                    />
                  </div>
                  {checked && <Verdict right={right}>{inc.responseWhy}</Verdict>}
                </div>
              );
            })()}
          </Deck>
          <footer className="rt-foot">
            {s.checked[2] ? (
              <>
                <p className="rt-tally">
                  <b>{score.calls} of 4</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(3)}>
                  See the debrief
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint(INCIDENTS.map((i) => Boolean(s.response[i.id])), INCIDENTS.map((i) => `incident ${i.tag}`))}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={INCIDENTS.some((i) => !s.response[i.id])} onClick={() => check(2)}>
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
            <div className={`rt-grade rt-grade--${score.total >= 12 ? "high" : score.total >= 10 ? "medium" : "low"}`}>
              <b>{score.total}</b>
              <small>of 14</small>
            </div>
            <div>
              <h3>{score.total >= 12 ? "Ready for the morning queue" : score.total >= 10 ? "Solid start" : "Worth another pass"}</h3>
              <p>
                Named {score.named} of 8 · Counted {score.counted} of 2 · Called {score.calls} of 4
              </p>
            </div>
          </header>
          <div className="lk-scroll">
            <table className="lk-table">
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>What gives it away</th>
                  <th>First move</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Password spray</td>
                  <td>Many accounts, one or two failures each, one source</td>
                  <td>Look for a success from that source, and contain it</td>
                </tr>
                <tr>
                  <td>Stale saved password</td>
                  <td>One account, steady failures from one device after a password change</td>
                  <td>Update the device, then unlock</td>
                </tr>
                <tr>
                  <td>MFA fatigue</td>
                  <td>Correct password, repeated pushes, then an approval at an odd hour</td>
                  <td>Reset the password and revoke sessions</td>
                </tr>
                <tr>
                  <td>Service account misuse</td>
                  <td>Logon type 2 or 10 for an account that should only run as a service</td>
                  <td>Escalate and block interactive sign-in</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="lk-real">
            <b>On the job</b>
            <p>SOC analysts run these same counts in a SIEM, or with Python or PowerShell over exported logs. The events to know: 4624 success, 4625 failure, 4740 lockout, 4723 password change and 4672 admin rights.</p>
          </div>
          <footer className="rt-foot">
            <p className="rt-tally">Count accounts, not just failures.</p>
            <button type="button" className="rt-btn" onClick={() => setS(START)}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}

const TONE: Record<string, string> = { "4624": "ok", "4625": "bad", "4740": "warn", "4723": "info", "4672": "warn", MFA: "mfa" };

const MEANING: Record<string, string> = {
  "4624": "signed in",
  "4625": "failed sign-in",
  "4740": "account locked out",
  "4723": "password changed by the user",
  "4672": "signed in with admin rights",
  MFA: "MFA push prompt",
};

/** What each event number in these rows means. */
function EventKey({ rows }: { rows: Row[] }) {
  const events = [...new Set(rows.map((r) => r.event))];
  return (
    <ul className="lk-evkey" aria-label="What the event numbers mean">
      {events.map((e) => (
        <li key={e}>
          <i className={`lk-ev lk-ev--${TONE[e] ?? "info"}`}>{e}</i> {MEANING[e] ?? ""}
        </li>
      ))}
    </ul>
  );
}

/** Sign-in events, two lines each. With onPick, each row is a button. */
function LogTable({ rows, picked, answer, onPick, tall = false }: { rows: Row[]; picked?: number; answer?: number; onPick?: (n: number) => void; tall?: boolean }) {
  return (
    <ol className={`lk-log${tall ? " is-tall" : ""}`}>
      {rows.map((r, n) => {
        const cls = answer !== undefined ? (n === answer ? "is-answer" : n === picked ? "is-miss" : "") : n === picked ? "is-picked" : "";
        const cells = (
          <>
            <span className="lk-log__time">{r.time}</span>
            <i className={`lk-ev lk-ev--${TONE[r.event] ?? "info"}`}>{r.event}</i>
            <span className="lk-log__main">
              <b>{r.account}</b>
              <small>
                from {r.source} · {r.detail}
              </small>
            </span>
          </>
        );
        return (
          <li key={n}>
            {onPick ? (
              <button type="button" className={cls} aria-pressed={n === picked} onClick={() => onPick(n)}>
                {cells}
              </button>
            ) : (
              <div className={cls}>{cells}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
