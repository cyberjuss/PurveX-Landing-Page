import { CERT_IDS, CERTS, type CertId, type RoleId, type StudentProfile } from "@/lib/academy-certs";

/** Short role names for tight spaces, such as the account menu. */
export const SHORT_ROLE: Record<RoleId, string> = {
  "help-desk": "Help Desk",
  sysadmin: "Sysadmin",
  "soc-analyst": "SOC Analyst",
  "cyber-analyst": "Cyber Analyst",
  "ir-analyst": "IR Analyst",
};

/** Today as YYYY-MM-DD in the student's own time zone. */
export function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
}

/** Certs the student marked as studying whose booked exam date is already behind them. */
export function passedExamDates(p: StudentProfile | null, today = todayLocal()): CertId[] {
  if (!p) return [];
  return CERT_IDS.filter((id) => {
    const g = p.certs[id];
    return g.status === "studying" && Boolean(g.examDate) && g.examDate! < today;
  });
}

/** One line for the account menu, such as "SOC Analyst · Security+ in 23 days". */
export function goalsSummary(p: StudentProfile | null, today = todayLocal()): { text: string; attention: boolean } {
  if (!p) return { text: "Not set yet", attention: true };
  const roles = p.roles.map((r) => SHORT_ROLE[r]).join(" and ");
  const overdue = passedExamDates(p, today);
  let exam = "";
  if (overdue.length) {
    exam = `${CERTS[overdue[0]].label} date passed`;
  } else {
    const studying = CERT_IDS.filter((id) => p.certs[id].status === "studying");
    const dated = studying.filter((id) => p.certs[id].examDate).sort((a, b) => p.certs[a].examDate!.localeCompare(p.certs[b].examDate!));
    if (dated.length) {
      const days = daysUntil(p.certs[dated[0]].examDate!, today);
      exam = `${CERTS[dated[0]].label} ${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}`;
    } else if (studying.length) {
      exam = `Studying ${CERTS[studying[0]].label}`;
    } else {
      const planned = CERT_IDS.find((id) => p.certs[id].status === "planning");
      if (planned) exam = `${CERTS[planned].label} planned`;
    }
  }
  return { text: [roles, exam].filter(Boolean).join(" · "), attention: overdue.length > 0 };
}
