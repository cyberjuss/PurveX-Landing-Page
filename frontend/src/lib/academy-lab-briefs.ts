import type { RoleId } from "@/lib/academy-certs";
import type { LabWidget } from "@/lib/academy-content";

// What a student sees above each browser lab: the real problem this skill
// solves, today's PurveX situation, and what they are there to do in the job
// they picked at intake. One line each, so the lab itself stays the focus.

export interface LabBrief {
  /** A real incident where this exact skill mattered. */
  problem: string;
  /** Today's situation at PurveX Financial. */
  today: string;
  /** The objective, phrased for each target role. */
  objective: Record<RoleId, string>;
  /** Used when the student has no target role on file. */
  objectiveDefault: string;
  /** Open-source tools the lab uses. Empty when it needs none. */
  tools: string[];
  minutes: number;
}

export const LAB_BRIEFS: Record<LabWidget, LabBrief> = {
  "risk-triage": {
    problem:
      "In 2017 Equifax left a published Apache Struts patch unapplied for months after its release. Attackers used that gap to take the records of about 147 million people.",
    today: "Four problems came in over the weekend. IT can start one fix this morning.",
    objective: {
      "help-desk": "Sort four tickets so the one that can hurt clients gets worked first, and explain the order to your lead.",
      sysadmin: "Pick which of four problems gets this morning's fix, and back it with likelihood and impact.",
      "soc-analyst": "Rank four reports by what failed and how risky it is, the way you rank alerts at the start of a shift.",
      "cyber-analyst": "Score four findings by likelihood and impact and produce the fix order for a risk report.",
      "ir-analyst": "Spot the report that is an open exposure right now, and separate it from what can wait.",
    },
    objectiveDefault: "Put four problems in the order the firm should fix them, and say why.",
    tools: [],
    minutes: 12,
  },
  "hash-verify": {
    problem:
      "In 2023 attackers slipped malware into the 3CX phone app installer that thousands of companies downloaded. Analysts confirmed the bad files by their SHA-256 hashes and shared those hashes so others could block them.",
    today: "IT released VPN update 2.4.1 and posted its hash. Three copies are going around the firm.",
    objective: {
      "help-desk": "Tell staff which copy of the update is safe to install, and stop the bad one spreading.",
      sysadmin: "Verify the update before it goes to every laptop, and find what was changed in the bad copy.",
      "soc-analyst": "Confirm the suspicious copy by hash, find the malicious change, and escalate with evidence.",
      "cyber-analyst": "Prove which copy was tampered with, and explain what a hash can and cannot prove.",
      "ir-analyst": "Identify the tampered copy, keep it as evidence, and choose the containment steps.",
    },
    objectiveDefault: "Find out which copy of the update is safe, and what to do about the one that is not.",
    tools: ["CyberChef", "sha256sum", "PowerShell 7"],
    minutes: 15,
  },
  "password-table": {
    problem:
      "In 2012, 6.5 million LinkedIn password hashes were posted online. They were stored without a salt, so most were cracked within days.",
    today: "A vendor eight PurveX staff used was breached. The dump stores their passwords four different ways.",
    objective: {
      "help-desk": "Work out whose passwords the breach exposes, and who needs a reset first.",
      sysadmin: "Judge how the vendor stored passwords, and what a safe system does instead.",
      "soc-analyst": "Read a leaked credential dump and flag the accounts at risk of takeover.",
      "cyber-analyst": "Rate four ways of storing passwords and show the weakness in each with real tools.",
      "ir-analyst": "Size what a third-party breach exposed, and choose the first response step.",
    },
    objectiveDefault: "Find out what the leaked table gives away, and what PurveX should do first.",
    tools: ["CyberChef", "Hashcat and John the Ripper (shown)"],
    minutes: 20,
  },
  "signin-log": {
    problem:
      "In late 2023, attackers used a password spray to break into an old Microsoft test account that had no MFA. From there they reached email belonging to Microsoft's senior leadership and security staff.",
    today: "Last night's sign-in log from PurveX's domain controller and MFA service has four things in it that need a look.",
    objective: {
      "help-desk": "Tell a user's own locked-out phone apart from an attack, and know which calls to escalate.",
      sysadmin: "Read the sign-in events that show an account being attacked or misused, and choose the fix.",
      "soc-analyst": "Triage a night of sign-ins, find the spray and the compromised accounts, and pick the first containment step.",
      "cyber-analyst": "Separate attacks from noise in a sign-in log, and show it with a count you can repeat.",
      "ir-analyst": "Find which accounts an attacker now holds, and contain them before tidying up.",
    },
    objectiveDefault: "Find the attacks in a night of sign-ins, and decide what to do first.",
    tools: ["Python (Pyodide)"],
    minutes: 20,
  },
  "effective-access": {
    problem:
      "Folders open to every account in the domain are a common finding in security audits. One stolen password is then enough to read data meant for a single department.",
    today: "An audit flagged four folders on PurveX's file server. Work out who can really open each one.",
    objective: {
      "help-desk": "Explain why a user can or cannot open a folder, and fix it through groups, not one-off rights.",
      sysadmin: "Work out effective access from share and NTFS permissions, and remove what grants too much.",
      "soc-analyst": "Spot folder permissions that expose client data to the whole firm.",
      "cyber-analyst": "Audit who can reach sensitive data, and name the evidence you would pull from the server.",
      "ir-analyst": "Size what one stolen account could have read on the file server.",
    },
    objectiveDefault: "Work out who can open each folder, and remove the access that should not be there.",
    tools: [],
    minutes: 15,
  },
  "network-map": {
    problem:
      "In the 2013 Target breach, attackers got in through a third-party HVAC vendor's stolen credentials, then moved from that vendor connection into the payment network because the two were not properly separated. Segmentation that actually isolates one system from another is what would have stopped that move.",
    today: "Before working another alert, confirm what your own pod's isolation actually allows and actually blocks.",
    objective: {
      "help-desk": "Name the port behind five everyday tasks on your pod, and know what your lab can and cannot reach.",
      sysadmin: "Confirm which ports your two machines actually use, and that your pod's isolation holds the line it claims to.",
      "soc-analyst": "Read your own network's boundary the way you would read any segmentation before trusting an alert about it.",
      "cyber-analyst": "Map your pod's real ports and trust boundary, and connect it to why segmentation failures like Target's matter.",
      "ir-analyst": "Know what's isolated and what isn't before you ever have to contain something on it.",
    },
    objectiveDefault: "Map what your own pod's two machines actually run, and what its isolation actually allows.",
    tools: [],
    minutes: 10,
  },
  "baseline-map": {
    problem:
      "Analysts who never establish a baseline end up ranking a queue by how alarming each alert sounds instead of what actually broke the pattern. The NIST incident-handling guidance that underlies most SOC practice treats this kind of baseline comparison as the starting point of triage, not an afterthought.",
    today: "Three real patterns, each with something in it that doesn't belong.",
    objective: {
      "help-desk": "Tell a routine sign-in, file access, or process launch from one that actually needs a second look.",
      sysadmin: "Separate what a system normally does from what it's doing right now, across three different kinds of data.",
      "soc-analyst": "Build the same baseline-then-outlier judgment you'll use on every real alert triage, in three different data shapes.",
      "cyber-analyst": "Practice the repeatable shape behind outlier detection: establish normal, then flag what breaks it.",
      "ir-analyst": "Know what normal looked like before the incident, so you can say exactly what changed.",
    },
    objectiveDefault: "Build three real baselines, and catch what breaks each one.",
    tools: [],
    minutes: 10,
  },
  "trust-boundary": {
    problem:
      "In the 2013 Target breach, attackers reached the payment network from a third-party HVAC vendor's stolen credentials because nothing re-checked them once they were past the first gate. NIST SP 800-207's Zero Trust Architecture exists specifically to remove that kind of free movement after one compromise.",
    today: "A chain from an outside attacker to your payroll database, with only the first gate actually guarded.",
    objective: {
      "help-desk": "Understand why being \"inside the network\" was never supposed to mean trusted.",
      sysadmin: "See exactly what a perimeter-only model leaves open once one account is compromised.",
      "soc-analyst": "Connect Zero Trust's abstract principle to the concrete gates an attacker actually has to pass.",
      "cyber-analyst": "Map where re-verification actually needs to sit in a real access chain, including the shortcut path.",
      "ir-analyst": "Know which hops in your environment would actually stop lateral movement, and which wouldn't.",
    },
    objectiveDefault: "Lock every gate between an outside attacker and your most sensitive data.",
    tools: [],
    minutes: 8,
  },
  "threshold-tuner": {
    problem:
      "A detection threshold set too low drowns a SOC in false positives until nobody trusts a Critical alert. Set too high, and it misses a real, quieter attack entirely. NIST's incident-response guidance frames severity and detection tuning as judgment calls against your own environment, not a fixed number.",
    today: "Five real cases on one scale, from a mistyped password to a targeted guess against one account.",
    objective: {
      "help-desk": "See why \"just lower the threshold\" isn't free, and what it costs the team that has to work the queue.",
      sysadmin: "Feel the trade-off a threshold actually makes, not just read about it.",
      "soc-analyst": "Practice setting a threshold that catches a real attack without burying the queue in noise.",
      "cyber-analyst": "Find the defensible band for a detection threshold, and be able to justify exactly why.",
      "ir-analyst": "Understand what a badly tuned threshold would have let through before you ever see the incident.",
    },
    objectiveDefault: "Find the threshold that catches the real attack without burying the queue in noise.",
    tools: [],
    minutes: 8,
  },
  "malware-triage": {
    problem:
      "In 2017 the NotPetya worm spread across corporate networks on its own, copying itself from one infected machine to thousands more within hours. Shipping giant Maersk lost its global IT infrastructure because the worm moved faster than any team could contain it by hand.",
    today: "A file in Finance's shared folder has already spread itself to two machines nobody touched, and it may not be done yet.",
    objective: {
      "help-desk": "Tell a worm's self-spread apart from a one-off infected file, and know which machines actually need isolating.",
      sysadmin: "Contain a self-spreading alert before it reaches more machines, and preserve what the investigating team will need.",
      "soc-analyst": "Work a live malware alert end to end: verify what it actually is, contain it fast, and hand up a clean escalation.",
      "cyber-analyst": "Reason through a spreading incident's evidence, and justify each containment decision.",
      "ir-analyst": "Scope how far a self-spreading incident has already gone, and preserve the evidence before anyone cleans it up.",
    },
    objectiveDefault: "Verify, contain, preserve and escalate one malware alert before it spreads further.",
    tools: [],
    minutes: 10,
  },
};

export const BROWSER_LABS = Object.keys(LAB_BRIEFS) as LabWidget[];
export const isBrowserLab = (v: unknown): v is LabWidget => typeof v === "string" && (BROWSER_LABS as string[]).includes(v);

/** The objective for the student's first target role, or the general one. */
export function labObjective(lab: LabWidget, roles: RoleId[] | undefined): { text: string; role: RoleId | null } {
  const brief = LAB_BRIEFS[lab];
  const role = roles?.find((r) => brief.objective[r]) ?? null;
  return role ? { text: brief.objective[role], role } : { text: brief.objectiveDefault, role: null };
}
