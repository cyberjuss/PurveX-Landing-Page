"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede } from "@/components/purvex-landing-page/docs-content";

const FEATURES: [string, string, string][] = [
  ["Detection validation", "Run real attack techniques against your environment and see, with evidence, whether your SIEM actually caught them.", "/install-guide/features/detection-validation"],
  ["SIEM integration", "Connects to Splunk, Elastic, or Sentinel. Reads only what is needed to confirm a test fired, and never mirrors your event data.", "/install-guide/features/detection-validation"],
  ["MITRE ATT&CK coverage", "Every test and detection maps to a real ATT&CK technique, showing what is actually covered rather than what is documented.", "/install-guide/features/detection-validation"],
  ["Safe by default", "Atomic Red Team tests are scoped and reversible. Every production run requires admin access and a written reason.", "/install-guide/features/runners-and-policy"],
  ["Test runners", "Dedicated lab machines that PurveX connects to over SSH, with host-key pinning so nothing else can impersonate one.", "/install-guide/features/runners-and-policy"],
  ["Detections, your way", "Sync detection rules from your SIEM, or write them by hand, each mapped to the technique it is meant to catch.", "/install-guide/features/detections"],
  ["Teams and roles", "Multiple team members, role-based permissions, and an audit log of who changed what.", "/install-guide/features/team-and-access"],
  ["Scale when ready", "Free covers real validation on a small team. Paid adds scheduled runs, Detection-as-Code, and reports when needed.", "/pricing"],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>What PurveX does</H1>
      <Lede>An overview before installation. PurveX is self-hosted throughout; none of this requires a PurveX cloud account.</Lede>

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
