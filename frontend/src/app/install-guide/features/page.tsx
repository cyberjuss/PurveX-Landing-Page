"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede } from "@/components/purvex-landing-page/docs-content";

const FEATURES: [string, string, string][] = [
  ["Detection validation", "Run real attack techniques against your environment and see, with evidence, whether your SIEM actually caught them.", "/install-guide/features/detection-validation"],
  ["SIEM integration", "Connects to Splunk, Elastic, or Sentinel. Reads only what's needed to confirm a test fired — never mirrors your event data.", "/install-guide/features/detection-validation"],
  ["MITRE ATT&CK coverage", "Every test and detection maps to a real ATT&CK technique, so you see what's actually covered, not just what's on paper.", "/install-guide/features/detection-validation"],
  ["Safe by default", "Atomic Red Team tests are scoped and reversible. Every production run needs admin access and a written reason.", "/install-guide/features/runners-and-policy"],
  ["Test runners", "Dedicated lab machines PurveX connects to over SSH, with host-key pinning so nothing else can impersonate one.", "/install-guide/features/runners-and-policy"],
  ["Detections, your way", "Sync detection rules from your SIEM, or write them by hand — each one mapped to the technique it's meant to catch.", "/install-guide/features/detections"],
  ["Teams and roles", "Multiple team members, role-based permissions, and an audit log of who changed what.", "/install-guide/features/team-and-access"],
  ["Optional AI assistant", "Watchtower is off by default. Turn it on for LLM-assisted analysis, or leave it off and nothing about the product changes.", "/install-guide/features/platform-tools"],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>What PurveX does</H1>
      <Lede>The short version, before you install anything. Self-hosted throughout — nothing here needs a PurveX cloud account.</Lede>

      <div className="dc-cards">
        {FEATURES.map(([title, desc, href]) => (
          <Link className="dc-card" key={title} href={href}>
            <span className="t">{title}</span>
            <span className="d">{desc}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
