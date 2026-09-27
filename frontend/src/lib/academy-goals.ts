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

/** The next exam, for the account menu: the cert, a big value, and a small unit. */
export type ExamLine = { cert: string; value: string; unit: string; attention: boolean };

/** Goals as parts for the account menu: short role names and the next exam. */
export function goalsSummary(p: StudentProfile | null, today = todayLocal()): { roles: string[]; exam: ExamLine | null } {
  if (!p) return { roles: [], exam: null };
  const roles = p.roles.map((r) => SHORT_ROLE[r]);
  const overdue = passedExamDates(p, today);
  if (overdue.length) {
    return { roles, exam: { cert: CERTS[overdue[0]].label, value: "Date passed", unit: "Update it", attention: true } };
  }
  const studying = CERT_IDS.filter((id) => p.certs[id].status === "studying");
  const dated = studying.filter((id) => p.certs[id].examDate).sort((a, b) => p.certs[a].examDate!.localeCompare(p.certs[b].examDate!));
  if (dated.length) {
    const days = daysUntil(p.certs[dated[0]].examDate!, today);
    const [value, unit] = days === 0 ? ["Today", "exam day"] : days === 1 ? ["1", "day left"] : [String(days), "days left"];
    return { roles, exam: { cert: CERTS[dated[0]].label, value, unit, attention: false } };
  }
  if (studying.length) return { roles, exam: { cert: CERTS[studying[0]].label, value: "Studying", unit: "No date set", attention: false } };
  const planned = CERT_IDS.find((id) => p.certs[id].status === "planning");
  if (planned) return { roles, exam: { cert: CERTS[planned].label, value: "Planned", unit: "Not booked", attention: false } };
  return { roles, exam: null };
}
