import { CERT_IDS, type CertId, type StudentProfile } from "@/lib/academy-certs";

/** Today as YYYY-MM-DD in the student's own time zone. */
export function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Whole days from today until a YYYY-MM-DD date. */
export function daysUntil(date: string, today: string): number {
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
