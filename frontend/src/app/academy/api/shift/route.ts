import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { canUseHostedLab, hostedLabStatus } from "@/lib/academy-hosted";
import { ackIncident, finishShift, getShift, hintIncident, startShift, submitIncident } from "@/lib/academy-shift-run";
import { isRangePro, proRequired } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";
export const maxDuration = 60;

// The Shift: start a 30-minute tour, read its live state, acknowledge and work
// each incident, buy a hint, submit a response, or end the shift. A shift needs
// a hosted lab, since incidents are fired into the student's own lab, so it
// is Pro like the lab itself.

// Pro is asked first, so a paying student is never told to buy what they have.
async function student(request: Request) {
  if (!(await isAcademyUnlocked())) return { s: null, denied: "lab" } as const;
  const s = await getAcademyStudent(request);
  if (!s) return { s: null, denied: "lab" } as const;
  if (!(await isRangePro(s))) return { s: null, denied: "pro" } as const;
  if (!canUseHostedLab(s.email)) return { s: null, denied: "lab" } as const;
  return { s, denied: null } as const;
}

export async function GET(request: Request) {
  const { s } = await student(request);
  if (!s) return NextResponse.json({ available: false });
  try {
    const [shift, lab] = await Promise.all([getShift(s.id), hostedLabStatus(s.id).catch(() => null)]);
    return NextResponse.json({ available: true, shift, labState: lab?.state ?? "none" });
  } catch (err) {
    console.error("shift state failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ available: true, shift: null, labState: "none", error: "Could not reach your shift." });
  }
}

export async function POST(request: Request) {
  const { s, denied } = await student(request);
  if (denied === "pro") return NextResponse.json(proRequired("The Shift"), { status: 403 });
  if (!s) return NextResponse.json({ error: "Shifts need a hosted lab." }, { status: 403 });
  let body: { action?: unknown; uid?: unknown; defId?: unknown; diagnosis?: unknown; response?: unknown; escalate?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const action = String(body.action || "");
  const uid = String(body.uid || body.defId || "");
  try {
    if (action === "start") {
      const r = await startShift(s.id);
      return r.error ? NextResponse.json({ error: r.error }, { status: 409 }) : NextResponse.json({ shift: r.shift });
    }
    if (action === "ack") {
      const r = await ackIncident(s.id, uid);
      return "error" in r ? NextResponse.json({ error: r.error }, { status: 409 }) : NextResponse.json({ shift: r });
    }
    if (action === "hint") {
      const r = await hintIncident(s.id, uid);
      return "error" in r ? NextResponse.json({ error: r.error }, { status: 409 }) : NextResponse.json(r);
    }
    if (action === "submit") {
      const r = await submitIncident(s.id, uid, String(body.diagnosis || ""), String(body.response || ""), body.escalate === true);
      if ("error" in r) return NextResponse.json({ error: r.error }, { status: 409 });
      return NextResponse.json({ result: r, shift: await getShift(s.id) });
    }
    if (action === "finish") {
      const r = await finishShift(s.id);
      return "error" in r ? NextResponse.json({ error: r.error }, { status: 409 }) : NextResponse.json({ shift: r });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("shift action failed", action, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 502 });
  }
}
