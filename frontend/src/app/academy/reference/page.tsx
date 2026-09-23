"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Check,
  ClipboardList,
  Copy,
  Handshake,
  KeyRound,
  Lock,
  Network,
  Search,
  Shield,
  Waypoints,
  X,
  type LucideIcon,
} from "lucide-react";

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
  ["Confidentiality", "The vault door — only badge holders get in.", "A phone lock, encryption, intercepted traffic"],
  ["Integrity", "The cash-bag seal — break it and everyone knows.", "A torn package seal, hashing, an altered file"],
  ["Availability", "Posted hours — open when customers need the branch.", "A site that loads, backups, a DDoS"],
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
  ["Operations", "Keeps day-to-day business running, settlements, internal processes.", "No"],
  ["Finance and Accounting", "Manages the organization's own internal finances.", "Yes"],
];

const govtechAccessLevels = [
  ["Level 1 — Domain Admin", "The Domain Controller and Active Directory itself.", "Nothing above it"],
  ["Level 2 — Server Admin", "Servers, application and file servers.", "The Domain Controller"],
  ["Level 3 — Helpdesk", "Workstations only, password resets, local support.", "Servers or the Domain Controller"],
];

interface RefItem {
  id: string;
  title: string;
  icon: LucideIcon;
  keywords: string;
  body: React.ReactNode;
}

interface RefCategory {
  label: string;
  items: RefItem[];
}

const categories: RefCategory[] = [
  {
    label: "Fundamentals",
    items: [
      {
        id: "cia-triad",
        title: "CIA Triad",
        icon: Shield,
        keywords: "confidentiality integrity availability encryption hashing ddos backup",
        body: (
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
        ),
      },
      {
        id: "risk-threats-vulnerabilities",
        title: "Risk, Threats & Vulnerabilities",
        icon: AlertTriangle,
        keywords: "risk threat vulnerability unpatched firewall hacker malware insider nation-state",
        body: (
          <>
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
            <div className="academy-analogy">
              <span className="academy-analogy__tag">Think of it like a house on the block</span>
              <p>
                A <strong>vulnerability</strong> is an unlocked door. A <strong>threat</strong> is a
                burglar in the neighborhood. <strong>Risk</strong> is the chance the burglar finds and
                uses that door, and what it costs you if they do. No vulnerability means no risk even
                if the threat exists. No threat means no risk even if the vulnerability exists.
              </p>
            </div>
          </>
        ),
      },
      {
        id: "authentication-authorization-access-control",
        title: "Authentication, Authorization, Access Control",
        icon: KeyRound,
        keywords: "authentication authorization access control aaa broken access control role permission",
        body: (
          <>
            <ul>
              <li><strong>Authentication</strong> — proving who you are.</li>
              <li><strong>Authorization</strong> {"— what you are allowed to do once you are in."}</li>
              <li><strong>Access control</strong> — the mechanism that enforces that boundary.</li>
            </ul>
            <p>
              {"The recurring failure is an app that trusts what the client says about itself, such as a role field or a permission flag, instead of checking it server-side. If the client can edit it, it is not a security control."}
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: "Networking",
    items: [
      {
        id: "common-ports",
        title: "Common Ports",
        icon: Network,
        keywords: "port ftp ssh telnet smtp dns http https rdp 443 22 80 3389",
        body: (
          <>
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
            <p>
              {"Traffic on 22 or 3389 from somewhere it should not be usually means someone is trying to "}
              <em>control</em>
              {" a machine, not just browse it."}
            </p>
          </>
        ),
      },
      {
        id: "protocols",
        title: "Protocols",
        icon: Waypoints,
        keywords: "http https dns dhcp smtp pop3 imap protocol",
        body: (
          <>
            <table>
              <thead><tr><th>Protocol</th><th>What it does</th></tr></thead>
              <tbody>
                {protocolRows.map((row) => (
                  <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td></tr>
                ))}
              </tbody>
            </table>
            <p>A port narrows traffic down to a category. The protocol is the actual conversation happening inside that category.</p>
          </>
        ),
      },
      {
        id: "tcp-handshake",
        title: "TCP Three-Way Handshake",
        icon: Handshake,
        keywords: "syn ack synack tcp handshake connection reliable phone call",
        body: (
          <div className="academy-analogy">
            <span className="academy-analogy__tag">Think of it like a phone call</span>
            <ul>
              <li><strong>SYN</strong> {'— Computer A: "I would like to connect."'}</li>
              <li><strong>SYN-ACK</strong> {'— Computer B: "Understood, I am ready too."'}</li>
              <li><strong>ACK</strong> {'— Computer A: "Good, let us proceed."'}</li>
            </ul>
          </div>
        ),
      },
      {
        id: "ssl-tls",
        title: "SSL/TLS",
        icon: Lock,
        keywords: "ssl tls encryption handshake privacy key",
        body: (
          <>
            <p>
              {'SSL is the older name and TLS is the modern standard, though people still say "SSL" out of habit. TLS wraps a connection in encryption, so anyone who captures the traffic sees scrambled data instead of readable content.'}
            </p>
            <p>
              {"TCP's three-way handshake sets up the "}
              <em>connection</em>
              {". TLS then does its own handshake to set up the "}
              <em>privacy</em>
              {": agreeing on encryption keys before any real data moves. Two separate handshakes, back to back."}
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: "Investigation",
    items: [
      {
        id: "wireshark-verdict",
        title: "Wireshark: Getting to a Verdict",
        icon: Search,
        keywords: "wireshark filter http post follow stream packet capture",
        body: (
          <>
            <table>
              <thead><tr><th>Filter</th><th>Shows</th></tr></thead>
              <tbody>
                {filters.map((row) => (
                  <tr key={row[0]}>
                    <td>
                      <span className="inline-flex flex-wrap items-center gap-1">
                        <code>{row[0]}</code>
                        <CopyButton text={row[0]} />
                      </span>
                    </td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              {"The single move that matters most: right-click any packet → "}
              <strong>Follow → HTTP Stream</strong>
              {" to reassemble the full exchange into something readable."}
            </p>
          </>
        ),
      },
      {
        id: "investigation-workflow",
        title: "Investigation Workflow",
        icon: ClipboardList,
        keywords: "orient triage decode timeline ioc write-up network forensics workflow",
        body: (
          <>
            <p>The general shape of working through any capture, from the Network Forensics lab:</p>
            <ol>
              <li><strong>Orient yourself</strong> — packet count, time span, protocol hierarchy, list of external hosts.</li>
              <li>
                <strong>Triage</strong>
                {" — separate signal from noise. Do not rule a host in or out at a glance. Look up anything unfamiliar before deciding, such as a hostname, User-Agent, or URI pattern."}
              </li>
              <li><strong>Focus on what&apos;s left</strong> — full URI, query parameters, GET vs. POST, anything that looks encoded.</li>
              <li><strong>Decode</strong> — URL-decode suspicious parameters and identify what&apos;s actually inside them.</li>
              <li><strong>Build a timeline</strong> — timestamps of the suspicious requests and what likely happened between them.</li>
              <li><strong>Write it up</strong> — an IOC table: victim host identifiers, C2 domain/gate path, exfil parameter name, and what data is being exfiltrated.</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    label: "Home Lab",
    items: [
      {
        id: "govtech-financial",
        title: "GovTech Financial (Home Lab)",
        icon: Building2,
        keywords: "govtech financial department access level domain admin server helpdesk it compliance wealth management operations finance",
        body: (
          <>
            <p>The reference table the Home Lab tells you to come back to after every lab. Every account and alert belongs to one of these departments.</p>
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
            <p>
              {"Any time you see a Level 3 (Helpdesk) account attempting something that belongs to Level 1 (Domain Admin), that is your first real red flag. Full detail lives on the "}
              <Link href="/academy/phase-1/home-lab-active-directory">Home Lab page</Link>.
            </p>
          </>
        ),
      },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied or unavailable -- nothing to fall back to.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`ml-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition ${
        copied
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-[var(--pvrx-border-light)] text-slate-500 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section id={id} className="academy-ref-section ax-refsec scroll-mt-24">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-[var(--rd-accent)]" />
        <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="academy-prose mt-3">{children}</div>
    </section>
  );
}

export default function ReferencePage() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const q = query.trim().toLowerCase();

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => !q || item.title.toLowerCase().includes(q) || item.keywords.includes(q)),
    }))
    .filter((cat) => cat.items.length > 0);

  const visibleItems = filteredCategories.flatMap((c) => c.items);

  // Highlights whichever section is currently at the top of the viewport,
  // so the sidebar tracks scroll position the way the rest of the academy's
  // nav does. rootMargin shrinks the bottom 70% of the viewport out of the
  // observed area, so a section only counts as "active" once it's actually
  // near the top, not just barely visible at the bottom.
  useEffect(() => {
    if (visibleItems.length === 0) return;
    setActiveId((current) => (visibleItems.some((i) => i.id === current) ? current : visibleItems[0].id));

    // A callback's `entries` are only the elements whose state just changed,
    // not every observed element -- during a fast scroll (e.g. jumping to a
    // nav link near the bottom), picking the topmost of just that batch can
    // land on a section that already scrolled past. Tracking the full
    // intersecting set and re-measuring it each time is what makes this
    // hold up under a jump, not just a slow scroll.
    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        let topMostId: string | null = null;
        let topMostY = Infinity;
        for (const id of intersecting) {
          const top = document.getElementById(id)?.getBoundingClientRect().top;
          if (top !== undefined && top < topMostY) {
            topMostY = top;
            topMostId = id;
          }
        }
        if (topMostId) setActiveId(topMostId);
      },
      { rootMargin: "-160px 0px -70% 0px", threshold: 0 }
    );
    const elements = visibleItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));

    // The last section can be too short to ever reach the "near top" band
    // once you've scrolled as far as the page allows -- there's no more
    // content below it to push it up there. Forcing the last item active
    // once you hit the bottom of the page covers that case directly.
    function checkBottom() {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) setActiveId(visibleItems[visibleItems.length - 1].id);
    }
    window.addEventListener("scroll", checkBottom, { passive: true });
    checkBottom();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkBottom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-observe only when the filtered id set changes
  }, [visibleItems.map((i) => i.id).join(",")]);

  return (
    <div className="rd">
      <header className="rd-mast">
        <div className="rd-meta">
          <span>Appendix</span>
        </div>
        <div className="ax-titleblock">
          <h1>Cheat sheet</h1>
          <p>
            The facts you&apos;ll want to look up mid-lab, pulled from the lessons into one page instead of scrolling back
            through a week you already finished.
          </p>
        </div>
      </header>

      <div className="sticky top-[65px] z-10 -mx-4 bg-[var(--pvrx-bg-light)] px-4 pb-2 pt-6 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="ax-search">
          <Search className="h-4 w-4 shrink-0 text-[var(--rd-ink-3)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the cheat sheet…"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-[var(--rd-ink-3)]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Desktop only -- on mobile there's no room for a side column, and
            the category headings inline in the content below do the same
            job of orienting you as you scroll. */}
        <nav aria-label="Cheat sheet sections" className="ax-refnav hidden shrink-0 lg:sticky lg:top-[150px] lg:block lg:w-[200px]">
          {filteredCategories.map((cat) => (
            <div key={cat.label} className="mb-6 last:mb-0">
              <p className="rd-kicker mb-2">{cat.label}</p>
              <ul>
                {cat.items.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className={activeId === item.id ? "ax-refnav--on" : ""}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {filteredCategories.length === 0 ? (
            <p className="border-t border-[var(--rd-line)] pt-4 text-sm text-[var(--rd-ink-3)]">
              {`No matches for "${query}".`}
            </p>
          ) : (
            <div className="flex flex-col gap-10">
              {filteredCategories.map((cat) => (
                <div key={cat.label}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 lg:hidden">
                    {cat.label}
                  </h2>
                  <div className="mt-4 flex flex-col gap-6 lg:mt-0">
                    {cat.items.map((item) => (
                      <Section key={item.id} id={item.id} title={item.title} icon={item.icon}>
                        {item.body}
                      </Section>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
