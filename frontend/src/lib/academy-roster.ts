import "server-only";
import { sanitizeActivityPlace, type ActivityPlace } from "@/lib/academy-activity";
import type { AcademyClass, ClassMember } from "@/lib/academy-classes";
import { findEntry } from "@/lib/academy-content";
import { MISSION_CATALOG } from "@/lib/academy-missions";
import { loadProofSettings } from "@/lib/academy-proof-store";
import { LAB_PASS_IDS, LEVELS, missionResults, sanitizeResults, summarize, type Results } from "@/lib/academy-score";
import { loadActivity, loadDrills, loadLabState, loadProgress } from "@/lib/academy-store";
import { supabaseAdmin } from "@/lib/supabase-admin";

// One class's progress for its instructor: readiness, who is stuck, who has
// gone quiet, and the skills the class is weakest in.

export type RosterStudent = {
  userId: string;
  name: string | null;
  email: string | null;
  joinedAt: string;
  readiness: { overall: number | null; level: string; finished: number; total: number };
  skills: { key: string; label: string; score: number | null }[];
  stuck: { title: string; wrong: number; skipped: boolean }[];
  lastActive: string | null;
  place: { page: string; tab: string; at: string } | null;
  labSynced: string | null;
  drillsThisWeek: number;
  labsPassed: number;
  portfolio: string | null;
};

export type ClassReport = {
  class: AcademyClass;
  students: RosterStudent[];
  summary: { students: number; activeThisWeek: number; stuck: number; avgReadiness: number | null; weakest: { label: string; avg: number }[] };
};

type Raw = {
  results: Results;
  progressAt: string | null;
  activity: { place: ActivityPlace; updatedAt: string } | null;
  labAt: string | null;
  drillsAt: string[];
  portfolio: string | null;
};

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Rows for these students. since: only rows created after it. */
async function rows<T>(table: string, cols: string, ids: string[], since?: string): Promise<T[]> {
  if (!supabaseAdmin || !ids.length) return [];
  const q = supabaseAdmin.from(table).select(cols).in("user_id", ids);
  const { data, error } = await (since ? q.gte("created_at", since) : q);
  // A table that is not there yet reads as empty.
  if (error) console.error(`${table} roster read failed`, error.message);
  return (data ?? []) as T[];
}

async function loadRaw(ids: string[]): Promise<Map<string, Raw>> {
  const out = new Map<string, Raw>(ids.map((id) => [id, { results: {}, progressAt: null, activity: null, labAt: null, drillsAt: [], portfolio: null }]));
  const weekAgo = new Date(Date.now() - WEEK).toISOString();
  if (supabaseAdmin) {
    const [progress, activity, lab, drills, profiles] = await Promise.all([
      rows<{ user_id: string; results: unknown; updated_at: string }>("academy_progress", "user_id, results, updated_at", ids),
      rows<{ user_id: string; place: unknown; updated_at: string }>("academy_activity", "user_id, place, updated_at", ids),
      rows<{ user_id: string; uploaded_at: string }>("academy_lab_state", "user_id, uploaded_at", ids),
      rows<{ user_id: string; created_at: string }>("academy_drill_log", "user_id, created_at", ids, weekAgo),
      rows<{ user_id: string; slug: string; published: boolean }>("academy_public_profiles", "user_id, slug, published", ids),
    ]);
    for (const r of progress) Object.assign(out.get(r.user_id) ?? {}, { results: sanitizeResults(r.results, true), progressAt: r.updated_at });
    for (const r of activity) {
      const place = sanitizeActivityPlace(r.place);
      if (place) Object.assign(out.get(r.user_id) ?? {}, { activity: { place, updatedAt: r.updated_at } });
    }
    for (const r of lab) Object.assign(out.get(r.user_id) ?? {}, { labAt: r.uploaded_at });
    for (const r of drills) out.get(r.user_id)?.drillsAt.push(r.created_at);
    for (const r of profiles) if (r.published) Object.assign(out.get(r.user_id) ?? {}, { portfolio: r.slug });
    return out;
  }
  // Local dev without Supabase: the per-student store.
  await Promise.all(
    ids.map(async (id) => {
      const [results, activity, lab, drills, proof] = await Promise.all([loadProgress(id), loadActivity(id), loadLabState(id), loadDrills(id), loadProofSettings(id).catch(() => null)]);
      out.set(id, {
        results,
        progressAt: null,
        activity,
        labAt: lab?.uploadedAt ?? null,
        drillsAt: drills.map((d) => d.at).filter((at) => at >= weekAgo),
        portfolio: proof?.published ? proof.slug : null,
      });
    })
  );
  return out;
}

const latest = (...isos: (string | null | undefined)[]) =>
  isos.filter((v): v is string => Boolean(v) && !Number.isNaN(Date.parse(v!))).sort().at(-1) ?? null;

function studentRow(m: ClassMember, raw: Raw): RosterStudent {
  const s = summarize(raw.results);
  const missionAts = Object.values(raw.results).map((r) => r.at);
  const place = raw.activity ? findEntry(raw.activity.place.phase, raw.activity.place.entry) : undefined;
  return {
    userId: m.userId,
    name: m.name,
    email: m.email,
    joinedAt: m.joinedAt,
    readiness: { overall: s.finished ? s.overall : null, level: LEVELS[s.level].label, finished: s.finished, total: s.total },
    skills: s.skills.map((k) => ({ key: k.key, label: k.label, score: k.score })),
    stuck: Object.entries(missionResults(raw.results))
      .filter(([, r]) => !r.solved && (r.wrong >= 2 || r.flagged))
      .map(([id, r]) => ({ title: MISSION_CATALOG[id]?.title ?? id, wrong: r.wrong, skipped: Boolean(r.flagged) })),
    lastActive: latest(raw.progressAt, raw.activity?.updatedAt, raw.labAt, ...raw.drillsAt, ...missionAts),
    place: raw.activity && place ? { page: place.title, tab: raw.activity.place.tab, at: raw.activity.updatedAt } : null,
    labSynced: raw.labAt,
    drillsThisWeek: raw.drillsAt.length,
    labsPassed: LAB_PASS_IDS.filter((id) => raw.results[id]?.solved).length,
    portfolio: raw.portfolio,
  };
}

export async function classReport(cls: AcademyClass, members: ClassMember[]): Promise<ClassReport> {
  const raw = await loadRaw(members.map((m) => m.userId));
  const students = members
    .map((m) => studentRow(m, raw.get(m.userId)!))
    .sort((a, b) => (b.lastActive ?? "").localeCompare(a.lastActive ?? ""));
  const weekAgo = Date.now() - WEEK;
  const scored = students.filter((s) => s.readiness.overall !== null);
  const skillAvg = new Map<string, number[]>();
  for (const s of students) for (const k of s.skills) if (k.score !== null) skillAvg.set(k.label, [...(skillAvg.get(k.label) ?? []), k.score]);
  return {
    class: cls,
    students,
    summary: {
      students: students.length,
      activeThisWeek: students.filter((s) => s.lastActive && Date.parse(s.lastActive) >= weekAgo).length,
      stuck: students.filter((s) => s.stuck.length > 0).length,
      avgReadiness: scored.length ? Math.round(scored.reduce((sum, s) => sum + (s.readiness.overall ?? 0), 0) / scored.length) : null,
      weakest: [...skillAvg.entries()]
        .map(([label, v]) => ({ label, avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length) }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 2),
    },
  };
}
