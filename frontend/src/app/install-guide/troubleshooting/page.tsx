"use client";

import { Eyebrow, H1, Lede, Table } from "@/components/purvex-landing-page/docs-content";

const TROUBLESHOOTING: [string, string][] = [
  ["Login succeeds but bounces back to /login", "The browser is not retaining the session cookie. On plain localhost this should not occur. Behind a reverse proxy, it usually means HTTPS is not configured correctly on that proxy: the cookie is marked HTTPS-only but arrives over plain HTTP, so the browser drops it silently."],
  ["A test runs forever and never completes", "The background worker, the process that runs tests behind the scenes, is not running, or Redis is unreachable if one is configured. Check that worker's own log output for the specific error."],
  ["“Agent never comes online” after registering a runner", "Confirm the runner machine can reach the PurveX server over the network, and that its registration token has not expired. Tokens are single-use and valid only for a short window. On Windows, run the installer as administrator."],
  ["Setup keeps redirecting back after creating the admin account", "The browser is not accepting the session cookie PurveX just issued. This requires the same origin, and HTTPS if secure cookies are enabled. Clear cookies for the site and go to /login directly."],
  ["The test library never finishes installing", "Check that the server can reach GitHub over the internet. On an isolated network with no internet access, pre-stage the archive at the path set in PURVEX_ATOMIC_DATA_DIR instead."],
  ["SIEM “test connection” passes but no events show up", "The pattern PurveX looks for in your logs does not match what your SIEM is actually sending. Confirm the SIEM-side filter matches the connector's configured log_marker_pattern setting."],
  ["Encrypted data fails to read after restarting", "PURVEX_ENCRYPTION_KEY changed, or the original was lost. Restore the exact value set during installation. There is no way to recover that data without it."],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>Troubleshooting</H1>
      <Lede>The problems that occur most often during and immediately after installation, and what to check first.</Lede>

      <Table
        head={["Symptom", "First check"]}
        rows={TROUBLESHOOTING}
        variant="trouble"
      />
    </>
  );
}
