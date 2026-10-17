import "server-only";
import { seeded, shuffle } from "@/lib/academy-drills";
import { ROSTER, SHIFT_SECONDS, type IncidentRun, type Severity, type Staff } from "@/lib/academy-shift";

// The desk around the incidents. A real shift is not only alerts: the inbox
// keeps filling, with phishing, a manager wanting status, a request to skip the
// process. One email lands per shift, picked from the pool below, and is
// answered in the console and graded here, deterministically, against
// reasoning that is written down with its source. Nothing in this file touches
// the lab. Like the incidents, an email has no timer of its own: it waits in
// the inbox until it is answered or the shift ends.
//
// Sources the reasoning rests on:
// - CISA and FBI advisory AA23-320A (Scattered Spider): the actors "conduct
//   spearphishing calls to convince IT help desk personnel to reset passwords"
//   and "posed as employees". The MGM Resorts breach is the well-known case.
// - NIST SP 800-63B-4, Sec. 4.2 and 4.6: account recovery "SHALL confirm that
//   the claimant's identity is consistent with the previously established
//   account", and a recovery "SHALL cause a notification to be sent to the
//   subscriber" at the addresses already stored in the account.
// - CISA, Avoiding Social Engineering and Phishing Attacks (ST04-014): check
//   the sender and the real link destination, and report rather than reply.
// - FBI IC3 business email compromise announcements: urgency, secrecy, gift
//   cards and changed bank details, verified out of band.
// - NIST SP 800-53 Rev. 5, AC-6 (least privilege) and CM-3 (change control).
// - The lessons themselves: Week 2 "verify the caller with a callback to the
//   number on file, never a number they give you"; Week 4, "do not skip steps
//   for urgency or seniority"; the Shift rule that P1s are worked first.

/** An email with choices, or one that asks for a written reply. */
export type DeskKind = "email" | "reply";

type Choice = { id: string; text: string; correct: boolean; why: string };

export type DeskDef = {
  id: string;
  kind: DeskKind;
  /** Earliest drill level (1-4) this can appear at. */
  minLevel: number;
  points: number;
  /** One line Coach says after it is answered, whatever the answer. */
  lesson: string;
  /** Where the reasoning comes from, shown with the feedback. */
  source: string;
  build: (who: Staff) => { from: string; title: string; body: string; choices?: Choice[]; prompt?: string };
};

export const DESK_EVENTS: DeskDef[] = [
  {
    id: "mfa-reset-email",
    kind: "email",
    minLevel: 1,
    points: 15,
    lesson: "Urgency and inside details are what a social engineer brings. Verify through what the account already has on file, then reset, and the owner is told.",
    source: "CISA AA23-320A · NIST SP 800-63B-4 §4.2, §4.6 · Week 2, Storing Passwords",
    build: (who) => ({
      from: `${who.name} <${who.sam}@purvex-mail.com>`,
      title: "Lost my phone, need MFA reset ASAP",
      body: `"Hi, it's ${who.name.split(" ")[0]} from ${who.dept}. My phone was stolen at the airport and my authenticator went with it. I have to approve a payment before my flight boards. Please reset my MFA and send the new enrollment link to this address. I can reply with my employee number."`,
      choices: [
        {
          id: "reset",
          text: "Reset it and send the link to this address. They know their department and it is time-critical",
          correct: false,
          why: "The reply-to is an outside address, not the company's, and the deadline is there to rush you. Sending enrollment to an address the requester controls hands the account over.",
        },
        {
          id: "kba",
          text: "Ask for their employee number and date of birth by email, then reset",
          correct: false,
          why: "Facts someone can type into an email prove only that they found them. They do not show the sender owns the account.",
        },
        {
          id: "verify",
          text: "Change nothing from this email. Call the number already in the directory, reset only if that checks out, and notify the owner",
          correct: true,
          why: "Recovery has to confirm the requester matches the account as it was established, through contact details already on file, and the owner is told on a channel separate from the request.",
        },
        {
          id: "ignore",
          text: "Delete it. MFA resets are never done for travelling staff",
          correct: false,
          why: "Real people do lose phones. Refusing outright leaves a colleague locked out; the job is to verify and then help, and to report the email if it does not check out.",
        },
      ],
    }),
  },
  {
    id: "lookalike-phish",
    kind: "email",
    minLevel: 1,
    points: 15,
    lesson: "Read the sender's domain and where a link really goes before anything else. A lookalike domain is a report, not a reply.",
    source: "CISA, Avoiding Social Engineering and Phishing Attacks (ST04-014) · Week 4, Authentication: pressure is the most common social engineering move",
    build: () => ({
      from: "IT Service Desk <helpdesk@purvex-support.co>",
      title: "Action required: your admin password expires today",
      body: `"Your privileged account password expires in 2 hours. To avoid losing access to the domain controller, re-validate now at https://purvex-support.co/sso/renew. This mailbox is not monitored."`,
      choices: [
        {
          id: "click",
          text: "Open the link and re-validate. Losing admin access mid-shift would be worse",
          correct: false,
          why: "purvex-support.co is not the company's domain. A fake sign-in page for an admin account is the most valuable thing a phisher can catch.",
        },
        {
          id: "reply",
          text: "Reply and ask whether the email is genuine",
          correct: false,
          why: "Replying asks the sender to vouch for themselves, and confirms your address is live. Verify through a channel you already trust.",
        },
        {
          id: "report",
          text: "Do not click. Report it to security as phishing with the sender's domain and the link, and check your account directly if you are worried",
          correct: true,
          why: "The domain is a lookalike and the clock is pressure. Reporting it lets security block the domain and warn everyone else who got it.",
        },
        {
          id: "forward",
          text: "Forward it to the team chat so everyone knows to ignore it",
          correct: false,
          why: "Forwarding spreads the live link to more people. Report it once, to security, and let them warn the company.",
        },
      ],
    }),
  },
  {
    id: "exec-gift-cards",
    kind: "email",
    minLevel: 1,
    points: 15,
    lesson: "A request for money or gift cards that skips the normal process, from an address you cannot verify, is business email compromise until proven otherwise.",
    source: "FBI IC3, Business Email Compromise public service announcements · Week 4, Authentication: pressure is the most common social engineering move",
    build: () => ({
      from: "Dana Whitmore (CEO) <dana.whitmore.ceo@gmail.com>",
      title: "Quick favour, keep this between us",
      body: `"Are you at your desk? I need six $200 gift cards for a client thank-you before the board call. I'm stuck in meetings and can't talk. Buy them, scratch the backs, and email me the codes. I'll make sure you're reimbursed today."`,
      choices: [
        {
          id: "buy",
          text: "Buy them. It is the CEO and it is a small amount",
          correct: false,
          why: "Gift cards are untraceable once the codes are sent, which is why fraudsters ask for them. Seniority and secrecy are the pressure, not proof.",
        },
        {
          id: "reply",
          text: "Reply to the email and ask them to confirm it is really them",
          correct: false,
          why: "The answer will come from whoever controls that personal address. Verification has to go through a channel the company already holds.",
        },
        {
          id: "verify",
          text: "Do nothing it asks. Report it to security, and if you want to check, contact the CEO's office through the directory, not this email",
          correct: true,
          why: "A personal address, secrecy, urgency and gift cards are the classic marks of business email compromise. Security needs it so others are warned.",
        },
        {
          id: "ignore",
          text: "Ignore it and carry on with the queue",
          correct: false,
          why: "Ignoring it protects you but nobody else. The same email has likely gone to other staff, and reporting it lets security warn them.",
        },
      ],
    }),
  },
  {
    id: "admin-request-email",
    kind: "email",
    minLevel: 2,
    points: 15,
    lesson: "Privileged access needs a change ticket and an approver, not a convincing email. Least privilege is a process, not a favour.",
    source: "NIST SP 800-53 Rev. 5, AC-6 Least Privilege and CM-3 Configuration Change Control · Week 4, Authorization",
    build: (who) => ({
      from: `${who.name} <${who.sam}@purvex.local>`,
      title: "Add me to Domain Admins for the afternoon?",
      body: `"Hi, I'm installing the new reporting tool and the installer keeps failing on permissions. Could you add me to Domain Admins just for today? I'll tell you when I'm done and you can take me out. No need for a ticket, it's only a few hours."`,
      choices: [
        {
          id: "add",
          text: "Add them now and set a reminder to remove it at the end of the day",
          correct: false,
          why: "Domain Admins is full control of the domain. Temporary admin with no ticket is how standing access and untracked changes start, and reminders get missed.",
        },
        {
          id: "itadmins",
          text: "Add them to IT Admins instead, since it is less than Domain Admins",
          correct: false,
          why: "Picking a smaller privileged group still grants admin rights with no approval. The fix is the process, not a different group.",
        },
        {
          id: "ticket",
          text: "Change nothing. Ask them to raise a change ticket with what the installer needs, so it can be approved and done with the least access that works",
          correct: true,
          why: "An approved change records who asked, who approved and why, and the installer usually needs one specific right, not the whole domain.",
        },
        {
          id: "share",
          text: "Run the installer for them with your own admin account",
          correct: false,
          why: "That uses your privileges for someone else's unapproved change, and the audit trail now says you did it.",
        },
      ],
    }),
  },
  {
    id: "vendor-bank-change",
    kind: "email",
    minLevel: 2,
    points: 15,
    lesson: "A change to where money goes is verified by calling the vendor on a number you already have, never one in the email.",
    source: "FBI IC3, Business Email Compromise public service announcements · Week 4, Authentication: pressure is the most common social engineering move",
    build: (who) => ({
      from: `${who.name} <${who.sam}@purvex.local>`,
      title: "FW: Updated bank details for LedgerLine invoices",
      body: `"Forwarding this from LedgerLine. They've moved banks and want this month's payment to the new account below. Can IT update the vendor record in the payments system? Their accounts team says it's urgent so the invoice isn't late. New details and a phone number to confirm are in their message."`,
      choices: [
        {
          id: "update",
          text: "Update the record. It came from a colleague, so it is trusted",
          correct: false,
          why: "Your colleague is trusted; the forwarded message is not. Vendor bank changes are one of the most common business email compromise frauds.",
        },
        {
          id: "their-number",
          text: "Call the number in the vendor's message to confirm, then update it",
          correct: false,
          why: "A number in the suspicious message reaches whoever wrote it. The check has to go to contact details you already hold for the vendor.",
        },
        {
          id: "verify",
          text: "Change nothing. Tell your colleague to have Finance confirm with LedgerLine on the number already on file, and report the message to security",
          correct: true,
          why: "Payment changes need verification out of band, by the team that owns them. If the vendor's mail was compromised, security needs to know.",
        },
        {
          id: "not-mine",
          text: "Reply that it is not an IT task and close it",
          correct: false,
          why: "It is not yours to change, but it is yours to flag. Closing it silently leaves the fraud in play.",
        },
      ],
    }),
  },
  {
    id: "status-email",
    kind: "reply",
    minLevel: 1,
    points: 10,
    lesson: "A good status is one line a manager can repeat: which incident, where it stands, and what you do next.",
    source: "Shift practice · Week 4 and Phase 2 escalation guidance",
    build: () => ({
      from: "Desk lead <desk.lead@purvex.local>",
      title: "Status for leadership?",
      body: "\"Leadership is asking. One line please: what are you on, where is it, what's next?\"",
      prompt: "Your one-line reply",
    }),
  },
  {
    id: "urgent-screen-email",
    kind: "email",
    minLevel: 2,
    points: 10,
    lesson: "Priority decides the order, not volume or rank. Acknowledge the person, give an honest time, log it, and go back to the highest priority.",
    source: "Shift rules: the queue is worked by priority, P1 first",
    build: (who) => ({
      from: `${who.name} <${who.sam}@purvex.local>`,
      title: "URGENT!!! Conference room screen not working",
      body: `"The client presentation starts in ten minutes and the screen in Room 4 won't connect to my laptop. This is URGENT, please come now."`,
      choices: [
        {
          id: "drop",
          text: "Leave the incident you are on and go to Room 4 now",
          correct: false,
          why: "A security incident comes first because it can hurt the whole firm. A meeting room screen cannot. Walking away is how a small breach becomes a big one.",
        },
        {
          id: "ignore",
          text: "Leave it unanswered until the queue is clear",
          correct: false,
          why: "Silence makes people escalate around you. A ten-second reply keeps their trust and costs the incident nothing.",
        },
        {
          id: "ack-log",
          text: "Reply that you are on a priority incident, log a ticket for the screen with an honest time, and stay on the incident",
          correct: true,
          why: "It is real work, just not the most urgent. Acknowledged, logged and timed, it gets done without the incident paying for it.",
        },
        {
          id: "password",
          text: "Reply with the room's admin password so they can fix it themselves",
          correct: false,
          why: "Sharing a credential by email fixes today and leaves a password in a mailbox for good. It is never the shortcut.",
        },
      ],
    }),
  },
];

const deskDef = (id: string) => DESK_EVENTS.find((d) => d.id === id) ?? null;

// ---- a desk event in a run ------------------------------------------------

export type DeskRun = {
  uid: string;
  defId: string;
  kind: DeskKind;
  arriveSec: number;
  windowSec: number;
  /** The staff member it is about, so the wording is fixed for the run. */
  who: string;
  /** Choice ids in the order the student sees them, shuffled per run. */
  order?: string[];
  answeredAtSec: number | null;
  choice?: string | null;
  text?: string;
  /** Filled when answered. */
  score?: number;
  hits?: string[];
  misses?: string[];
};

/**
 * The one email a shift gets, and when. Picked from the pool for the student's
 * level, so shifts differ; the urgent one lands just after the first P1, so it
 * competes with it, and the rest while the queue is busy. Deterministic per seed.
 */
export function planDesk(seed: string, level: number, incidents: Pick<IncidentRun, "uid" | "severity" | "arriveSec" | "bind">[]): DeskRun[] {
  const r = seeded(`${seed}:desk`);
  const taken = new Set(
    incidents
      .map((i) => (i.bind?.args && typeof i.bind.args === "object" ? Object.values(i.bind.args).map(String) : []))
      .flat()
      .map((v) => v.toLowerCase())
  );
  // A caller who is also an incident's victim would contradict the queue, so
  // they are picked from the people the shift is not already about.
  const people = shuffle(r, ROSTER.filter((s) => s.sam !== "alex.rivera" && !taken.has(s.sam)));
  const who = (k: number) => (people.length ? people[k % people.length] : ROSTER[1]);
  const at = (frac: number, jitter: number) => Math.round(SHIFT_SECONDS * frac + (r() - 0.5) * jitter);
  // No reply clock: it waits until the shift ends, so it lapses only then.
  const window = (arriveSec: number) => SHIFT_SECONDS - arriveSec;

  const out: DeskRun[] = [];
  const add = (defId: string, arriveSec: number, k: number) => {
    const def = deskDef(defId)!;
    const order = def.build(who(k)).choices?.map((c) => c.id);
    const when = Math.max(90, Math.min(SHIFT_SECONDS - 300, arriveSec));
    out.push({
      uid: `${defId}-${out.length}`,
      defId,
      kind: def.kind,
      arriveSec: when,
      windowSec: window(when),
      who: who(k).sam,
      order: order ? shuffle(r, order) : undefined,
      answeredAtSec: null,
    });
  };
  const pool = DESK_EVENTS.filter((d) => d.minLevel <= level);
  const pick = pool.length ? pool[Math.floor(r() * pool.length)] : null;
  if (pick) {
    const p1 = incidents.filter((i) => i.severity === "P1").sort((a, b) => a.arriveSec - b.arriveSec)[0];
    add(pick.id, pick.id === "urgent-screen-email" && p1 ? p1.arriveSec + 25 : at(0.4, 300), 0);
  }
  return out.sort((a, b) => a.arriveSec - b.arriveSec);
}

const staff = (sam: string) => ROSTER.find((s) => s.sam === sam) ?? ROSTER[1];

// ---- what the console sees -------------------------------------------------

export type PublicDesk = {
  uid: string;
  kind: DeskKind;
  from: string;
  title: string;
  body: string;
  prompt: string | null;
  choices: { id: string; text: string }[];
  arriveSec: number;
  secondsLeft: number | null;
  lapsed: boolean;
  answered: boolean;
  /** Only once answered: what they chose, whether it was right, and why. */
  verdict: {
    choice: string | null;
    text: string | null;
    correct: boolean;
    score: number;
    max: number;
    feedback: { id: string; text: string; correct: boolean; why: string }[];
    hits: string[];
    misses: string[];
    lesson: string;
    source: string;
  } | null;
};

export function deskArrived(d: DeskRun, elapsed: number) {
  return elapsed >= d.arriveSec;
}
export function deskLapsed(d: DeskRun, elapsed: number) {
  return d.answeredAtSec === null && elapsed > d.arriveSec + d.windowSec;
}

export function toPublicDesk(d: DeskRun, elapsed: number): PublicDesk | null {
  const def = deskDef(d.defId);
  if (!def || !deskArrived(d, elapsed)) return null;
  const view = def.build(staff(d.who));
  const byId = new Map((view.choices ?? []).map((c) => [c.id, c]));
  const ordered = (d.order ?? []).map((id) => byId.get(id)).filter((c): c is Choice => Boolean(c));
  const answered = d.answeredAtSec !== null;
  const lapsed = deskLapsed(d, elapsed);
  return {
    uid: d.uid,
    kind: d.kind,
    from: view.from,
    title: view.title,
    body: view.body,
    prompt: view.prompt ?? null,
    choices: ordered.map((c) => ({ id: c.id, text: c.text })),
    arriveSec: d.arriveSec,
    // Emails have no reply clock of their own; the shift's clock is the only one.
    secondsLeft: null,
    lapsed,
    answered,
    verdict:
      answered || lapsed
        ? {
            choice: d.choice ?? null,
            text: d.text ?? null,
            correct: (d.score ?? 0) >= def.points,
            score: d.score ?? 0,
            max: def.points,
            feedback: ordered.map((c) => ({ id: c.id, text: c.text, correct: c.correct, why: c.why })),
            hits: d.hits ?? [],
            misses: d.misses ?? (lapsed ? ["No answer before it lapsed"] : []),
            lesson: def.lesson,
            source: def.source,
          }
        : null,
  };
}

// ---- grading ---------------------------------------------------------------

/** A choice event: full points for the right call, none otherwise. */
export function gradeChoice(defId: string, who: string, choice: string): { score: number; correct: boolean } | null {
  const def = deskDef(defId);
  const c = def?.build(staff(who)).choices?.find((x) => x.id === choice);
  if (!def || !c) return null;
  return { score: c.correct ? def.points : 0, correct: c.correct };
}

const STATE = /\b(contain(ed|ing)?|investigat\w*|fix(ed|ing)?|resolv\w*|escalat\w*|working|disabl\w*|reset|unlock\w*|block\w*|clos\w*|monitor\w*|triag\w*|isolat\w*|remov\w*|confirm\w*|check\w*|look\w* into|on it)\b/i;
const NEXT = /\b(next|then|will|going to|eta|by \d|\d+\s*(m|min|mins|minutes?)\b|after (that|this)|once|shortly|soon)\b/i;

/**
 * A one-line status. Three things a lead can act on: which incident (it names
 * one on the queue, by a word from its title, its severity or its person),
 * where it stands, and what comes next. Each is a third of the points.
 */
export function gradeStatus(text: string, open: { title: string; severity: Severity; who?: string }[]): { score: number; hits: string[]; misses: string[] } {
  const t = text.trim();
  const words = new Set(
    open
      .flatMap((o) => [...o.title.toLowerCase().split(/[^a-z0-9]+/), o.severity.toLowerCase(), ...(o.who ? o.who.toLowerCase().split(/[^a-z]+/) : [])])
      .filter((w) => w.length >= 5 || /^p[123]$/.test(w))
  );
  const lower = t.toLowerCase();
  const namesIncident = [...words].some((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower));
  const checks: [boolean, string][] = [
    [namesIncident, "Names the incident"],
    [STATE.test(t), "Says where it stands"],
    [NEXT.test(t), "Says what happens next"],
  ];
  const hits = checks.filter(([ok]) => ok).map(([, l]) => l);
  const misses = checks.filter(([ok]) => !ok).map(([, l]) => l);
  return { score: Math.round((hits.length / 3) * (deskDef("status-email")?.points ?? 10)), hits, misses };
}

// ---- triage, timing and the after-action timeline --------------------------

const RANK: Record<Severity, number> = { P1: 3, P2: 2, P3: 1 };
export const TRIAGE_POINTS = 15;

export type TriageMiss = { openedUid: string; opened: Severity; waitingUid: string; waiting: Severity; atSec: number };

/**
 * Severity order. Each time an incident is opened, was a more severe one
 * already waiting on the queue, unopened and unfinished? That is a triage miss:
 * the analyst picked up lower-priority work while a higher one sat. Five points
 * off per miss. A queue that never had two things waiting at once has nothing
 * to miss and keeps the full points.
 */
export function triage(incidents: IncidentRun[]): { misses: TriageMiss[]; score: number; max: number } {
  const misses: TriageMiss[] = [];
  const doneAt = (i: IncidentRun) => Math.min(i.resolvedAtSec ?? Infinity, i.escalatedAtSec ?? Infinity);
  for (const opened of incidents) {
    if (opened.ackedAtSec === null) continue;
    const t = opened.ackedAtSec;
    const waiting = incidents
      .filter(
        (o) =>
          o.uid !== opened.uid &&
          RANK[o.severity] > RANK[opened.severity] &&
          o.arriveSec <= t &&
          (o.ackedAtSec === null || o.ackedAtSec > t) &&
          doneAt(o) > t
      )
      .sort((a, b) => RANK[b.severity] - RANK[a.severity] || a.arriveSec - b.arriveSec)[0];
    if (waiting) misses.push({ openedUid: opened.uid, opened: opened.severity, waitingUid: waiting.uid, waiting: waiting.severity, atSec: t });
  }
  return { misses, score: Math.max(0, TRIAGE_POINTS - 5 * misses.length), max: TRIAGE_POINTS };
}

/**
 * Timing, defined here rather than borrowed: vendors disagree on where these
 * clocks start and stop. Time to acknowledge is arrival to first opening.
 * Time to resolve is arrival to the lab showing the fix (escalations excluded,
 * they are a handoff). There is one window, the shift: a breach is an
 * incident that arrived and was still open when the shift ended.
 */
export function shiftMetrics(incidents: IncidentRun[], elapsedEnd: number) {
  const arrived = incidents.filter((i) => i.arriveSec <= elapsedEnd);
  const acks = arrived.filter((i) => i.ackedAtSec !== null).map((i) => i.ackedAtSec! - i.arriveSec);
  const fixes = arrived.filter((i) => i.resolvedAtSec !== null).map((i) => i.resolvedAtSec! - i.arriveSec);
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  const breaches = arrived.filter((i) => {
    const closedAt = Math.min(i.resolvedAtSec ?? Infinity, i.escalatedAtSec ?? Infinity);
    return closedAt - i.arriveSec > i.deadlineSec;
  }).length;
  return { timeToAckSec: avg(acks), timeToResolveSec: avg(fixes), breaches, arrived: arrived.length };
}

export type TimelineItem = { atSec: number; text: string; tone: "info" | "good" | "bad" };

/** Everything that happened, in order, for the after-action review. */
export function shiftTimeline(incidents: IncidentRun[], desk: DeskRun[], titleOf: (i: IncidentRun) => string, elapsedEnd: number): TimelineItem[] {
  const out: TimelineItem[] = [];
  for (const i of incidents) {
    if (i.arriveSec > elapsedEnd) continue;
    const name = `${i.severity} ${titleOf(i)}`;
    out.push({ atSec: i.arriveSec, text: `${name} arrived`, tone: "info" });
    if (i.ackedAtSec !== null) out.push({ atSec: i.ackedAtSec, text: `You opened ${name}`, tone: "info" });
    if (i.resolvedAtSec !== null) {
      out.push({ atSec: i.resolvedAtSec, text: `${name} fixed`, tone: "good" });
    } else if (i.escalatedAtSec != null) {
      out.push({ atSec: i.escalatedAtSec, text: `${name} handed to tier 2`, tone: "info" });
    } else {
      out.push({ atSec: Math.min(elapsedEnd, i.arriveSec + i.deadlineSec), text: `${name} was still open when the shift ended`, tone: "bad" });
    }
  }
  for (const d of desk) {
    if (d.arriveSec > elapsedEnd) continue;
    const def = deskDef(d.defId);
    if (!def) continue;
    const title = def.build(staff(d.who)).title;
    out.push({ atSec: d.arriveSec, text: title, tone: "info" });
    if (d.answeredAtSec !== null) {
      const ok = (d.score ?? 0) >= def.points;
      out.push({ atSec: d.answeredAtSec, text: ok ? "Handled it the right way" : "Answered, but not the way the desk should", tone: ok ? "good" : "bad" });
    } else {
      out.push({ atSec: Math.min(elapsedEnd, d.arriveSec + d.windowSec), text: "No answer before it lapsed", tone: "bad" });
    }
  }
  return out.sort((a, b) => a.atSec - b.atSec);
}

export const deskMax = (desk: DeskRun[]) => desk.reduce((s, d) => s + (deskDef(d.defId)?.points ?? 0), 0);
export const deskScore = (desk: DeskRun[]) => desk.reduce((s, d) => s + (d.score ?? 0), 0);
export { deskDef };
