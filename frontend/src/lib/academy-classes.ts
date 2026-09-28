import "server-only";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Classes: each has its own passcode and an instructor, who sees the class at
// /academy/instructor. Admins (ACADEMY_ADMIN_EMAILS) create classes and see
// every class. Supabase when configured; per-process memory otherwise.

export type AcademyClass = { id: string; code: string; name: string; instructorEmail: string; createdAt: string };
export type ClassMember = { userId: string; email: string | null; name: string | null; joinedAt: string };

const memoryClasses = new Map<string, AcademyClass>();
const memoryMembers = new Map<string, ClassMember[]>();

export const normalizeClassCode = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "-");
const lower = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

export function isAcademyAdmin(email: string | null): boolean {
  const admins = (process.env.ACADEMY_ADMIN_EMAILS ?? "").split(",").map(lower).filter(Boolean);
  return Boolean(email) && admins.includes(lower(email));
}

const fromRow = (r: Record<string, unknown>): AcademyClass => ({
  id: String(r.id),
  code: String(r.code),
  name: String(r.name),
  instructorEmail: String(r.instructor_email),
  createdAt: String(r.created_at),
});

export async function findClassByCode(input: string): Promise<AcademyClass | null> {
  const code = normalizeClassCode(input);
  if (!/^[A-Z0-9-]{6,40}$/.test(code)) return null;
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_classes").select("*").eq("code", code).maybeSingle();
    if (!error && data) return fromRow(data);
    if (error) console.error("academy_classes read failed", error.message);
  }
  return [...memoryClasses.values()].find((c) => c.code === code) ?? null;
}

/** Every class this person can see: all of them for an admin, their own for an instructor. */
export async function classesFor(email: string | null): Promise<AcademyClass[]> {
  if (!email) return [];
  const admin = isAcademyAdmin(email);
  if (supabaseAdmin) {
    const q = supabaseAdmin.from("academy_classes").select("*").order("created_at", { ascending: false });
    // Emails are stored lowercased, so an exact match is enough.
    const { data, error } = admin ? await q : await q.eq("instructor_email", lower(email));
    if (!error && data) return data.map(fromRow);
    if (error) console.error("academy_classes list failed", error.message);
  }
  return [...memoryClasses.values()].filter((c) => admin || lower(c.instructorEmail) === lower(email));
}

/** A readable code from the class name, plus four random characters so it cannot be guessed. */
function makeCode(name: string) {
  const word = name.toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().split(" ")[0]?.slice(0, 12) || "CLASS";
  const tail = randomBytes(4).toString("base64").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  return normalizeClassCode(`${word.length >= 2 ? word : "CLASS"}-${tail}`);
}

export async function createClass(name: string, instructorEmail: string): Promise<AcademyClass | null> {
  for (let tries = 0; tries < 3; tries++) {
    const cls: AcademyClass = { id: crypto.randomUUID(), code: makeCode(name), name, instructorEmail: lower(instructorEmail), createdAt: new Date().toISOString() };
    if (!supabaseAdmin) {
      if ([...memoryClasses.values()].some((c) => c.code === cls.code)) continue;
      memoryClasses.set(cls.id, cls);
      return cls;
    }
    const { data, error } = await supabaseAdmin
      .from("academy_classes")
      .insert({ id: cls.id, code: cls.code, name: cls.name, instructor_email: cls.instructorEmail, created_at: cls.createdAt })
      .select("*")
      .single();
    if (!error && data) return fromRow(data);
    // A code clash retries with a new code. Anything else is a real failure.
    if (error && !/duplicate|unique/i.test(error.message)) {
      console.error("academy_classes insert failed", error.message);
      return null;
    }
  }
  return null;
}

export async function joinClass(classId: string, student: { id: string; email: string | null; name: string | null }) {
  const member: ClassMember = { userId: student.id, email: student.email, name: student.name, joinedAt: new Date().toISOString() };
  const list = (memoryMembers.get(classId) ?? []).filter((m) => m.userId !== student.id);
  memoryMembers.set(classId, [...list, member]);
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from("academy_class_members")
    .upsert({ class_id: classId, user_id: student.id, email: student.email, name: student.name }, { onConflict: "class_id,user_id", ignoreDuplicates: true });
  if (error) console.error("academy_class_members upsert failed", error.message);
}

export async function classMembers(classId: string): Promise<ClassMember[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_class_members").select("user_id, email, name, joined_at").eq("class_id", classId);
    if (!error && data) return data.map((r) => ({ userId: r.user_id, email: r.email, name: r.name, joinedAt: r.joined_at }));
    if (error) console.error("academy_class_members read failed", error.message);
  }
  return memoryMembers.get(classId) ?? [];
}
