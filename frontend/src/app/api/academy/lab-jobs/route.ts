import { NextResponse } from "next/server";
import { claimLabJobs, finishLabJob, loadLabState, resolveMcpKey } from "@/lib/academy-store";

export const runtime = "nodejs";

// The student's lab script pulls work from here with the pvx_ key in their
// downloaded copy. Nothing is pushed to the lab, and jobs are only handed out
// when the student's last snapshot said scenarios are turned on.
async function userFrom(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return key ? await resolveMcpKey(key) : null;
}

export async function GET(request: Request) {
  const userId = await userFrom(request);
  if (!userId) return NextResponse.json({ error: "Invalid or missing PurveX Academy key." }, { status: 401 });
  const lab = await loadLabState(userId);
  if (!lab?.snapshot.agent?.scenarios) return NextResponse.json({ jobs: [] });
  const jobs = await claimLabJobs(userId);
  return NextResponse.json({ jobs: jobs.map((j) => ({ id: j.id, type: j.type, params: j.params })) });
}

export async function POST(request: Request) {
  const userId = await userFrom(request);
  if (!userId) return NextResponse.json({ error: "Invalid or missing PurveX Academy key." }, { status: 401 });
  let body: { id?: unknown; status?: unknown; result?: unknown };
  try {
    body = JSON.parse((await request.text()).replace(/^﻿/, ""));
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || (body.status !== "done" && body.status !== "failed")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  await finishLabJob(userId, id, body.status, typeof body.result === "string" ? body.result : "");
  return NextResponse.json({ ok: true });
}
