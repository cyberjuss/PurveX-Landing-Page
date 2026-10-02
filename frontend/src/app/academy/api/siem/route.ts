import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { getAcademyStudent } from "@/lib/academy-student";
import { firstCaseId } from "@/lib/siem/cases";
import { KqlError } from "@/lib/siem/kql";
import { sentinelSource, siemMode } from "@/lib/siem/source";

export const runtime = "nodejs";

// The SIEM console's one endpoint. GET loads a case (story, schema, examples,
// alerts). POST runs a query, fires the sim, or checks a finding. Answers and
// proof queries never leave the server.

async function student(request: Request) {
  if (!(await isAcademyUnlocked())) return null;
  return getAcademyStudent(request);
}

export async function GET(request: Request) {
  const s = await student(request);
  if (!s) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const src = sentinelSource();
  const url = new URL(request.url);
  const caseId = url.searchParams.get("case") || firstCaseId() || "";
  const [cases, current] = await Promise.all([src.listCases(), caseId ? src.getCase(s.id, caseId) : Promise.resolve(null)]);
  return NextResponse.json({ mode: siemMode(), cases, caseId, current });
}

export async function POST(request: Request) {
  const s = await student(request);
  if (!s) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const src = sentinelSource();

  let body: { action?: string; case?: string; kql?: string; findingId?: string; answer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const caseId = String(body.case || "");
  if (!caseId) return NextResponse.json({ error: "No case chosen." }, { status: 400 });

  if (body.action === "query") {
    try {
      const result = await src.runQuery(s.id, caseId, String(body.kql || "").slice(0, 4000));
      return NextResponse.json({ result });
    } catch (err) {
      if (err instanceof KqlError) return NextResponse.json({ queryError: err.message });
      console.error("siem query failed", err instanceof Error ? err.message : err);
      return NextResponse.json({ error: "Could not run that query." }, { status: 500 });
    }
  }

  if (body.action === "fire") {
    const fired = await src.fireScenario(s.id, caseId);
    return NextResponse.json({ fired });
  }

  if (body.action === "check") {
    const res = await src.checkFinding(s.id, caseId, String(body.findingId || ""), String(body.answer || "").slice(0, 200));
    if (!res) return NextResponse.json({ error: "Unknown finding." }, { status: 400 });
    return NextResponse.json(res);
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
