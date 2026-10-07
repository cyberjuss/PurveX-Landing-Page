import { phases, type LabWidget, type WeekDef } from "@/lib/academy-content";
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
  widget?: LabWidget;
};

// Card art keyed by slug. Blurbs are short and plain. Icons are security-themed.
const ART: Record<string, { blurb: string; skill: string; icon: string; accent: string; minutes: number }> = {
  "risk-triage": { blurb: "Score Monday's incoming tickets by real business risk.", skill: "Risk Triage", icon: "TriangleAlert", accent: "#f5a524", minutes: 12 },
  "hash-verify": { blurb: "Prove a downloaded update is the file IT really published.", skill: "Integrity", icon: "Fingerprint", accent: "#8b7bff", minutes: 15 },
  "password-table": { blurb: "Crack a leaked table to see which password storage holds up.", skill: "Credentials", icon: "KeyRound", accent: "#22b8cf", minutes: 20 },
  "wireshark": { blurb: "Read a packet capture and follow a conversation on the wire.", skill: "Networking", icon: "Radar", accent: "#3b9eff", minutes: 20 },
  "forensics": { blurb: "Trace Hidden Tear ransomware through captured network traffic.", skill: "Forensics", icon: "Bug", accent: "#ff6b81", minutes: 25 },
  "effective-access": { blurb: "Work out who can really open a file after nested groups.", skill: "Access Control", icon: "ShieldCheck", accent: "#2fbf71", minutes: 15 },
  "triple-a": { blurb: "Break a broken access-control flow, then close the hole.", skill: "Access Control", icon: "LockKeyhole", accent: "#19c3b2", minutes: 20 },
  "signin-log": { blurb: "Find four problems hiding in a night of sign-in events.", skill: "Log Analysis", icon: "ScanSearch", accent: "#9b8cff", minutes: 18 },
};

const FALLBACK = { blurb: "A hands-on lab in the PurveX environment.", skill: "Hands-on", icon: "FlaskConical", accent: "#5546e0", minutes: 15 };


function labsInEntry(phaseLabel: string, phaseSlug: string, entry: WeekDef): LabMeta[] {
  return entry.sections
    .filter((s) => s.label.startsWith("Lab:"))
    .map((s) => {
      const slug = labSlug(s.file, s.widget);
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
        widget: s.widget,
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
