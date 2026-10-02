import "server-only";
import { normalizeGuess } from "@/lib/academy-answers";
import { getCase, listCaseIds, type LoadedCase } from "@/lib/siem/cases";
import { KqlError, runKql } from "@/lib/siem/kql";
import type { CasePublic, QueryResult, Row } from "@/lib/siem/types";

// The one interface the console, the MCP server and the grader depend on. Dev
// uses MockSource (local KQL over the case fixtures). Production will add an
// AzureSource that runs the same calls against the student's real Sentinel
// workspace, with no change to anything that consumes this.

export type SiemMode = "mock" | "live";
export const siemMode = (): SiemMode => (process.env.SIEM_MODE === "live" ? "live" : "mock");

export type FindingResult = { correct: boolean; feedback: string | null };

export interface SentinelSource {
  listCases(): Promise<{ id: string; title: string }[]>;
  getCase(userId: string, caseId: string): Promise<CasePublic | null>;
  runQuery(userId: string, caseId: string, kql: string): Promise<QueryResult>;
  /** Append this case's sim rows (dev stand-in for live ingestion). Returns how
   *  many rows arrived, or null if the case has none. */
  fireScenario(userId: string, caseId: string): Promise<{ added: number } | null>;
  /** Grade a flag without ever returning the answer. */
  checkFinding(userId: string, caseId: string, findingId: string, answer: string): Promise<FindingResult | null>;
}

// ---- dev backend -----------------------------------------------------------

/** Rows a student has had injected by the sim, kept per student + case so the
 *  prototype behaves like a real per-student workspace. In-memory only. */
const injected = new Map<string, Record<string, Row[]>>();
const keyOf = (userId: string, caseId: string) => `${userId}\u0001${caseId}`;

function tablesFor(userId: string, loaded: LoadedCase): Record<string, Row[]> {
  const extra = injected.get(keyOf(userId, loaded.id));
  if (!extra) return loaded.tables;
  const merged: Record<string, Row[]> = {};
  for (const [name, rows] of Object.entries(loaded.tables)) merged[name] = extra[name] ? [...rows, ...extra[name]] : rows;
  return merged;
}

class MockSource implements SentinelSource {
  async listCases() {
    return listCaseIds().map((id) => ({ id, title: getCase(id)!.file.public.title }));
  }

  async getCase(_userId: string, caseId: string) {
    const loaded = getCase(caseId);
    if (!loaded) return null;
    // Attach the finding prompts, derived from the answer key with the answers
    // and proof queries stripped off.
    return { ...loaded.file.public, findings: loaded.file.answers.map((a) => ({ id: a.id, prompt: a.prompt })) };
  }

  async runQuery(userId: string, caseId: string, kql: string): Promise<QueryResult> {
    const loaded = getCase(caseId);
    if (!loaded) throw new KqlError("That case is not loaded.");
    return runKql(kql, tablesFor(userId, loaded));
  }

  async fireScenario(userId: string, caseId: string) {
    const loaded = getCase(caseId);
    if (!loaded?.file.sim?.length) return null;
    const store = injected.get(keyOf(userId, caseId)) ?? {};
    let added = 0;
    for (const { table, rows } of loaded.file.sim) {
      store[table] = [...(store[table] ?? []), ...rows];
      added += rows.length;
    }
    injected.set(keyOf(userId, caseId), store);
    return { added };
  }

  async checkFinding(userId: string, caseId: string, findingId: string, answer: string): Promise<FindingResult | null> {
    const loaded = getCase(caseId);
    const ans = loaded?.file.answers.find((a) => a.id === findingId);
    if (!ans) return null;
    const g = normalizeGuess(answer);
    if (!g) return { correct: false, feedback: "Type an answer first." };
    const accepts = ans.accept.map(normalizeGuess);
    if (accepts.includes(g)) return { correct: true, feedback: null };
    return { correct: false, feedback: hint(ans.id, g) };
  }
}

// Short, non-revealing nudges for common wrong flags, in the house style.
function hint(id: string, _g: string): string | null {
  const map: Record<string, string> = {
    "rw-02": "Look at the host the encrypting process kept calling, not an address a browser hit once.",
    "rw-03": "Find the process behind the renamed files, not the attachment that started it.",
    "rw-05": "Count only the files renamed with the locked extension, not every file event.",
  };
  return map[id] ?? null;
}

let singleton: SentinelSource | null = null;

/** The active source for this environment. Mock in dev, Azure in production
 *  once that backend lands. */
export function sentinelSource(): SentinelSource {
  if (!singleton) singleton = new MockSource();
  return singleton;
}
