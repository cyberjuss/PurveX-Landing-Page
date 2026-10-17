"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { marked, type Token, type Tokens } from "marked";
import {
  Activity,
  AlarmClock,
  Archive,
  ArrowRight,
  Ban,
  Banknote,
  BellRing,
  Binary,
  BrickWall,
  Briefcase,
  Bug,
  Building2,
  Cable,
  Calculator,
  CalendarClock,
  CircleHelp,
  ClipboardCheck,
  CloudLightning,
  Code,
  Cookie,
  Copy,
  CreditCard,
  Crosshair,
  Database,
  Eye,
  EyeOff,
  FileLock,
  FileSearch,
  FileText,
  Fingerprint,
  Flame,
  Folder,
  FolderTree,
  Gauge,
  Globe,
  Handshake,
  HardDriveDownload,
  Hash,
  HeartPulse,
  History,
  Hourglass,
  IdCard,
  KeyRound,
  Landmark,
  Laptop,
  Layers,
  Link2,
  ListChecks,
  LockKeyhole,
  LockOpen,
  Mail,
  MailWarning,
  Monitor,
  Network,
  Pill,
  Radar,
  Receipt,
  RefreshCw,
  Router,
  Scale,
  ScrollText,
  Search,
  Server,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  Siren,
  Skull,
  Smartphone,
  Target,
  Terminal,
  UserCheck,
  UserCog,
  UserRoundX,
  Users,
  Waypoints,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Markdown } from "@/lib/markdown";
import { dropLonePeriod } from "@/lib/lone-period";
import type { RecapItem } from "@/lib/lesson-deck";
import { collect, has, loadDeck } from "@/lib/concept-review";
import { confettiFrom } from "@/lib/confetti";

// First match wins, so the narrower words sit above the broader ones. Matched
// against the plain text of one list item.
const ITEM_ICONS: [RegExp, LucideIcon][] = [
  [/social security|\bssn\b|\bid\b card|identity/i, IdCard],
  [/salar|payroll|wage/i, Banknote],
  [/medical|patient|health/i, HeartPulse],
  [/medication|dose|drug/i, Pill],
  [/deal|merger|contract|engagement/i, Handshake],
  [/payment|checkout|card number/i, CreditCard],
  [/time clock|clock|timeout|expire|dormant/i, AlarmClock],
  [/invoice|billing|billed|receipt/i, Receipt],
  [/finance|accounting|ledger/i, Calculator],
  [/wealth|bank|client funds/i, Landmark],
  [/compliance|regulat|audit|glba|sox/i, Scale],
  [/phish|fake sign-in|spoof/i, MailWarning],
  [/e-?mail|smtp|imap|pop3|mailbox/i, Mail],
  [/\bvpn\b|tunnel/i, Waypoints],
  [/firewall/i, BrickWall],
  [/ddos|denial of service|flood/i, CloudLightning],
  [/natural disaster|storm|fire\b/i, Flame],
  [/nation-state|state group/i, Landmark],
  [/attacker|criminal|adversar/i, Crosshair],
  [/malware|virus|ransomware|trojan/i, Skull],
  [/insider/i, UserRoundX],
  [/unpatched|patch|update/i, RefreshCw],
  [/misconfigur|configuration/i, Wrench],
  [/weak password|password polic|password|symmetric/i, KeyRound],
  [/\bport\b|ports\b/i, Cable],
  [/vulnerab|weakness|flaw/i, Bug],
  [/threat/i, ShieldAlert],
  [/risk|likelihood|impact|cost|damage/i, Gauge],
  [/backup|rebuild|restore/i, HardDriveDownload],
  [/redundan|second path|failover/i, Copy],
  [/encrypt|cipher|gibberish|key holder|the key\b/i, LockKeyhole],
  [/decrypt|undone|reversed|get it back/i, LockOpen],
  [/hash|sha-?256|checksum|integrity/i, Hash],
  [/encod|base64/i, Binary],
  [/signature|signed/i, FileLock],
  [/fingerprint|face|biometric|something you are/i, Fingerprint],
  [/phone|authenticator|sms|text code|something you have/i, Smartphone],
  [/\bmfa\b|multi-factor|factor/i, ShieldCheck],
  [/authenticat|who somebody is|sign-?in|log ?on|logon/i, UserCheck],
  [/authoriz|allowed|permission|access control|enforces/i, ShieldBan],
  [/least privilege|admin|privilege|elevated/i, UserCog],
  [/refused|denied|403|blocked|reject/i, Ban],
  [/log\b|logs\b|event|record|lastlogon|pwdlastset|whencreated/i, ScrollText],
  [/alert|defender|siren/i, Siren],
  [/watch|read what|see|visible|notice/i, Eye],
  [/hidden|cookie/i, Cookie],
  [/form field|field/i, FileText],
  [/handshake|connection|syn\b/i, Handshake],
  [/\btls\b|\bssl\b|https|privacy/i, LockKeyhole],
  [/\bdns\b|name lookup|domain name/i, Globe],
  [/address|routing|\bip\b|router|gateway/i, Router],
  [/protocol|layer/i, Layers],
  [/wire|network|traffic|packet|data moved/i, Network],
  [/wi-?fi|wireless/i, Wifi],
  [/domain controller|server/i, Server],
  [/workstation|laptop|desktop|\bvm\b|windows 10/i, Laptop],
  [/computer|machine|monitor/i, Monitor],
  [/service account|automated|scheduled task|script|powershell/i, Terminal],
  [/contractor|intern|staff|employee|people|person|user|account|caller/i, Users],
  [/group|member/i, Users],
  [/organizational unit|\bou\b|\bous\b|folder|director/i, FolderTree],
  [/department|org chart|firm/i, Building2],
  [/policy|gpo|setting|restriction/i, ListChecks],
  [/ticket|request|reset/i, ClipboardCheck],
  [/job|role|title|promotion/i, Briefcase],
  [/search|find|look/i, Search],
  [/check|confirm|verify|exist|right/i, ClipboardCheck],
  [/sequence|order|number/i, Activity],
  [/time|shortly|short time|history/i, History],
  [/code|program/i, Code],
  [/file|document|download/i, FileSearch],
  [/data|database|store/i, Database],
  [/phone number|new phone/i, Smartphone],
  [/target|goal/i, Target],
  [/fast|speed|quick/i, Zap],
  [/schedule|calendar|week/i, CalendarClock],
  [/wait|slow/i, Hourglass],
  [/notify|bell|prompt/i, BellRing],
  [/link|url|address bar/i, Link2],
  [/archive|keep/i, Archive],
  [/hide|private|confidential/i, EyeOff],
  [/radar|scan/i, Radar],
  [/folder/i, Folder],
  [/\?$/, CircleHelp],
];

export function iconForItem(text: string): LucideIcon {
  return ITEM_ICONS.find(([re]) => re.test(text))?.[1] ?? ArrowRight;
}

const OPEN_TAG = /<(div|details|figure|section|aside|table)\b/gi;
const CLOSE_TAG = /<\/(div|details|figure|section|aside|table)>/gi;

type Card = { lead: string | null; html: string; text: string };
type Block = { kind: "md"; raw: string } | { kind: "tiles" | "cards" | "steps"; items: Card[] };

function plain(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\*\*|__|`/g, "").trim();
}

// A list item whose text opens with bold, like "**Salt:** a random value",
// reads as a card with that bold part as its title.
function toCard(item: Tokens.ListItem): Card | null {
  if (item.tokens.some((t) => t.type === "list" || t.type === "code")) return null;
  const text = item.text.trim();
  const lead = /^\*\*(.+?)\*\*[.:]?\s*([\s\S]*)$/.exec(text);
  if (lead && lead[2]) {
    return {
      lead: plain(lead[1]).replace(/[.:]$/, ""),
      html: dropLonePeriod(marked.parseInline(lead[2].replace(/^[-–:]\s*/, ""), { async: false }) as string),
      text,
    };
  }
  return { lead: null, html: dropLonePeriod(marked.parseInline(text, { async: false }) as string), text };
}

const wordCount = (s: string) => plain(s).split(/\s+/).filter(Boolean).length;

// Short lists become a grid of icon tiles; bold-led lists become icon cards;
// short ordered lists become numbered steps. Anything longer, nested, or
// inside an HTML block stays ordinary prose.
function shape(list: Tokens.List): Block | null {
  const cards = list.items.map(toCard);
  if (cards.some((c) => !c) || cards.length < 2 || cards.length > 8) return null;
  const items = cards as Card[];
  if (list.ordered) {
    return items.length <= 6 && items.every((c) => wordCount(c.text) <= 24) ? { kind: "steps", items } : null;
  }
  if (items.every((c) => c.lead) && items.length <= 6 && items.every((c) => wordCount(c.text) <= 48)) {
    return { kind: "cards", items };
  }
  if (items.every((c) => wordCount(c.text) <= 12)) return { kind: "tiles", items };
  return null;
}

// About two to three lines of slide prose. A paragraph longer than this is
// cut at sentence ends into pieces of roughly this size.
const CHUNK_CHARS = 200;

// Splits a long paragraph into short pieces so a slide never shows a wall of
// text. Cuts only between sentences, never inside a code span, and never
// while a **bold** run is still open.
export function chunkParagraph(raw: string): string[] {
  const text = raw.trim();
  if (text.length <= CHUNK_CHARS * 1.2) return [text];
  const codes: string[] = [];
  const safe = text.replace(/`[^`]*`/g, (m) => `\u0000${codes.push(m) - 1}\u0000`);
  const sentences: string[] = [];
  const end = /[.!?]["')\]*_]*\s+(?=[A-Z0-9"'(*\u0000])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = end.exec(safe))) {
    sentences.push(safe.slice(last, m.index + m[0].length).trim());
    last = m.index + m[0].length;
  }
  sentences.push(safe.slice(last).trim());
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences.filter(Boolean)) {
    const balanced = (cur.match(/\*\*/g)?.length ?? 0) % 2 === 0;
    if (cur && balanced && cur.length + s.length + 1 > CHUNK_CHARS) {
      chunks.push(cur);
      cur = s;
    } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) chunks.push(cur);
  return chunks.map((c) => c.replace(/\u0000(\d+)\u0000/g, (_, n) => codes[Number(n)]));
}

function toBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  let depth = 0;
  const pushMd = (raw: string) => {
    const last = blocks[blocks.length - 1];
    if (last?.kind === "md") last.raw += `\n${raw}`;
    else blocks.push({ kind: "md", raw });
  };
  for (const token of marked.lexer(markdown) as Token[]) {
    if (token.type === "space") continue;
    const shaped = depth === 0 && token.type === "list" ? shape(token as Tokens.List) : null;
    // Each paragraph is its own build step, and a long one is cut into a few
    // short ones. Everything inside an open HTML block, and the HTML itself,
    // stays with what came before it.
    if (shaped) blocks.push(shaped);
    else if (depth > 0 || token.type === "html") pushMd(token.raw);
    else if (token.type === "paragraph") for (const piece of chunkParagraph(token.raw)) blocks.push({ kind: "md", raw: piece });
    else blocks.push({ kind: "md", raw: token.raw });
    depth = Math.max(0, depth + (token.raw.match(OPEN_TAG)?.length ?? 0) - (token.raw.match(CLOSE_TAG)?.length ?? 0));
  }
  return blocks;
}

// The pointer's place on a card, for the glow that follows it and the slight
// tilt toward it. Written straight onto the element so moving costs no render.
function follow(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
  el.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
}
function settle(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--ry", "0deg");
  el.style.setProperty("--rx", "0deg");
}

// Term cards flip: the term and its icon on the front, what it means on the
// back. Recalling the meaning before turning the card is the point, so they
// start face down, and one control turns them all over.
/** The closing recap: every key term face down, the sentence that taught it on the back. */
// Numbers that count up from zero as they arrive, the way a score does.
function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    // With reduced motion the first frame lands on the final number.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = reduce ? 1 : Math.min(1, (t - start) / 700);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

// The first time a student reaches a section's recap is a finish line, so it
// gets one: a ring that closes, the counts ticking up, and confetti. After
// that the recap opens quietly. Remembered per browser.
const FINISHED_KEY = "academy-sections-finished";
function firstFinish(where: string): boolean {
  try {
    const done = new Set<string>(JSON.parse(window.localStorage.getItem(FINISHED_KEY) || "[]"));
    if (done.has(where)) return false;
    done.add(where);
    window.localStorage.setItem(FINISHED_KEY, JSON.stringify([...done]));
    return true;
  } catch {
    return false;
  }
}

/**
 * The closing recap: every key term face down, the sentence that taught it on
 * the back. Each card a student turns over joins their review deck, and comes
 * back on the home page when it is due.
 */
export function Recap({ items, slides, activities, where }: { items: RecapItem[]; slides: number; activities: number; where: string }) {
  const cards = useMemo(
    () => items.map((r) => ({ lead: r.term, html: dropLonePeriod(marked.parseInline(r.sentence, { async: false }) as string), text: r.sentence })),
    [items]
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const [collected, setCollected] = useState<number | null>(null);
  const [fresh, setFresh] = useState(0);
  const [mine, setMine] = useState<Set<string>>(() => new Set());
  const [finish, setFinish] = useState(false);
  // Storage is only readable in the browser, so the counts arrive after the
  // first paint rather than mismatching the server render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollected(Object.keys(loadDeck()).length);
    setMine(new Set(items.map((r) => r.term.toLowerCase()).filter((t) => has(t))));
    if (firstFinish(where)) {
      setFinish(true);
      const t = window.setTimeout(() => confettiFrom(rootRef.current, 60), 450);
      return () => window.clearTimeout(t);
    }
  }, [items, where]);
  const reveal = (j: number) => {
    const item = items[j];
    if (!item || !collect(item.term, item.sentence, where)) return;
    setCollected(Object.keys(loadDeck()).length);
    setMine((prev) => new Set(prev).add(item.term.toLowerCase()));
    setFresh((n) => n + 1);
  };
  return (
    <div className="lk-recap" ref={rootRef}>
      {finish && (
        <div className="lk-finish" role="status">
          <svg className="lk-finish__ring" viewBox="0 0 44 44" aria-hidden>
            <circle cx="22" cy="22" r="19" className="lk-finish__track" />
            <circle cx="22" cy="22" r="19" className="lk-finish__fill" />
            <path d="M14 22.5 l5.5 5.5 l11 -12" className="lk-finish__tick" />
          </svg>
          <span>
            <strong>Section complete.</strong> Flip each card to add it to your review deck. They come back when it is time to
            practise.
          </span>
        </div>
      )}
      <p className="lk-recap__stats lk-build">
        <span>
          <b>
            <CountUp to={slides} />
          </b>{" "}
          slides
        </span>
        {activities > 0 && (
          <span>
            <b>
              <CountUp to={activities} />
            </b>{" "}
            {activities === 1 ? "activity" : "activities"}
          </span>
        )}
        <span>
          <b>
            {mine.size}/{items.length}
          </b>{" "}
          in your deck
        </span>
        {collected !== null && (
          <span className="lk-recap__total">
            <b key={`count-${collected}`}>{collected}</b> in your review deck
            {fresh > 0 && (
              <em key={`plus-${fresh}`} className="lk-recap__plus">
                +1
              </em>
            )}
          </span>
        )}
      </p>
      <FlipCards items={cards} i={1} onReveal={reveal} />
    </div>
  );
}

function FlipCards({ items, i, onReveal }: { items: Card[]; i: number; onReveal?: (j: number) => void }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const all = open.size === items.length;
  const toggle = (j: number) => {
    const next = new Set(open);
    if (next.has(j)) next.delete(j);
    else {
      next.add(j);
      onReveal?.(j);
    }
    setOpen(next);
  };
  return (
    <div className="lk-flipwrap lk-build" style={{ ["--i" as string]: i }}>
      <div className="lk-fliphead">
        <span>Say what each one means, then flip it</span>
        <button type="button" onClick={() => {
            if (!all) items.forEach((_, j) => onReveal?.(j));
            setOpen(all ? new Set() : new Set(items.map((_, j) => j)));
          }}>
          {all ? "Flip all back" : "Flip all"}
        </button>
      </div>
      <ul className="lk-cards">
        {items.map((c, j) => {
          const Icon = iconForItem(`${c.lead ?? ""} ${plain(c.text)}`);
          const shown = open.has(j);
          return (
            <li key={j} className={`lk-c${(i + j) % 8} lk-m${j % 4}`} style={{ ["--j" as string]: j }}>
              <button
                type="button"
                className={`lk-flip${shown ? " is-open" : ""}`}
                aria-pressed={shown}
                aria-label={shown ? `${c.lead}: ${plain(c.text)}` : `${c.lead}. Flip to see what it means.`}
                onClick={() => toggle(j)}
                onPointerMove={follow}
                onPointerLeave={settle}
              >
                <span className="lk-flip__face lk-flip__front">
                  <span className="lk-ico" aria-hidden>
                    <Icon strokeWidth={1.75} />
                  </span>
                  <strong>{c.lead}</strong>
                  <span className="lk-flip__hint">Tap to flip</span>
                </span>
                <span className="lk-flip__face lk-flip__back">
                  <strong>{c.lead}</strong>
                  <span dangerouslySetInnerHTML={{ __html: c.html }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// A slide's body, built in like a presentation: each short paragraph, list
// and card grid rises in a beat after the one before it.
export function SlideBody({ markdown }: { markdown: string }) {
  const blocks = useMemo(() => toBlocks(markdown), [markdown]);
  return (
    <div className="lk__flow">
      {blocks.map((b, i) => {
        const style = { ["--i" as string]: i };
        if (b.kind === "md") {
          return (
            <div key={i} className="lk-build" style={style}>
              <Markdown content={b.raw} className="lk__prose" />
            </div>
          );
        }
        if (b.kind === "steps") {
          return (
            <ol key={i} className="lk-steps lk-build" style={style}>
              {b.items.map((c, j) => (
                <li key={j} style={{ ["--j" as string]: j }}>
                  <span className="lk-steps__n">{j + 1}</span>
                  <span className="lk-steps__text">
                    {c.lead && <strong>{c.lead}. </strong>}
                    <span dangerouslySetInnerHTML={{ __html: c.html }} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        if (b.kind === "cards") return <FlipCards key={i} items={b.items} i={i} />;
        return (
          <ul key={i} className="lk-tiles lk-build" style={style}>
            {b.items.map((c, j) => {
              const Icon = iconForItem(plain(c.text));
              return (
                // Each tile takes the next color and the next idle motion, so a
                // grid never reads as one icon stamped five times.
                <li
                  key={j}
                  className={`lk-c${(i + j) % 8} lk-m${j % 4}`}
                  style={{ ["--j" as string]: j }}
                  onPointerMove={follow}
                  onPointerLeave={settle}
                >
                  <span className="lk-ico" aria-hidden>
                    <Icon strokeWidth={1.75} />
                  </span>
                  <span className="lk-tiles__text" dangerouslySetInnerHTML={{ __html: c.html }} />
                </li>
              );
            })}
          </ul>
        );
      })}
    </div>
  );
}
