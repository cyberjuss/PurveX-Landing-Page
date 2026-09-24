"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Gauge, Headset, Linkedin, Mic, Star } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";

const ALERTS = [
  { title: "Suspicious service account", sev: "High", time: "02:11", id: "4624", acct: "svc-payroll", host: "FIN-WKS14" },
  { title: "Dormant account reactivated", sev: "High", time: "03:42", id: "4722", acct: "old.vendor", host: "DC02" },
  { title: "Disabled account used", sev: "High", time: "08:16", id: "4625", acct: "n.okonkwo", host: "VPN-GW02" },
  { title: "After-hours share copy", sev: "High", time: "01:27", id: "5145", acct: "m.chen", host: "FS-FIN02" },
  { title: "USB data transfer", sev: "Med", time: "16:51", id: "4663", acct: "l.hoffman", host: "HR-WKS22" },
  { title: "Large outbound file move", sev: "Crit", time: "23:08", id: "5140", acct: "s.nguyen", host: "FS-CORE01" },
  { title: "User added to Domain Admins", sev: "Crit", time: "11:33", id: "4728", acct: "j.patel", host: "DC01" },
  { title: "Help desk added a privileged group", sev: "High", time: "14:06", id: "4732", acct: "helpdesk-tmp", host: "DC01" },
  { title: "Nested group privilege grant", sev: "High", time: "09:18", id: "4728", acct: "d.reyes", host: "DC02" },
];

const CASES = [
  {
    id: "INC-2281",
    sev: "High",
    status: "Open",
    title: "Suspicious account",
    fields: [
      { k: "Account", v: "svc-payroll" },
      { k: "Host", v: "FIN-WKS14" },
      { k: "Seen", v: "02:11" },
      { k: "Event", v: "4624" },
    ],
    body: "A service account signed in interactively from a finance workstation. That account has no keyboard history.",
    ask: "Prove whether this account should ever sit at a desk.",
  },
  {
    id: "INC-3310",
    sev: "High",
    status: "Open",
    title: "Data transferred",
    fields: [
      { k: "Account", v: "m.chen" },
      { k: "Share", v: "FS-FIN02\\Close" },
      { k: "Volume", v: "18.4 GB" },
      { k: "Dest", v: "USB device" },
    ],
    body: "Finance close files left the share in one burst after hours.",
    ask: "Confirm the destination before you treat it as backup.",
  },
  {
    id: "INC-4417",
    sev: "Crit",
    status: "Open",
    title: "Added to a group",
    fields: [
      { k: "Account", v: "j.patel" },
      { k: "Group", v: "Domain Admins" },
      { k: "By", v: "helpdesk-tmp" },
      { k: "DC", v: "DC01" },
    ],
    body: "A help desk account added a user to Domain Admins. No change ticket on file.",
    ask: "The group change is the incident. Find who approved the add.",
  },
];

function pickPair(avoid: string[] = []) {
  const pool = ALERTS.filter((a) => !avoid.includes(a.title));
  const src = pool.length >= 2 ? pool : ALERTS;
  const first = src[Math.floor(Math.random() * src.length)];
  const rest = src.filter((a) => a.title !== first.title);
  const second = rest[Math.floor(Math.random() * rest.length)];
  return [first, second];
}

function CaseCard() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % CASES.length), 4200);
    return () => window.clearInterval(id);
  }, []);

  const item = CASES[i];

  return (
    <div className="hp-case">
      <span className="hp-case__stack" aria-hidden />
      <span className="hp-case__stack hp-case__stack--2" aria-hidden />
      <article key={item.id} className="hp-ticket">
        <header className="hp-ticket__bar">
          <span>{item.id}</span>
          <span data-sev={item.sev}>{item.sev}</span>
          <span>{item.status}</span>
        </header>
        <div className="hp-ticket__sheet">
          <h2>{item.title}</h2>
          <dl className="hp-ticket__grid">
            {item.fields.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
          <p className="hp-ticket__body">{item.body}</p>
          <p className="hp-ticket__ask">{item.ask}</p>
        </div>
      </article>
    </div>
  );
}

function AlertDock() {
  const [rows, setRows] = useState(() => [ALERTS[0], ALERTS[1]]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const next = () => {
      setRows((cur) => pickPair(cur.map((r) => r.title)));
      setTick((n) => n + 1);
    };
    next();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(next, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hp-dock">
      <p>
        <span className="hp-dock__live" /> Queue
      </p>
      {rows.map((row, idx) => (
        <div key={`${tick}-${row.title}-${idx}`} className="hp-dock__row">
          <strong>{row.title}</strong>
          <em data-sev={row.sev}>{row.sev}</em>
          <span>{row.time}</span>
          <span>{row.id}</span>
          <span>{row.acct}</span>
          <span>{row.host}</span>
        </div>
      ))}
    </div>
  );
}

const charges = [
  {
    n: "01",
    title: "Unproven detections",
    body: "The rules are in. Nobody has shown they fire.",
  },
  {
    n: "02",
    title: "Exam-only training",
    body: "Students leave with terms. Employers want investigation.",
  },
  {
    n: "03",
    title: "Assumed coverage",
    body: "If it has not been tested, you do not know what it covers.",
  },
];

export default function HomePage() {
  return (
    <SiteChrome active="home">
      <section className="hp-hero">
        <div className="hp-hero__copy">
          <span className="sp-tag">Security operations and training</span>
          <h1 className="hp-hero__h1">Improve detections and train analysts</h1>
          <p className="hp-hero__sub">
            Lean security teams and academies that need hands-on work. SIEM engineering, live lab tickets, and PurveX Coach included.
          </p>
          <div className="hp-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Get in Touch <ArrowRight size={16} />
            </a>
            <a href="#what-we-offer" className="sp-btn sp-btn--ghost sp-btn--lg">
              See what we offer
            </a>
          </div>
        </div>

        <aside className="hp-floor" aria-hidden="true">
          <div className="hp-floor__wash" />
          <CaseCard />
          <AlertDock />
        </aside>
      </section>

      <section className="hp-section">
        <div className="hp-see" data-r>
          <div className="hp-see__intro">
            <span className="sp-tag">In the field</span>
            <h2>What we see</h2>
            <p>Short-staffed teams, and programs that need graduates ready for a queue.</p>
          </div>
          <ol className="hp-see__grid">
            {charges.map((c) => (
              <li key={c.n}>
                <span>{c.n}</span>
                <strong>{c.title}</strong>
                <p>{c.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hp-section">
        <div className="hp-perk" data-r>
          <div className="hp-perk__copy">
            <p className="hp-perk__kicker">The perk</p>
            <h2>Coach that makes a Tier 1</h2>
            <p>
              Coach trains a Tier 1 help desk and junior SOC analyst. It reads their live directory, their readiness, and a screenshot of the console. It never hands over the answer.
            </p>
            <Link href="/cybersecurity-training" className="hp-perk__go">
              See Coach with training <ArrowRight size={16} />
            </Link>
          </div>
          <aside className="hp-perk__stage" aria-hidden="true">
            <div className="hp-case">
              <span className="hp-case__stack" />
              <span className="hp-case__stack hp-case__stack--2" />
              <article className="hp-ticket">
                <header className="hp-ticket__bar">
                  <span>INC-5520</span>
                  <span data-sev="High">High</span>
                  <span>Coach</span>
                </header>
                <div className="hp-ticket__sheet">
                  <h2>Locked Out</h2>
                  <dl className="hp-ticket__grid">
                    <div><dt>Account</dt><dd>a.okonkwo</dd></div>
                    <div><dt>Host</dt><dd>FIN-WKS08</dd></div>
                    <div><dt>Seen</dt><dd>07:14</dd></div>
                    <div><dt>Event</dt><dd>4740</dd></div>
                  </dl>
                  <p className="hp-ticket__body">A finance user cannot sign in. Coach is in Need help, reading this ticket with the student.</p>
                  <p className="hp-ticket__ask">Stay on the Account tab. Say whether it is locked or disabled.</p>
                </div>
              </article>
            </div>
            <div className="hp-dock">
              <p>
                <span className="hp-dock__live" /> Coach
              </p>
              <div className="hp-dock__row">
                <strong>Next click</strong>
                <em data-sev="High">Help</em>
                <span>07:14</span>
                <span>4740</span>
                <span>Account tab</span>
                <span>FIN-WKS08</span>
              </div>
              <div className="hp-dock__row">
                <strong>Check before you change it</strong>
                <em data-sev="High">Check</em>
                <span>07:14</span>
                <span>4740</span>
                <span>Locked or disabled</span>
                <span>FIN-WKS08</span>
              </div>
            </div>
          </aside>
          <ol className="hp-perk__cards">
            <li>
              <header>
                <span>01</span>
                <span className="hp-perk__ico"><Gauge size={15} /></span>
              </header>
              <strong>Readiness</strong>
              <p>Are they ready for the job? A score, four skills, and the job tasks already proven in their lab.</p>
            </li>
            <li>
              <header>
                <span>02</span>
                <span className="hp-perk__ico"><CalendarDays size={15} /></span>
              </header>
              <strong>Daily drill</strong>
              <p>One scenario each day from their own directory. A weekly CTF on their Security log.</p>
            </li>
            <li>
              <header>
                <span>03</span>
                <span className="hp-perk__ico"><Headset size={15} /></span>
              </header>
              <strong>Four modes</strong>
              <p>Need help, Mentor, or Interview. Upload a screenshot when the console is the question.</p>
            </li>
            <li>
              <header>
                <span>04</span>
                <span className="hp-perk__ico"><Mic size={15} /></span>
              </header>
              <strong>Hire</strong>
              <p>Resume lines from tickets they closed. A spoken mock interview with a hire signal.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="hp-section" id="what-we-offer">
        <div className="hp-head" data-r>
          <span className="sp-tag">What we offer</span>
          <h2>What we do</h2>
          <p>Training with PurveX Coach included, operations support, and a validation product still in development.</p>
        </div>

        <div className="hp-deck" data-r>
          <article className="hp-tile hp-tile--lead">
            <div className="hp-tile__stub">
              <span>01</span>
              <span>Includes Coach</span>
            </div>
            <h3>Cybersecurity Training</h3>
            <p>
              Graduates who can work a ticket. GovTech Financial, a live instructor, and PurveX Coach on the desk. AD, SIEM, and incident response. Nobody waits for office hours.
            </p>
            <div className="hp-tile__split">
              <div>
                <p className="hp-tile__label">The program</p>
                <ul>
                  <li>Live tickets on a real directory</li>
                  <li>Daily drills and a weekly CTF</li>
                  <li>Readiness score and proven job tasks</li>
                  <li>Curriculum shaped around your tools</li>
                </ul>
              </div>
              <div>
                <p className="hp-tile__label">PurveX Coach</p>
                <ul>
                  <li>Desk SME trained to make a Tier 1</li>
                  <li>Need help, Mentor, and a spoken interview</li>
                  <li>Reads a screenshot of their console</li>
                  <li>Resume lines from tickets they closed</li>
                </ul>
              </div>
            </div>
            <Link href="/cybersecurity-training" className="sp-btn sp-btn--prim sp-btn--sm">
              See the curriculum <ArrowRight size={15} />
            </Link>
          </article>

          <article className="hp-tile hp-tile--ops">
            <div className="hp-tile__stub">
              <span>02</span>
              <span>Operations</span>
            </div>
            <h3>Security Operations</h3>
            <p>We tune your SIEM, write the detections you are missing, and test whether they fire.</p>
            <ul>
              <li>SIEM and detection engineering</li>
              <li>Optimization and assessments</li>
              <li>Detection validation</li>
            </ul>
            <Link href="/security-operations" className="hp-tile__link">
              See how we help <ArrowRight size={14} />
            </Link>
          </article>

          <article className="hp-tile hp-tile--labs">
            <div className="hp-tile__stub">
              <span>03</span>
              <span>In development</span>
            </div>
            <h3>PurveX Labs</h3>
            <p>
              Scheduled detection tests, with the evidence kept.
              <br />
              Private development.
            </p>
            <Link href="/platform" className="hp-tile__link hp-tile__link--light">
              Request early access <ArrowRight size={14} />
            </Link>
          </article>
        </div>
      </section>

      <section className="hp-voice-wrap">
        <figure className="hp-voice" data-r>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kenneth.jpg" alt="Kenneth Ellington" />
          <figcaption>
            <span className="sp-tag">Cybersecurity Training</span>
            <blockquote>
              Hands down one of the best services. Our students now work in tech, running their own SOC projects thanks to real hands-on experience.
            </blockquote>
            <div className="hp-voice__who">
              <strong>Kenneth Ellington</strong>
              <span>Cybersecurity Coach + Instructor, Ellington Cyber Academy</span>
              <span className="hp-voice__stars" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} />
                ))}
              </span>
              <a href="https://www.linkedin.com/in/kenneth-ellington/" target="_blank" rel="noreferrer">
                <Linkedin size={13} /> LinkedIn
              </a>
            </div>
          </figcaption>
        </figure>
      </section>

      <section className="hp-close" data-r>
        <div className="hp-close__copy">
          <p className="hp-close__kicker">Next step</p>
          <h2>Talk with us</h2>
          <p className="hp-close__sub">Thirty minutes covers detections, the training desk, or Labs.</p>
          <div className="hp-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="hp-close__book">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/about" className="hp-close__more">
              About PurveX <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="home" />
      </section>

      <style>{HP_CSS}</style>
    </SiteChrome>
  );
}

const HP_CSS = `
.hp-floor, .hp-tile--labs, .hp-close, .hp-perk {
  --hp-dark: #3d32b0;
  --hp-deep: #2a2280;
  --hp-mist: #eef0ff;
  --hp-line: rgba(238,240,255,.16);
}
.hp-hero {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .95fr);
  gap: 0 48px; align-items: stretch; min-height: 620px; padding: 28px 0 0;
}
.hp-hero__copy {
  display: flex; flex-direction: column; justify-content: center;
  max-width: 36rem; padding: 36px 0 48px;
}
.hp-hero__h1 {
  margin: 14px 0 0; font-family: var(--font-display);
  font-size: clamp(2.2rem, 4.6vw, 3.5rem); font-weight: 700;
  line-height: 1.08; letter-spacing: -.034em; color: var(--ink);
}
.hp-hero__sub {
  margin: 20px 0 0; color: var(--ink-soft); font-size: 1.06rem; line-height: 1.7; text-wrap: pretty;
}
.hp-hero__actions { margin: 30px 0 0; display: flex; flex-wrap: wrap; gap: 12px }
.hp-hero__h1, .hp-hero__sub, .hp-hero__actions, .hp-hero .sp-tag {
  opacity: 0; animation: hp-rise .85s var(--ease) both;
}
.hp-hero .sp-tag { animation-delay: .05s }
.hp-hero__h1 { animation-delay: .14s }
.hp-hero__sub { animation-delay: .26s }
.hp-hero__actions { animation-delay: .38s }

.hp-floor {
  position: relative; display: flex; flex-direction: column; justify-content: space-between;
  min-height: 560px; padding: 36px 28px 0;
  background:
    radial-gradient(90% 70% at 85% 0%, rgba(106,92,255,.5), transparent 58%),
    linear-gradient(165deg, var(--accent) 0%, var(--hp-dark) 48%, var(--hp-deep) 100%);
  border: 1px solid rgba(106,92,255,.38);
  overflow: hidden;
  animation: hp-floor-in 1s var(--ease) .18s both;
}
.hp-floor__wash {
  position: absolute; inset: auto -20% -30% 20%; height: 70%;
  background: radial-gradient(circle, rgba(106,92,255,.35), transparent 70%);
  pointer-events: none;
}
.hp-case {
  position: relative; z-index: 2; width: min(390px, 100%);
  margin: 8px auto 32px; min-height: 318px;
}
.hp-case__stack, .hp-case__stack--2 {
  position: absolute; inset: 14px 10px -10px 10px; border-radius: 4px;
  background: rgba(238,240,255,.18); border: 1px solid rgba(238,240,255,.2);
}
.hp-case__stack--2 { inset: 22px 20px -16px 20px; opacity: .55 }
.hp-ticket {
  position: relative; overflow: hidden; background: #fff;
  border-left: 4px solid var(--accent);
  box-shadow: 0 28px 56px -18px rgba(42,34,128,.72);
  animation: hp-ticket-in .7s var(--ease) both;
}
.hp-ticket__bar {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px 0; font-family: var(--font-mono);
  font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: var(--muted);
}
.hp-ticket__bar span:first-child { color: var(--accent-deep); margin-right: auto }
.hp-ticket__bar span[data-sev],
.hp-ticket__bar span:last-child {
  padding: 3px 7px; border: 1px solid rgba(106,92,255,.22); color: var(--accent-deep);
}
.hp-ticket__bar span[data-sev="High"],
.hp-ticket__bar span[data-sev="Crit"] {
  background: var(--accent-soft); border-color: transparent;
}
.hp-ticket__sheet { padding: 14px 16px 18px }
.hp-ticket h2 {
  margin: 0; font-family: var(--font-display); font-size: 1.55rem; font-weight: 700;
  letter-spacing: -.03em; line-height: 1.15;
}
.hp-ticket__grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px;
  margin: 16px 0 0; padding: 14px 0 0; border-top: 1px solid rgba(106,92,255,.14);
}
.hp-ticket__grid dt {
  margin: 0; font-family: var(--font-mono); font-size: .58rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
}
.hp-ticket__grid dd {
  margin: 4px 0 0; font-family: var(--font-mono); font-size: .78rem;
  font-weight: 650; color: var(--ink); word-break: break-word;
}
.hp-ticket__body { margin: 16px 0 0; color: var(--ink-soft); font-size: .9rem; line-height: 1.5 }
.hp-ticket__ask {
  margin: 14px 0 0; padding-top: 12px; border-top: 1px solid rgba(106,92,255,.14);
  color: var(--accent-deep); font-size: .84rem; font-weight: 600; line-height: 1.45;
}
.hp-dock {
  position: relative; z-index: 2; margin: 0 -28px;
  padding: 12px 22px 14px;
  background: rgba(42,34,128,.45); border-top: 1px solid var(--hp-line);
  backdrop-filter: blur(10px);
}
.hp-dock p {
  display: flex; align-items: center; gap: 8px; margin: 0 0 6px;
  font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: var(--hp-mist);
}
.hp-dock__live {
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
  animation: hp-pulse 1.8s ease-out infinite;
}
.hp-dock__row {
  display: grid; grid-template-columns: 44px 40px 1fr auto; align-items: center;
  gap: 4px 10px; padding: 9px 0;
  font-family: var(--font-mono); font-size: .68rem; color: var(--hp-mist);
  animation: hp-row .4s var(--ease) both;
}
.hp-dock__row + .hp-dock__row { border-top: 1px solid rgba(238,240,255,.1) }
.hp-dock__row strong {
  grid-column: 1 / 4; margin: 0;
  font-family: var(--font-display); font-size: .84rem; font-weight: 650;
  letter-spacing: -.02em; color: #fff;
}
.hp-dock__row em {
  grid-column: 4; justify-self: end; font-style: normal;
  font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: 2px 6px; border: 1px solid rgba(238,240,255,.28); color: var(--hp-mist);
}
.hp-dock__row em[data-sev="High"],
.hp-dock__row em[data-sev="Crit"] {
  border-color: rgba(238,240,255,.55); background: rgba(238,240,255,.12); color: #fff;
}
.hp-dock__row em[data-sev="Crit"] { letter-spacing: .1em }
.hp-dock__row span:nth-child(4) { color: #fff; font-weight: 700 }

.hp-section { padding-top: 120px; scroll-margin-top: 84px }
.hp-head { max-width: 34rem; margin: 0 0 36px }
.hp-head h2, .hp-see__intro h2, .hp-close h2 {
  margin: 12px 0 0; font-family: var(--font-display); font-weight: 700;
  letter-spacing: -.022em; line-height: 1.15; color: var(--ink);
}
.hp-head h2 { font-size: clamp(1.6rem, 2.6vw, 2.1rem) }
.hp-head p { margin: 12px 0 0; color: var(--muted); font-size: 1rem; line-height: 1.6 }

.hp-see__intro { max-width: 28rem; margin: 0 0 36px }
.hp-see__intro h2 { font-size: clamp(1.7rem, 3vw, 2.2rem) }
.hp-see__intro p { margin: 14px 0 0; color: var(--ink-soft); font-size: 1.02rem; line-height: 1.65 }
.hp-see__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
  border-top: 1px solid var(--border);
}
.hp-see__grid li {
  position: relative; padding: 32px 28px 8px 0;
  overflow: hidden;
}
.hp-see__grid li + li { padding-left: 28px; border-left: 1px solid var(--border) }
.hp-see__grid span {
  display: block; margin-bottom: 18px;
  font-family: var(--font-mono); font-size: 4.2rem; font-weight: 700; line-height: .8;
  letter-spacing: -.06em; color: rgba(85,70,224,.16);
}
.hp-see__grid strong { display: block; font-size: 1.05rem; font-weight: 650; letter-spacing: -.014em }
.hp-see__grid p { margin: 8px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.55; max-width: 28ch }
.hp-see[data-r] { opacity: 1; transform: none; filter: none }
.hp-see[data-r] .hp-see__intro, .hp-see[data-r] li {
  opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease);
}
.hp-see[data-r].in .hp-see__intro, .hp-see[data-r].in li { opacity: 1; transform: none }
.hp-see[data-r].in li:nth-child(1) { transition-delay: .08s }
.hp-see[data-r].in li:nth-child(2) { transition-delay: .16s }
.hp-see[data-r].in li:nth-child(3) { transition-delay: .24s }

.hp-perk {
  position: relative; overflow: hidden;
  display: grid; grid-template-columns: 1fr 1fr; gap: 40px 56px; align-items: center;
  padding: 64px 56px 48px; border-radius: 28px;
  background:
    radial-gradient(60% 80% at 100% 0%, rgba(238,240,255,.22), transparent 55%),
    radial-gradient(50% 60% at 0% 100%, rgba(106,92,255,.5), transparent 60%),
    linear-gradient(145deg, var(--accent) 0%, var(--hp-dark) 52%, var(--hp-deep) 100%);
  color: var(--hp-mist); border: 1px solid rgba(238,240,255,.18);
  box-shadow: 0 40px 80px -40px rgba(42,34,128,.7);
}
.hp-perk::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(238,240,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(238,240,255,.05) 1px, transparent 1px);
  background-size: 32px 32px; mask-image: radial-gradient(80% 80% at 70% 30%, #000, transparent);
}
.hp-perk__copy, .hp-perk__stage { position: relative; z-index: 1 }
.hp-perk__kicker {
  display: inline-block; margin: 0; padding: 6px 12px; border-radius: 999px;
  background: rgba(238,240,255,.14); border: 1px solid rgba(238,240,255,.22);
  font-family: var(--font-mono); font-size: .68rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: #fff;
}
.hp-perk__copy h2 {
  margin: 18px 0 0; font-family: var(--font-display); font-weight: 700;
  letter-spacing: -.028em; line-height: 1.08;
  font-size: clamp(2.2rem, 3.8vw, 3.1rem); color: #fff;
}
.hp-perk__copy > p:not(.hp-perk__kicker) {
  margin: 18px 0 0; max-width: 42ch; color: var(--hp-mist);
  font-size: 1.06rem; line-height: 1.65;
}
.hp-perk__go {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 30px; height: 52px; padding: 0 26px;
  border-radius: 999px; background: #fff; color: var(--accent-deep); font-weight: 650; font-size: .94rem;
  text-decoration: none; border: 0;
  box-shadow: 0 18px 32px -16px rgba(16,8,64,.6);
  transition: transform .25s var(--ease), gap .25s var(--ease);
}
.hp-perk__go:hover { transform: translateY(-2px); gap: 12px }
.hp-perk__stage { display: block; padding: 0 0 20px }
.hp-perk__stage .hp-case { width: min(420px, 100%); margin: 0 0 0 auto; min-height: 0 }
.hp-perk__stage .hp-case__stack { border-radius: 18px }
.hp-perk__stage .hp-ticket {
  animation: none; border-left: 0; border-radius: 18px;
  box-shadow: 0 32px 60px -24px rgba(16,8,64,.75);
}
.hp-perk__stage .hp-ticket__bar { padding: 16px 20px 0 }
.hp-perk__stage .hp-ticket__bar span[data-sev],
.hp-perk__stage .hp-ticket__bar span:last-child { border-radius: 999px; padding: 3px 9px }
.hp-perk__stage .hp-ticket__sheet { padding: 12px 20px 20px }
.hp-perk__stage .hp-ticket h2 { color: var(--ink); font-size: 1.6rem; letter-spacing: -.03em }
.hp-perk__stage .hp-ticket__ask {
  padding: 12px 14px; border: 0; border-radius: 12px; background: var(--accent-soft);
}
.hp-perk__stage .hp-dock {
  width: min(360px, 88%); margin: -34px auto 0 0; padding: 14px 18px 12px;
  border-radius: 18px; border: 1px solid rgba(238,240,255,.24);
  background: rgba(30,22,112,.78); box-shadow: 0 26px 48px -22px rgba(10,6,48,.8);
}
.hp-perk__cards {
  grid-column: 1 / -1; list-style: none; margin: 8px 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  position: relative; z-index: 1;
}
.hp-perk__cards li {
  background: #fff; color: var(--ink); border-radius: 20px;
  padding: 20px 20px 22px;
  box-shadow: 0 24px 40px -26px rgba(16,8,64,.6);
  transition: transform .3s var(--ease), box-shadow .3s var(--ease);
}
.hp-perk__cards li:hover { transform: translateY(-4px); box-shadow: 0 30px 46px -24px rgba(16,8,64,.7) }
.hp-perk__cards header {
  display: flex; justify-content: space-between; align-items: center; margin: 0 0 16px;
}
.hp-perk__cards header span:first-child {
  display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%;
  background: var(--accent); color: #fff;
  font-family: var(--font-mono); font-size: .68rem; font-weight: 700;
}
.hp-perk__ico {
  display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px;
  background: var(--accent-soft); color: var(--accent-deep);
}
.hp-perk__cards strong { display: block; font-size: 1.04rem; font-weight: 650; letter-spacing: -.014em }
.hp-perk__cards p { margin: 8px 0 0; color: var(--ink-soft); font-size: .86rem; line-height: 1.55 }

.hp-deck {
  display: grid; grid-template-columns: 1.2fr .8fr; grid-template-rows: auto auto; gap: 16px;
}
.hp-tile {
  position: relative; display: flex; flex-direction: column;
  min-height: 100%; padding: 0 28px 28px;
  background: #fff; border: 1px solid var(--border-strong);
  box-shadow: 0 18px 40px -30px rgba(16,25,46,.3);
  transition: transform .4s var(--ease), box-shadow .4s var(--ease);
}
.hp-tile:hover {
  transform: translateY(-5px);
  border-color: rgba(106,92,255,.35);
  box-shadow: 0 26px 50px -26px rgba(85,70,224,.4);
}
.hp-tile__stub {
  display: flex; justify-content: space-between; align-items: center;
  margin: 0 -28px 22px; padding: 11px 28px;
  background: var(--accent-soft);
  font-family: var(--font-mono); font-size: .66rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep);
}
.hp-tile--lead {
  grid-row: 1 / span 2; padding-bottom: 36px;
  background:
    radial-gradient(90% 50% at 100% 0%, var(--accent-soft), transparent 50%),
    #fff;
}
.hp-tile--labs {
  background: linear-gradient(165deg, var(--accent) 0%, var(--hp-dark) 55%, var(--hp-deep) 100%);
  border-color: rgba(106,92,255,.4); color: var(--hp-mist);
  padding-bottom: 32px;
}
.hp-tile--labs .hp-tile__stub { background: rgba(255,255,255,.12); color: #fff; margin-bottom: 26px }
.hp-tile--labs:hover { box-shadow: 0 26px 50px -22px rgba(85,70,224,.5) }
.hp-tile h3 {
  margin: 0; font-family: var(--font-display); font-size: clamp(1.28rem, 2vw, 1.55rem);
  font-weight: 700; letter-spacing: -.02em;
}
.hp-tile--labs h3 { color: #fff }
.hp-tile p { margin: 12px 0 0; color: var(--ink-soft); font-size: .94rem; line-height: 1.6 }
.hp-tile--labs p { color: #c5cce0; margin-top: 8px; line-height: 1.55 }
.hp-tile--labs .hp-tile__link { margin-top: 28px }
.hp-tile__split {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px 22px; margin: 22px 0 26px;
}
.hp-tile__label {
  margin: 0; font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep);
}
.hp-tile ul { list-style: none; margin: 20px 0 26px; padding: 0; display: flex; flex-direction: column; gap: 10px }
.hp-tile__split ul { margin: 10px 0 0 }
.hp-tile li { position: relative; padding-left: 14px; font-size: .88rem; color: var(--ink) }
.hp-tile li::before {
  content: ""; position: absolute; left: 0; top: .55em; width: 5px; height: 5px; background: var(--accent-deep);
}
.hp-tile .sp-btn { margin-top: auto; align-self: flex-start }
.hp-tile__link {
  display: inline-flex; align-items: center; gap: 7px; margin-top: auto;
  font-size: .9rem; font-weight: 650; color: var(--accent-deep); text-decoration: none;
  transition: gap .25s var(--ease);
}
.hp-tile__link:hover { gap: 11px }
.hp-tile__link--light { color: var(--hp-mist) }
.hp-deck[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.hp-deck[data-r] > * { opacity: 0; transform: translateY(20px); transition: opacity .65s var(--ease), transform .65s var(--ease) }
.hp-deck[data-r].in > * { opacity: 1; transform: none }
.hp-deck[data-r] > *:nth-child(1) { transition-delay: .05s }
.hp-deck[data-r] > *:nth-child(2) { transition-delay: .14s }
.hp-deck[data-r] > *:nth-child(3) { transition-delay: .23s }

.hp-voice-wrap { padding-top: 120px }
.hp-voice {
  display: grid; grid-template-columns: 280px 1fr; gap: 0; margin: 0;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.2);
  box-shadow: 0 22px 50px -32px rgba(85,70,224,.35);
}
.hp-voice img { width: 100%; height: 100%; min-height: 320px; object-fit: cover; object-position: top center }
.hp-voice figcaption {
  display: flex; flex-direction: column; justify-content: center; padding: 40px 44px;
  border-left: 3px solid var(--accent);
}
.hp-voice blockquote {
  margin: 16px 0 0; font-family: var(--font-display);
  font-size: clamp(1.2rem, 2.1vw, 1.55rem); font-weight: 550; line-height: 1.4;
  letter-spacing: -.02em; color: var(--ink);
}
.hp-voice__who { display: flex; flex-direction: column; gap: 4px; margin-top: 22px }
.hp-voice__who span { color: var(--muted); font-size: .82rem; line-height: 1.4 }
.hp-voice__stars { display: flex; gap: 3px; color: var(--accent); margin-top: 4px }
.hp-voice__stars svg { fill: currentColor }
.hp-voice__who a {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 8px;
  color: var(--muted); font-size: .8rem; text-decoration: none; width: fit-content;
}
.hp-voice__who a:hover { color: var(--accent-deep) }

.hp-close {
  position: relative; overflow: hidden;
  display: grid; grid-template-columns: 1.15fr .85fr; gap: 36px; align-items: center;
  margin-top: 120px; padding: 48px;
  background:
    radial-gradient(70% 90% at 100% 0%, rgba(238,240,255,.16), transparent 52%),
    linear-gradient(145deg, var(--accent) 0%, var(--hp-dark) 52%, var(--hp-deep) 100%);
  color: var(--hp-mist); border: 1px solid rgba(106,92,255,.4);
}
.hp-close::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(238,240,255,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(238,240,255,.06) 1px, transparent 1px);
  background-size: 28px 28px; mask-image: linear-gradient(90deg, transparent, #000 40%);
}
.hp-close__copy, .hp-close .hold { position: relative; z-index: 1 }
.hp-close__kicker {
  margin: 0; font-family: var(--font-mono); font-size: .7rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: var(--hp-mist);
}
.hp-close h2 { font-size: clamp(2rem, 3.4vw, 2.7rem); color: #fff }
.hp-close__sub { margin: 12px 0 0; max-width: 28ch; color: var(--hp-mist); font-size: 1.02rem; line-height: 1.5 }
.hp-close__row { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; gap: 18px }
.hp-close__book {
  display: inline-flex; align-items: center; gap: 8px; height: 50px; padding: 0 22px;
  background: #fff; color: var(--accent-deep); font-weight: 650; font-size: .92rem;
  text-decoration: none; border: 0;
  box-shadow: 0 14px 28px -16px rgba(16,8,64,.45);
  transition: transform .25s var(--ease), gap .25s var(--ease);
}
.hp-close__book:hover { transform: translateY(-2px); gap: 12px }
.hp-close__more {
  display: inline-flex; align-items: center; gap: 8px; color: var(--hp-mist); font-weight: 650; text-decoration: none;
  transition: gap .25s var(--ease);
}
.hp-close__more:hover { gap: 12px }
.hp-close__hold {
  background: #fff; color: var(--ink); border-left: 4px solid var(--accent);
  padding: 22px 22px 20px; box-shadow: 0 28px 48px -22px rgba(16,8,64,.55);
}
.hp-close__hold header {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep);
}
.hp-close__hold header span:last-child {
  padding: 3px 7px; background: var(--accent-soft);
}
.hp-close__hold strong {
  display: block; margin: 14px 0 0;
  font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; letter-spacing: -.02em;
}
.hp-close__hold ul { list-style: none; margin: 16px 0 0; padding: 16px 0 0; border-top: 1px solid rgba(106,92,255,.14) }
.hp-close__hold li {
  position: relative; padding: 7px 0 7px 16px;
  font-size: .9rem; color: var(--ink-soft);
}
.hp-close__hold li::before {
  content: ""; position: absolute; left: 0; top: 1em; width: 6px; height: 6px; background: var(--accent);
}
.hp-close__hold p {
  margin: 14px 0 0; padding-top: 12px; border-top: 1px solid rgba(106,92,255,.14);
  font-family: var(--font-mono); font-size: .68rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep);
}

@keyframes hp-rise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes hp-floor-in { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: none } }
@keyframes hp-ticket-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes hp-row { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: none } }
@keyframes hp-pulse {
  0% { box-shadow: 0 0 0 0 rgba(106,92,255,.5) }
  70% { box-shadow: 0 0 0 8px rgba(106,92,255,0) }
  100% { box-shadow: 0 0 0 0 rgba(106,92,255,0) }
}

@media (prefers-reduced-motion: reduce) {
  .hp-hero__h1, .hp-hero__sub, .hp-hero__actions, .hp-hero .sp-tag,
  .hp-floor, .hp-ticket, .hp-dock__row, .hp-deck[data-r] > *,
  .hp-see[data-r] .hp-see__intro, .hp-see[data-r] li, .hp-perk {
    animation: none; opacity: 1; transform: none; transition: none;
  }
  .hp-ticket { transform: none }
  .hp-dock__live { animation: none }
  .hp-tile:hover { transform: none }
}

@media (max-width: 980px) {
  .hp-hero { grid-template-columns: 1fr; min-height: 0; gap: 28px }
  .hp-hero__copy { padding: 20px 0 0 }
  .hp-floor { min-height: 0; padding-top: 28px }
  .hp-see__grid { grid-template-columns: 1fr }
  .hp-see__grid li + li { padding-left: 0; border-left: 0; border-top: 1px solid var(--border) }
  .hp-see__grid span { font-size: 2.8rem; margin-bottom: 10px }
  .hp-deck { grid-template-columns: 1fr }
  .hp-tile--lead { grid-row: auto }
  .hp-tile__split { grid-template-columns: 1fr }
  .hp-voice { grid-template-columns: 1fr }
  .hp-voice img { min-height: 220px; max-height: 280px }
  .hp-voice figcaption { padding: 28px 24px }
  .hp-close, .hp-perk { grid-template-columns: 1fr; gap: 28px; padding: 40px 24px }
  .hp-perk__stage .hp-case { margin: 0 auto }
  .hp-perk__stage .hp-dock { margin: -34px auto 0 }
  .hp-perk__cards { grid-template-columns: 1fr 1fr }
}
@media (max-width: 680px) {
  .hp-hero__actions { flex-direction: column }
  .hp-hero__actions .sp-btn { width: 100% }
  .hp-section, .hp-voice-wrap { padding-top: 84px }
  .hp-tile { padding: 0 20px 22px }
  .hp-tile__stub { margin: 0 -20px 18px; padding: 11px 20px }
  .hp-tile--labs { padding-bottom: 28px }
  .hp-tile--labs .hp-tile__stub { margin-bottom: 22px }
  .hp-close { margin-top: 84px; padding: 28px 20px }
  .hp-close__book, .hp-perk__go { width: 100%; justify-content: center }
  .hp-perk { padding: 28px 20px }
  .hp-perk__cards { grid-template-columns: 1fr }
}
`;
