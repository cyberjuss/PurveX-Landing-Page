import { randomUUID } from "node:crypto";
import type { DrillEntry, EntryMode } from "@/lib/academy-drills";

export type TestStudent = { id: string; email: string | null; name: string | null };

/** A fresh student, so in-memory state from one test never reaches another. */
export function newStudent(email = `${randomUUID().slice(0, 8)}@example.com`): TestStudent {
  return { id: randomUUID(), email, name: "Test Student" };
}

export const today = () => new Date().toISOString().slice(0, 10);

export function entry(mode: EntryMode, day = today(), id = `${mode}-${randomUUID()}`): DrillEntry {
  return { id, day, mode, correct: 1, total: 1, seconds: 30, misses: [], at: new Date().toISOString(), level: 1, detail: [] };
}

export function req(path: string, init: { method?: string; body?: unknown } = {}) {
  return new Request(`http://localhost${path}`, {
    method: init.method ?? "GET",
    headers: { "content-type": "application/json", authorization: "Bearer test" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}
