"use client";

import { useMemo } from "react";
import { Folder, RotateCcw } from "lucide-react";
import { Avatar, useLabDone, useLabResult, useSaved } from "./lab-kit";
import { ChatShell, Chip, ChipRow, Mine, Says, SendAction } from "./lab-chat";
import { useOptionalCoach } from "../coach-context";
import { LOST_ASK } from "./lab-brief";
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
  const coach = useOptionalCoach();
  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const check = (i: 0 | 1 | 2) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));
  const go = (step: number) => patch({ step });

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

  const balancesNtfs = BALANCES_NTFS.filter((a) => !s.removedAces.includes(a.who));
  const taylorGroups = TAYLOR_GROUPS.filter((g) => !s.removedGroups.includes(g));

  const pips = [s.checked[0], s.checked[1], s.checked[2], s.checked[2]];
  const signal = `${s.step}:${Object.keys(s.guess).length}:${s.removedAces.length}:${s.removedGroups.length}:${Object.keys(s.answers).length}:${s.checked.join("")}`;

  // first unanswered in each choice step
  const cur0 = CASES.findIndex((c) => !s.guess[c.id]);
  const cur2 = CHECKS.findIndex((q) => !s.answers[q.id]);

  const thread = (
    <>
      {s.step === 0 && (
        <>
          <Says>Four people, four folders on the file server. For each one, read their groups and the folder&rsquo;s share and NTFS permissions, then tell me what they can do over the network.</Says>
          <div className="lc-tool"><ol className="ea-rules">{RULES.map(([rule, text]) => <li key={rule}><b>{rule}.</b> {text}</li>)}</ol></div>
          {CASES.slice(0, cur0 === -1 ? CASES.length : cur0 + 1).map((c) => {
            const g = s.guess[c.id];
            const right = g === answerOf(c);
            return (
              <div key={c.id}>
                <Says><b>Case {c.tag} — {c.name}.</b> Here is their access to <code>{c.path}</code>.</Says>
                <div className="lc-tool"><AccessView person={c.person} name={c.name} dept={c.dept} groups={c.groups} path={c.path} share={c.share} ntfs={c.ntfs} reveal={s.checked[0]} /></div>
                <Says>What can {c.name.split(" ")[0]} do with it?</Says>
                {g && <Mine>{ACCESS.find((a) => a.key === g)?.text}</Mine>}
                {s.checked[0] && g && (
                  <>
                    <div className="lc-tool"><Working c={c} /></div>
                    <Says tone={right ? "right" : "wrong"}><b>{c.rule}.</b> {c.why}</Says>
                  </>
                )}
              </div>
            );
          })}
          {cur0 === -1 && !s.checked[0] && <Says>That&rsquo;s all four. Check them?</Says>}
          {s.checked[0] && <Says>You got <b>{score.predicted} of 4</b>. Now let&rsquo;s fix the two folders that give away too much.</Says>}
        </>
      )}

      {s.step === 1 && (
        <>
          <Says>Two fixes. Click an entry or a group to remove it, and watch who can still get in.</Says>
          <Says><b>Fix 1.</b> Client-Balances should open only for Wealth Management. Remove the NTFS entry that lets everyone else read it.</Says>
          <div className="lc-tool">
            <AccessView path={CASES[3].path} share={BALANCES_SHARE} ntfs={BALANCES_NTFS} removed={s.removedAces} onToggleAce={s.checked[1] ? undefined : (who) => patch({ removedAces: s.removedAces.includes(who) ? s.removedAces.filter((x) => x !== who) : [...s.removedAces, who] })} />
            <WhoGetsIn rows={[
              { name: "Sam Whitfield", note: "Wealth Management", n: effective(BALANCES_SHARE, balancesNtfs, ["Wealth Management Users"]) },
              { name: "Devon Brooks", note: "Compliance", n: effective(BALANCES_SHARE, balancesNtfs, ["Compliance Users"]) },
              { name: "Any other account", note: "Domain Users", n: effective(BALANCES_SHARE, balancesNtfs, []) },
            ]} />
          </div>
          <Says><b>Fix 2.</b> Taylor moved from Operations to Finance. Remove the group Taylor should no longer have.</Says>
          <div className="lc-tool">
            <AccessView person="taylor.osei" name="Taylor Osei" dept="Finance, moved from Operations" groups={TAYLOR_GROUPS} removedGroups={s.removedGroups} onToggleGroup={s.checked[1] ? undefined : (gp) => patch({ removedGroups: s.removedGroups.includes(gp) ? s.removedGroups.filter((x) => x !== gp) : [...s.removedGroups, gp] })} />
            <WhoGetsIn rows={[{ name: "Taylor on \\\\FS01\\Payroll", note: taylorGroups.join(", ") || "no department group", n: effective(PAYROLL_SHARE, PAYROLL_NTFS, taylorGroups) }]} />
          </div>
          {s.checked[1] && (
            <>
              <Says tone={fix1Right ? "right" : "wrong"}>Remove Domain Users. Every account is in it, so a Read entry for Domain Users opens client data to the whole firm, and to anyone with one stolen password.</Says>
              <Says tone={fix2Right ? "right" : "wrong"}>Remove Operations Users. The old group kept Taylor&rsquo;s Operations access and its Deny blocked the Finance work Taylor now does.</Says>
              <Says>Give access through the group for the role, and take the old group away in the same change. You got <b>{score.fixed} of 2</b>.</Says>
            </>
          )}
        </>
      )}

      {s.step === 2 && (
        <>
          <Says>On the job you confirm access with the tools, not by eye. Four quick ones — pick the right command each time.</Says>
          {CHECKS.slice(0, cur2 === -1 ? CHECKS.length : cur2 + 1).map((q) => {
            const a = s.answers[q.id];
            const right = a === q.answer;
            return (
              <div key={q.id}>
                <Says><b>{q.title}.</b> {q.prompt}</Says>
                {a && <Mine><code>{q.options.find((o) => o.key === a)?.text}</code></Mine>}
                {s.checked[2] && a && <Says tone={right ? "right" : "wrong"}>{q.why}</Says>}
              </div>
            );
          })}
          {cur2 === -1 && !s.checked[2] && <Says>Ready to check?</Says>}
          {s.checked[2] && <Says>You got <b>{score.checks} of 4</b>.</Says>}
        </>
      )}

      {s.step === 3 && (
        <>
          <Says>Wrap-up. You scored <b>{score.total} of 10</b> — predicted {score.predicted} of 4, fixed {score.fixed} of 2, checked {score.checks} of 4. {score.total >= 9 ? "You can read a folder's access." : score.total >= 7 ? "Solid start." : "Worth another pass."}</Says>
          <div className="lc-tool lc-tool--flush">
            <table className="lk-table">
              <thead><tr><th>Rule</th><th>What it means</th></tr></thead>
              <tbody>
                <tr><td>Groups add up</td><td>A person gets every Allow from every group they are in.</td></tr>
                <tr><td>Deny beats Allow</td><td>One Deny from any group overrides the Allows.</td></tr>
                <tr><td>The stricter one wins</td><td>Over the network, access is the lower of the share and NTFS permissions.</td></tr>
                <tr><td>Domain Users is everyone</td><td>Every account is in it. An entry for Domain Users opens the folder to the whole firm.</td></tr>
              </tbody>
            </table>
          </div>
          <Says>When the role changes, the groups have to change with it. Nice work.</Says>
        </>
      )}
    </>
  );

  const composer = (
    <>
      {s.step === 0 && (cur0 !== -1 ? (
        <ChipRow list label={`What can ${CASES[cur0].name.split(" ")[0]} do with ${CASES[cur0].path}?`}>
          {ACCESS.map((a) => <Chip key={a.key} onClick={() => patch({ guess: { ...s.guess, [CASES[cur0].id]: a.key } })}>{a.text}</Chip>)}
        </ChipRow>
      ) : !s.checked[0] ? (
        <SendAction onClick={() => check(0)}>Check answers</SendAction>
      ) : (
        <SendAction onClick={() => go(1)}>Fix it →</SendAction>
      ))}

      {s.step === 1 && (!s.checked[1] ? (
        <div className="lc-actions">
          <span className="rt-tally">{s.removedAces.length && s.removedGroups.length ? "Both done." : "Remove an entry and a group above."}</span>
          <SendButton disabled={!s.removedAces.length || !s.removedGroups.length} onClick={() => check(1)}>Check answers</SendButton>
        </div>
      ) : (
        <SendAction onClick={() => go(2)}>Check it →</SendAction>
      ))}

      {s.step === 2 && (cur2 !== -1 ? (
        <ChipRow list label={CHECKS[cur2].title}>
          {CHECKS[cur2].options.map((o) => <Chip key={o.key} onClick={() => patch({ answers: { ...s.answers, [CHECKS[cur2].id]: o.key } })}>{o.text}</Chip>)}
        </ChipRow>
      ) : !s.checked[2] ? (
        <SendAction onClick={() => check(2)}>Check answers</SendAction>
      ) : (
        <SendAction onClick={() => go(3)}>See the debrief →</SendAction>
      ))}

      {s.step === 3 && <SendAction subtle onClick={() => setS(START)}><RotateCcw aria-hidden="true" /> Try again</SendAction>}
    </>
  );

  return (
    <ChatShell
      role="Your IT lead"
      steps={STEPS}
      step={s.step}
      done={pips}
      onAsk={coach?.enabled ? () => coach.ask(LOST_ASK) : undefined}
      signal={signal}
      thread={thread}
      composer={composer}
      label="Who Can Open This?, guided chat"
    />
  );
}

/** A primary action that can be disabled (the Options chips can't gate, so a
 *  couple of steps use this instead). */
function SendButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className="lc-send" disabled={disabled} style={disabled ? { opacity: 0.45, cursor: "not-allowed", boxShadow: "none" } : undefined} onClick={onClick}>{children}</button>;
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
