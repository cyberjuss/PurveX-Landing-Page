"use client";

import { Eyebrow, H1, Lede, Table } from "@/components/purvex-landing-page/docs-content";

const TROUBLESHOOTING: [string, string][] = [
  ["Login succeeds but bounces back to /login", "A cookie isn't being set. On plain localhost this shouldn't happen; behind a reverse proxy it means TLS isn't terminating correctly — Secure cookies are set but never sent over plain HTTP."],
  ["A test runs forever, never completes", "The background worker isn't running, or Redis is unreachable (if you've configured one). Check the arq worker's own log output for the specific error."],
  ["“Agent never comes online” after registering a runner", "Confirm outbound connectivity from the endpoint back to the PurveX API, and that the registration token hasn't expired — tokens are single-use and short-lived. On Windows, run the installer as administrator."],
  ["/setup keeps redirecting back after creating the admin", "Confirm the browser actually accepted the session cookie (same origin; HTTPS if you've set secure cookies). Clear cookies for the site and try /login directly."],
  ["Atomic catalog never installs", "Check the server's outbound access to GitHub. If you're air-gapped, pre-stage the archive at the path set in PURVEX_ATOMIC_DATA_DIR instead."],
  ["SIEM “test connection” passes but events never arrive", "A marker-pattern mismatch — confirm the SIEM-side filter matches the connector's configured log_marker_pattern."],
  ["Encrypted fields fail to read after restarting", "PURVEX_ENCRYPTION_KEY changed or was lost. Restore the original value from installation — there's no way to recover encrypted rows without it."],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>Troubleshooting</H1>
      <Lede>The problems that come up most often during and right after install.</Lede>

      <Table
        head={["Symptom", "First check"]}
        rows={TROUBLESHOOTING}
        variant="trouble"
      />
    </>
  );
}
