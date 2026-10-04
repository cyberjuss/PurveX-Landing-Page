import "server-only";
import { classesFor, isAcademyAdmin, isClassMember } from "@/lib/academy-classes";
import { weekStart, type DrillEntry, type EntryMode } from "@/lib/academy-drills";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Which plan a student is on, and what each plan allows. Every paid feature
// asks here on the server; the page only shows what the server already allows.
//
//   free   the course, browser labs, the self-hosted lab, a few coach chats,
//          a few drills, and a private portfolio
//   pro    $20 a month: the hosted lab, the full coach (interviews, resume
//          help, screenshots), unlimited drills, and a public portfolio
//   class  a seat in a school or employer class: everything in Pro
//
// Nothing changes until ACADEMY_PLANS=on. Until then every student keeps the
// full course, as before plans existed.

export type Plan = "free" | "pro" | "class";

export const FREE_COACH_DAILY = 5;
export const FREE_DRILLS_PER_WEEK = 3;

export const plansEnforced = () => process.env.ACADEMY_PLANS === "on";
export const isPaid = (plan: Plan) => plan !== "free";

/** Shown wherever a free student reaches for a Pro feature. */
export const PRO_ONLY = {
  hostedLab: "The hosted lab is part of Pro. On Free, build the lab on your own machine with the setup script.",
  interview: "Mock interviews and resume help are part of Pro.",
  screenshots: "Sending screenshots to Coach is part of Pro. Describe what you see instead.",
  publish: "Sharing your portfolio publicly is part of Pro. Your work is saved and stays private until then.",
  drills: `Free includes ${FREE_DRILLS_PER_WEEK} drills a week. Pro has unlimited drills.`,
} as const;

const memoryPro = new Map<string, string | null>();

/** Grant or end Pro without Supabase, for local runs and tests. */
export function setMemoryPro(userId: string, until: string | null | false) {
  if (until === false) memoryPro.delete(userId);
  else memoryPro.set(userId, until);
}

const active = (until: string | null | undefined) => !until || new Date(until).getTime() > Date.now();

/** A Pro row that has not run out. Written only by the server (see academy.sql). */
async function hasPro(userId: string): Promise<boolean> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_plans").select("plan, pro_until").eq("user_id", userId).maybeSingle();
    if (!error) return data?.plan === "pro" && active(data.pro_until as string | null);
    console.error("academy_plans read failed", error.message);
  }
  return memoryPro.has(userId) && active(memoryPro.get(userId));
}

async function emailOf(userId: string): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

/** The student's plan. Pass the email when it is at hand; it is looked up otherwise. */
export async function planFor(userId: string, email?: string | null): Promise<Plan> {
  if (!plansEnforced()) return "pro";
  const mail = email === undefined ? await emailOf(userId) : email;
  if (isAcademyAdmin(mail)) return "class";
  if (await isClassMember(userId)) return "class";
  if (mail && (await classesFor(mail)).length > 0) return "class";
  if (await hasPro(userId)) return "pro";
  return "free";
}

/** Coach questions a day. Drills earn extra chats on paid plans only. */
export function coachAllowance(plan: Plan, base: number, bonus: number) {
  return isPaid(plan) ? { limit: base + bonus, bonus } : { limit: FREE_COACH_DAILY, bonus: 0 };
}

const COUNTED: EntryMode[] = ["daily", "timed", "ctf"];

/** Drills finished this week, the week the given day falls in. Practice logged by Coach does not count. */
export function drillsThisWeek(entries: DrillEntry[], day: string) {
  const week = weekStart(day);
  return entries.filter((e) => COUNTED.includes(e.mode) && weekStart(e.day) === week).length;
}

/** Whether the student may start or record another drill this week. */
export function canDrill(plan: Plan, entries: DrillEntry[], day: string) {
  return isPaid(plan) || drillsThisWeek(entries, day) < FREE_DRILLS_PER_WEEK;
}
