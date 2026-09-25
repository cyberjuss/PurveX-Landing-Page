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
    summary: "Name what failed, then separate a threat from a vulnerability before ranking the risk.",
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
    summary: "How symmetric encryption, asymmetric encryption, and hashing are used in practice.",
    sections: [],
  },
  {
    slug: "week-3",
    title: "Week 3 — Networking",
    summary: "Read a network capture by checking the address, the handshake, the port, and the protocol, and then decide whether the traffic is ordinary.",
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
    summary: "See what happens when an application trusts the client to say who it is, and then use that flaw to delete a user.",
    sections: [
      { label: "Lab: Broken Access Control (PortSwigger)", file: "phase-1/week-4/lab-triple-a.md" },
      { label: "Resources", file: "phase-1/week-4/resources.md" },
    ],
  },
];

const phase1HomeLab: HomeLabDef = {
  slug: "home-lab-active-directory",
  title: "Home Lab — Active Directory",
  summary: "Learn the PurveX Financial environment before touching a ticket, and then work its directory.",
  sections: [
    { label: "Overview", file: "phase-1/home-lab-ad/overview.md" },
    { label: "The Domain Controller", file: "phase-1/home-lab-ad/the-domain.md" },
    { label: "Join a Computer", file: "phase-1/home-lab-ad/join-a-computer.md" },
    { label: "Install the Domain", file: "phase-1/home-lab-ad/install-the-domain.md" },
    { label: "Build the Environment", file: "phase-1/home-lab-ad/build-the-environment.md" },
    { label: "Check the Build", file: "phase-1/home-lab-ad/check-the-build.md" },
    { label: "Organizational Units", file: "phase-1/home-lab-ad/organizational-units.md" },
    { label: "Accounts", file: "phase-1/home-lab-ad/accounts.md" },
    { label: "Groups", file: "phase-1/home-lab-ad/groups.md" },
    { label: "Group Policy", file: "phase-1/home-lab-ad/group-policy.md" },
    { label: "Find an Account", file: "phase-1/home-lab-ad/find-an-account.md" },
    { label: "Unlock or Reset", file: "phase-1/home-lab-ad/unlock-or-reset.md" },
    { label: "Move an Account", file: "phase-1/home-lab-ad/move-an-account.md" },
    { label: "Read the Account", file: "phase-1/home-lab-ad/read-the-account.md" },
    { label: "Service Accounts", file: "phase-1/home-lab-ad/service-accounts.md" },
    { label: "The Org Chart", file: "phase-1/home-lab-ad/the-org-chart.md" },
    { label: "Access Levels", file: "phase-1/home-lab-ad/access-levels.md" },
    { label: "The Data", file: "phase-1/home-lab-ad/the-data.md" },
    { label: "The Environment", file: "phase-1/home-lab-ad/the-environment.md" },
    { label: "Challenge: Operation Day One", file: "phase-1/home-lab-ad/ctf-challenge.md" },
    { label: "Challenge: Ticket Queue", file: "phase-1/home-lab-ad/ticket-queue-challenge.md" },
  ],
};

// Phase 2 -- Threat Detection & Log Analysis. All weeks' folders in the
// source Drive are still empty placeholders, same as Phase 1's Week 2.
const phase2Weeks: WeekDef[] = [
  {
    slug: "week-1",
    title: "Week 1 — Malware",
    summary: "How malware works, how it spreads, and what arrives along with it.",
    sections: [],
  },
  {
    slug: "week-2",
    title: "Week 2 — Log Analysis Fundamentals",
    summary: "Read the host, the account, and the log before deciding what happened.",
    sections: [
      { label: "Overview", file: "phase-2/week-2/overview.md" },
      { label: "Challenge: The 2 AM Login", file: "phase-2/week-2/alert-inc-1046.md" },
    ],
  },
  {
    slug: "week-3",
    title: "Week 3 — SIEM Basics",
    summary: "Centralized logging and how to build a first set of detections.",
    sections: [],
  },
  {
    slug: "week-4",
    title: "Week 4 — Detection Engineering",
    summary: "How MITRE ATT&CK maps detections to real attacker techniques.",
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
