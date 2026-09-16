import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ports = [
  ["20/21", "FTP", "File transfer"],
  ["22", "SSH", "Secure remote login"],
  ["23", "Telnet", "Remote login (unencrypted)"],
  ["25", "SMTP", "Sending email"],
  ["53", "DNS", "Domain name lookups"],
  ["80", "HTTP", "Web traffic (unencrypted)"],
  ["443", "HTTPS", "Web traffic (encrypted)"],
  ["3389", "RDP", "Remote desktop"],
];

const filters = [
  ["http", "Just web traffic"],
  ['http.request.method == "POST"', "Just data being sent out"],
  ["ip.addr == <IP>", "Just one computer's traffic"],
];

const ciaRows = [
  ["Confidentiality", "Only authorized people/systems can access the data.", "Encryption, unauthorized traffic interception"],
  ["Integrity", "Data is accurate and hasn't been tampered with.", "Hashing, digital signatures, an altered file"],
  ["Availability", "Systems and data are reachable when needed.", "Redundancy/backups, a DDoS attack"],
];

const riskRows = [
  ["Vulnerability", "A weakness that could be exploited.", "Unpatched software, a misconfigured firewall, an open port"],
  ["Threat", "Something (or someone) that could exploit a vulnerability.", "A hacker, malware, an insider, a nation-state actor"],
  ["Risk", "The likelihood and impact of a threat actually exploiting a vulnerability.", "Risk = Threat × Vulnerability × Impact"],
];

const protocolRows = [
  ["HTTP/HTTPS", "How web pages load; HTTPS is the encrypted version."],
  ["DNS", "Translates names (google.com) into IP addresses."],
  ["DHCP", "Automatically hands out IP addresses to devices joining a network."],
  ["SMTP/POP3/IMAP", "Sending mail (SMTP) and pulling it down to a client (POP3/IMAP)."],
];

const govtechDepartments = [
  ["IT", "Runs and supports the company's technology. Only department with elevated access.", "No"],
  ["Compliance", "Ensures regulatory compliance (GLBA, SOX). Handles sensitive records and audit material.", "Yes"],
  ["Wealth Management", "Client-facing financial planning and advisory. Large volume of sensitive client data.", "Yes"],
  ["Operations", "Keeps day-to-day business running — settlements, internal processes.", "No"],
  ["Finance and Accounting", "Manages the organization's own internal finances.", "Yes"],
];

const govtechAccessLevels = [
  ["Level 1 — Domain Admin", "The Domain Controller and Active Directory itself.", "Nothing above it"],
  ["Level 2 — Server Admin", "Servers, application and file servers.", "The Domain Controller"],
  ["Level 3 — Helpdesk", "Workstations only, password resets, local support.", "Servers or the Domain Controller"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-6 sm:p-8">
      <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
      <div className="academy-prose mt-3">{children}</div>
    </section>
  );
}

export default function ReferencePage() {
  return (
    <div>
      <Link href="/academy" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Course overview
      </Link>

      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">Quick reference</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Cheat sheet
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
        The facts you'll want to look up mid-lab, pulled from the lessons into one page instead of
        scrolling back through a week you already finished.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <Section title="CIA Triad">
          <table>
            <thead>
              <tr><th>Property</th><th>Means</th><th>Example</th></tr>
            </thead>
            <tbody>
              {ciaRows.map((row) => (
                <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Risk, Threats & Vulnerabilities">
          <table>
            <thead>
              <tr><th>Term</th><th>Means</th><th>Example</th></tr>
            </thead>
            <tbody>
              {riskRows.map((row) => (
                <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <p>Simple analogy: a vulnerability is an unlocked door, a threat is a burglar in the neighborhood, and risk is the chance the burglar finds and uses that door — and what it costs you if they do. No vulnerability means no risk even if the threat exists; no threat means no risk even if the vulnerability exists.</p>
        </Section>

        <Section title="Common Ports">
          <table>
            <thead>
              <tr><th>Port</th><th>Protocol</th><th>Use</th></tr>
            </thead>
            <tbody>
              {ports.map((row) => (
                <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <p>Traffic on 22 or 3389 from somewhere it shouldn't be usually means someone is trying to <em>control</em> a machine, not just browse it.</p>
        </Section>

        <Section title="Protocols">
          <table>
            <thead><tr><th>Protocol</th><th>What it does</th></tr></thead>
            <tbody>
              {protocolRows.map((row) => (
                <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td></tr>
              ))}
            </tbody>
          </table>
          <p>A port narrows traffic down to a category. The protocol is the actual conversation happening inside that category.</p>
        </Section>

        <Section title="TCP Three-Way Handshake">
          <ol>
            <li><strong>SYN</strong> — "I'd like to connect."</li>
            <li><strong>SYN-ACK</strong> — "Okay, I'm ready too."</li>
            <li><strong>ACK</strong> — "Great, let's go."</li>
          </ol>
        </Section>

        <Section title="SSL/TLS">
          <p>SSL is the older name; TLS is the modern standard — people still say "SSL" out of habit. TLS wraps a connection in encryption so that even if someone captures the traffic, they see scrambled data instead of readable content.</p>
          <p>TLS does its own handshake — after TCP's three-way handshake sets up the <em>connection</em>, TLS's handshake sets up the <em>privacy</em>, agreeing on encryption keys before any real data moves. Two separate handshakes, back to back.</p>
        </Section>

        <Section title="Wireshark: Getting to a Verdict">
          <table>
            <thead><tr><th>Filter</th><th>Shows</th></tr></thead>
            <tbody>
              {filters.map((row) => (
                <tr key={row[0]}><td><code>{row[0]}</code></td><td>{row[1]}</td></tr>
              ))}
            </tbody>
          </table>
          <p>The single move that matters most: right-click any packet → <strong>Follow → HTTP Stream</strong> to reassemble the full exchange into something readable.</p>
        </Section>

        <Section title="Investigation Workflow">
          <p>The general shape of working through any capture, from the Network Forensics lab:</p>
          <ol>
            <li><strong>Orient yourself</strong> — packet count, time span, protocol hierarchy, list of external hosts.</li>
            <li><strong>Triage</strong> — separate signal from noise. Don't rule a host in or out on a single glance; look up anything unfamiliar (hostname, User-Agent, URI pattern) before deciding.</li>
            <li><strong>Focus on what's left</strong> — full URI, query parameters, GET vs. POST, anything that looks encoded.</li>
            <li><strong>Decode</strong> — URL-decode suspicious parameters and identify what's actually inside them.</li>
            <li><strong>Build a timeline</strong> — timestamps of the suspicious requests and what likely happened between them.</li>
            <li><strong>Write it up</strong> — an IOC table: victim host identifiers, C2 domain/gate path, exfil parameter name, and what data is being exfiltrated.</li>
          </ol>
        </Section>

        <Section title="Authentication, Authorization, Access Control">
          <ul>
            <li><strong>Authentication</strong> — proving who you are.</li>
            <li><strong>Authorization</strong> — what you're allowed to do once you're in.</li>
            <li><strong>Access control</strong> — the mechanism that enforces that boundary.</li>
          </ul>
          <p>The recurring failure mode: an app trusts something the client says about itself (a role field, a permission flag) instead of checking it server-side. If the client can edit it, it isn't a security control.</p>
        </Section>

        <Section title="GovTech Financial (Home Lab)">
          <p>The reference table the Home Lab tells you to come back to after every lab — every account and alert belongs to one of these departments.</p>
          <table>
            <thead><tr><th>Department</th><th>Function</th><th>Critical</th></tr></thead>
            <tbody>
              {govtechDepartments.map((row) => (
                <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <table className="mt-4">
            <thead><tr><th>Access Level</th><th>Controls</th><th>Cannot Touch</th></tr></thead>
            <tbody>
              {govtechAccessLevels.map((row) => (
                <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <p>Any time you see a Level 3 (Helpdesk) account attempting something that belongs to Level 1 (Domain Admin), that's your first real red flag. Full detail — the org chart, the user directory, data categories, the client workstation — lives on the <Link href="/academy/phase-1/home-lab-active-directory">Home Lab page</Link>.</p>
        </Section>
      </div>
    </div>
  );
}
