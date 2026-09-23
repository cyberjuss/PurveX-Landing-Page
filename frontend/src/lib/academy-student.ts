import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Portal sessions live in the browser (supabase-js localStorage), not in
// cookies, so academy API routes get the student's access token as a
// Bearer header and verify it with Supabase on every request.
const verifier =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

export type AcademyStudent = { id: string; email: string | null };

export async function getAcademyStudent(request: Request): Promise<AcademyStudent | null> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || !verifier) return null;
  const { data, error } = await verifier.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}
