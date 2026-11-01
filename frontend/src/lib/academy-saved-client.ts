"use client";

import { academyFetch } from "@/lib/academy-client";
import { applyPatch, EMPTY_SAVED, mergeSaved, sanitizeSaved, type Saved, type SavedPatch } from "@/lib/academy-saved";

// The page's side of saved answers (see academy-saved.ts). A copy lives in this
// browser so the page has it at once, and the account's copy is loaded once
// per sign-in and merged in. Changes save to the account in the background.
//
// The browser copy is tagged with whose it is. On a shared computer the next
// student would otherwise inherit, and upload, the last one's answers, so a
// copy that is not the signed-in student's is thrown away, never sent.

/** Fired once the account's copy has been merged in, so the page re-applies it. */
export const SAVED_LOADED_EVENT = "academy-saved-loaded";

const LOCAL_KEY = "academy-saved-v1";

let owner: string | null = null;
let saved: Saved = EMPTY_SAVED;
let serverReady = false;
let opening: Promise<void> | null = null;
let pending: SavedPatch | null = null;
let timer = 0;
let sending: Promise<void> | null = null;
const listeners = new Set<() => void>();

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

function writeLocal() {
  try {
    storage()?.setItem(LOCAL_KEY, JSON.stringify({ owner, saved }));
  } catch {}
}

/** This browser's copy, if it belongs to this student. */
function readLocal(studentId: string): Saved {
  const s = storage();
  if (!s) return EMPTY_SAVED;
  try {
    const raw = JSON.parse(s.getItem(LOCAL_KEY) ?? "null") as { owner?: unknown; saved?: unknown } | null;
    return raw?.owner === studentId ? sanitizeSaved(raw.saved) : EMPTY_SAVED;
  } catch {
    return EMPTY_SAVED;
  }
}

function notify() {
  for (const fn of listeners) fn();
}

/** Load this student's saved work. Safe to call more than once. */
export function openSaved(studentId: string): Promise<void> {
  if (owner === studentId && opening) return opening;
  owner = studentId;
  serverReady = false;
  pending = null;
  saved = readLocal(studentId);
  writeLocal();
  notify();
  const me = studentId;
  opening = academyFetch("/academy/api/saved", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((data: { saved?: unknown }) => {
      if (owner !== me) return;
      const server = sanitizeSaved(data.saved);
      // The account's copy wins where both have the same quiz or box, since it
      // is the newer one whenever the student last worked somewhere else.
      const merged = mergeSaved(server, saved);
      serverReady = true;
      if (JSON.stringify(merged) !== JSON.stringify(server)) queue(merged);
      saved = merged;
      writeLocal();
      notify();
      window.dispatchEvent(new Event(SAVED_LOADED_EVENT));
    })
    .catch(() => {
      // Kept in this browser for now, as before. Nothing is sent, so a
      // failed load can never overwrite the account's copy with less.
      if (owner === me) opening = null;
    });
  return opening;
}

export function getSaved(): Saved {
  return saved;
}

export function subscribeSaved(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Record a change here at once and save it to the account shortly after. */
export function updateSaved(patch: SavedPatch) {
  if (!owner) return;
  const next = applyPatch(saved, patch);
  if (JSON.stringify(next) === JSON.stringify(saved)) return;
  saved = next;
  writeLocal();
  notify();
  if (serverReady) queue(patch);
}

function queue(patch: SavedPatch) {
  pending = pending ? { ...pending, ...patch, quizzes: { ...pending.quizzes, ...patch.quizzes }, drafts: { ...pending.drafts, ...patch.drafts } } : patch;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => void flush(), 800);
}

/** Sends what is waiting, one request at a time so two saves never overwrite each other. */
async function flush(keepalive = false) {
  window.clearTimeout(timer);
  if (sending) await sending;
  if (!pending) return;
  const patch = pending;
  pending = null;
  sending = academyFetch("/academy/api/saved", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patch }),
    keepalive,
  })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
    })
    .catch(() => {
      // Put it back so the next change, or leaving the page, tries again.
      pending = pending ? { ...patch, ...pending, quizzes: { ...patch.quizzes, ...pending.quizzes }, drafts: { ...patch.drafts, ...pending.drafts } } : patch;
    })
    .finally(() => {
      sending = null;
    });
  await sending;
}

/** When a different student signs in on this browser: drop the copy that is not theirs. */
export function forgetLocalUnless(studentId: string) {
  const s = storage();
  if (!s) return;
  try {
    const raw = JSON.parse(s.getItem(LOCAL_KEY) ?? "null") as { owner?: unknown } | null;
    if (raw && raw.owner !== studentId) s.removeItem(LOCAL_KEY);
  } catch {}
}

/** On sign-out: send what is waiting, then forget this browser's copy. The account keeps its own. */
export async function clearSavedLocal() {
  await flush(true);
  owner = null;
  opening = null;
  serverReady = false;
  saved = EMPTY_SAVED;
  try {
    storage()?.removeItem(LOCAL_KEY);
  } catch {}
  notify();
}

// Leaving the page, closing the tab, or switching apps on a phone: send what
// is waiting now rather than after the delay.
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => void flush(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush(true);
  });
}
