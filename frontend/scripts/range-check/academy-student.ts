// Stands in for the real token verification when the gate check runs outside
// Next. The student is whatever STUB_STUDENT_EMAIL says, so the checks can
// drive a free and a Pro account through the real route handlers without
// minting a Supabase session.
export type AcademyStudent = { id: string; email: string | null; name: string | null };

export async function getAcademyStudent(): Promise<AcademyStudent | null> {
  const email = process.env.STUB_STUDENT_EMAIL;
  if (!email) return null;
  // STUB_STUDENT_ID lets a check sign in as two different students.
  return { id: process.env.STUB_STUDENT_ID || "00000000-0000-0000-0000-00000000beef", email, name: "Range Check" };
}
