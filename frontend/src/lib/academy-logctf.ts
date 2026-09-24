import "server-only";
import { pickFinding } from "@/lib/academy-audit";
import { seeded, type Item } from "@/lib/academy-drills";
import type { LabSnapshot } from "@/lib/academy-lab";

// The weekly CTF, asked about what really happened in the student's own lab.
// The evidence is the Security log on their domain controller. This module only
// reads a digest of it (counts and names) to know the right answer. It plants
// nothing and invents nothing: no question is asked unless the log has a single
// clear answer.

type Question = {
  key: string;
  title: string;
  story: string;
  prompt: string;
  answer: string;
  accept: string[];
  format: string;
  where: string[];
  hint: string;
  explain: string;
  /** A real finding that made the answer possible, to fix for the second half. */
  gateOn?: "lockout-policy";
};

const time = (iso: string) => new Date(iso).toISOString().slice(0, 16).replace("T", " ") + " UTC";
const powershell = (ids: string, days: number, note: string) =>
  `PowerShell: Get-WinEvent -FilterHashtable @{LogName='Security'; Id=${ids}; StartTime=(Get-Date).AddDays(-${days})} | ${note}`;

function questions(s: LabSnapshot): Question[] {
  const ev = s.events;
  if (!ev) return [];
  const days = ev.windowDays;
  const bySam = new Map(s.users.map((u) => [u.sam.toLowerCase(), u]));
  const byName = new Map(s.users.map((u) => [u.name.toLowerCase(), u]));
  const nameFor = (sam: string) => [bySam.get(sam.toLowerCase())?.name ?? ""].filter(Boolean);
  const out: Question[] = [];

  const top = <T extends { count: number }>(list: T[]) => {
    const sorted = [...list].sort((a, b) => b.count - a.count);
    return sorted.length && (sorted.length === 1 || sorted[0].count > sorted[1].count) ? sorted[0] : null;
  };

  const fail = top(ev.failures);
  if (fail && fail.count >= 3) {
    out.push({
      key: "top-failures",
      title: "Who keeps failing",
      story: `In the last ${days} days your domain controller logged failed sign-ins. Most are typing mistakes. One account stands out from the rest.`,
      prompt: `Which account had the most failed sign-ins in the last ${days} days?`,
      answer: fail.account,
      accept: nameFor(fail.account),
      format: "Sign-in name, like first.last",
      where: [
        "Event Viewer, Windows Logs, Security, then Filter Current Log.",
        "Failures are event 4625 (NTLM) and 4771 (Kerberos). Set the time range to the last 30 days.",
        powershell("4625,4771", days, "Group-Object { ([xml]$_.ToXml()).Event.EventData.Data | Where-Object Name -eq 'TargetUserName' | ForEach-Object '#text' } | Sort-Object Count -Descending"),
      ],
      hint: "Filter for the failure events, then count them per account name. Ignore computer accounts that end in a dollar sign.",
      explain: `${fail.account} had ${fail.count} failed sign-ins in the last ${days} days.`,
      gateOn: "lockout-policy",
    });
  }
  const lock = top(ev.lockouts);
  if (lock && lock.count >= 1) {
    out.push({
      key: "top-lockouts",
      title: "Locked out the most",
      story: `Your domain controller recorded account lockouts in the last ${days} days. One account was locked more than the others.`,
      prompt: "Which account was locked out the most?",
      answer: lock.account,
      accept: nameFor(lock.account),
      format: "Sign-in name, like first.last",
      where: ["Event Viewer, Windows Logs, Security, then Filter Current Log for event 4740 (an account was locked out).", powershell("4740", days, "Select-Object TimeCreated,Message")],
      hint: "Event 4740 names the locked account. Count them.",
      explain: `${lock.account} was locked out ${lock.count} time${lock.count === 1 ? "" : "s"}.`,
    });
  }
  const made = [...ev.created].filter((c) => bySam.has(c.account.toLowerCase())).sort((a, b) => b.at.localeCompare(a.at));
  if (made.length >= 2 && new Date(made[0].at).getTime() - new Date(made[1].at).getTime() >= 1500) {
    out.push({
      key: "newest-account",
      title: "The newest account",
      story: "Accounts have been created in your lab. The log records each one, who created it, and when.",
      prompt: "Which account was created most recently?",
      answer: made[0].account,
      accept: nameFor(made[0].account),
      format: "Sign-in name, like first.last",
      where: ["Event Viewer, Windows Logs, Security, then Filter Current Log for event 4720 (a user account was created).", powershell("4720", days, "Select-Object TimeCreated,Message")],
      hint: "Event 4720 is written when an account is created. Look at the newest one.",
      explain: `${made[0].account} was created at ${time(made[0].at)} by ${made[0].by || "an administrator"}, after ${made[1].account} at ${time(made[1].at)}.`,
    });
  }
  const off = [...ev.disabled].sort((a, b) => b.at.localeCompare(a.at));
  if (off.length >= 1 && (off.length === 1 || new Date(off[0].at).getTime() - new Date(off[1].at).getTime() >= 1500)) {
    out.push({
      key: "last-disabled",
      title: "The last account switched off",
      story: "Someone disabled an account in your lab. The log shows which one, when, and by whom.",
      prompt: "Which account was disabled most recently?",
      answer: off[0].account,
      accept: nameFor(off[0].account),
      format: "Sign-in name, like first.last",
      where: ["Event Viewer, Windows Logs, Security, then Filter Current Log for event 4725 (a user account was disabled).", powershell("4725", days, "Select-Object TimeCreated,Message")],
      hint: "Event 4725 is written when an account is disabled.",
      explain: `${off[0].account} was disabled at ${time(off[0].at)} by ${off[0].by || "an administrator"}.`,
    });
  }
  const perGroup = new Map<string, number>();
  for (const a of ev.groupAdds) perGroup.set(a.group, (perGroup.get(a.group) ?? 0) + 1);
  const groupTop = top([...perGroup].map(([account, count]) => ({ account, count })));
  if (groupTop && groupTop.count >= 2) {
    out.push({
      key: "top-group",
      title: "The busiest group",
      story: `People have been added to groups in your lab over the last ${days} days. The log records each addition.`,
      prompt: "Which group had the most new members added?",
      answer: groupTop.account,
      accept: [],
      format: "Group name, exactly as it appears",
      where: ["Event Viewer, Windows Logs, Security, then Filter Current Log for events 4728, 4732 and 4756 (a member was added to a group).", powershell("4728,4732,4756", days, "Select-Object TimeCreated,Message")],
      hint: "Each addition names the group. Count additions per group.",
      explain: `${groupTop.account} received ${groupTop.count} new members in the last ${days} days.`,
    });
  }
  const last = [...ev.groupAdds].sort((a, b) => b.at.localeCompare(a.at));
  if (last.length >= 2 && new Date(last[0].at).getTime() - new Date(last[1].at).getTime() >= 1500) {
    const who = byName.get(last[0].member.toLowerCase()) ?? bySam.get(last[0].member.toLowerCase());
    if (who) {
      out.push({
        key: "last-added",
        title: "The latest addition",
        story: "Someone was added to a group in your lab most recently. The log says who.",
        prompt: "Which account was most recently added to a group?",
        answer: who.sam,
        accept: [who.name],
        format: "Sign-in name, like first.last",
        where: ["Event Viewer, Windows Logs, Security, then Filter Current Log for events 4728, 4732 and 4756.", powershell("4728,4732,4756", days, "Select-Object TimeCreated,Message")],
        hint: "Look at the newest addition and read the member it names.",
        explain: `${who.sam} was added to ${last[0].group} at ${time(last[0].at)} by ${last[0].by || "an administrator"}.`,
      });
    }
  }
  return out;
}

export function buildLogCtf(params: { snapshot: LabSnapshot; seed: string; level: number }): Item | null {
  const options = questions(params.snapshot);
  if (!options.length) return null;
  // Harder levels lean toward questions that need counting, not just reading the top of the log.
  const hard = new Set(["top-failures", "top-lockouts", "top-group"]);
  const pool = params.level >= 3 ? options.filter((q) => hard.has(q.key)) : options.filter((q) => !hard.has(q.key));
  const from = pool.length ? pool : options;
  const q = from[Math.floor(seeded(`logctf:${params.seed}`)() * from.length)];

  // The second half is a real fix in their lab, tied to what the log showed.
  const finding = q.gateOn ? pickFinding({ snapshot: params.snapshot, seed: params.seed, level: params.level, avoid: [], only: q.gateOn }) : null;
  return {
    skill: "security",
    title: q.title,
    story: q.story,
    prompt: q.prompt,
    evidence: ["Your evidence is the real Security log on your own domain controller.", ...q.where],
    choices: [],
    answer: q.answer,
    accept: q.accept,
    explain: finding ? `${q.explain} That was only possible because the domain has no working lockout limit. ${finding.facts}` : q.explain,
    hint: q.hint,
    format: q.format,
    free: true,
    ...(finding?.task ? { gate: true, task: finding.task } : {}),
    job: "trace-logon",
    theme: `CTF: ${q.key}`,
  };
}
