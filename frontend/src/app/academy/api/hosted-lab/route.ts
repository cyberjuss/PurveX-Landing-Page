import { after, NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import {
  canUseHostedLab,
  extendHostedLab,
  hostedLabLink,
  hostedLabStatus,
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

// Two separate questions, both of which have to be yes. canUseHostedLab is
// operational -- is AWS configured and is this account inside the pilot
// allowlist. isRangePro is commercial -- is the cloud lab something this
// account paid for. Keeping them apart means turning the pilot off does not
// silently become a billing change, and vice versa.
async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return null;
  const student = await getAcademyStudent(request);
  if (!student || !canUseHostedLab(student.email)) return null;
  return (await isRangePro(student)) ? student : null;
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
  if (!student || !canUseHostedLab(student.email)) return NextResponse.json({ available: false });
  // available:false keeps every lab control off the page, same as for an
  // account outside the pilot -- a Start button that always 403s is worse
  // than no button. locked:true rides along so the one place it is worth
  // selling, the Home Lab setup tab, can say what Pro would give them.
  if (!(await isRangePro(student))) {
    return NextResponse.json({ available: false, locked: true, upgrade: "/range/upgrade" });
  }
  sweep();
  try {
    return NextResponse.json({ available: true, ...(await hostedLabStatus(student.id)) });
  } catch {
    return NextResponse.json({ available: true, state: "none", error: "Could not reach AWS. Try again in a minute." });
  }
}

export async function POST(request: Request) {
  const student = await auth(request);
  if (!student) {
    return NextResponse.json({ ...proRequired("Your own cloud lab"), hostedLabs: false }, { status: 403 });
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
    console.error("hosted lab action failed", action, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "AWS did not accept that. Try again in a minute." }, { status: 502 });
  }
}
