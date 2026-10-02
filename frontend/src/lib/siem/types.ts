// Shared SIEM types. Kept free of server-only imports so the console (client)
// and the engine (server) can both use them.

/** One log row. Columns depend on the table. Values are strings, numbers,
 *  booleans or null, matching what a real Log Analytics row holds. */
export type Cell = string | number | boolean | null;
export type Row = Record<string, Cell>;

/** A column in a table schema, with a one-line description for the sidebar. */
export type Column = { name: string; type: "string" | "int" | "datetime" | "bool"; about: string };

/** A table the student can query, such as SecurityEvent. */
export type TableSchema = { name: string; about: string; columns: Column[] };

/** The result of running a query: named columns and the rows that matched. */
export type QueryResult = { columns: string[]; rows: Row[]; scanned: number; truncated: boolean };

/** A query the student can run with one click, shown above the editor. */
export type ExampleQuery = { label: string; kql: string };

/** An alert in the incident queue, before the student has classified it. */
export type CaseAlert = {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High";
  firedAt: string;
  entities: string[];
  attack: { id: string; name: string } | null;
  /** The student's read of the alert. One of the three real SOC verdicts. */
  summary: string;
};

/** The public shape of a case: the story and schema the student sees, never
 *  the answer key or the proof queries. */
export type CasePublic = {
  id: string;
  title: string;
  story: string;
  tables: TableSchema[];
  examples: ExampleQuery[];
  alerts: CaseAlert[];
  /** The questions the student reports answers to, added by the server from the
   *  answer key. Prompts only, never the answer or the proof query. */
  findings?: { id: string; prompt: string }[];
};
