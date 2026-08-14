"use client";

import { Eyebrow, H1, Lede } from "@/components/purvex-landing-page/docs-content";

const FAQ: [string, string][] = [
  ["Is PurveX a replacement for my SIEM?", "No. PurveX reads from your SIEM; it does not replace it. Splunk, Elastic, Sentinel, or a similar platform must already be in place for PurveX to be useful."],
  ["Is it safe to run against production?", "Yes, by design. The attack simulations PurveX runs, drawn from the Atomic Red Team library, are scoped and reversible. Running against production requires Administrator access plus a written reason for every run, and every run is logged so there is always a record of who ran what and why."],
  ["Does the AI assistant send my data to third parties?", "Only if you choose to connect one, OpenAI or DeepSeek. Leave OPENAI_API_KEY blank during installation and the assistant is disabled: nothing is sent anywhere, and no other part of the product changes."],
  ["Can one install serve multiple teams or clients?", "Yes. PurveX supports multiple organizations on a single install, fully isolated from one another. The same person can hold different roles across different organizations."],
  ["Do I need to install PostgreSQL myself?", "No. The installer detects your OS, installs PostgreSQL, creates a dedicated role and database, and applies the schema automatically. The only thing you're asked for is a password. This runs for every install, not just larger deployments."],
  ["Do I need Redis for a local install?", "No. Redis is needed only for the rate limiting and job queue behind larger, multi-server production deployments. A single-machine install works without it. Set REDIS_URL only if you are specifically testing that setup."],
  ["What happens if I lose PURVEX_ENCRYPTION_KEY?", "Everything it protects, including SIEM credentials and source tokens, becomes permanently unreadable. There is no way to recover it besides restoring the original key, so back it up before connecting any real credentials."],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>FAQ</H1>
      <Lede>Questions that come up most often during installation, before the product has been used yet.</Lede>

      <div>
        {FAQ.map(([q, a]) => (
          <div className="dc-faq__item" key={q}>
            <p className="dc-faq__q">{q}</p>
            <p className="dc-faq__a">{a}</p>
          </div>
        ))}
      </div>
    </>
  );
}
