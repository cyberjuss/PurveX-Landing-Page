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

export type AcademyStudent = { id: string; email: string | null; name: string | null };

export async function getAcademyStudent(request: Request): Promise<AcademyStudent | null> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || !verifier) return null;
  const { data, error } = await verifier.auth.getUser(token);
  if (error || !data.user) return null;
  const meta = data.user.user_metadata ?? {};
  const name = [meta.full_name, meta.name, meta.given_name].find((v) => typeof v === "string" && v.trim()) as string | undefined;
  // Admin and instructor rights are granted by email, so an address nobody
  // confirmed must count for nothing here. Supabase normally refuses sign-in
  // until the address is confirmed, but that is a setting in its dashboard;
  // this holds even if it is ever turned off.
  const confirmed = Boolean(data.user.email_confirmed_at || data.user.confirmed_at);
  return { id: data.user.id, email: confirmed ? (data.user.email ?? null) : null, name: name?.trim().slice(0, 60) ?? null };
}
