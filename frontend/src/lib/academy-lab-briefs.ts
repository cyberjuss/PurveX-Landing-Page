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
};

export const BROWSER_LABS = Object.keys(LAB_BRIEFS) as LabWidget[];
export const isBrowserLab = (v: unknown): v is LabWidget => typeof v === "string" && (BROWSER_LABS as string[]).includes(v);

/** The objective for the student's first target role, or the general one. */
export function labObjective(lab: LabWidget, roles: RoleId[] | undefined): { text: string; role: RoleId | null } {
  const brief = LAB_BRIEFS[lab];
  const role = roles?.find((r) => brief.objective[r]) ?? null;
  return role ? { text: brief.objective[role], role } : { text: brief.objectiveDefault, role: null };
}
