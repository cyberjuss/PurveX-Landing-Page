import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { canUseHostedLab, hostedLabNetwork } from "@/lib/academy-hosted";
import { isRangePro } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// The pod's own network, for the map on the lab panel. Same gate as the lab
// itself: no point describing a network a student cannot see a button for.
export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isRangePro(student)) || !canUseHostedLab(student.email)) {
    return NextResponse.json({ error: "Not available." }, { status: 403 });
  }
  try {
    const network = await hostedLabNetwork(student.id);
    return NextResponse.json(network ?? { nodes: [], dns: [], firewall: [] });
  } catch {
    return NextResponse.json({ error: "Could not reach AWS. Try again in a minute." }, { status: 503 });
  }
}
