import { phases, type WeekDef } from "@/lib/academy-content";
import { entriesOf, labSlug } from "@/lib/academy-entries";

// Every hands-on lab in the course, flattened so the Labs page can give each
// one its own card and its own page. The card art (icon, accent, blurb) lives
// here; the lab's teaching content stays in its markdown or its widget.

export type LabMeta = {
  /** Stable, unique url segment, e.g. "risk-triage". */
  slug: string;
  /** Clean title with the "Lab:" prefix already removed. */
  title: string;
  /** One line for the card. */
  blurb: string;
  /** The skill it builds, shown as a tag. */
  skill: string;
  /** A lucide icon name, mapped to a component on the client. */
  icon: string;
  /** Card accent, a cyber hue. Never grey. */
  accent: string;
  /** Roughly how long it takes. */
  minutes: number;
  /** Which phase it sits in, for the tag only (cards are not grouped). */
  phaseLabel: string;
  /** Where the lab actually lives, so the page can load it. */
  phaseSlug: string;
  entrySlug: string;
  file: string;
};

// Card art keyed by slug. Blurbs are short and plain. Icons are security-themed.
const ART: Record<string, { blurb: string; skill: string; icon: string; accent: string; minutes: number }> = {
  "three-failures": { blurb: "Break confidentiality, integrity and availability on one file, and prove each one.", skill: "Fundamentals", icon: "ShieldAlert", accent: "#4fa3d1", minutes: 20 },
  "severity-risk": { blurb: "Score one flaw three ways with CVSS, and watch Critical stop meaning urgent.", skill: "Vulnerability Scoring", icon: "Gauge", accent: "#0ca678", minutes: 30 },
  "tell-them-apart": { blurb: "Tell encoding, encryption and hashing apart in CyberChef, and prove which reverse.", skill: "Credentials", icon: "ScanSearch", accent: "#22b8cf", minutes: 20 },
  "store-a-password": { blurb: "See why a leaked unsalted table gives a company away, and how salting fixes it.", skill: "Credentials", icon: "KeyRound", accent: "#22b8cf", minutes: 25 },
  "wireshark": { blurb: "Read a packet capture and follow a conversation on the wire.", skill: "Networking", icon: "Radar", accent: "#3b9eff", minutes: 20 },
  "capture-dc-traffic": { blurb: "Capture a few seconds of the domain controller and find the handshakes, ports and protocols.", skill: "Networking", icon: "Cable", accent: "#3b9eff", minutes: 25 },
  "read-a-scan": { blurb: "Produce a port scan, capture it, and learn the signature that tells an open door from a closed one.", skill: "Networking", icon: "ScanSearch", accent: "#3b9eff", minutes: 30 },
  "write-a-detection": { blurb: "Write a real Suricata rule and watch it catch the scan you ran by hand.", skill: "Networking", icon: "SatelliteDish", accent: "#3b9eff", minutes: 20 },
  "forensics": { blurb: "Trace Hidden Tear ransomware through captured network traffic.", skill: "Forensics", icon: "Bug", accent: "#ff6b81", minutes: 25 },
  "triple-a": { blurb: "Break a broken access-control flow, then close the hole.", skill: "Application Security", icon: "Unlock", accent: "#e64980", minutes: 20 },
  "read-the-login-record": { blurb: "Make a failed and a successful login, find both in the log, and tell them apart.", skill: "Log Analysis", icon: "ScanSearch", accent: "#9b8cff", minutes: 20 },
  "one-power": { blurb: "Grant a user exactly one command as root, and prove you did not hand over the machine.", skill: "Access Control", icon: "LockKeyhole", accent: "#19c3b2", minutes: 25 },
  "confirm-the-map": { blurb: "Ask your domain controller what it is really listening on, in PowerShell, and find what a five-port lesson left out.", skill: "Networking", icon: "Router", accent: "#3b9eff", minutes: 15 },
  "document-the-five-ws": { blurb: "Fail a real sign-in on purpose, then document it with the 5 W's.", skill: "SOC Analysis", icon: "FileSearch", accent: "#d946ef", minutes: 15 },
  "default-posture": { blurb: "Read your domain controller's real default firewall posture, allowlist versus blocklist.", skill: "SOC Analysis", icon: "DoorClosed", accent: "#d946ef", minutes: 10 },
  "trigger-a-real-detection": { blurb: "Create a real EICAR test file and read the exact signature Defender flags it with.", skill: "Malware", icon: "TestTube2", accent: "#ff6b81", minutes: 15 },
  "read-a-process-tree": { blurb: "Find a real Sysmon process tree and name the Kill Chain stage it matches.", skill: "Malware", icon: "GitBranch", accent: "#ff6b81", minutes: 15 },
  "one-timeline-two-machines": { blurb: "Sign in to both machines in your pod and correlate the two logs into one timeline.", skill: "Log Analysis", icon: "GitCompare", accent: "#9b8cff", minutes: 15 },
  "turn-on-script-logging": { blurb: "Turn on PowerShell's own script-block logging and read a command's full text back.", skill: "Log Analysis", icon: "Terminal", accent: "#9b8cff", minutes: 15 },
};

const FALLBACK = { blurb: "A hands-on lab in the PurveX environment.", skill: "Hands-on", icon: "FlaskConical", accent: "#5546e0", minutes: 15 };


function labsInEntry(phaseLabel: string, phaseSlug: string, entry: WeekDef): LabMeta[] {
  return entry.sections
    .filter((s) => s.label.startsWith("Lab:"))
    .map((s) => {
      const slug = labSlug(s.file);
      const art = ART[slug] ?? FALLBACK;
      return {
        slug,
        title: s.label.replace(/^Lab:\s*/, ""),
        blurb: art.blurb,
        skill: art.skill,
        icon: art.icon,
        accent: art.accent,
        minutes: art.minutes,
        phaseLabel,
        phaseSlug,
        entrySlug: entry.slug,
        file: s.file,
      };
    });
}

/** Every lab across the course, in course order. */
export function listLabs(): LabMeta[] {
  const out: LabMeta[] = [];
  for (const phase of phases) {
    const entries = entriesOf(phase);
    for (const entry of entries) out.push(...labsInEntry(`${phase.label} · ${phase.title}`, phase.slug, entry));
  }
  return out;
}

export const findLab = (slug: string): LabMeta | undefined => listLabs().find((l) => l.slug === slug);
