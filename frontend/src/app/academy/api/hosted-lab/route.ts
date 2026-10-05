import { after, NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import {
  canUseHostedLab,
  extendHostedLab,
  hostedLabLink,
  hostedLabsConfigured,
  hostedLabStatus,
  labHours,
  LabHoursSpentError,
  PodSlotsFullError,
  resetHostedLab,
  startHostedLab,
  stopDueHostedLabs,
  stopHostedLab,
} from "@/lib/academy-hosted";
import { isRangePro, proRequired } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";
export const maxDuration = 30;

// The lab button: status, start, open in the browser, extend, stop, reset.

// Two separate questions, and the commercial one is asked first. isRangePro
// is "did this account pay for a cloud lab"; canUseHostedLab is "can we hand
// one over right now" -- AWS configured, account inside the pilot allowlist.
// Asking the operational one first told a paying student their subscription
// was the problem whenever AWS config was missing, and told a free student
// nothing at all unless they happened to be in the pilot.
type Denied = { denied: "pro" | "unavailable" };
const isDenied = (v: unknown): v is Denied => typeof v === "object" && v !== null && "denied" in v;

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return null;
  const student = await getAcademyStudent(request);
  if (!student) return null;
  if (!(await isRangePro(student))) return { denied: "pro" } as const;
  if (!canUseHostedLab(student.email)) return { denied: "unavailable" } as const;
  return student;
}

// Labs past their stop time are stopped whenever anyone checks their lab, at most
// every 5 minutes per server. The daily cron catches anything left overnight.
let lastSweep = 0;
function sweep() {
  if (Date.now() - lastSweep < 5 * 60_000) return;
  lastSweep = Date.now();
  after(() => stopDueHostedLabs().then(() => undefined).catch(() => undefined));
}

export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ available: false });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ available: false });
  // available:false keeps every lab control off the page -- a Start button
  // that always 403s is worse than no button. locked:true rides along so the
  // one place it is worth selling, the Home Lab setup tab, can say what Pro
  // would give them. Checked before the pilot allowlist, since whether to
  // make the offer is a billing question, not an AWS one. Still conditional
  // on hosted labs existing at all: advertising a lab we cannot build is
  // worse than staying quiet.
  if (!(await isRangePro(student))) {
    return hostedLabsConfigured()
      ? NextResponse.json({ available: false, locked: true, upgrade: "/range/upgrade" })
      : NextResponse.json({ available: false });
  }
  if (!canUseHostedLab(student.email)) return NextResponse.json({ available: false });
  sweep();
  try {
    const [status, hours] = await Promise.all([hostedLabStatus(student.id), labHours(student.id)]);
    // hoursLeft is Infinity when the cap is off, which JSON turns into null --
    // the page reads null as "no cap to show", not "no hours left".
    return NextResponse.json({
      available: true,
      ...status,
      hoursUsed: Math.round(hours.used),
      hoursLimit: hours.limit || null,
      hoursLeft: Number.isFinite(hours.left) ? Math.round(hours.left) : null,
    });
  } catch {
    return NextResponse.json({ available: true, state: "none", error: "Could not reach AWS. Try again in a minute." });
  }
}

export async function POST(request: Request) {
  const student = await auth(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  // "Buy Pro" and "this is broken right now" are different answers, and a
  // paying student told to buy what they already bought has no way forward.
  if (isDenied(student)) {
    return student.denied === "pro"
      ? NextResponse.json(proRequired("Your own cloud lab"), { status: 403 })
      : NextResponse.json({ error: "Cloud labs are not switched on for this account yet. Email support@purvex.io." }, { status: 503 });
  }
  let action = "";
  try {
    action = String(((await request.json()) as { action?: unknown }).action || "");
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    if (action === "start") await startHostedLab(student.id);
    else if (action === "stop") await stopHostedLab(student.id);
    else if (action === "extend") await extendHostedLab(student.id);
    else if (action === "reset") await resetHostedLab(student.id);
    else if (action === "open") {
      const url = await hostedLabLink(student.id);
      if (!url) return NextResponse.json({ error: "Your lab is not running yet. Start it first." }, { status: 409 });
      return NextResponse.json({ url });
    } else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    return NextResponse.json(await hostedLabStatus(student.id));
  } catch (err) {
    // Running out of hours is not a fault, so it does not get the AWS wording
    // or the error log. 429 so the page can tell them apart from a real outage.
    if (err instanceof LabHoursSpentError) return NextResponse.json({ error: err.message, hoursSpent: true }, { status: 429 });
    // Every pod security group is taken. Not a fault either, and the fix is
    // ours (raise pod_slots and apply), so it is logged but worded for them.
    if (err instanceof PodSlotsFullError) {
      console.error("hosted lab pod slots exhausted");
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("hosted lab action failed", action, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "AWS did not accept that. Try again in a minute." }, { status: 502 });
  }
}
