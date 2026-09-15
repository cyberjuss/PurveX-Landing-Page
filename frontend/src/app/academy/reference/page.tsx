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
          <p><strong>Risk = Threat × Vulnerability × Impact.</strong> No threat or no vulnerability means no risk, even if the other one exists.</p>
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

        <Section title="TCP Three-Way Handshake">
          <ol>
            <li><strong>SYN</strong> — "I'd like to connect."</li>
            <li><strong>SYN-ACK</strong> — "Okay, I'm ready too."</li>
            <li><strong>ACK</strong> — "Great, let's go."</li>
          </ol>
          <p>TCP's handshake sets up the <em>connection</em>. TLS then does its own separate handshake to set up <em>privacy</em> (encryption) before real data moves.</p>
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

        <Section title="Authentication, Authorization, Access Control">
          <ul>
            <li><strong>Authentication</strong> — proving who you are.</li>
            <li><strong>Authorization</strong> — what you're allowed to do once you're in.</li>
            <li><strong>Access control</strong> — the mechanism that enforces that boundary.</li>
          </ul>
          <p>The recurring failure mode: an app trusts something the client says about itself (a role field, a permission flag) instead of checking it server-side. If the client can edit it, it isn't a security control.</p>
        </Section>
      </div>
    </div>
  );
}
