import "server-only";
import fs from "fs";
import { entriesOf } from "@/lib/academy-entries";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "src/content/academy");

export function loadLesson(relativePath: string): string | null {
  try {
    return fs.readFileSync(path.join(CONTENT_ROOT, relativePath), "utf-8");
  } catch {
    return null;
  }
}

/** Interactive labs rendered by a React component below the section's markdown. */
export type LabWidget = "risk-triage" | "hash-verify" | "password-table" | "signin-log" | "effective-access" | "network-map" | "baseline-map" | "trust-boundary" | "threshold-tuner";

export interface ContentSection {
  label: string;
  file: string;
  widget?: LabWidget;
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
  /** Hands-on entries, after the weeks. Several, because one entry holding the
   *  whole home lab counted a multi-hour domain build as a fifth of the phase
   *  and the progress bar barely moved while a student did the hardest work. */
  homeLabs?: HomeLabDef[];
}

// Phase 1 -- Fundamentals. Weeks 1, 3, 4 have real lesson content migrated
// from the instructor's Google Docs. Week 2's lessons were written in the
// repo to feed its two browser labs.
const phase1Weeks: WeekDef[] = [
  {
    slug: "week-1",
    title: "Week 1 — CIA Triad",
    summary: "Name what failed, then separate a threat from a vulnerability before ranking the risk.",
    sections: [
      { label: "Overview", file: "phase-1/week-1/lesson-overview.md" },
      { label: "Confidentiality", file: "phase-1/week-1/lesson-confidentiality.md" },
      { label: "Integrity", file: "phase-1/week-1/lesson-integrity.md" },
      { label: "Availability", file: "phase-1/week-1/lesson-availability.md" },
      { label: "Vulnerabilities", file: "phase-1/week-1/lesson-vulnerabilities.md" },
      { label: "Threats", file: "phase-1/week-1/lesson-threats.md" },
      { label: "Risk", file: "phase-1/week-1/lesson-risk.md" },
      { label: "How It All Connects", file: "phase-1/week-1/lesson-connects.md" },
      { label: "Resources", file: "phase-1/week-1/resources.md" },
      { label: "Lab: Monday Morning Risk Triage", file: "phase-1/week-1/lab-risk-triage.md", widget: "risk-triage" },
      { label: "Lab: CIA Triad in Practice", file: "phase-1/week-1/lab-three-failures.md" },
      { label: "Lab: CVSS Vulnerability Scoring", file: "phase-1/week-1/lab-severity-risk.md" },
    ],
  },
  {
    slug: "week-2",
    title: "Week 2 — Encryption & Hashing",
    summary: "Prove a file was not changed, and tell encoding, encryption and hashing apart in a real password breach.",
    sections: [
      { label: "Overview", file: "phase-1/week-2/lesson-overview.md" },
      { label: "Encoding, Encryption or Hashing?", file: "phase-1/week-2/lesson-three-ways.md" },
      { label: "Hashing and Integrity", file: "phase-1/week-2/lesson-hashing.md" },
      { label: "Encryption and Keys", file: "phase-1/week-2/lesson-encryption.md" },
      { label: "Storing Passwords", file: "phase-1/week-2/lesson-passwords.md" },
      { label: "Resources", file: "phase-1/week-2/resources.md" },
      { label: "Lab: The Update Nobody Can Vouch For", file: "phase-1/week-2/lab-hash-verify.md", widget: "hash-verify" },
      { label: "Lab: The Leaked Password Table", file: "phase-1/week-2/lab-password-table.md", widget: "password-table" },
      { label: "Lab: Hashing and Encryption with CyberChef", file: "phase-1/week-2/lab-tell-them-apart.md" },
      { label: "Lab: Password Hashing and Salting", file: "phase-1/week-2/lab-store-a-password.md" },
      { label: "Challenge: The Mirror That Does Not Match", file: "phase-1/week-2/challenge-installer-check.md" },
    ],
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
      { label: "Lab: Network Traffic Analysis with Wireshark", file: "phase-1/week-3/lab-capture-dc-traffic.md" },
      { label: "Lab: Port Scan Detection with Wireshark", file: "phase-1/week-3/lab-read-a-scan.md" },
      { label: "Challenge: The Nightly Settlement Push", file: "phase-1/week-3/challenge-settlement-push.md" },
      { label: "Resources", file: "phase-1/week-3/resources.md" },
    ],
  },
  {
    slug: "week-4",
    title: "Week 4 — Authentication, Authorization, Access Control",
    summary: "Prove who someone is, give them only what their job needs, and check it on every request. Then break an app that forgot to.",
    sections: [
      { label: "Overview", file: "phase-1/week-4/lesson-overview.md" },
      { label: "Authentication", file: "phase-1/week-4/lesson-authentication.md" },
      { label: "Authorization", file: "phase-1/week-4/lesson-authorization.md" },
      { label: "Broken Access Control", file: "phase-1/week-4/lesson-access-control.md" },
      { label: "Lab: Who Can Open This?", file: "phase-1/week-4/lab-effective-access.md", widget: "effective-access" },
      { label: "Lab: Broken Access Control (PortSwigger)", file: "phase-1/week-4/lab-triple-a.md" },
      { label: "Lab: Authentication Log Analysis", file: "phase-1/week-4/lab-read-the-login-record.md" },
      { label: "Lab: Linux Privilege Management with sudo", file: "phase-1/week-4/lab-one-power.md" },
      { label: "Resources", file: "phase-1/week-4/resources.md" },
    ],
  },
];

// The home lab, in four sittings. It used to be one 22-section entry, which
// made an evening of building a domain controller worth the same fifth of the
// phase as a week of short lessons -- and nothing at all until the last
// section was read. Each entry below is a place a student can reasonably stop.
const phase1HomeLabs: HomeLabDef[] = [
  {
    slug: "home-lab-setup",
    title: "Home Lab — Set Up",
    summary: "Learn the PurveX Financial environment, then build it on your own machine.",
    sections: [
      { label: "Overview", file: "phase-1/home-lab-ad/overview.md" },
      { label: "The Org Chart", file: "phase-1/home-lab-ad/the-org-chart.md" },
      { label: "Access Levels", file: "phase-1/home-lab-ad/access-levels.md" },
      { label: "The Data", file: "phase-1/home-lab-ad/the-data.md" },
      { label: "The Environment", file: "phase-1/home-lab-ad/the-environment.md" },
      { label: "Set Up the Lab", file: "phase-1/home-lab-ad/set-up-the-lab.md" },
      { label: "The Domain Controller", file: "phase-1/home-lab-ad/the-domain.md" },
      { label: "Install the Domain", file: "phase-1/home-lab-ad/install-the-domain.md" },
      { label: "Build the Environment", file: "phase-1/home-lab-ad/build-the-environment.md" },
      { label: "Check the Build", file: "phase-1/home-lab-ad/check-the-build.md" },
    ],
  },
  {
    slug: "home-lab-directory",
    title: "Home Lab — The Directory",
    summary: "What lives in Active Directory and how the firm's accounts, groups and policy fit together.",
    sections: [
      { label: "Join a Computer", file: "phase-1/home-lab-ad/join-a-computer.md" },
      { label: "Organizational Units", file: "phase-1/home-lab-ad/organizational-units.md" },
      { label: "Accounts", file: "phase-1/home-lab-ad/accounts.md" },
      { label: "Groups", file: "phase-1/home-lab-ad/groups.md" },
      { label: "Service Accounts", file: "phase-1/home-lab-ad/service-accounts.md" },
      { label: "Group Policy", file: "phase-1/home-lab-ad/group-policy.md" },
    ],
  },
  {
    slug: "home-lab-desk",
    title: "Home Lab — Working the Desk",
    summary: "The four jobs a help desk does all day, done in your own directory.",
    sections: [
      { label: "Find an Account", file: "phase-1/home-lab-ad/find-an-account.md" },
      { label: "Unlock or Reset", file: "phase-1/home-lab-ad/unlock-or-reset.md" },
      { label: "Move an Account", file: "phase-1/home-lab-ad/move-an-account.md" },
      { label: "Read the Account", file: "phase-1/home-lab-ad/read-the-account.md" },
    ],
  },
  {
    slug: "home-lab-challenges",
    title: "Home Lab — Challenges",
    summary: "A first day on the desk, a full ticket queue and a client data review, graded against your own lab.",
    sections: [
      { label: "Challenge: Operation Day One", file: "phase-1/home-lab-ad/ctf-challenge.md" },
      { label: "Challenge: Ticket Queue", file: "phase-1/home-lab-ad/ticket-queue-challenge.md" },
      { label: "Challenge: The Client Data Review", file: "phase-1/home-lab-ad/client-data-challenge.md" },
    ],
  },
];

// Phase 2 -- Threat Detection & Log Analysis. All weeks' folders in the
// source Drive are still empty placeholders, same as Phase 1's Week 2.
const phase2Weeks: WeekDef[] = [
  {
    slug: "soc-mindset",
    title: "Week 1 — Think Like a SOC Analyst",
    summary: "The tier structure, the investigation mindset, and how an incident gets named and classified before it ever reaches a tool.",
    sections: [
      { label: "Overview", file: "phase-2/soc-mindset/overview.md" },
      { label: "What a SOC Analyst Does", file: "phase-2/soc-mindset/lesson-role.md" },
      { label: "How AI Is Changing the Role", file: "phase-2/soc-mindset/lesson-ai-impact.md" },
      { label: "The Investigation Mindset", file: "phase-2/soc-mindset/lesson-investigation-mindset.md" },
      { label: "The 5 W's of an Investigation", file: "phase-2/soc-mindset/lesson-5ws.md" },
      { label: "Classifying an Incident", file: "phase-2/soc-mindset/lesson-classification.md" },
      { label: "Allowlisting and Blocklisting", file: "phase-2/soc-mindset/lesson-allow-deny.md" },
      { label: "Resources", file: "phase-2/soc-mindset/resources.md" },
    ],
  },
  // Slugs below stay as "week-1".."week-4" (not renumbered) so existing
  // student progress, which is keyed by slug, doesn't silently reset.
  // Only the display title changed to match the new lead-in week above.
  {
    slug: "week-1",
    title: "Week 2 — Malware",
    summary: "How malware works, how it spreads, and what arrives along with it.",
    sections: [
      { label: "Overview", file: "phase-2/week-1/overview.md" },
      { label: "Types of Malware", file: "phase-2/week-1/lesson-types.md" },
      { label: "How Malware Gets In", file: "phase-2/week-1/lesson-delivery.md" },
      { label: "Working a Malware Alert", file: "phase-2/week-1/lesson-response.md" },
      { label: "Tools Analysts Use", file: "phase-2/week-1/lesson-tools.md" },
    ],
  },
  {
    slug: "week-2",
    title: "Week 3 — Log Analysis Fundamentals",
    summary: "Read the host, the account, and the log before deciding what happened.",
    sections: [
      { label: "Overview", file: "phase-2/week-2/overview.md" },
      { label: "Lab: Read the Sign-In Log", file: "phase-2/week-2/lab-signin-log.md", widget: "signin-log" },
      { label: "Challenge: The 2 AM Login", file: "phase-2/week-2/alert-inc-1046.md" },
    ],
  },
  // These two replace the old empty "week-3" (SIEM Basics) and "week-4"
  // (Detection Engineering) placeholders, which had no sections and so no
  // student progress to preserve -- safe to retire rather than renumber.
  {
    slug: "baselines-thresholds",
    title: "Week 4 — Baselines, Thresholds & Zero Trust",
    summary: "Map your own lab's network, tell an outlier from a baseline, place MITRE ATT&CK on attacker behavior you've already seen, and learn what a detection threshold actually costs in either direction.",
    sections: [
      { label: "Overview", file: "phase-2/baselines-thresholds/overview.md" },
      { label: "Mapping Your Environment", file: "phase-2/baselines-thresholds/lesson-map-environment.md" },
      { label: "Lab: Map Your Pod", file: "phase-2/baselines-thresholds/lab-network-map.md", widget: "network-map" },
      { label: "Baselines and Outliers", file: "phase-2/baselines-thresholds/lesson-baselines-outliers.md" },
      { label: "Lab: Spot the Outlier", file: "phase-2/baselines-thresholds/lab-baseline-map.md", widget: "baseline-map" },
      { label: "The MITRE ATT&CK Framework", file: "phase-2/baselines-thresholds/lesson-attack.md" },
      { label: "Zero Trust", file: "phase-2/baselines-thresholds/lesson-zero-trust.md" },
      { label: "Lab: Lock Every Gate", file: "phase-2/baselines-thresholds/lab-trust-boundary.md", widget: "trust-boundary" },
      { label: "Setting Thresholds for Detections", file: "phase-2/baselines-thresholds/lesson-thresholds.md" },
      { label: "Lab: Tune the Threshold", file: "phase-2/baselines-thresholds/lab-threshold-tuner.md", widget: "threshold-tuner" },
      { label: "Why Detections Matter", file: "phase-2/baselines-thresholds/lesson-why-detections.md" },
      { label: "Resources", file: "phase-2/baselines-thresholds/resources.md" },
    ],
  },
  {
    slug: "detection-writing",
    title: "Week 5 — Writing Detections with KQL",
    summary: "Learn KQL and TRACE, a five-part method for turning an ATT&CK technique and a threshold into a real detection query.",
    sections: [
      { label: "Overview", file: "phase-2/detection-writing/overview.md" },
      { label: "KQL Basics", file: "phase-2/detection-writing/lesson-kql-basics.md" },
      { label: "The TRACE Method", file: "phase-2/detection-writing/lesson-trace.md" },
      { label: "TRACE: Technique", file: "phase-2/detection-writing/lesson-trace-technique.md" },
      { label: "TRACE: Reference", file: "phase-2/detection-writing/lesson-trace-reference.md" },
      { label: "TRACE: Aggregate", file: "phase-2/detection-writing/lesson-trace-aggregate.md" },
      { label: "TRACE: Condition", file: "phase-2/detection-writing/lesson-trace-condition.md" },
      { label: "TRACE: Escalation", file: "phase-2/detection-writing/lesson-trace-escalation.md" },
      { label: "Resources", file: "phase-2/detection-writing/resources.md" },
    ],
  },
  {
    slug: "kill-chain",
    title: "Week 6 — The Cyber Kill Chain",
    summary: "See how individual ATT&CK techniques you already know chain into one intrusion, then work a real five-stage chain in your own Shift queue.",
    sections: [
      { label: "Overview", file: "phase-2/kill-chain/overview.md" },
      { label: "The Cyber Kill Chain", file: "phase-2/kill-chain/lesson-kill-chain.md" },
      { label: "Reconnaissance", file: "phase-2/kill-chain/lesson-recon.md" },
      { label: "Weaponization", file: "phase-2/kill-chain/lesson-weaponization.md" },
      { label: "Delivery", file: "phase-2/kill-chain/lesson-delivery.md" },
      { label: "Exploitation", file: "phase-2/kill-chain/lesson-exploitation.md" },
      { label: "Installation", file: "phase-2/kill-chain/lesson-installation.md" },
      { label: "Command and Control", file: "phase-2/kill-chain/lesson-c2.md" },
      { label: "Actions on Objectives", file: "phase-2/kill-chain/lesson-actions.md" },
      { label: "Challenge: The Five-Stage Intrusion", file: "phase-2/kill-chain/challenge-attack-chain.md" },
      { label: "Resources", file: "phase-2/kill-chain/resources.md" },
    ],
  },
];

// Phase 3 -- Incident Response. No weeks defined yet (unlike Phase 1/2,
// there's no source-Drive week breakdown to placeholder against), so it
// shows in the sidebar as a phase group with no entries underneath, linking
// straight to the phase-3 page's "still being written" placeholder.
export const phases: PhaseDef[] = [
  { slug: "phase-1", label: "Phase 1", title: "Fundamentals", weeks: phase1Weeks, homeLabs: phase1HomeLabs },
  { slug: "phase-2", label: "Phase 2", title: "Threat Detection & Log Analysis", weeks: phase2Weeks },
  { slug: "phase-3", label: "Phase 3", title: "Incident Response", weeks: [] },
];

export function findPhase(phaseSlug: string): PhaseDef | undefined {
  return phases.find((p) => p.slug === phaseSlug);
}

export function findEntry(phaseSlug: string, entrySlug: string): WeekDef | undefined {
  const phase = findPhase(phaseSlug);
  if (!phase) return undefined;
  return entriesOf(phase).find((e) => e.slug === entrySlug);
}

// The first entry actually worth landing on -- an entry with no sections
// yet is "Coming soon" and isn't clickable anywhere else either, so there's
// nothing useful to redirect a phase's index route into for it.
export function firstAvailableEntry(phase: PhaseDef): WeekDef | undefined {
  return entriesOf(phase).find((e) => e.sections.length > 0);
}
