"use client";

import { useMemo } from "react";
import { Folder, RotateCcw } from "lucide-react";
import { Avatar, Deck, Guide, Narrator, nextHint, Options, Stepper, Takeaway, useDeck, useLabDone, useLabResult, useSaved, Verdict, type DotStatus } from "./lab-kit";
import "./effective-access-lab.css";

// Week 4 lab: who can open a folder on PurveX's file server. The student
// predicts each person's access from their groups and the folder's share
// and NTFS permissions, removes the entries that grant too much, and names
// the commands that show it. Every answer is computed with the Windows
// rules below, so the lab and its explanations cannot disagree.

type Perm = "full" | "modify" | "read";
type Ace = { who: string; perm: Perm; deny?: boolean };
const RANK: Record<Perm, number> = { read: 1, modify: 2, full: 3 };
const PERM_NAME: Record<Perm, string> = { read: "Read", modify: "Modify", full: "Full control" };

// Every account is in Domain Users, and Everyone covers every account.
const identities = (groups: string[]) => new Set([...groups, "Domain Users", "Everyone"]);

/** 0 none, 1 read, 2 or more can change. A Deny of full control removes all access. */
function level(aces: Ace[], ids: Set<string>) {
  const applies = aces.filter((a) => ids.has(a.who));
  if (applies.some((a) => a.deny && a.perm === "full")) return 0;
  return Math.max(0, ...applies.filter((a) => !a.deny).map((a) => RANK[a.perm]));
}
/** Over the network, the stricter of the share and NTFS permissions wins. */
const effective = (share: Ace[], ntfs: Ace[], groups: string[]) => Math.min(level(share, identities(groups)), level(ntfs, identities(groups)));

type Access = "change" | "read" | "none";
const ACCESS: { key: Access; text: string }[] = [
  { key: "change", text: "Can open and change files" },
  { key: "read", text: "Read only" },
  { key: "none", text: "No access" },
];
const toAccess = (n: number): Access => (n >= 2 ? "change" : n === 1 ? "read" : "none");

interface Case {
  id: string;
  tag: string;
  person: string;
  name: string;
  dept: string;
  groups: string[];
  path: string;
  share: Ace[];
  ntfs: Ace[];
  rule: string;
  why: string;
}

const PAYROLL_SHARE: Ace[] = [{ who: "Everyone", perm: "full" }];
const PAYROLL_NTFS: Ace[] = [
  { who: "Finance Accounting Users", perm: "modify" },
  { who: "Operations Users", perm: "full", deny: true },
];
const BALANCES_SHARE: Ace[] = [{ who: "Everyone", perm: "full" }];
const BALANCES_NTFS: Ace[] = [
  { who: "Wealth Management Users", perm: "modify" },
  { who: "Domain Users", perm: "read" },
];
const TAYLOR_GROUPS = ["Finance Accounting Users", "Operations Users"];

const CASES: Case[] = [
  {
    id: "priya",
    tag: "A",
    person: "priya.nair",
    name: "Priya Nair",
    dept: "IT",
    groups: ["IT Users"],
    path: "\\\\FS01\\IT-Tools",
    share: [{ who: "Everyone", perm: "full" }],
    ntfs: [{ who: "IT Users", perm: "modify" }],
    rule: "A group grants the access",
    why: "The share lets everyone in, so NTFS decides. Priya is in IT Users, which has Modify.",
  },
  {
    id: "jordan",
    tag: "B",
    person: "jordan.ellis",
    name: "Jordan Ellis",
    dept: "Finance",
    groups: ["Finance Accounting Users"],
    path: "\\\\FS01\\Finance",
    share: [{ who: "Everyone", perm: "read" }],
    ntfs: [{ who: "Finance Accounting Users", perm: "modify" }],
    rule: "The stricter of share and NTFS wins",
    why: "NTFS allows Modify, but the share only allows Read. Over the network the stricter of the two wins, so Jordan can only read.",
  },
  {
    id: "taylor",
    tag: "C",
    person: "taylor.osei",
    name: "Taylor Osei",
    dept: "Finance, moved from Operations",
    groups: TAYLOR_GROUPS,
    path: "\\\\FS01\\Payroll",
    share: PAYROLL_SHARE,
    ntfs: PAYROLL_NTFS,
    rule: "A Deny beats an Allow",
    why: "Finance Accounting Users allows Modify, but Taylor still sits in Operations Users, which is denied. A Deny overrides the Allow.",
  },
  {
    id: "devon",
    tag: "D",
    person: "devon.brooks",
    name: "Devon Brooks",
    dept: "Compliance",
    groups: ["Compliance Users"],
    path: "\\\\FS01\\Client-Balances",
    share: BALANCES_SHARE,
    ntfs: BALANCES_NTFS,
    rule: "Domain Users means every account",
    why: "Devon is not in Wealth Management, but every account is in Domain Users, and Domain Users can read. So can anyone with one stolen password.",
  },
];
const answerOf = (c: Case) => toAccess(effective(c.share, c.ntfs, c.groups));

/** The working for one list: which entry decides it for this person, and what it allows. */
function side(list: Ace[], groups: string[]) {
  const ids = identities(groups);
  const applies = list.filter((a) => ids.has(a.who));
  const deny = applies.find((a) => a.deny && a.perm === "full");
  if (deny) return { text: `${deny.who} is denied, which overrides any Allow`, n: 0 };
  const top = applies.filter((a) => !a.deny).sort((a, b) => RANK[b.perm] - RANK[a.perm])[0];
  return top ? { text: `${top.who} allows ${PERM_NAME[top.perm]}`, n: RANK[top.perm] } : { text: "No entry covers them", n: 0 };
}

const RULES = [
  ["Groups add up", "A person gets every Allow from every group they are in."],
  ["Deny beats Allow", "One Deny from any of their groups overrides the Allows."],
  ["The stricter one wins", "Over the network, access is the lower of the share and NTFS permissions."],
  ["Domain Users is everyone", "Every account is in Domain Users, so an entry for it covers the whole firm."],
];

// Fix 1: the entry that opens Client-Balances to the whole firm. Fix 2: Taylor's leftover group.
const FIX_ACE = "Domain Users";
const FIX_GROUP = "Operations Users";

const CHECKS: { id: string; tag: string; title: string; prompt: string; options: { key: string; text: string }[]; answer: string; why: string }[] = [
  {
    id: "groups",
    tag: "1",
    title: "Groups",
    prompt: "Which command lists every group taylor.osei is in?",
    options: [
      { key: "principal", text: "Get-ADPrincipalGroupMembership taylor.osei" },
      { key: "member", text: "Get-ADGroupMember taylor.osei" },
      { key: "priv", text: "whoami /priv" },
    ],
    answer: "principal",
    why: "Get-ADPrincipalGroupMembership lists the groups an account is in. Get-ADGroupMember works the other way, listing the members of a group.",
  },
  {
    id: "ntfs",
    tag: "2",
    title: "NTFS",
    prompt: "Which command shows the NTFS permissions on D:\\Shares\\Payroll?",
    options: [
      { key: "icacls", text: 'icacls "D:\\Shares\\Payroll"' },
      { key: "smb", text: "Get-SmbShareAccess -Name Payroll" },
      { key: "net", text: "net user taylor.osei" },
    ],
    answer: "icacls",
    why: "icacls prints the folder's NTFS entries, including any Deny. Get-SmbShareAccess shows the share permissions, the other half.",
  },
  {
    id: "share",
    tag: "3",
    title: "Share",
    prompt: "Which command shows who the Payroll share lets in over the network?",
    options: [
      { key: "smb", text: "Get-SmbShareAccess -Name Payroll" },
      { key: "icacls", text: 'icacls "D:\\Shares\\Payroll"' },
      { key: "aduser", text: "Get-ADUser taylor.osei" },
    ],
    answer: "smb",
    why: "Get-SmbShareAccess lists the share permissions. You need both it and icacls, because the stricter of the two wins.",
  },
  {
    id: "effective",
    tag: "4",
    title: "Effective access",
    prompt: "Where do you see what one user can really do on a folder, after every group is counted?",
    options: [
      { key: "tab", text: "The folder's Properties, then Security, Advanced, Effective Access" },
      { key: "memberof", text: "The Member Of tab on the user's account" },
      { key: "events", text: "Event Viewer on the file server" },
    ],
    answer: "tab",
    why: "Effective Access works out the result of every group, Allow and Deny for the user you name. Member Of shows the groups, not what they add up to.",
  },
];

const STEPS = ["Predict access", "Fix it", "Check it", "Debrief"];

interface State {
  step: number;
  guess: Record<string, Access>;
  removedAces: string[];
  removedGroups: string[];
  answers: Record<string, string>;
  checked: [boolean, boolean, boolean];
}
const START: State = { step: 0, guess: {}, removedAces: [], removedGroups: [], answers: {}, checked: [false, false, false] };
const STORE = "academy-lab-effective-access-v1";

export function EffectiveAccessLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.checked) && v.checked.length === 3 && Array.isArray(v.removedAces));
  const deck1 = useDeck(CASES.length);
  const deck3 = useDeck(CHECKS.length);
  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const check = (i: 0 | 1 | 2) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));
  const go = (step: number) => {
    patch({ step });
    deck1.reset();
    deck3.reset();
    document.querySelector(".rt")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const fix1Right = s.removedAces.length === 1 && s.removedAces[0] === FIX_ACE;
  const fix2Right = s.removedGroups.length === 1 && s.removedGroups[0] === FIX_GROUP;
  const score = useMemo(() => {
    const predicted = CASES.filter((c) => s.guess[c.id] === answerOf(c)).length;
    const fixed = (fix1Right ? 1 : 0) + (fix2Right ? 1 : 0);
    const checks = CHECKS.filter((q) => s.answers[q.id] === q.answer).length;
    return { predicted, fixed, checks, total: predicted + fixed + checks };
  }, [s, fix1Right, fix2Right]);
  const done = s.checked.every(Boolean);
  useLabDone(done, onDone);
  useLabResult("lab-effective-access", done, score.total, 10);
  const reached = [true, s.checked[0], s.checked[1], s.checked[2]];

  const balancesNtfs = BALANCES_NTFS.filter((a) => !s.removedAces.includes(a.who));
  const taylorGroups = TAYLOR_GROUPS.filter((g) => !s.removedGroups.includes(g));

  return (
    <section className="rt" aria-label="Who Can Open This? lab">
      <Stepper steps={STEPS} step={s.step} done={[...s.checked, false]} reached={reached} onGo={go} />

      {s.step === 0 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>Who can open this?</h3>
            <Narrator>Read the person&apos;s groups and the folder&apos;s permissions, then say what they can do with it over the network.</Narrator>
          </header>
          <details className="lk-more" open>
            <summary>How access adds up</summary>
            <ol className="ea-rules">
              {RULES.map(([rule, text]) => (
                <li key={rule}>
                  <b>{rule}.</b> {text}
                </li>
              ))}
            </ol>
          </details>
          <Deck
            tags={CASES.map((c) => c.tag)}
            titles={CASES.map((c) => `${c.name}, ${c.path}`)}
            index={deck1.card}
            dir={deck1.dir}
            onGo={deck1.show}
            status={CASES.map((c): DotStatus => (s.checked[0] ? (s.guess[c.id] === answerOf(c) ? "right" : "wrong") : s.guess[c.id] ? "answered" : "open"))}
          >
            {(() => {
              const c = CASES[deck1.card];
              const checked = s.checked[0];
              const right = s.guess[c.id] === answerOf(c);
              return (
                <div className={`rt-ticket${checked ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <AccessView person={c.person} name={c.name} dept={c.dept} groups={c.groups} path={c.path} share={c.share} ntfs={c.ntfs} reveal={checked} />
                  <div className="lk-q">
                    <b>
                      What can {c.name.split(" ")[0]} do with {c.path}?
                    </b>
                    <Options
                      label={`Access for ${c.name}`}
                      options={ACCESS}
                      value={s.guess[c.id]}
                      answer={checked ? answerOf(c) : undefined}
                      disabled={checked}
                      onPick={(v) => {
                        const guess = { ...s.guess, [c.id]: v as Access };
                        patch({ guess });
                        deck1.next((n) => Boolean(guess[CASES[n].id]));
                      }}
                    />
                  </div>
                  {checked && (
                    <>
                      <Working c={c} />
                      <Verdict right={right}>
                        <b>{c.rule}.</b> {c.why}
                      </Verdict>
                    </>
                  )}
                </div>
              );
            })()}
          </Deck>
          <footer className="rt-foot">
            {s.checked[0] ? (
              <>
                <p className="rt-tally">
                  <b>{score.predicted} of 4</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(1)}>
                  Fix it
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint(CASES.map((c) => Boolean(s.guess[c.id])), CASES.map((c) => c.name))}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={CASES.some((c) => !s.guess[c.id])} onClick={() => check(0)}>
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
            <h3>Take away what should not be there</h3>
            <Narrator>Two fixes. Click an entry or a group to remove it, and watch who can still get in.</Narrator>
          </header>
          <div className="rt-ticket">
            <Guide
              showAll
              steps={[
                {
                  title: "Client-Balances should open only for Wealth Management. Remove the NTFS entry that lets everyone else read it.",
                  done: s.removedAces.length > 0,
                  body: (
                    <>
                      <AccessView
                        path={CASES[3].path}
                        share={BALANCES_SHARE}
                        ntfs={BALANCES_NTFS}
                        removed={s.removedAces}
                        onToggleAce={s.checked[1] ? undefined : (who) => patch({ removedAces: s.removedAces.includes(who) ? s.removedAces.filter((x) => x !== who) : [...s.removedAces, who] })}
                      />
                      <WhoGetsIn
                        rows={[
                          { name: "Sam Whitfield", note: "Wealth Management", n: effective(BALANCES_SHARE, balancesNtfs, ["Wealth Management Users"]) },
                          { name: "Devon Brooks", note: "Compliance", n: effective(BALANCES_SHARE, balancesNtfs, ["Compliance Users"]) },
                          { name: "Any other account", note: "Domain Users", n: effective(BALANCES_SHARE, balancesNtfs, []) },
                        ]}
                      />
                    </>
                  ),
                },
                {
                  title: "Taylor moved from Operations to Finance. Remove the group Taylor should no longer have.",
                  done: s.removedGroups.length > 0,
                  body: (
                    <>
                      <AccessView
                        person="taylor.osei"
                        name="Taylor Osei"
                        dept="Finance, moved from Operations"
                        groups={TAYLOR_GROUPS}
                        removedGroups={s.removedGroups}
                        onToggleGroup={s.checked[1] ? undefined : (g) => patch({ removedGroups: s.removedGroups.includes(g) ? s.removedGroups.filter((x) => x !== g) : [...s.removedGroups, g] })}
                      />
                      <WhoGetsIn rows={[{ name: "Taylor on \\\\FS01\\Payroll", note: taylorGroups.join(", ") || "no department group", n: effective(PAYROLL_SHARE, PAYROLL_NTFS, taylorGroups) }]} />
                    </>
                  ),
                },
              ]}
            />
            {s.checked[1] && (
              <div className="rt-why">
                <Verdict right={fix1Right}>Remove Domain Users. Every account is in it, so a Read entry for Domain Users opens client data to the whole firm, and to anyone with one stolen password.</Verdict>
                <Verdict right={fix2Right}>
                  Remove Operations Users. The old group kept Taylor&apos;s Operations access and its Deny blocked the Finance work Taylor now does. When the role changes, the groups have to change with it.
                </Verdict>
                <Takeaway>Give access through the group for the role, and take the old group away in the same change.</Takeaway>
              </div>
            )}
          </div>
          <footer className="rt-foot">
            {s.checked[1] ? (
              <>
                <p className="rt-tally">
                  <b>{score.fixed} of 2</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(2)}>
                  Check it
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint([s.removedAces.length > 0, s.removedGroups.length > 0], ["fix the Client-Balances folder", "fix Taylor's groups"])}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!s.removedAces.length || !s.removedGroups.length} onClick={() => check(1)}>
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
            <h3>How would you check it on the server?</h3>
            <Narrator>On the job you confirm access with the tools, not by eye. Pick the right one each time.</Narrator>
          </header>
          <Deck
            tags={CHECKS.map((q) => q.tag)}
            titles={CHECKS.map((q) => q.title)}
            index={deck3.card}
            dir={deck3.dir}
            onGo={deck3.show}
            status={CHECKS.map((q): DotStatus => (s.checked[2] ? (s.answers[q.id] === q.answer ? "right" : "wrong") : s.answers[q.id] ? "answered" : "open"))}
          >
            {(() => {
              const q = CHECKS[deck3.card];
              const checked = s.checked[2];
              const right = s.answers[q.id] === q.answer;
              return (
                <div className={`rt-ticket${checked ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <div className="lk-q">
                    <b>{q.prompt}</b>
                    <Options
                      label={q.title}
                      options={q.options}
                      value={s.answers[q.id]}
                      answer={checked ? q.answer : undefined}
                      disabled={checked}
                      onPick={(v) => {
                        const answers = { ...s.answers, [q.id]: v };
                        patch({ answers });
                        deck3.next((n) => Boolean(answers[CHECKS[n].id]));
                      }}
                    />
                  </div>
                  {checked && <Verdict right={right}>{q.why}</Verdict>}
                </div>
              );
            })()}
          </Deck>
          <footer className="rt-foot">
            {s.checked[2] ? (
              <>
                <p className="rt-tally">
                  <b>{score.checks} of 4</b> right
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(3)}>
                  See the debrief
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{nextHint(CHECKS.map((q) => Boolean(s.answers[q.id])), CHECKS.map((q) => `question ${q.tag}`))}</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={CHECKS.some((q) => !s.answers[q.id])} onClick={() => check(2)}>
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
            <div className={`rt-grade rt-grade--${score.total >= 9 ? "high" : score.total >= 7 ? "medium" : "low"}`}>
              <b>{score.total}</b>
              <small>of 10</small>
            </div>
            <div>
              <h3>{score.total >= 9 ? "You can read a folder's access" : score.total >= 7 ? "Solid start" : "Worth another pass"}</h3>
              <p>
                Predicted {score.predicted} of 4 · Fixed {score.fixed} of 2 · Checked {score.checks} of 4
              </p>
            </div>
          </header>
          <div className="lk-scroll">
            <table className="lk-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>What it means</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Groups add up</td>
                  <td>A person gets every Allow from every group they are in.</td>
                </tr>
                <tr>
                  <td>Deny beats Allow</td>
                  <td>One Deny from any group overrides the Allows.</td>
                </tr>
                <tr>
                  <td>The stricter one wins</td>
                  <td>Over the network, access is the lower of the share and NTFS permissions.</td>
                </tr>
                <tr>
                  <td>Domain Users is everyone</td>
                  <td>Every account is in it. An entry for Domain Users opens the folder to the whole firm.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer className="rt-foot">
            <p className="rt-tally">When the role changes, the groups have to change with it.</p>
            <button type="button" className="rt-btn" onClick={() => setS(START)}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}

/** A person and their groups next to a folder and its permissions. Pieces can be left out. */
function AccessView({
  person,
  name,
  dept,
  groups,
  path,
  share,
  ntfs,
  reveal = false,
  removed = [],
  removedGroups = [],
  onToggleAce,
  onToggleGroup,
}: {
  person?: string;
  name?: string;
  dept?: string;
  groups?: string[];
  path?: string;
  share?: Ace[];
  ntfs?: Ace[];
  reveal?: boolean;
  removed?: string[];
  removedGroups?: string[];
  onToggleAce?: (who: string) => void;
  onToggleGroup?: (group: string) => void;
}) {
  const ids = groups ? identities(groups) : null;
  const deciding = (list: Ace[]) => {
    if (!ids) return new Set<Ace>();
    const applies = list.filter((a) => ids.has(a.who));
    const deny = applies.filter((a) => a.deny);
    if (deny.length) return new Set(deny);
    const top = Math.max(0, ...applies.map((a) => RANK[a.perm]));
    return new Set(applies.filter((a) => RANK[a.perm] === top));
  };
  const aceList = (label: string, list: Ace[], clickable: boolean) => {
    const decide = deciding(list);
    return (
      <div className="ea-acl">
        <small>{label}</small>
        <ul>
          {list.map((a) => {
            const gone = removed.includes(a.who) && clickable;
            const cls = ["ea-ace", a.deny ? "is-deny" : "", gone ? "is-gone" : "", reveal && ids ? (decide.has(a) ? "is-key" : ids.has(a.who) ? "" : "is-dim") : ""].filter(Boolean).join(" ");
            const inner = (
              <>
                <span>{a.who}</span>
                <span>{PERM_NAME[a.perm]}</span>
                <em>{a.deny ? "Deny" : "Allow"}</em>
              </>
            );
            return (
              <li key={a.who}>
                {clickable && onToggleAce ? (
                  <button type="button" className={cls} aria-pressed={gone} onClick={() => onToggleAce(a.who)}>
                    {inner}
                  </button>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  return (
    <div className="ea">
      {person && groups && (
        <div className="ea-panel">
          <div className="ea-who">
            <Avatar name={name ?? person} size={34} />
            <div>
              <b>{name}</b>
              <small>
                {person} · {dept}
              </small>
            </div>
          </div>
          <small className="ea-label">Groups</small>
          <ul className="ea-chips">
            {groups.map((g) => {
              const gone = removedGroups.includes(g);
              return (
                <li key={g}>
                  {onToggleGroup ? (
                    <button type="button" className={`ea-chip${gone ? " is-gone" : ""}`} aria-pressed={gone} onClick={() => onToggleGroup(g)}>
                      {g}
                    </button>
                  ) : (
                    <span className="ea-chip">{g}</span>
                  )}
                </li>
              );
            })}
            <li>
              <span className="ea-chip is-auto" title="Every account is in Domain Users">
                Domain Users
              </span>
            </li>
          </ul>
        </div>
      )}
      {path && share && ntfs && (
        <div className="ea-panel">
          <div className="ea-path">
            <Folder aria-hidden="true" />
            <code>{path}</code>
          </div>
          {aceList("Share permissions", share, false)}
          {aceList("NTFS permissions", ntfs, true)}
        </div>
      )}
    </div>
  );
}

/** The answer worked out: the share, then NTFS, then the stricter of the two. */
function Working({ c }: { c: Case }) {
  const share = side(c.share, c.groups);
  const ntfs = side(c.ntfs, c.groups);
  const result = ACCESS.find((a) => a.key === toAccess(Math.min(share.n, ntfs.n)))?.text;
  return (
    <ol className="ea-work" aria-label="How the answer is worked out">
      <li>
        <span>1. Share</span>
        {share.text}
      </li>
      <li>
        <span>2. NTFS</span>
        {ntfs.text}
      </li>
      <li>
        <span>3. Result</span>
        <span className="ea-work__val">
          The stricter of the two: <b>{result}</b>
        </span>
      </li>
    </ol>
  );
}

/** Live result of the fix: who can still get in. */
function WhoGetsIn({ rows }: { rows: { name: string; note: string; n: number }[] }) {
  return (
    <ul className="ea-result">
      {rows.map((r) => {
        const a = toAccess(r.n);
        return (
          <li key={r.name}>
            <span>
              <b>{r.name}</b>
              <small>{r.note}</small>
            </span>
            <em className={`is-${a}`}>{ACCESS.find((x) => x.key === a)?.text}</em>
          </li>
        );
      })}
    </ul>
  );
}
