import "server-only";
import fs from "fs";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "src/content/academy");

export function loadLesson(relativePath: string): string | null {
  try {
    return fs.readFileSync(path.join(CONTENT_ROOT, relativePath), "utf-8");
  } catch {
    return null;
  }
}

export interface ContentSection {
  label: string;
  file: string;
}

export interface WeekDef {
  slug: string;
  title: string;
  summary: string;
  sections: ContentSection[];
}

export type HomeLabDef = WeekDef;

export interface PhaseDef {
  slug: string;
  label: string;
  title: string;
  weeks: WeekDef[];
  homeLab?: HomeLabDef;
}

// Phase 1 -- Fundamentals. Weeks 1, 3, 4 have real lesson content migrated
// from the instructor's Google Docs; Week 2's folder in the source Drive is
// still an empty placeholder, so it stays "coming soon" here too rather
// than getting invented content.
const phase1Weeks: WeekDef[] = [
  {
    slug: "week-1",
    title: "Week 1 — CIA Triad",
    summary: "The CIA triad and how risk/threat/vulnerability fit together.",
    sections: [
      { label: "Overview", file: "phase-1/week-1/lesson-overview.md" },
      { label: "The CIA Triad", file: "phase-1/week-1/lesson-cia-triad.md" },
      { label: "Risk, Threats & Vulnerabilities", file: "phase-1/week-1/lesson-risk.md" },
      { label: "How It All Connects", file: "phase-1/week-1/lesson-connects.md" },
      { label: "Resources", file: "phase-1/week-1/resources.md" },
    ],
  },
  {
    slug: "week-2",
    title: "Week 2 — Encryption & Hashing",
    summary: "How symmetric and asymmetric encryption and hashing actually get used.",
    sections: [],
  },
  {
    slug: "week-3",
    title: "Week 3 — Networking",
    summary: "Covers the networking fundamentals behind every packet capture with hands-on Wireshark labs.",
    sections: [
      { label: "Overview", file: "phase-1/week-3/lesson-overview.md" },
      { label: "TCP/IP", file: "phase-1/week-3/lesson-tcpip.md" },
      { label: "Three-Way Handshake", file: "phase-1/week-3/lesson-handshake.md" },
      { label: "Common Ports", file: "phase-1/week-3/lesson-ports.md" },
      { label: "Protocols", file: "phase-1/week-3/lesson-protocols.md" },
      { label: "SSL/TLS", file: "phase-1/week-3/lesson-tls.md" },
      { label: "Lab: Wireshark Basics", file: "phase-1/week-3/lab-wireshark.md" },
      { label: "Lab: Network Forensics — Hidden Tear Ransomware", file: "phase-1/week-3/lab-forensics.md" },
      { label: "Resources", file: "phase-1/week-3/resources.md" },
    ],
  },
  {
    slug: "week-4",
    title: "Week 4 — Authentication, Authorization, Access Control",
    summary: "Walking through broken access control end to end on a live target.",
    sections: [
      { label: "Lab: Broken Access Control (PortSwigger)", file: "phase-1/week-4/lab-triple-a.md" },
      { label: "Resources", file: "phase-1/week-4/resources.md" },
    ],
  },
];

const phase1HomeLab: HomeLabDef = {
  slug: "home-lab-active-directory",
  title: "Home Lab — Active Directory",
  summary: "GovTech Financial: a fictional enterprise environment used for investigation and detection labs.",
  sections: [
    { label: "Overview", file: "phase-1/home-lab-ad/overview.md" },
    { label: "Build This Lab", file: "phase-1/home-lab-ad/build-this-lab.md" },
    { label: "Troubleshooting: If the Script Won't Run", file: "phase-1/home-lab-ad/troubleshooting.md" },
    { label: "AD Building Blocks", file: "phase-1/home-lab-ad/ad-building-blocks.md" },
    { label: "Admin Tasks", file: "phase-1/home-lab-ad/admin-tasks.md" },
    { label: "The Org Chart", file: "phase-1/home-lab-ad/org-chart.md" },
    { label: "Administrative Roles", file: "phase-1/home-lab-ad/admin-roles.md" },
    { label: "Data Categories", file: "phase-1/home-lab-ad/data-categories.md" },
    { label: "Who Wealth Management Serves", file: "phase-1/home-lab-ad/wealth-management-clients.md" },
    { label: "Full User Directory", file: "phase-1/home-lab-ad/user-directory.md" },
    { label: "The Client Workstation", file: "phase-1/home-lab-ad/client-workstation.md" },
    { label: "Environment Stats", file: "phase-1/home-lab-ad/environment-stats.md" },
    { label: "Challenge: Operation Day One", file: "phase-1/home-lab-ad/ctf-challenge.md" },
  ],
};

// Phase 2 -- Threat Detection & Log Analysis. All weeks' folders in the
// source Drive are still empty placeholders, same as Phase 1's Week 2.
const phase2Weeks: WeekDef[] = [
  {
    slug: "week-1",
    title: "Week 1 — Malware",
    summary: "How malware works and spreads and what rides along with it.",
    sections: [],
  },
  {
    slug: "week-2",
    title: "Week 2 — Log Analysis Fundamentals",
    summary: "Reading raw logs and telling signal from noise.",
    sections: [],
  },
  {
    slug: "week-3",
    title: "Week 3 — SIEM Basics",
    summary: "Centralized logging and building your first detections.",
    sections: [],
  },
  {
    slug: "week-4",
    title: "Week 4 — Detection Engineering",
    summary: "MITRE ATT&CK and mapping detections to real techniques.",
    sections: [],
  },
];

// Phase 3 -- Incident Response. No weeks defined yet (unlike Phase 1/2,
// there's no source-Drive week breakdown to placeholder against), so it
// shows in the sidebar as a phase group with no entries underneath, linking
// straight to the phase-3 page's "still being written" placeholder.
export const phases: PhaseDef[] = [
  { slug: "phase-1", label: "Phase 1", title: "Fundamentals", weeks: phase1Weeks, homeLab: phase1HomeLab },
  { slug: "phase-2", label: "Phase 2", title: "Threat Detection & Log Analysis", weeks: phase2Weeks },
  { slug: "phase-3", label: "Phase 3", title: "Incident Response", weeks: [] },
];

export function findPhase(phaseSlug: string): PhaseDef | undefined {
  return phases.find((p) => p.slug === phaseSlug);
}

export function findEntry(phaseSlug: string, entrySlug: string): WeekDef | undefined {
  const phase = findPhase(phaseSlug);
  if (!phase) return undefined;
  if (phase.homeLab?.slug === entrySlug) return phase.homeLab;
  return phase.weeks.find((w) => w.slug === entrySlug);
}

// The first entry actually worth landing on -- an entry with no sections
// yet is "Coming soon" and isn't clickable anywhere else either, so there's
// nothing useful to redirect a phase's index route into for it.
export function firstAvailableEntry(phase: PhaseDef): WeekDef | undefined {
  const entries = [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];
  return entries.find((e) => e.sections.length > 0);
}
