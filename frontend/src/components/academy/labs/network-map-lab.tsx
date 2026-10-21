"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { useLabDone, useLabResult, useSaved } from "./lab-kit";
import { ChatShell, Chip, ChipRow, Mine, Says, SendAction } from "./lab-chat";
import { useOptionalCoach } from "../coach-context";
import { LOST_ASK } from "./lab-brief";

// Week 4 lab: the student's own pod, read live from the same status endpoint
// the lab button uses, then two graded rounds over the real isolation model
// described in academy-hosted.ts -- which port a task actually uses, and
// whether a given connection attempt is inside the pod's boundary or outside
// it. Nothing here is a generic diagram; the machine list at the top is
// whatever this student's pod actually reports right now.

type PodStatus = { available?: boolean; state?: string; instanceType?: string; linux?: boolean };

type PortScenario = { id: string; desc: string; answer: string; why: string };
const PORTS: PortScenario[] = [
  { id: "rdp", desc: "You open a remote desktop session to work on the domain controller directly.", answer: "3389 · RDP", why: "Remote Desktop Protocol, how you actually reach the DC's own screen." },
  { id: "kerberos", desc: "A sign-in anywhere in the directory needs its ticket checked against the domain controller.", answer: "88 · Kerberos", why: "Kerberos is the protocol that issues and verifies every sign-in ticket in the domain." },
  { id: "ldap", desc: "Something looks up a user object's details straight from the directory.", answer: "389 · LDAP", why: "LDAP is how the directory itself gets queried." },
  { id: "dns", desc: "A machine needs to find the domain controller's address before anything else can happen.", answer: "53 · DNS", why: "DNS is how every machine finds the domain controller in the first place." },
  { id: "ssh", desc: "You open a terminal session on the Ubuntu server.", answer: "22 · SSH", why: "SSH, the Linux box's remote terminal protocol." },
];
const PORT_OPTIONS = ["3389 · RDP", "88 · Kerberos", "389 · LDAP", "53 · DNS", "22 · SSH"];

type BoundaryScenario = { id: string; desc: string; answer: "allowed" | "blocked"; why: string };
const BOUNDARY: BoundaryScenario[] = [
  { id: "dc-to-linux", desc: "The domain controller reaches out to your Ubuntu server, on any port.", answer: "allowed", why: "The two machines in your own pod can reach each other on every port. That is the whole point of them being one pod." },
  { id: "linux-to-dc", desc: "The Ubuntu server reaches back to the domain controller.", answer: "allowed", why: "Same pod, same rule, either direction." },
  { id: "internet-to-dc", desc: "A connection attempt arrives from the open internet, aimed at the domain controller's RDP port.", answer: "blocked", why: "Nothing on the internet can open a connection into either machine. That is enforced by the security group, not a setting on the machine itself." },
  { id: "other-pod", desc: "Another student's domain controller tries to reach your Ubuntu server.", answer: "blocked", why: "No student's pod can see another's. Each pod gets its own security group." },
  { id: "guacamole", desc: "Guacamole, the gateway your browser opens the lab through, connects in to show you the desktop.", answer: "allowed", why: "Guacamole is the one sanctioned path in, which is why you reach your lab through a signed link instead of a raw address." },
];

const STEPS = ["Meet your pod", "Name the ports", "Trace the boundary", "Debrief"];

interface State {
  step: number;
  ports: Record<string, string>;
  boundary: Record<string, "allowed" | "blocked">;
  checked: [boolean, boolean];
}
const START: State = { step: 0, ports: {}, boundary: {}, checked: [false, false] };
const STORE = "academy-lab-network-map-v1";

export function NetworkMapLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.checked) && v.checked.length === 2 && typeof v.ports === "object");
  const coach = useOptionalCoach();
  const [pod, setPod] = useState<PodStatus | null>(null);
  const [podLoaded, setPodLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    academyFetch("/academy/api/hosted-lab")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PodStatus | null) => {
        if (live) setPod(data);
      })
      .catch(() => {})
      .finally(() => live && setPodLoaded(true));
    return () => {
      live = false;
    };
  }, []);

  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const check = (i: 0 | 1) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));
  const go = (step: number) => patch({ step });

  const score = useMemo(() => {
    const ports = PORTS.filter((p) => s.ports[p.id] === p.answer).length;
    const boundary = BOUNDARY.filter((b) => s.boundary[b.id] === b.answer).length;
    return { ports, boundary, total: ports + boundary };
  }, [s]);
  const done = s.checked.every(Boolean);
  useLabDone(done, onDone);
  useLabResult("lab-network-map", done, score.total, PORTS.length + BOUNDARY.length);

  const pips = [s.checked[0] || s.step > 0, s.checked[0], s.checked[1], s.checked[1]];
  const signal = `${s.step}:${Object.keys(s.ports).length}:${Object.keys(s.boundary).length}:${s.checked.join("")}:${podLoaded}`;

  const curPort = PORTS.findIndex((p) => !s.ports[p.id]);
  const curBoundary = BOUNDARY.findIndex((b) => !s.boundary[b.id]);

  const podLine = !podLoaded
    ? "Checking your pod…"
    : pod?.available === false
      ? "Your pod reports Explore tier -- the facts below hold either way, since every Pro pod is built the same."
      : pod?.state === "ready"
        ? `Your pod is online right now: a ${pod.instanceType ?? "Windows"} domain controller${pod.linux ? ", and an Ubuntu server beside it" : ""}.`
        : "Your pod is offline right now, but the two machines and the rule below are the same whether it's running or not.";

  const thread = (
    <>
      {s.step === 0 && (
        <>
          <Says>Before we talk about traffic, let&rsquo;s look at what you actually have. {podLine}</Says>
          <Says>Two machines, one rule: they can reach each other on every port, and nothing outside the pod can reach either one. That rule is enforced by your pod&rsquo;s own security group, not a setting either machine could be tricked into changing.</Says>
          <Says>Ready to name what&rsquo;s actually running on each of those ports?</Says>
        </>
      )}

      {s.step === 1 && (
        <>
          <Says>Five things you&rsquo;d actually do in this pod. Name the port each one uses.</Says>
          {PORTS.slice(0, curPort === -1 ? PORTS.length : curPort + 1).map((p) => {
            const a = s.ports[p.id];
            return (
              <div key={p.id}>
                <Says>{p.desc}</Says>
                {a && <Mine>{a}</Mine>}
                {s.checked[0] && <Says tone={a === p.answer ? "right" : "wrong"}>{p.why}</Says>}
              </div>
            );
          })}
          {curPort === -1 && !s.checked[0] && <Says>That&rsquo;s all five. Check them?</Says>}
          {s.checked[0] && <Says>You got <b>{score.ports} of {PORTS.length}</b>. Now the boundary itself: what can actually reach what?</Says>}
        </>
      )}

      {s.step === 2 && (
        <>
          <Says>Five connection attempts. Allowed, or blocked by your pod&rsquo;s own isolation?</Says>
          {BOUNDARY.slice(0, curBoundary === -1 ? BOUNDARY.length : curBoundary + 1).map((b) => {
            const a = s.boundary[b.id];
            return (
              <div key={b.id}>
                <Says>{b.desc}</Says>
                {a && <Mine>{a === "allowed" ? "Allowed" : "Blocked"}</Mine>}
                {s.checked[1] && <Says tone={a === b.answer ? "right" : "wrong"}>{b.why}</Says>}
              </div>
            );
          })}
          {curBoundary === -1 && !s.checked[1] && <Says>All five answered. Check them?</Says>}
          {s.checked[1] && <Says>You got <b>{score.boundary} of {BOUNDARY.length}</b>.</Says>}
        </>
      )}

      {s.step === 3 && (
        <>
          <Says>
            Wrap-up. You scored <b>{score.total} of {PORTS.length + BOUNDARY.length}</b> — named {score.ports} of {PORTS.length} ports, traced {score.boundary} of {BOUNDARY.length} boundary cases.{" "}
            {score.total >= 7 ? "You know your own pod cold." : score.total >= 5 ? "Solid start." : "Worth another pass."}
          </Says>
          <Says>
            The rule that mattered in every boundary case was the same one: your two machines trust each other completely, and the pod trusts nothing else at all. That is the shape every network you will ever defend actually has, just drawn at a bigger scale.
          </Says>
        </>
      )}
    </>
  );

  const composer = (
    <>
      {s.step === 0 && <SendAction onClick={() => go(1)}>Name the ports →</SendAction>}

      {s.step === 1 && (curPort !== -1 ? (
        <ChipRow list label={PORTS[curPort].desc}>
          {PORT_OPTIONS.map((o) => <Chip key={o} onClick={() => patch({ ports: { ...s.ports, [PORTS[curPort].id]: o } })}>{o}</Chip>)}
        </ChipRow>
      ) : !s.checked[0] ? (
        <SendAction onClick={() => check(0)}>Check answers</SendAction>
      ) : (
        <SendAction onClick={() => go(2)}>Trace the boundary →</SendAction>
      ))}

      {s.step === 2 && (curBoundary !== -1 ? (
        <ChipRow list label={BOUNDARY[curBoundary].desc}>
          <Chip onClick={() => patch({ boundary: { ...s.boundary, [BOUNDARY[curBoundary].id]: "allowed" } })}>Allowed</Chip>
          <Chip onClick={() => patch({ boundary: { ...s.boundary, [BOUNDARY[curBoundary].id]: "blocked" } })}>Blocked</Chip>
        </ChipRow>
      ) : !s.checked[1] ? (
        <SendAction onClick={() => check(1)}>Check answers</SendAction>
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
      label="Map Your Pod, guided chat"
    />
  );
}
