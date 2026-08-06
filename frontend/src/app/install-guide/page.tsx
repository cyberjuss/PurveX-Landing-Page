"use client";

import Link from "next/link";
import { Clock, Server, ShieldCheck } from "lucide-react";
import { Eyebrow, H1, Lede, MetaRow, H2, P, Table } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Install guide</Eyebrow>
      <H1>Get PurveX running on your own machine</H1>
      <Lede>
        PurveX connects to your SIEM, the tool your team already uses to collect and search security logs. It
        safely simulates real attack techniques and tells you whether your detections actually caught them. No
        guesswork, just evidence. This guide walks through the whole setup in order: get the code, run one command,
        create your account, and run your first test.
      </Lede>
      <MetaRow>
        <span><Clock size={14} /> A few minutes</span>
        <span><Server size={14} /> Runs on one machine you control</span>
        <span><ShieldCheck size={14} /> Nothing leaves that machine</span>
      </MetaRow>

      <H2>Before you start</H2>
      <P>You&apos;ll need these installed first. The setup script checks for them too, but confirming now saves a false start later. No database install needed: PurveX stores its data in a local file by default.</P>
      <Table
        head={["Tool", "Version", "Check"]}
        rows={[
          ["Python", "3.11+", <code key="c">python --version</code>],
          ["Node.js", "20+", <code key="c">node --version</code>],
          ["npm", "9+", <code key="c">npm --version</code>],
          ["Git", "optional", <code key="c">git --version</code>],
        ]}
      />

      <H2>What&apos;s actually running on your machine</H2>
      <P>
        PurveX is three pieces working together, all running locally: a backend that does the work, a web app
        you&apos;ll use in your browser, and a database that stores everything. There&apos;s no PurveX cloud
        service involved anywhere. The only outside connection it makes is to the SIEM you point it at, and
        optionally an AI provider if you choose to turn on the assistant.
      </P>
      <P>
        Ready? <Link href="/install-guide/installation" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>Start with installation &rarr;</Link>
      </P>
    </>
  );
}
