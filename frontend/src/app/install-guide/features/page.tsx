"use client";

import { Eyebrow, H1, Lede } from "@/components/purvex-landing-page/docs-content";

const FEATURES: [string, string][] = [
  ["Detection validation", "Run real attack techniques against your environment and see, with evidence, whether your SIEM actually caught them."],
  ["SIEM integration", "Connects to Splunk, Elastic, or Sentinel. Reads only what's needed to confirm a test fired — never mirrors your event data."],
  ["MITRE ATT&CK coverage", "Every test and detection maps to a real ATT&CK technique, so you see what's actually covered, not just what's on paper."],
  ["Safe by default", "Atomic Red Team simulations are scoped and reversible. Production runs are admin-only, restricted to maintenance windows, with irreversible tests blocked outright."],
  ["Test runners", "Dedicated lab machines PurveX connects to over SSH, with host-key pinning so nothing else can impersonate one."],
  ["Detections, your way", "Sync detection rules from your SIEM, or write them by hand — each one mapped to the technique it's meant to catch."],
  ["Teams and roles", "Multiple people, multiple organizations, role-based permissions, and an audit log of who changed what."],
  ["Optional AI assistant", "Watchtower is off by default. Turn it on for LLM-assisted analysis, or leave it off and nothing about the product changes."],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>What PurveX does</H1>
      <Lede>The short version, before you install anything. Self-hosted throughout — nothing here needs a PurveX cloud account.</Lede>

      <div className="dc-cards">
        {FEATURES.map(([title, desc]) => (
          <div className="dc-card" key={title}>
            <span className="t">{title}</span>
            <span className="d">{desc}</span>
          </div>
        ))}
      </div>
    </>
  );
}
