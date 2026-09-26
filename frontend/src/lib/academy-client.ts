"use client";

import { useMemo, useSyncExternalStore } from "react";
import { sanitizeProfile, type StudentProfile } from "@/lib/academy-certs";
import { RESULTS_STORAGE_KEY, type Results } from "@/lib/academy-score";
import { supabase } from "@/lib/supabase";

// Which account the results in localStorage belong to, so a second student
// on the same browser never inherits the first one's score.
export const RESULTS_OWNER_KEY = "academy-results-owner";
export const RESULTS_CHANGED_EVENT = "academy-results-changed";
// Fired after a single answer is recorded, so live score displays update.
// RESULTS_CHANGED_EVENT is for whole-set replacements, which also re-apply
// saved state to the missions on the page.
export const RESULTS_UPDATED_EVENT = "academy-results-updated";
export const READINESS_PATH = "/academy/readiness";

/** The student's local calendar day, same shape the drill APIs accept. */
export const localDay = (d = new Date()) => d.toLocaleDateString("sv-SE");

const RESULT_EVENTS = [RESULTS_CHANGED_EVENT, RESULTS_UPDATED_EVENT, "storage"];

function subscribeResults(onChange: () => void) {
  RESULT_EVENTS.forEach((e) => window.addEventListener(e, onChange));
  return () => RESULT_EVENTS.forEach((e) => window.removeEventListener(e, onChange));
}

function readResultsRaw() {
  try {
    return window.localStorage.getItem(RESULTS_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

// Mission results from localStorage, re-read on every render and whenever
// they are replaced from the server. Empty during server rendering.
export function useResults(): Results {
  const raw = useSyncExternalStore(subscribeResults, readResultsRaw, () => "");
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as Results) : {};
    } catch {
      return {};
    }
  }, [raw]);
}

export async function academyFetch(path: string, init: RequestInit = {}) {
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers, credentials: "same-origin" });
}

// A copy of the student's intake answers, so a slow or failing server never
// sends someone who already answered back through the questions.
const profileKey = (studentId: string) => `academy-profile:${studentId}`;

export function loadCachedProfile(studentId: string): StudentProfile | null {
  try {
    const raw = window.localStorage.getItem(profileKey(studentId));
    return raw ? sanitizeProfile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveCachedProfile(studentId: string, profile: StudentProfile) {
  try {
    window.localStorage.setItem(profileKey(studentId), JSON.stringify(profile));
  } catch {}
}

export const LINKED_SCRIPT_PATH = "/lab-scripts/Build-Environment.ps1";

function psString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

// Downloads Build-Environment.ps1 linked to the signed-in student, so each
// build also syncs their lab snapshot for PurveX Coach. A new download
// replaces the previous link.
export async function downloadLinkedBuildScript() {
  const [keyRes, scriptRes] = await Promise.all([
    academyFetch("/academy/api/mcp-key", { method: "POST" }),
    fetch(LINKED_SCRIPT_PATH, { cache: "no-store" }),
  ]);
  const data = await keyRes.json().catch(() => ({}));
  if (!keyRes.ok || typeof data.key !== "string") {
    throw new Error(typeof data.error === "string" && data.error ? data.error : "Could not link the script to your account.");
  }
  if (!scriptRes.ok) throw new Error("Could not load the script.");
  const script = (await scriptRes.text())
    .replace(/\[string\]\$PurvexKey = ""/, `[string]$PurvexKey = ${psString(data.key)}`)
    .replace(/\[string\]\$PurvexUrl = ""/, `[string]$PurvexUrl = ${psString(window.location.origin)}`);
  const url = URL.createObjectURL(new Blob([script], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "Build-Environment.ps1";
  a.click();
  URL.revokeObjectURL(url);
}
