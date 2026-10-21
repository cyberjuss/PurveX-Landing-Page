"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { confettiFrom } from "@/lib/confetti";
import { academyFetch } from "@/lib/academy-client";
import { dropSlotAt, useLabDone, useLabResult, usePointerDrag, useSaved } from "./lab-kit";
import "./network-map-lab.css";

// Week 4 lab: an actual diagram of the student's own pod, not a quiz about
// one. Round 1 drags five everyday tasks onto the port each one actually
// uses, drawn around the two machines. Round 2 drags five connection
// attempts onto the actor that starts them, and each drop draws a real
// arrow into the diagram, colored by whether the pod's own isolation
// allows it -- by the end the full diagram shows every real attack surface
// the pod has, and the one sanctioned way in.

type PodStatus = { available?: boolean; state?: string; instanceType?: string; linux?: boolean };

type Pt = { x: number; y: number };
const DC: Pt = { x: 230, y: 150 };
const LX: Pt = { x: 410, y: 150 };
const ACTORS: Record<string, Pt> = {
  internet: { x: 140, y: 390 },
  otherpod: { x: 320, y: 390 },
  guac: { x: 500, y: 390 },
};
const ACTOR_LABEL: Record<string, string> = { internet: "The Internet", otherpod: "Another Pod", guac: "Guacamole" };

type Port = { id: string; task: string; at: Pt; node: "dc" | "lx"; label: string; why: string };
const PORTS: Port[] = [
  { id: "rdp", task: "Open a remote desktop session on the domain controller.", at: { x: DC.x, y: DC.y - 72 }, node: "dc", label: "3389", why: "RDP: how you actually reach the DC's own screen." },
  { id: "kerberos", task: "Check a sign-in's ticket against the directory.", at: { x: DC.x - 72, y: DC.y - 20 }, node: "dc", label: "88", why: "Kerberos issues and verifies every sign-in ticket in the domain." },
  { id: "ldap", task: "Look up a user object straight from the directory.", at: { x: DC.x - 72, y: DC.y + 56 }, node: "dc", label: "389", why: "LDAP is how the directory itself gets queried." },
  { id: "dns", task: "Find the domain controller's address before anything else can happen.", at: { x: DC.x + 20, y: DC.y + 78 }, node: "dc", label: "53", why: "DNS is how every machine finds the domain controller in the first place." },
  { id: "ssh", task: "Open a terminal session on the Ubuntu server.", at: { x: LX.x, y: LX.y + 72 }, node: "lx", label: "22", why: "SSH, the Linux box's remote terminal protocol." },
];

type Boundary = { id: string; from: string; task: string; to: "dc" | "lx"; allowed: boolean; why: string };
const BOUNDARY: Boundary[] = [
  { id: "dc-to-lx", from: "dc", task: "The domain controller reaches your Ubuntu server, on any port.", to: "lx", allowed: true, why: "The two machines in your own pod reach each other on every port. That's the whole point of them being one pod." },
  { id: "lx-to-dc", from: "lx", task: "The Ubuntu server reaches back to the domain controller.", to: "dc", allowed: true, why: "Same pod, same rule, either direction." },
  { id: "internet", from: "internet", task: "A connection arrives from the open internet, aimed at the domain controller's RDP port.", to: "dc", allowed: false, why: "Nothing on the internet can open a connection into either machine. The security group enforces that, not a setting on the machine." },
  { id: "otherpod", from: "otherpod", task: "Another student's domain controller tries to reach your Ubuntu server.", to: "lx", allowed: false, why: "No student's pod can see another's. Each pod gets its own security group." },
  { id: "guac", from: "guac", task: "Guacamole, your browser's gateway, connects in to show you the desktop.", to: "dc", allowed: true, why: "Guacamole is the one sanctioned path in -- why you reach your lab through a signed link, not a raw address." },
];

interface State {
  ports: string[];
  boundary: string[];
}
const START: State = { ports: [], boundary: [] };
const STORE = "academy-lab-network-map-v2";

export function NetworkMapLab({ onDone }: { onDone?: () => void }) {
  const [s, setS] = useSaved<State>(STORE, START, (v) => Array.isArray(v.ports) && Array.isArray(v.boundary));
  const [pod, setPod] = useState<PodStatus | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    academyFetch("/academy/api/hosted-lab")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PodStatus | null) => live && setPod(data))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const portsDone = s.ports.length === PORTS.length;
  const boundaryDone = s.boundary.length === BOUNDARY.length;
  const allDone = portsDone && boundaryDone;
  useLabDone(allDone, onDone);
  useLabResult("lab-network-map", allDone, s.ports.length + s.boundary.length, PORTS.length + BOUNDARY.length);

  const dropPort = (id: string, x: number, y: number) => {
    const slot = dropSlotAt(x, y);
    const port = PORTS.find((p) => p.id === id);
    if (!port || s.ports.includes(id)) return;
    if (slot === id) {
      setS((prev) => ({ ...prev, ports: [...prev.ports, id] }));
      setNote(port.why);
      if (s.ports.length + 1 === PORTS.length) window.setTimeout(() => confettiFrom(boardRef.current, 30), 100);
    } else {
      setMiss(id);
      setNote("Not that port. Think about what the task actually needs to do.");
      window.setTimeout(() => setMiss((m) => (m === id ? null : m)), 450);
    }
  };
  const dropBoundary = (id: string, x: number, y: number) => {
    const slot = dropSlotAt(x, y);
    const b = BOUNDARY.find((bb) => bb.id === id);
    if (!b || s.boundary.includes(id)) return;
    if (slot === b.from) {
      setS((prev) => ({ ...prev, boundary: [...prev.boundary, id] }));
      setNote(b.why);
      if (s.boundary.length + 1 === BOUNDARY.length) window.setTimeout(() => confettiFrom(boardRef.current, 50), 100);
    } else {
      setMiss(id);
      setNote("Drag it onto who is actually making that connection, not who it's aimed at.");
      window.setTimeout(() => setMiss((m) => (m === id ? null : m)), 450);
    }
  };

  const portsDrag = usePointerDrag(dropPort);
  const boundaryDrag = usePointerDrag(dropBoundary);

  const nodeAt = (node: "dc" | "lx") => (node === "dc" ? DC : LX);
  const edge = (from: Pt, to: Pt, r: number) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const d = Math.hypot(dx, dy) || 1;
    return { x: from.x + (dx / d) * r, y: from.y + (dy / d) * r };
  };

  const podLine = !pod
    ? "Checking your pod…"
    : pod.available === false
      ? "This diagram is the same for every Pro pod, including yours once it's provisioned."
      : pod.state === "ready"
        ? `Your pod is online right now: a ${pod.instanceType ?? "Windows"} domain controller${pod.linux ? " and an Ubuntu server" : ""}.`
        : "Your pod is offline right now, but this is exactly its shape when it's running.";

  return (
    <div className="nml" ref={boardRef}>
      <p className="nml__brief">{podLine}</p>

      <svg viewBox="0 0 640 440" className="nml__svg" role="img" aria-label="Diagram of your pod: a domain controller and an Ubuntu server inside an isolated boundary, with the internet, another pod, and Guacamole outside it">
        <rect x="100" y="40" width="440" height="190" rx="18" className="nml__pod" />
        <text x="118" y="64" className="nml__podlabel">YOUR POD</text>

        {/* trusted link */}
        <line x1={DC.x + 44} y1={DC.y} x2={LX.x - 44} y2={LX.y} className="nml__trust" />

        {/* boundary-round arrows, drawn as each one is solved */}
        {s.boundary.map((id) => {
          const b = BOUNDARY.find((bb) => bb.id === id)!;
          const from = ACTORS[b.from] ?? nodeAt(b.from as "dc" | "lx");
          const to = nodeAt(b.to);
          const a = edge(from, to, 46);
          const z = edge(to, from, 46);
          return (
            <line key={id} x1={a.x} y1={a.y} x2={z.x} y2={z.y} className={`nml__arrow ${b.allowed ? "is-ok" : "is-no"}`} markerEnd={b.allowed ? "url(#ok)" : "url(#no)"} />
          );
        })}

        <defs>
          <marker id="ok" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" className="nml__arrowhead is-ok" />
          </marker>
          <marker id="no" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" className="nml__arrowhead is-no" />
          </marker>
        </defs>

        {/* machines */}
        <g transform={`translate(${DC.x} ${DC.y})`} className="nml__node nml__node--dc">
          <circle r="44" />
          <text y="-6">DC</text>
          <text y="14" className="nml__sub">Windows Server</text>
        </g>
        <g transform={`translate(${LX.x} ${LX.y})`} className="nml__node nml__node--lx">
          <circle r="44" />
          <text y="-6">Ubuntu</text>
          <text y="14" className="nml__sub">Linux server</text>
        </g>

        {/* port slots */}
        {PORTS.map((p) => {
          const solved = s.ports.includes(p.id);
          return (
            <g key={p.id} transform={`translate(${p.at.x} ${p.at.y})`} data-slot={p.id} className={`nml__port${solved ? " is-solved" : ""}`}>
              <circle r="18" />
              <text>{solved ? p.label : "?"}</text>
            </g>
          );
        })}

        {/* outside actors, once ports are done */}
        {portsDone &&
          Object.entries(ACTORS).map(([id, at]) => {
            const solved = s.boundary.includes(id);
            return (
              <g key={id} transform={`translate(${at.x} ${at.y})`} data-slot={id} className={`nml__actor${solved ? " is-solved" : ""}`}>
                <circle r="34" />
                {solved && <Check x="-8" y="-24" width="16" height="16" />}
                <text y="50">{ACTOR_LABEL[id]}</text>
              </g>
            );
          })}
      </svg>

      {!portsDone && (
        <>
          <p className="nml__round">Round 1 of 2 — drag each task onto the port it actually uses.</p>
          <div className="nml__tray" aria-label="Tasks to place">
            {PORTS.filter((p) => !s.ports.includes(p.id)).map((p) => (
              <button key={p.id} type="button" className={`nml__card${portsDrag.dragging === p.id ? " is-dragging" : ""}${miss === p.id ? " is-miss" : ""}`} {...portsDrag.bind(p.id)}>
                {p.task}
              </button>
            ))}
          </div>
        </>
      )}

      {portsDone && !boundaryDone && (
        <>
          <p className="nml__round">Round 2 of 2 — drag each connection onto whoever is actually making it.</p>
          <div className="nml__tray" aria-label="Connections to place">
            {BOUNDARY.filter((b) => !s.boundary.includes(b.id)).map((b) => (
              <button key={b.id} type="button" className={`nml__card${boundaryDrag.dragging === b.id ? " is-dragging" : ""}${miss === b.id ? " is-miss" : ""}`} {...boundaryDrag.bind(b.id)}>
                {b.task}
              </button>
            ))}
          </div>
        </>
      )}

      {note && <p className="nml__note" aria-live="polite">{note}</p>}

      {allDone && (
        <p className="nml__done">
          <Check className="h-4 w-4" aria-hidden /> That&rsquo;s the whole attack surface: two machines that trust each other completely, and a boundary that trusts nothing else at all except the one path you actually use to get in.
        </p>
      )}
    </div>
  );
}
