"use client";

import { Eyebrow, H1, Lede, H2, P, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Detections &amp; Detection-as-Code</H1>
      <Lede>Every detection PurveX validates against lives here: written by hand, synced from your SIEM, or kept in sync with a git repo.</Lede>

      <H2 id="the-detections-page">The Detections page</H2>
      <P>Three tabs: <strong>Review</strong> (the default queue, sorted into Telemetry missing, Needs tuning,
        Untested, and Ready), <strong>Library</strong> (a full searchable table), and <strong>Proposals</strong>{" "}
        (pending changes waiting on approval, more below).</P>
      <P>
        Each detection tracks a title, the SIEM query behind it, an optional MITRE technique, a lifecycle stage
        (Draft / Active / Needs improvement / Retired), an owner, and its trust history: last tested, last pass,
        last fail.
      </P>
      <P>
        There&apos;s no standalone &ldquo;new detection&rdquo; page. You author one from inside the Run Test
        wizard (Validate a Detection &rarr; New detection), or pull them in automatically the ways below.
      </P>

      <H2 id="siem-sync">Sync from your SIEM</H2>
      <P>
        A SIEM connection can pull its own detection rules directly into PurveX (<strong>Settings &rarr; SIEM
        &rarr; Sync</strong>). It&apos;s the fastest way to get your existing rule set in without writing anything
        by hand.
      </P>

      <H2 id="git-import">Import from git</H2>
      <P>
        <strong>Settings &rarr; Detection-as-Code &rarr; Import.</strong> Point PurveX at a git repo (HTTPS only
        today), a branch, and a path glob (default <code>detections/**/*.yml</code>). Hit{" "}
        <strong>Sync now</strong> and it creates or updates matching detections.
      </P>
      <P>
        If a file changed upstream in a way that conflicts with an edit someone made locally, PurveX won&apos;t
        silently overwrite it. It opens a proposal instead (see below).
      </P>

      <H2 id="git-export">Export / audit mirror</H2>
      <P>
        <strong>Settings &rarr; Detection-as-Code &rarr; Export / Audit.</strong> The reverse direction, and
        strictly one-way. Link a SIEM connection to a git repo, and every rule change picked up by a SIEM sync gets
        auto-committed there: a running, human-readable record of what your SIEM&apos;s detections looked like
        over time. A mirror never reads the repo back.
      </P>

      <H2 id="proposals">Proposals</H2>
      <P>
        Some changes shouldn&apos;t apply themselves: a conflicting git sync, a fix Watchtower suggests, an
        analyst&apos;s manual edit to a git-sourced detection. All of these land in{" "}
        <strong>Detections &rarr; Proposals</strong> as a diff, tagged with who or what proposed it. An admin
        approves or rejects each one. Nothing is applied without that step.
      </P>

      <Callout tone="info">
        Import and export are independent. A repo you import detections from isn&apos;t automatically also
        where changes get exported to. Set both up if you want two-way visibility.
      </Callout>
    </>
  );
}
