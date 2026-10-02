import "server-only";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { Row } from "@/lib/siem/types";

// Loads the generated case files from src/content/scenarios. The on-disk shape
// matches scripts/siem/kit.ts. The private half (answers, proofs, sim rows)
// never leaves the server, so a flag or a proof query can never reach the page.

export type Answer = { id: string; prompt: string; accept: string[]; proof: string; expect: string };

type CaseFile = {
  public: import("@/lib/siem/types").CasePublic;
  answers: Answer[];
  sim?: { table: string; rows: Row[] }[];
};

export type LoadedCase = {
  id: string;
  file: CaseFile;
  tables: Record<string, Row[]>;
};

const ROOT = join(process.cwd(), "src", "content", "scenarios");

let cache: Map<string, LoadedCase> | null = null;

function readCase(id: string): LoadedCase | null {
  try {
    const dir = join(ROOT, id);
    const file = JSON.parse(readFileSync(join(dir, "case.json"), "utf8")) as CaseFile;
    const tables: Record<string, Row[]> = {};
    for (const schema of file.public.tables) {
      const path = join(dir, `${schema.name}.ndjson`);
      try {
        tables[schema.name] = readFileSync(path, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Row);
      } catch {
        tables[schema.name] = [];
      }
    }
    return { id, file, tables };
  } catch {
    return null;
  }
}

function build(): Map<string, LoadedCase> {
  if (cache) return cache;
  cache = new Map();
  let ids: string[] = [];
  try {
    ids = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    ids = [];
  }
  for (const id of ids.sort()) {
    const c = readCase(id);
    if (c) cache.set(id, c);
  }
  return cache;
}

export const listCaseIds = () => [...build().keys()];
export const getCase = (id: string) => build().get(id) ?? null;
export const firstCaseId = () => listCaseIds()[0] ?? null;
