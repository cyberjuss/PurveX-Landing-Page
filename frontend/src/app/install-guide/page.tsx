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
        PurveX connects to the SIEM your team already uses to collect and search security logs. It safely
        simulates real attack techniques and reports whether your detections actually caught them, backed by
        evidence rather than assumption. This guide covers the full setup in order: get the code, run one
        command, create an account, and run your first test.
      </Lede>
      <MetaRow>
        <span><Clock size={14} /> A few minutes</span>
        <span><Server size={14} /> Runs on one machine you control</span>
        <span><ShieldCheck size={14} /> Nothing leaves that machine</span>
      </MetaRow>

      <H2>Before you start</H2>
      <P>
        Install the following tools before you begin, or let the installer handle it: it checks for each
        one, and if Python, Node.js, or PostgreSQL is missing, it detects your OS, prints the exact command
        to install it, and offers to run that command for you once you confirm. PostgreSQL is the standard
        database for every install; the installer sets it up automatically and only asks you for a password.
      </P>
      <Table
        head={["Tool", "Version", "Check"]}
        rows={[
          ["Python", "3.11+", <code key="c">python --version</code>],
          ["Node.js", "20+", <code key="c">node --version</code>],
          ["npm", "9+", <code key="c">npm --version</code>],
          ["Git", "optional", <code key="c">git --version</code>],
        ]}
      />

      <H2>What runs on your machine</H2>
      <P>
        PurveX consists of three components running locally: a backend that performs the work, a web
        application you use in your browser, and a database that stores everything. No PurveX cloud service
        is involved at any point. The only outbound connection PurveX makes is to the SIEM you configure, and
        optionally to an AI provider if you enable the assistant.
      </P>
      <P>
        Continue to <Link href="/install-guide/installation" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>installation &rarr;</Link>
      </P>
    </>
  );
}
