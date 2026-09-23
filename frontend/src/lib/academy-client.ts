"use client";

import { supabase } from "@/lib/supabase";

// Which account the results in localStorage belong to, so a second student
// on the same browser never inherits the first one's score.
export const RESULTS_OWNER_KEY = "academy-results-owner";
export const RESULTS_CHANGED_EVENT = "academy-results-changed";

export async function academyFetch(path: string, init: RequestInit = {}) {
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers, credentials: "same-origin" });
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
  const data = await keyRes.json();
  if (!keyRes.ok || !scriptRes.ok || typeof data.key !== "string") throw new Error("Could not prepare the script.");
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
