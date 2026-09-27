import "server-only";
import { randomBytes, randomUUID } from "crypto";
import type { ExtraCert } from "@/lib/academy-proof";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Proof Profile storage. Supabase when the service role is configured;
// per-process memory otherwise, so local dev works before academy.sql runs.

export type ProofSettings = {
  slug: string;
  displayName: string;
  published: boolean;
  showSkills: boolean;
  /** Lab work items (job ids) with screenshots switched on. */
  shotsOn: string[];
  /** Storage path of the student's profile photo, if they added one. */
  avatarPath?: string | null;
  /** Storage path of the student's resume PDF. */
  resumePath?: string | null;
  /** How employers reach the student. Both optional, both public once shared. */
  contactEmail?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  location?: string | null;
  /** One of AVAILABILITY. */
  availability?: string | null;
  /** Certifications added on the portfolio, beyond the ones in Goals. */
  extraCerts?: ExtraCert[];
  credentialId: string;
  updatedAt: string;
};

export type ProofShot = { id: string; job: string; caption: string; contentType: string; path: string; createdAt: string };

const BUCKET = "proof-screenshots";
const memorySettings = new Map<string, ProofSettings>();
const memoryShots = new Map<string, ProofShot[]>();
const memoryBytes = new Map<string, Buffer>();

const RESERVED = new Set(["admin", "api", "academy", "verify", "login", "portal", "purvex", "support", "help", "settings", "new"]);

function fromRow(r: Record<string, unknown>): ProofSettings {
  return {
    slug: String(r.slug),
    displayName: String(r.display_name),
    published: r.published === true,
    showSkills: r.show_skills !== false,
    shotsOn: Array.isArray(r.shots_on) ? r.shots_on.filter((x): x is string => typeof x === "string") : [],
    avatarPath: typeof r.avatar_path === "string" ? r.avatar_path : null,
    resumePath: typeof r.resume_path === "string" ? r.resume_path : null,
    contactEmail: typeof r.contact_email === "string" ? r.contact_email : null,
    linkedinUrl: typeof r.linkedin_url === "string" ? r.linkedin_url : null,
    githubUrl: typeof r.github_url === "string" ? r.github_url : null,
    websiteUrl: typeof r.website_url === "string" ? r.website_url : null,
    location: typeof r.location === "string" ? r.location : null,
    availability: typeof r.availability === "string" ? r.availability : null,
    extraCerts: Array.isArray(r.extra_certs) ? (r.extra_certs as ExtraCert[]) : [],
    credentialId: String(r.credential_id),
    updatedAt: String(r.updated_at ?? ""),
  };
}

export function slugify(name: string): string {
  const s = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  return s.length >= 3 && !RESERVED.has(s) ? s : `student-${randomBytes(3).toString("hex")}`;
}

export function validSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,40}$/.test(slug) && !RESERVED.has(slug);
}

export function newCredentialId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const part = (from: number, n: number) => Array.from(bytes.subarray(from, from + n), (b) => alphabet[b % alphabet.length]).join("");
  return `PX-${part(0, 4)}-${part(4, 2)}`;
}

export async function loadProofSettings(userId: string): Promise<ProofSettings | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_public_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (!error) return data ? fromRow(data) : null;
    console.error("academy_public_profiles read failed", error.message);
  }
  return memorySettings.get(userId) ?? null;
}

/** Saves settings. Returns "taken" when another student already has the slug. */
export async function saveProofSettings(userId: string, s: ProofSettings): Promise<"ok" | "taken" | "error"> {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("academy_public_profiles").upsert({
      user_id: userId,
      slug: s.slug,
      display_name: s.displayName,
      published: s.published,
      show_skills: s.showSkills,
      shots_on: s.shotsOn,
      avatar_path: s.avatarPath ?? null,
      resume_path: s.resumePath ?? null,
      contact_email: s.contactEmail ?? null,
      linkedin_url: s.linkedinUrl ?? null,
      github_url: s.githubUrl ?? null,
      website_url: s.websiteUrl ?? null,
      location: s.location ?? null,
      availability: s.availability ?? null,
      extra_certs: s.extraCerts ?? [],
      credential_id: s.credentialId,
      updated_at: s.updatedAt,
    });
    if (!error) return "ok";
    if (error.code === "23505") return "taken";
    console.error("academy_public_profiles upsert failed", error.message);
    return "error";
  }
  for (const [id, other] of memorySettings) if (id !== userId && other.slug === s.slug) return "taken";
  memorySettings.set(userId, s);
  return "ok";
}

export async function findProofBySlug(slug: string): Promise<{ userId: string; settings: ProofSettings } | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_public_profiles").select("*").eq("slug", slug).maybeSingle();
    if (!error) return data ? { userId: String(data.user_id), settings: fromRow(data) } : null;
    console.error("academy_public_profiles slug read failed", error.message);
  }
  for (const [userId, settings] of memorySettings) if (settings.slug === slug) return { userId, settings };
  return null;
}

export async function findProofByCredential(credentialId: string): Promise<{ userId: string; settings: ProofSettings } | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("academy_public_profiles").select("*").eq("credential_id", credentialId).maybeSingle();
    if (!error) return data ? { userId: String(data.user_id), settings: fromRow(data) } : null;
    console.error("academy_public_profiles credential read failed", error.message);
  }
  for (const [userId, settings] of memorySettings) if (settings.credentialId === credentialId) return { userId, settings };
  return null;
}

export async function listShots(userId: string): Promise<ProofShot[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("academy_profile_screenshots")
      .select("id, job, caption, content_type, path, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      return data.map((r) => ({
        id: String(r.id),
        job: String(r.job),
        caption: String(r.caption ?? ""),
        contentType: String(r.content_type),
        path: String(r.path),
        createdAt: String(r.created_at),
      }));
    }
    if (error) console.error("academy_profile_screenshots read failed", error.message);
  }
  return memoryShots.get(userId) ?? [];
}

export async function addShot(userId: string, job: string, bytes: Buffer, contentType: string, caption: string): Promise<ProofShot | null> {
  const id = randomUUID();
  const ext = contentType === "image/png" ? "png" : "jpg";
  const path = `${userId}/${id}.${ext}`;
  const shot: ProofShot = { id, job, caption, contentType, path, createdAt: new Date().toISOString() };
  if (supabaseAdmin) {
    const up = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false });
    if (up.error) {
      console.error("proof screenshot upload failed", up.error.message);
      return null;
    }
    const { error } = await supabaseAdmin.from("academy_profile_screenshots").insert({
      id,
      user_id: userId,
      job,
      path,
      content_type: contentType,
      caption,
    });
    if (error) {
      console.error("academy_profile_screenshots insert failed", error.message);
      await supabaseAdmin.storage.from(BUCKET).remove([path]);
      return null;
    }
    return shot;
  }
  memoryShots.set(userId, [...(memoryShots.get(userId) ?? []), shot]);
  memoryBytes.set(path, bytes);
  return shot;
}

export async function deleteShot(userId: string, id: string): Promise<boolean> {
  const shot = (await listShots(userId)).find((s) => s.id === id);
  if (!shot) return false;
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("academy_profile_screenshots").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      console.error("academy_profile_screenshots delete failed", error.message);
      return false;
    }
    await supabaseAdmin.storage.from(BUCKET).remove([shot.path]);
    return true;
  }
  memoryShots.set(userId, (memoryShots.get(userId) ?? []).filter((s) => s.id !== id));
  memoryBytes.delete(shot.path);
  return true;
}

export async function readShotBytes(shot: ProofShot): Promise<Buffer | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(shot.path);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }
  return memoryBytes.get(shot.path) ?? null;
}

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "application/pdf": "pdf" };

/** Stores a profile photo or resume and returns its storage path. */
export async function putFile(userId: string, kind: "avatar" | "resume", bytes: Buffer, contentType: string): Promise<string | null> {
  const path = `${userId}/${kind}-${randomUUID()}.${EXT[contentType] ?? "bin"}`;
  if (supabaseAdmin) {
    const up = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false });
    if (up.error) {
      console.error(`proof ${kind} upload failed`, up.error.message);
      return null;
    }
    return path;
  }
  memoryBytes.set(path, bytes);
  return path;
}

export async function removeFile(path: string) {
  if (supabaseAdmin) await supabaseAdmin.storage.from(BUCKET).remove([path]);
  else memoryBytes.delete(path);
}

export async function readFile(path: string): Promise<Buffer | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }
  return memoryBytes.get(path) ?? null;
}

export const fileType = (path: string) => (path.endsWith(".png") ? "image/png" : path.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
