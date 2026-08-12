"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede, H2, P, Table, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Detection validation</H1>
      <Lede>
        The core loop: connect a SIEM, select an attack technique, run it against a real endpoint, and
        confirm whether your detection fired, with evidence.
      </Lede>

      <H2 id="connect-a-siem">Connect a SIEM</H2>
      <P>
        <strong>Settings &rarr; SIEM.</strong> PurveX reads from your SIEM at validation time. It never copies or
        stores your event data. Three types are supported today:
      </P>
      <Table
        head={["SIEM", "Auth", "Requirements"]}
        rows={[
          ["Splunk", "Token", "Management URL (port 8089), a Splunk token"],
          ["Elastic Security", "API key", "Kibana base URL, an Elastic API key (base64)"],
          ["Microsoft Sentinel", "Service principal", "Tenant ID, Client ID, Client secret, Log Analytics workspace ID"],
        ]}
      />
      <P>
        Every connection has a <strong>Log marker pattern</strong> (default <code>purvex_*</code>), a tag PurveX
        stamps on its own validation traffic so your SOC can filter test activity out of real alerts.
      </P>
      <P>
        Select <strong>Test</strong> to confirm PurveX can reach a connection and read alerts. The same check
        also runs automatically on page load, and drives the Connected / Configured / Not configured status
        shown next to each row. Add as many connections as needed; there is no limit.
      </P>

      <H2 id="test-library">Browse the test library</H2>
      <P>
        <strong>Tests &rarr; Explore.</strong> The library is the open-source{" "}
        <a href="https://github.com/redcanaryco/atomic-red-team" target="_blank" rel="noreferrer" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>
          Atomic Red Team
        </a>{" "}
        project, organized by MITRE ATT&amp;CK technique: one card per tactic, with a &ldquo;Has
        detections&rdquo; or &ldquo;No detections&rdquo; chip on each technique. The first time a technique is
        opened with no library installed yet, a <strong>Download test catalog</strong> button appears. This is
        a one-click download, cached after that.
      </P>
      <Callout tone="info">
        Opening a test shows the exact command it runs, but PurveX does not execute anything from this screen.
        It is reference only. Selecting <strong>Run</strong> hands the technique off to the Run Test wizard,
        which is what actually dispatches it to a registered runner.
      </Callout>

      <H2 id="run-a-test">Run a test</H2>
      <P><strong>Tests &rarr; Run New.</strong> A three-step wizard.</P>
      <Table
        head={["Step", "What to select"]}
        rows={[
          ["1. Mode", "Validate a Detection (confirm an existing rule works) · Explore Coverage (see what should catch this technique) · Verify Telemetry Readiness (confirm logs are arriving)"],
          ["2. Target", "The specific detection, technique, or scenario, depending on the mode selected"],
          ["3. Environment", "Lab, Dev, or Prod, plus which registered runner executes the test"],
        ]}
      />
      <P>
        Selecting <strong>Prod</strong> opens a confirmation dialog. The run does not proceed without a
        written reason (10 or more characters). That reason is logged, so there is always a record of who ran
        what in production, and why. A test can also be run immediately or scheduled (see the{" "}
        <Link href="/install-guide/features/platform-tools" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>schedules guide</Link>).
      </P>
      <P>Free plans include 3 test runs per day. Paid plans are unlimited.</P>

      <H2 id="read-the-result">Read the result</H2>
      <P>
        PurveX tracks each run through four stages: Queued, Running, Ingesting, Validated. It then scores the
        result from 0 to 100 based on whether logs arrived, how quickly, whether the rule fired, and how
        quickly it fired.
      </P>
      <Table
        head={["Result", "Meaning"]}
        rows={[
          ["PASS", "The rule fired, on real telemetry, within an expected window"],
          ["FAIL", "Telemetry arrived, but the rule never fired"],
          ["Blind Spot", "No matching logs arrived at all: a telemetry gap, not a rule problem"],
        ]}
      />
      <P>
        The result page shows the evidence behind that score: telemetry status, whether the rule fired, the
        exact command that ran, and a sample of the raw SIEM events PurveX retrieved, not only a pass/fail
        badge.
      </P>

      <H2 id="coverage">See your coverage</H2>
      <P>
        <strong>MITRE Coverage</strong> (top-level nav). A heatmap with one column per tactic and one card per
        technique, color-coded by how well it is actually covered, not only whether a detection exists on
        paper:
      </P>
      <Table
        head={["Color", "Status"]}
        rows={[
          ["Green", "Validated: a linked detection has passed"],
          ["Amber", "At risk: linked and tested, but not currently passing"],
          ["Blue", "Linked: a detection is mapped but has never been run"],
          ["Gray", "Unmapped: nothing covers this technique"],
        ]}
      />
      <P>Filter by technique, status, or platform, select any card for its available tests, or export the full matrix as CSV.</P>
    </>
  );
}
