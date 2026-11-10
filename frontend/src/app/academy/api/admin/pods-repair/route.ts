import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { isAcademyAdmin } from "@/lib/academy-classes";
import { getAcademyStudent } from "@/lib/academy-student";
import { hostedLabsConfigured, repairHostedLab } from "@/lib/academy-hosted";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

// Admin-triggered: replant missing ticket objects on every running hosted
// pod, right after a Build-Environment.ps1 change deploys, instead of
// waiting for each student to open the challenge that needs it. Same command
// the mission gate sends to one pod at a time (academy-mission-gate.ts),
// sent to all of them at once. Mirrors scripts/shift-live/repair-all.ts, but
// runs inside Vercel where the Sensitive AWS/Supabase env vars work at
// runtime even though they can never be read back out to a laptop.

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return null;
  return getAcademyStudent(request);
}

export async function POST(request: Request) {
  const me = await auth(request);
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!isAcademyAdmin(me.email)) return NextResponse.json({ error: "Only an admin can repair pods." }, { status: 403 });
  if (!supabaseAdmin) return NextResponse.json({ error: "No Supabase service key in the environment." }, { status: 500 });
  if (!hostedLabsConfigured()) return NextResponse.json({ error: "Hosted labs are not configured." }, { status: 500 });

  const { data, error } = await supabaseAdmin.from("academy_hosted_labs").select("user_id, instance_id").not("instance_id", "is", null);
  if (error) return NextResponse.json({ error: `Could not list hosted labs: ${error.message}` }, { status: 500 });
  const pods = (data ?? []) as { user_id: string; instance_id: string }[];

  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  if (dryRun) return NextResponse.json({ dryRun: true, pods: pods.length, instanceIds: pods.map((p) => p.instance_id) });

  let sent = 0;
  let skipped = 0;
  // repairHostedLab skips a pod that is stopped or whose SSM agent is not
  // online yet, and returns false for it -- same semantics as the script.
  const results: { instanceId: string; userId: string; sent: boolean }[] = [];
  for (const pod of pods) {
    const ok = await repairHostedLab(pod.user_id).catch((err) => {
      console.error("admin pods-repair failed", pod.instance_id, err instanceof Error ? err.message : err);
      return false;
    });
    if (ok) sent++;
    else skipped++;
    results.push({ instanceId: pod.instance_id, userId: pod.user_id, sent: ok });
  }
  return NextResponse.json({ pods: pods.length, sent, skipped, results });
}
