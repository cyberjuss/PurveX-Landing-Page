"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Linkedin, Star } from "lucide-react";
import {
  IconAlert, IconBook, IconChain, IconCoverage, IconGraduate, IconHeadset, IconIdentity, IconKey,
  IconLifebuoy, IconLog, IconMic, IconRecord, IconSchedule, IconShield, IconSignal, IconTune, IconValidate,
} from "./brand-icons";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";

const ALERTS = [
  { title: "Suspicious service account", sev: "High", time: "02:11", id: "4624", acct: "svc-payroll", host: "FIN-WKS14", Icon: IconIdentity },
  { title: "Dormant account reactivated", sev: "High", time: "03:42", id: "4722", acct: "old.vendor", host: "DC02", Icon: IconKey },
  { title: "Disabled account used", sev: "High", time: "08:16", id: "4625", acct: "n.okonkwo", host: "VPN-GW02", Icon: IconAlert },
  { title: "After-hours share copy", sev: "High", time: "01:27", id: "5145", acct: "m.chen", host: "FS-FIN02", Icon: IconSchedule },
  { title: "USB data transfer", sev: "Med", time: "16:51", id: "4663", acct: "l.hoffman", host: "HR-WKS22", Icon: IconRecord },
  { title: "Large outbound file move", sev: "Crit", time: "23:08", id: "5140", acct: "s.nguyen", host: "FS-CORE01", Icon: IconSignal },
  { title: "User added to Domain Admins", sev: "Crit", time: "11:33", id: "4728", acct: "j.patel", host: "DC01", Icon: IconShield },
  { title: "Help desk added a privileged group", sev: "High", time: "14:06", id: "4732", acct: "helpdesk-tmp", host: "DC01", Icon: IconHeadset },
  { title: "Nested group privilege grant", sev: "High", time: "09:18", id: "4728", acct: "d.reyes", host: "DC02", Icon: IconTune },
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
    href: "/security-operations",
    title: "Unproven detections",
    body: "The rules are in. Nobody has shown they fire.",
    Icon: IconValidate,
  },
  {
    href: "/cybersecurity-training",
    title: "Exam-only training",
    body: "Students leave with terms. Employers want investigation.",
    Icon: IconBook,
  },
  {
    href: "/platform",
    title: "Assumed coverage",
    body: "If it has not been tested, you do not know what it covers.",
    Icon: IconCoverage,
  },
];

const perks = [
  {
    n: "01",
    title: "Readiness",
    body: "Four skills, scored from work the directory already shows.",
    Icon: IconCoverage,
  },
  {
    n: "02",
    title: "Daily drill",
    body: "A new ticket from their own lab, every day.",
    Icon: IconSchedule,
  },
  {
    n: "03",
    title: "Four modes",
    body: "Need help, Mentor, and Interview. None of them hands over the answer.",
    Icon: IconHeadset,
  },
  {
    n: "04",
    title: "Hire",
    body: "Closed tickets become lines they can defend.",
    Icon: IconMic,
  },
];

const programPoints = [
  { text: "Live tickets on a real directory", Icon: IconChain },
  { text: "Daily drills and a weekly CTF", Icon: IconLog },
  { text: "A readiness score they can defend", Icon: IconCoverage },
];

const coachPoints = [
  { text: "On every ticket, never the unsolved answer", Icon: IconLifebuoy },
  { text: "Need help, Mentor, and a spoken interview", Icon: IconHeadset },
  { text: "The rest waits inside the portal", Icon: IconMic },
];

const opsPoints = [
  { text: "SIEM and detection engineering", Icon: IconTune },
  { text: "Optimization and assessments", Icon: IconCoverage },
  { text: "Detection validation", Icon: IconValidate },
];

const REVIEWS = [
  {
    name: "Kenneth Ellington",
    role: "Coach and instructor, Ellington Cyber Academy",
    photo: "/kenneth.jpg",
    href: "https://www.linkedin.com/in/kenneth-ellington/",
    stars: 5,
    quote: (
      <>
        Hands down one of the best services. Our students now work in tech, running their own SOC projects thanks to{" "}
        <mark>real hands-on experience</mark>.
      </>
    ),
  },
];

const OFFERS = [
  {
    label: "Operations",
    title: "Detections that actually fire",
    body: "We write detection rules for your logs, test that they trigger, and cut the noise. You keep every result.",
    who: "For security teams",
    href: "/security-operations",
    Icon: IconValidate,
  },
  {
    label: "Training",
    title: "Training that builds real skill",
    body: "Learners practice in their own lab with an AI coach and finish with proof of skill employers trust.",
    who: "For students, schools, and employers",
    href: "/cybersecurity-training",
    Icon: IconGraduate,
  },
  {
    label: "Platform",
    title: "Prove your alerts work",
    body: "Software that runs real attack tests against your SIEM and shows exactly where an alert failed.",
    who: "Early access by waitlist",
    href: "/platform",
    Icon: IconChain,
  },
];

function OfferDesk() {
  return (
    <section className="hx-work" id="what-we-offer">
      <p className="hx-work__kicker">What we offer</p>
      <div className="hx-wire">
        {OFFERS.map((o) => (
          <Link key={o.href} href={o.href} className="hx-tag">
            <o.Icon size={26} />
            <span>{o.label}</span>
            <strong>{o.title}</strong>
            <p>{o.body}</p>
            <small>{o.who}</small>
            <em>Learn more</em>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AlertTape() {
  const rows = [0, 1].flatMap((copy) => ALERTS.map((a) => ({ ...a, key: `${copy}-${a.id}-${a.host}` })));
  return (
    <div className="hx-tape" aria-hidden="true">
      <div className="hx-tape__track">
        {rows.map((a) => (
          <span key={a.key}>
            <a.Icon size={14} />
            <b>{a.id}</b>
            {a.title}
            <i>{a.host}</i>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <SiteChrome active="home">
      <section className="hx">
        <ol className="hx-index">
          {charges.map((c, i) => (
            <li key={c.href}>
              <Link href={c.href}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{c.title}</strong>
                <p>{c.body}</p>
              </Link>
            </li>
          ))}
        </ol>

        <div className="hx-copy">
          <h1>Open<br />the<br /><em>case.</em></h1>
          <p>A detection, a student ticket, or a test that names the miss.</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Book 30 minutes
          </a>
        </div>

        <aside className="hx-file" aria-hidden="true">
          <CaseCard />
        </aside>

        <AlertTape />
      </section>

      <OfferDesk />

      <section className="hx-why">
        <p className="hx-work__kicker">Why PurveX</p>
        <div className="hx-why__sheet">
          <div>
            <header><i>01</i><span>Students</span></header>
            <p>Build a lab and prove each fix against their own directory.</p>
          </div>
          <div>
            <header><i>02</i><span>Security teams</span></header>
            <p>See every alert from telemetry to ticket, and exactly where a detection misses.</p>
          </div>
          <p className="hx-why__close"><span>Passing and working are not the same thing.</span><em>PurveX <b>shows the difference.</b></em></p>
        </div>
        <div className="hx-why__paths">
          <Link href="/about/founder">Meet the founder</Link>
          <Link href="/about">About</Link>
        </div>
      </section>

      <section className="hp-voice-wrap" id="reviews">
        <p className="hx-work__kicker">Reviews</p>
        <ol className="hp-reviews">
          {REVIEWS.map((r) => (
            <li key={r.name}>
              <div className="hp-voice__photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.photo} alt="" />
              </div>
              <div>
                <blockquote>{r.quote}</blockquote>
                <footer>
                  <strong>{r.name}</strong>
                  <span>{r.role}</span>
                  <span className="hp-voice__stars" aria-label={`${r.stars}.0 rating`}>
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} size={13} />
                    ))}
                  </span>
                  {r.href ? (
                    <a href={r.href} target="_blank" rel="noreferrer">
                      <Linkedin size={13} /> LinkedIn
                    </a>
                  ) : null}
                </footer>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="hp-close" data-r>
        <div className="hp-close__copy">
          <h2>Bring one problem</h2>
          <p className="hp-close__sub">Thirty minutes. A detection, a cohort, or a look at the platform.</p>
          <div className="hp-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="hp-close__book">
              Book 30 minutes
            </a>
            <Link href="/about" className="hp-close__more">
              About PurveX
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
.hx {
  position: relative;
  display: grid;
  grid-template-columns: minmax(210px, 260px) minmax(0, 1fr) minmax(280px, 400px);
  grid-template-rows: 1fr auto;
  align-items: stretch;
  min-height: calc(100svh - 64px);
  width: 100vw;
  margin-left: calc(50% - 50vw);
  padding: 8px max(24px, calc((100vw - 1240px) / 2)) 0;
}
.hx::before {
  content: "";
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--accent);
}
.hx-index {
  grid-column: 1; grid-row: 1; list-style: none; margin: 0; padding: 40px 28px 40px 0;
  display: flex; flex-direction: column; justify-content: center;
  border-right: 1px solid var(--border);
}
.hx-index a { display: block; padding: 16px 0; color: inherit; text-decoration: none; border-top: 1px solid var(--border); position: relative }
.hx-index li:last-child a { border-bottom: 1px solid var(--border) }
.hx-index a::after {
  content: ""; position: absolute; left: 0; bottom: -1px; height: 2px; width: 100%;
  background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .35s var(--ease);
}
.hx-index a:hover::after, .hx-index a:focus-visible::after { transform: scaleX(1) }
.hx-index span {
  display: block; font-family: var(--font-display); font-weight: 700; font-size: 1.7rem; line-height: 1; letter-spacing: -.04em;
  color: transparent; -webkit-text-stroke: 1.25px rgba(106,92,255,.55); transition: color .2s var(--ease);
}
.hx-index a:hover span, .hx-index a:focus-visible span { color: var(--accent); -webkit-text-stroke: 0 }
.hx-index strong { display: block; margin-top: 6px; font-family: var(--font-display); font-size: 1rem; font-weight: 700; letter-spacing: -.02em }
.hx-index p { margin: 6px 0 0; max-width: 22ch; color: var(--muted); font-size: .84rem; line-height: 1.4 }
.hx-copy { grid-column: 2; grid-row: 1; display: flex; flex-direction: column; justify-content: center; padding: 28px 40px }
.hx-copy h1 {
  margin: 0; font-family: var(--font-display); font-weight: 700;
  font-size: clamp(4.6rem, 8.4vw, 8rem); line-height: .82; letter-spacing: -.07em; color: var(--ink);
}
.hx-copy h1 em { font-style: normal; color: var(--accent-deep); }
.hx-copy p { margin: 22px 0 0; max-width: 28ch; color: var(--ink-soft); font-size: 1.05rem; line-height: 1.5 }
.hx-copy .sp-btn { margin-top: 28px; align-self: flex-start }
.hx-file { grid-column: 3; grid-row: 1; display: flex; align-items: center; justify-content: center; padding: 28px 20px 28px 0 }
.hx-file .hp-case { width: min(360px, 100%); margin: 0 }
.hx-file .hp-case__stack {
  inset: 16px -4px -12px 12px; transform: rotate(2.4deg);
  background: #f4f1fb; border-color: rgba(85,70,224,.22);
  box-shadow: 0 16px 28px -20px rgba(42,34,128,.45);
}
.hx-file .hp-case__stack--2 { inset: 26px 10px -20px 26px; transform: rotate(-1.2deg); background: #e8e4f6; opacity: 1 }
.hx-file .hp-ticket {
  transform: rotate(-1.6deg);
  clip-path: polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%);
  box-shadow: 0 1px 0 rgba(255,255,255,.9) inset, 0 24px 40px -22px rgba(42,34,128,.5), 0 6px 14px -10px rgba(16,25,46,.16);
  animation: hx-in .85s var(--ease) both;
}
.hx-tape { grid-column: 1 / -1; grid-row: 2; overflow: hidden; border-top: 1px solid var(--border); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent) }
.hx-tape__track {
  display: flex; width: max-content; gap: 36px; padding: 13px 0;
  animation: hx-run 42s linear infinite;
  font-family: var(--font-mono); font-size: .7rem; letter-spacing: .04em; text-transform: uppercase; color: var(--ink-soft);
}
.hx-tape__track span { display: inline-flex; align-items: center; gap: 8px }
.hx-tape__track svg { flex: none; color: var(--accent-deep) }
.hx-tape__track b { color: var(--accent-deep); font-weight: 700 }
.hx-tape__track i { font-style: normal; color: var(--muted) }
.hx-work, .hx-why { padding: 112px 0 0 }
.hx-work__kicker {
  margin: 0 0 22px; font-family: var(--font-mono); font-size: .72rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep);
}
.hx-wire {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1.5px solid var(--ink); padding-top: 0;
}
.hx-tag {
  position: relative; display: flex; flex-direction: column; min-height: 280px;
  margin-top: var(--hang); padding: 0 28px 8px 0; color: inherit; text-decoration: none;
  transition: transform .35s var(--ease);
}
.hx-tag:nth-child(1) { --hang: 36px }
.hx-tag:nth-child(2) { --hang: 78px; padding-left: 22px }
.hx-tag:nth-child(3) { --hang: 48px; padding-left: 22px }
.hx-tag::before {
  content: ""; position: absolute; left: 12px; bottom: 100%; width: 1px; height: var(--hang);
  background: var(--ink);
}
.hx-tag:nth-child(2)::before, .hx-tag:nth-child(3)::before { left: 34px }
.hx-tag:hover, .hx-tag:focus-visible { transform: translateY(8px) }
.hx-tag svg { display: block; margin: 0 0 16px; color: var(--accent-deep) }
.hx-tag span {
  font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--accent-deep);
}
.hx-tag strong {
  display: block; margin-top: 10px; max-width: 11ch;
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(1.85rem, 2.8vw, 2.7rem); line-height: .92; letter-spacing: -.045em;
}
.hx-tag p { margin: 14px 0 0; max-width: 32ch; color: var(--ink-soft); font-size: .95rem; line-height: 1.45 }
.hx-tag small { display: block; margin-top: 12px; font-size: .84rem; font-weight: 600; color: var(--accent-deep) }
.hx-tag em {
  margin-top: 18px; font-style: normal; font-family: var(--font-display); font-weight: 700;
  color: var(--accent-deep); border-bottom: 2px solid transparent; width: fit-content;
}
.hx-tag:hover em, .hx-tag:focus-visible em { border-bottom-color: var(--accent) }
.hx-why__sheet {
  display: grid; grid-template-columns: 1fr 1fr; margin-top: 0;
  background: #fff; border: 1px solid rgba(85,70,224,.22); border-left: 4px solid var(--accent);
  clip-path: polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%);
  box-shadow: var(--highlight), var(--shadow-lg);
  animation: hx-why-up .75s var(--ease) .14s both;
  transition: transform .35s var(--ease), box-shadow .35s var(--ease);
}
.hx-why__sheet:hover { transform: translateY(-4px); box-shadow: var(--highlight), 0 28px 56px -28px rgba(42,34,128,.45) }
.hx-why__sheet > div { padding: 32px 36px 30px; transition: background .25s var(--ease) }
.hx-why__sheet > div:hover { background: rgba(238,240,255,.45) }
.hx-why__sheet > div + div { border-left: 1px solid var(--border) }
.hx-why__sheet header { display: flex; align-items: baseline; gap: 12px }
.hx-why__sheet header i {
  font-style: normal; font-family: var(--font-display); font-weight: 700; font-size: 1.35rem;
  line-height: 1; letter-spacing: -.04em; color: transparent;
  -webkit-text-stroke: 1.25px rgba(106,92,255,.65);
  transition: color .2s var(--ease), -webkit-text-stroke .2s var(--ease);
}
.hx-why__sheet > div:hover header i { color: var(--accent); -webkit-text-stroke: 0 }
.hx-why__sheet header span {
  font-family: var(--font-mono); font-size: .68rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep);
}
.hx-why__sheet > div > p {
  margin: 16px 0 0; max-width: 32ch; color: var(--ink);
  font-size: 1.2rem; line-height: 1.4; letter-spacing: -.015em; font-weight: 400;
}
.hx-why__close {
  grid-column: 1 / -1; display: flex; flex-direction: row; flex-wrap: wrap; align-items: baseline; column-gap: .35em;
  margin: 0; max-width: none; padding: 22px 36px 24px;
  border-top: 1px solid var(--border); background: #fff;
}
.hx-why__close span,
.hx-why__close em,
.hx-why__close b {
  font-family: inherit; font-size: 1.2rem; font-weight: 400;
  letter-spacing: -.015em; line-height: 1.4;
}
.hx-why__close span { color: var(--ink) }
.hx-why__close em {
  font-style: normal; color: var(--ink); width: fit-content;
  background-image: linear-gradient(var(--accent), var(--accent));
  background-repeat: no-repeat; background-position: left bottom; background-size: 0 2px;
  animation: hx-why-rule .7s var(--ease) .55s forwards;
}
.hx-why__close b { font-weight: 400; color: var(--accent-deep) }
.hx-why__paths { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px }
.hx-why__paths a {
  display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
  width: 220px; min-height: 44px; padding: 10px 16px;
  border: 1px solid rgba(106,92,255,.4); background: rgba(255,255,255,.55);
  font-family: var(--font-display); font-weight: 650; font-size: 1rem; letter-spacing: -.02em;
  color: var(--accent-deep); text-decoration: none; cursor: pointer; white-space: nowrap;
  transition: background .2s var(--ease), border-color .2s var(--ease);
}
.hx-why__paths a:hover, .hx-why__paths a:focus-visible { background: var(--accent-soft); border-color: var(--accent) }
.hx-why__paths a:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px }
.hx-next { display: flex; align-items: baseline; justify-content: space-between; gap: 28px; padding: 26px 0; border-bottom: 1px solid var(--border) }
.hx-next p { margin: 0; max-width: 48ch; color: var(--ink); font-size: 1.05rem; line-height: 1.5 }
.hx-next a { font-family: var(--font-display); font-weight: 700; color: var(--accent-deep); text-decoration: none; white-space: nowrap }
.hx-next a:hover { text-decoration: underline }
@keyframes hx-why-up { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes hx-why-rule { to { background-size: 100% 2px } }
@keyframes hx-in { from { opacity: 0; transform: translateX(48px) rotate(2deg) } to { opacity: 1; transform: rotate(-1.6deg) } }
@keyframes hx-run { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@media (max-width: 980px) {
  .hx { grid-template-columns: 1fr; min-height: 0; width: auto; margin-left: 0; padding: 8px 0 0 }
  .hx::before { display: none }
  .hx-index, .hx-copy, .hx-file, .hx-tape { grid-column: 1; grid-row: auto }
  .hx-copy { order: 1; padding: 32px 0 8px }
  .hx-file { order: 2; justify-content: center; padding: 24px 6px 36px 0 }
  .hx-index { order: 3; border-right: 0; padding: 0 0 28px }
  .hx-tape { order: 4 }
  .hx-copy h1 { font-size: clamp(3.4rem, 16vw, 5.2rem) }
  .hx-copy .sp-btn { width: 100% }
  .hx-index a { display: grid; grid-template-columns: 44px 1fr; column-gap: 12px; padding: 16px 0 }
  .hx-index span { grid-row: 1 / 3; font-size: 1.5rem }
  .hx-index strong { margin-top: 0 }
  .hx-index p { max-width: none; margin-top: 4px }
  .hx-file .hp-ticket, .hx-file .hp-case__stack, .hx-file .hp-case__stack--2 { transform: none }
  .hx-file .hp-ticket { animation-name: hp-ticket-in }
  .hx-work, .hx-why { padding-top: 72px }
  .hx-wire { grid-template-columns: 1fr }
  .hx-tag { min-height: 0; padding-bottom: 28px }
  .hx-tag, .hx-tag:nth-child(2), .hx-tag:nth-child(3) { --hang: 28px; padding-left: 0 }
  .hx-tag::before, .hx-tag:nth-child(2)::before, .hx-tag:nth-child(3)::before { left: 12px }
  .hx-why__sheet { grid-template-columns: 1fr }
  .hx-why__sheet > div + div { border-left: 0; border-top: 1px solid var(--border) }
  .hx-why__paths a { width: 100% }
  .hx-next { flex-direction: column; align-items: flex-start }
}
@media (prefers-reduced-motion: reduce) {
  .hx-file .hp-ticket, .hx-tape__track, .hx-tag, .hx-why__sheet, .hx-why__sheet header i, .hx-why__close em, .hp-reviews li, .hp-voice__stars svg { animation: none; transition: none }
  .hx-tag, .hx-tag:hover, .hx-why__sheet, .hx-why__sheet:hover, .hp-reviews li, .hp-reviews li:hover { transform: none }
  .hx-why__close em { background-size: 100% 2px }
  .hx-file .hp-ticket { transform: none }
}
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
.hp-stage {
  position: relative;
  grid-template-rows: auto auto;
  align-items: center;
  min-height: 0;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  padding: 28px max(24px, calc((100vw - 1180px) / 2)) 0;
  overflow: visible;
}
.hp-stage .hp-floor::before {
  content: "";
  position: absolute;
  z-index: 0;
  inset: -12px -8% -8px -18%;
  background: #eef0ff;
  clip-path: polygon(0 0, calc(100% - 56px) 0, 100% 56px, 100% 100%, 0 100%);
}
.hp-stage .hp-case, .hp-stage .hp-dock { position: relative; z-index: 1 }
.hp-stage .hp-hero__copy { grid-column: 1; grid-row: 1; align-self: center; position: relative; z-index: 1; max-width: 34rem; padding: 36px 0 12px }
.hp-stage .hp-floor { grid-column: 2; grid-row: 1; position: relative; z-index: 1; justify-content: center }
.hp-stage .hp-rail { grid-column: 1 / -1; grid-row: 2; position: relative; z-index: 1 }
.hp-stage .hp-hero__h1 {
  font-size: clamp(4.4rem, 8vw, 7.2rem);
  line-height: .88;
  letter-spacing: -.06em;
}
.hp-stage .hp-case { width: min(440px, 100%) }
.hp-stage .hp-case__stack { transform: rotate(2.2deg) }
.hp-stage .hp-case__stack--2 { transform: rotate(-1.4deg) }
.hp-stage .hp-ticket { transform: rotate(-1.4deg); animation: hp-drop .75s var(--ease) both }
.hp-rail {
  list-style: none; margin: 8px 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--border);
}
.hp-rail a {
  position: relative; display: block; padding: 22px 28px 28px 0;
  color: inherit; text-decoration: none;
}
.hp-rail li + li a { padding-left: 28px }
.hp-rail li + li { border-left: 1px solid var(--border) }
.hp-rail a::before {
  content: ""; position: absolute; left: 0; right: 28px; top: -1px; height: 2px;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform .4s var(--ease);
}
.hp-rail li + li a::before { left: 28px }
.hp-rail a:hover::before, .hp-rail a:focus-visible::before { transform: scaleX(1) }
.hp-rail span {
  display: block; margin-bottom: 10px;
  font-family: var(--font-display); font-size: clamp(2rem, 3.4vw, 3rem); font-weight: 700;
  line-height: .9; letter-spacing: -.05em; color: transparent;
  -webkit-text-stroke: 1.5px rgba(106,92,255,.55);
  transition: color .25s var(--ease), -webkit-text-stroke .25s var(--ease);
}
.hp-rail a:hover span, .hp-rail a:focus-visible span { color: var(--accent); -webkit-text-stroke: 0 }
.hp-rail strong { display: block; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; letter-spacing: -.02em }
.hp-rail p { margin: 6px 0 0; max-width: 28ch; color: var(--muted); font-size: .92rem; line-height: 1.5 }
.hp-hero__copy {
  display: flex; flex-direction: column; justify-content: center;
  max-width: 36rem; padding: 36px 0 48px;
}
.hp-hero__h1 {
  margin: 0; font-family: var(--font-display);
  font-size: clamp(2.4rem, 4.8vw, 3.7rem); font-weight: 700;
  line-height: 1.05; letter-spacing: -.03em; color: var(--ink);
}
.hp-hero__sub {
  margin: 20px 0 0; color: var(--ink-soft); font-size: 1.06rem; line-height: 1.7; text-wrap: pretty;
}
.hp-hero__actions { margin: 30px 0 0; display: flex; flex-wrap: wrap; gap: 12px }

.hp-floor {
  position: relative; display: flex; flex-direction: column; justify-content: flex-start;
  min-height: 0; padding: 48px 0 0; background: transparent; border: 0; overflow: visible;
}
.hp-floor__wash { display: none }
.hp-case {
  position: relative; z-index: 2; width: min(390px, 100%);
  margin: 8px auto 32px; min-height: 318px;
}
.hp-case__stack, .hp-case__stack--2 {
  position: absolute; inset: 14px 10px -10px 10px; border-radius: 0;
  background: #f4f2fb; border: 1px solid rgba(85,70,224,.16);
}
.hp-case__stack--2 { inset: 22px 20px -16px 20px; opacity: .55 }
.hp-ticket {
  position: relative; overflow: hidden; background: #fff; border-radius: 0;
  clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%);
  border-left: 4px solid var(--accent);
  box-shadow: 0 28px 56px -18px rgba(42,34,128,.72);
  animation: hp-ticket-in .55s var(--ease) both;
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
  position: relative; z-index: 2; margin: 10px 0 0; padding: 12px 0 0;
  background: none; border-top: 1px solid var(--border); backdrop-filter: none;
}
.hp-dock p {
  display: flex; align-items: center; gap: 8px; margin: 0 0 6px;
  font-family: var(--font-mono); font-size: .68rem; font-weight: 650;
  letter-spacing: .02em; text-transform: none; color: var(--muted);
}
.hp-dock__live {
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
  animation: hp-pulse 1.8s ease-out infinite;
}
.hp-dock__row {
  display: grid; grid-template-columns: 44px 40px 1fr auto; align-items: center;
  gap: 4px 10px; padding: 9px 0;
  font-family: var(--font-mono); font-size: .68rem; color: var(--ink-soft);
}
.hp-dock__row + .hp-dock__row { border-top: 1px solid var(--border) }
.hp-dock__row strong {
  grid-column: 1 / 4; margin: 0;
  font-family: var(--font-display); font-size: .84rem; font-weight: 650;
  letter-spacing: -.02em; color: var(--ink);
}
.hp-dock__row em {
  grid-column: 4; justify-self: end; font-style: normal;
  font-size: .58rem; font-weight: 700; letter-spacing: .04em;
  padding: 2px 6px; border: 1px solid rgba(85,70,224,.22); color: var(--accent-deep);
}
.hp-dock__row em[data-sev="High"],
.hp-dock__row em[data-sev="Crit"] {
  border-color: transparent; background: var(--accent-soft); color: var(--accent-deep);
}
.hp-dock__row em[data-sev="Crit"] { letter-spacing: .06em }
.hp-dock__row span:nth-child(4) { color: var(--ink); font-weight: 700 }

.hp-section { padding-top: 144px; scroll-margin-top: 84px }
.hp-head { max-width: 34rem; margin: 0 0 56px }
.hp-head h2, .hp-see__intro h2, .hp-close h2 {
  margin: 12px 0 0; font-family: var(--font-display); font-weight: 700;
  letter-spacing: -.022em; line-height: 1.15; color: var(--ink);
}
.hp-head h2 { font-size: clamp(1.6rem, 2.6vw, 2.1rem) }
.hp-head p { margin: 12px 0 0; color: var(--muted); font-size: 1rem; line-height: 1.6 }

.hp-see__intro { max-width: 28rem; margin: 0 0 56px }
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
  display: block; margin-bottom: 10px;
  font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; line-height: 1;
  letter-spacing: 0; color: var(--accent-deep);
}
.hp-mark { display: flex; color: var(--accent-deep); margin: 0 0 14px }
.hp-see__grid a { display: block; color: inherit; text-decoration: none; }
.hp-see__grid a::after {
  content: ""; display: block; width: 36px; height: 2px; margin-top: 18px; background: var(--accent);
  transform: scaleX(0); transform-origin: left; transition: transform .28s var(--ease);
}
.hp-see__grid a:hover::after, .hp-see__grid a:focus-visible::after { transform: scaleX(1) }
.hp-see__grid strong { display: block; font-size: 1.05rem; font-weight: 650; letter-spacing: -.014em; transition: color .2s var(--ease) }
.hp-see__grid a:hover strong { color: var(--accent-deep) }
.hp-see__grid p { margin: 8px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.55; max-width: 28ch }
.hp-see[data-r], .hp-see[data-r] .hp-see__intro, .hp-see[data-r] li {
  opacity: 1; transform: none; filter: none;
}

.hp-perk {
  position: relative; overflow: visible;
  display: grid; grid-template-columns: 1fr 1fr; gap: 40px 56px; align-items: center;
  padding: 72px 0 0; border-radius: 0; margin-top: 88px;
  background: none; color: var(--ink); border: 0; border-top: 1px solid var(--border);
  box-shadow: none;
}
.hp-perk::before { display: none }
.hp-perk__copy, .hp-perk__stage { position: relative; z-index: 1 }
.hp-perk__kicker {
  display: inline-block; margin: 0; padding: 6px 12px; border-radius: 999px;
  background: rgba(238,240,255,.14); border: 1px solid rgba(238,240,255,.22);
  font-family: var(--font-mono); font-size: .68rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: #fff;
}
.hp-perk__copy h2 {
  margin: 0; font-family: var(--font-display); font-weight: 700;
  letter-spacing: -.03em; line-height: 1.08;
  font-size: clamp(2.2rem, 3.8vw, 3.1rem); color: var(--ink);
}
.hp-perk__copy > p:not(.hp-perk__kicker) {
  margin: 18px 0 0; max-width: 42ch; color: var(--ink-soft);
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
.hp-perk__stage .hp-case__stack { border-radius: 0 }
.hp-perk__stage .hp-ticket {
  animation: none; border-left: 0; border-radius: 0;
  box-shadow: 0 32px 60px -24px rgba(16,8,64,.75);
}
.hp-perk__stage .hp-ticket__bar { padding: 16px 20px 0 }
.hp-perk__stage .hp-ticket__bar span[data-sev],
.hp-perk__stage .hp-ticket__bar span:last-child { border-radius: 999px; padding: 3px 9px }
.hp-perk__stage .hp-ticket__sheet { padding: 12px 20px 20px }
.hp-perk__stage .hp-ticket h2 { color: var(--ink); font-size: 1.6rem; letter-spacing: -.03em }
.hp-perk__stage .hp-ticket__ask {
  padding: 12px 14px; border: 0; border-radius: 0; background: var(--accent-soft);
}
.hp-perk__stage .hp-dock {
  width: min(420px, 100%); margin: 12px 0 0 auto; padding: 12px 0 0;
  border-radius: 0; border: 0; border-top: 1px solid var(--border);
  background: none; box-shadow: none;
}
.hp-perk__cards {
  grid-column: 1 / -1; list-style: none; margin: 8px 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  position: relative; z-index: 1;
}
.hp-perk__cards li {
  background: #fff; color: var(--ink); border-radius: 0;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
  padding: 20px 20px 22px; border: 1px solid var(--border-strong);
  box-shadow: none;
}
.hp-perk__cards li:hover { border-color: rgba(85,70,224,.4) }
.hp-perk__cards header {
  display: flex; align-items: center; gap: 10px; margin: 0 0 16px; color: var(--accent-deep);
}
.hp-perk__cards header span {
  font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .08em;
}
.hp-perk__cards strong { display: block; font-size: 1.04rem; font-weight: 650; letter-spacing: -.014em }
.hp-perk__cards p { margin: 8px 0 0; color: var(--ink-soft); font-size: .86rem; line-height: 1.55 }

.hp-deck {
  display: grid; grid-template-columns: 1.2fr .8fr; grid-template-rows: auto auto; gap: 16px;
}
.hp-tile {
  position: relative; display: flex; flex-direction: column;
  min-height: 100%; padding: 0 28px 28px; border-radius: 0;
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%);
  background: #fff; border: 1px solid var(--border-strong);
  box-shadow: 0 18px 40px -30px rgba(16,25,46,.3);
  transition: transform .4s var(--ease), box-shadow .4s var(--ease);
}
.hp-tile:hover {
  transform: none;
  border-color: rgba(106,92,255,.45);
  box-shadow: none;
}
.hp-tile__stub {
  display: flex; justify-content: space-between; align-items: center;
  margin: 0 -28px 22px; padding: 11px 28px;
  background: var(--accent-soft);
  font-family: var(--font-mono); font-size: .72rem; font-weight: 650;
  letter-spacing: .02em; text-transform: none; color: var(--accent-deep);
}
.hp-tile--lead {
  grid-row: 1 / span 2; padding-bottom: 36px;
  background:
    radial-gradient(90% 50% at 100% 0%, var(--accent-soft), transparent 50%),
    #fff;
}
.hp-tile--labs {
  background: #fff; border-color: var(--border-strong); color: var(--ink);
  border-left: 4px solid var(--accent); padding-bottom: 32px;
}
.hp-tile--labs .hp-tile__stub { background: var(--accent-soft); color: var(--accent-deep); margin-bottom: 26px }
.hp-tile--labs:hover { box-shadow: none }
.hp-tile h3 {
  display: flex; align-items: center; gap: 10px; margin: 0;
  font-family: var(--font-display); font-size: clamp(1.28rem, 2vw, 1.55rem);
  font-weight: 700; letter-spacing: -.02em;
}
.hp-tile h3 svg { flex: none; color: var(--accent-deep) }
.hp-tile--labs h3 svg { color: var(--accent-deep) }
.hp-tile--labs h3 { color: var(--ink) }
.hp-tile p { margin: 12px 0 0; color: var(--ink-soft); font-size: .94rem; line-height: 1.6 }
.hp-tile--labs p { color: var(--ink-soft); margin-top: 8px; line-height: 1.55 }
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
.hp-tile li {
  display: flex; align-items: flex-start; gap: 8px; font-size: .88rem; color: var(--ink);
}
.hp-tile li svg { flex: none; margin-top: 1px; color: var(--accent-deep) }
.hp-tile .sp-btn { margin-top: auto; align-self: flex-start }
.hp-tile__link {
  display: inline-flex; align-items: center; gap: 7px; margin-top: auto;
  font-size: .9rem; font-weight: 650; color: var(--accent-deep); text-decoration: none;
  transition: gap .25s var(--ease);
}
.hp-tile__link:hover { gap: 11px }
.hp-tile__link--light { color: var(--accent-deep) }
.hp-deck[data-r], .hp-deck[data-r] > * { opacity: 1; transform: none; filter: none; transition: none }

.hp-voice-wrap { padding-top: 112px }
.hp-voice-wrap .hx-work__kicker { text-align: center }
.hp-reviews { list-style: none; margin: 18px auto 0; padding: 0; display: grid; grid-template-columns: minmax(0, 820px); justify-content: center; gap: 16px }
.hp-reviews li {
  display: grid; grid-template-columns: 108px minmax(0, 1fr); gap: 8px 22px; align-items: center;
  padding: 22px 26px 22px 22px; background: #fff;
  border: 1px solid rgba(85,70,224,.24); border-left: 4px solid var(--accent);
  clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%);
  box-shadow: 0 18px 36px -26px rgba(42,34,128,.5);
  animation: hp-rev-in .7s var(--ease) both;
  transition: transform .35s var(--ease), box-shadow .35s var(--ease);
}
.hp-reviews li:hover {
  transform: translateY(-6px);
  box-shadow: 0 28px 44px -22px rgba(42,34,128,.42);
}
.hp-voice__photo {
  width: 108px; height: 132px; overflow: hidden; background: #eef0ff;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
}
.hp-voice__photo img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center 16% }
.hp-reviews blockquote {
  margin: 0; font-weight: 400; font-size: 1.08rem; line-height: 1.55; color: var(--ink);
}
.hp-reviews mark { background: linear-gradient(transparent 62%, rgba(106,92,255,.28) 62%); color: inherit; padding: 0 1px }
.hp-reviews footer { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; margin-top: 14px }
@keyframes hp-rev-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes hp-star { from { opacity: 0; transform: scale(.4) } to { opacity: 1; transform: none } }
.hp-reviews strong { font-family: var(--font-display); font-size: 1rem; font-weight: 700; letter-spacing: -.02em }
.hp-reviews footer > span { color: var(--muted); font-size: .78rem; line-height: 1.35 }
.hp-voice__stars { display: inline-flex; gap: 2px; color: var(--accent) }
.hp-voice__stars svg { fill: currentColor; animation: hp-star .4s var(--ease) both }
.hp-voice__stars svg:nth-child(2) { animation-delay: .08s }
.hp-voice__stars svg:nth-child(3) { animation-delay: .16s }
.hp-voice__stars svg:nth-child(4) { animation-delay: .24s }
.hp-voice__stars svg:nth-child(5) { animation-delay: .32s }
.hp-reviews a {
  display: inline-flex; align-items: center; gap: 5px;
  color: var(--accent); font-size: .78rem; font-weight: 650; text-decoration: none;
}
.hp-reviews a:hover { color: var(--accent-deep, #5546e0) }

.hp-close {
  position: relative; overflow: visible;
  display: grid; grid-template-columns: 1.15fr .85fr; gap: 36px; align-items: center;
  margin-top: 88px; padding: 72px 0 0;
  background: none; color: var(--ink); border: 0; border-top: 1px solid var(--border);
}
.hp-close::before { display: none }
.hp-close__copy, .hp-close .hold { position: relative; z-index: 1 }
.hp-close__kicker {
  margin: 0; font-family: var(--font-mono); font-size: .7rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: var(--hp-mist);
}
.hp-close h2 { font-size: clamp(2rem, 3.4vw, 2.7rem); color: var(--ink) }
.hp-close__sub { margin: 12px 0 0; max-width: 36ch; color: var(--ink-soft); font-size: 1.02rem; line-height: 1.5 }
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
  display: inline-flex; align-items: center; gap: 8px; color: var(--accent-deep); font-weight: 650; text-decoration: none;
  transition: gap .25s var(--ease);
}
.hp-close__more:hover { gap: 12px }
.hp-close__hold {
  background: #fff; color: var(--ink); border: 1px solid var(--border-strong); border-left: 4px solid var(--accent);
  padding: 22px 22px 20px; box-shadow: none;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
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
@keyframes hp-drop { from { opacity: 0; transform: translateY(-40px) rotate(4deg) } to { opacity: 1; transform: rotate(-1.4deg) } }
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
  .hp-stage { min-height: 0; width: auto; margin-left: 0; padding: 8px 0 0; overflow: visible }
  .hp-stage .hp-floor::before { display: none }
  .hp-stage .hp-hero__copy, .hp-stage .hp-floor, .hp-stage .hp-rail { grid-column: 1; grid-row: auto }
  .hp-stage .hp-hero__copy { max-width: none }
  .hp-stage .hp-hero__h1 { font-size: clamp(3.2rem, 14vw, 4.8rem) }
  .hp-stage .hp-ticket, .hp-stage .hp-case__stack, .hp-stage .hp-case__stack--2 { transform: none }
  .hp-rail { grid-template-columns: 1fr }
  .hp-rail li + li { border-left: 0; border-top: 1px solid var(--border) }
  .hp-rail li + li a { padding-left: 0 }
  .hp-rail li + li a::before { left: 0 }
  .hp-hero__copy { padding: 20px 0 0 }
  .hp-floor { min-height: 0; padding-top: 28px }
  .hp-see__grid { grid-template-columns: 1fr }
  .hp-see__grid li + li { padding-left: 0; border-left: 0; border-top: 1px solid var(--border) }
  .hp-see__grid span { font-size: 1.2rem; margin-bottom: 10px }
  .hp-deck { grid-template-columns: 1fr }
  .hp-tile--lead { grid-row: auto }
  .hp-tile__split { grid-template-columns: 1fr }
  .hp-reviews { grid-template-columns: 1fr }
  .hp-reviews li { grid-template-columns: 76px minmax(0, 1fr); padding: 16px }
  .hp-voice__photo { width: 76px; height: 96px }
  .hp-close, .hp-perk { grid-template-columns: 1fr; gap: 28px; padding: 48px 0 0 }
  .hp-perk__stage .hp-case { margin: 0 auto }
  .hp-perk__stage .hp-dock { margin: -34px auto 0 }
  .hp-perk__cards { grid-template-columns: 1fr 1fr }
}
@media (max-width: 680px) {
  .hp-hero__actions { flex-direction: column }
  .hp-hero__actions .sp-btn { width: 100% }
  .hp-section, .hp-voice-wrap { padding-top: 72px }
  .hp-reviews li { grid-template-columns: 1fr; padding: 20px }
  .hp-voice__photo { width: 64px; height: 64px }
  .hp-reviews blockquote { font-size: 1.02rem }
  .hp-tile { padding: 0 20px 22px }
  .hp-tile__stub { margin: 0 -20px 18px; padding: 11px 20px }
  .hp-tile--labs { padding-bottom: 28px }
  .hp-tile--labs .hp-tile__stub { margin-bottom: 22px }
  .hp-close { margin-top: 64px; padding: 40px 0 0 }
  .hp-close__book, .hp-perk__go { width: 100%; justify-content: center }
  .hp-perk { padding: 40px 0 0 }
  .hp-perk__cards { grid-template-columns: 1fr }
}
`;
