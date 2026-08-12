"use client";

import { Eyebrow, H1, Lede, H2, P, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Detections &amp; Detection-as-Code</H1>
      <Lede>Every detection PurveX validates against lives here: written by hand, synced from your SIEM, or kept in sync with a git repository.</Lede>

      <H2 id="the-detections-page">The Detections page</H2>
      <P>Three tabs: <strong>Review</strong> (the default queue, sorted into Telemetry missing, Needs tuning,
        Untested, and Ready), <strong>Library</strong> (a full searchable table), and <strong>Proposals</strong>{" "}
        (pending changes awaiting approval, described below).</P>
      <P>
        Each detection tracks a title, the SIEM query behind it, an optional MITRE technique, a lifecycle stage
        (Draft / Active / Needs improvement / Retired), an owner, and its trust history: last tested, last pass,
        last fail.
      </P>
      <P>
        There is no standalone &ldquo;new detection&rdquo; page. Author one from inside the Run Test
        wizard (Validate a Detection &rarr; New detection), or bring them in automatically using the methods
        below.
      </P>

      <H2 id="siem-sync">Sync from your SIEM</H2>
      <P>
        A SIEM connection can pull its own detection rules directly into PurveX (<strong>Settings &rarr; SIEM
        &rarr; Sync</strong>). This is the fastest way to bring in an existing rule set without authoring
        anything by hand.
      </P>

      <Callout tone="info">
        <strong>Detection-as-Code is a paid-plan feature.</strong> Manual authoring and SIEM sync above are free on
        every plan. Git import and export, below, require a paid license.
      </Callout>

      <H2 id="git-import">Import from git</H2>
      <P>
        <strong>Settings &rarr; Detection-as-Code &rarr; Import.</strong> Point PurveX at a git repository (HTTPS
        only today), a branch, and a path glob (default <code>detections/**/*.yml</code>). Select{" "}
        <strong>Sync now</strong> to create or update matching detections.
      </P>
      <P>
        If a file changed upstream in a way that conflicts with a local edit, PurveX does not overwrite it
        silently. It opens a proposal instead (see below).
      </P>

      <H2 id="git-export">Export / audit mirror</H2>
      <P>
        <strong>Settings &rarr; Detection-as-Code &rarr; Export / Audit.</strong> The reverse direction, and
        strictly one-way. Link a SIEM connection to a git repository, and every rule change picked up by a SIEM
        sync is committed there automatically: a running, human-readable record of what your SIEM&apos;s
        detections looked like over time. A mirror never reads the repository back.
      </P>

      <H2 id="proposals">Proposals</H2>
      <P>
        Some changes should not apply themselves: a conflicting git sync, a fix Watchtower suggests, or an
        analyst&apos;s manual edit to a git-sourced detection. All of these land in{" "}
        <strong>Detections &rarr; Proposals</strong> as a diff, tagged with who or what proposed it. An
        administrator approves or rejects each one. Nothing is applied without that step.
      </P>

      <Callout tone="info">
        Import and export are independent. A repository detections are imported from is not automatically the
        same repository changes are exported to. Configure both if two-way visibility is required.
      </Callout>
    </>
  );
}
