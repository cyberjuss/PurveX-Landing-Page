// A stand-in for the academy_progress table that behaves like Postgres where
// it matters here: an update with filters lands only on rows that still match
// them, a duplicate insert fails with 23505, and every call takes a random
// moment, so requests that start together interleave the way real ones do.
type Row = Record<string, unknown>;
export const table = new Map<string, Row>();
const pause = () => new Promise((r) => setTimeout(r, Math.random() * 15));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function query(op: "select" | "update", patch?: Row) {
  const filters: [string, unknown][] = [];
  const match = (row: Row) => filters.every(([k, v]) => row[k] === v);
  const q = {
    eq(k: string, v: unknown) {
      filters.push([k, v]);
      return q;
    },
    async maybeSingle() {
      await pause();
      const row = [...table.values()].find(match);
      return { data: row ? clone(row) : null, error: null };
    },
    async select() {
      await pause();
      const hit = [...table.values()].filter(match);
      if (op === "update") for (const row of hit) Object.assign(row, clone(patch));
      return { data: hit.map((r) => ({ user_id: r.user_id })), error: null };
    },
  };
  return q;
}

export const supabaseAdmin = {
  from() {
    return {
      select: () => query("select"),
      update: (patch: Row) => query("update", patch),
      async insert(row: Row) {
        await pause();
        if (table.has(row.user_id as string)) return { error: { code: "23505", message: "duplicate key" } };
        table.set(row.user_id as string, clone(row));
        return { error: null };
      },
      async upsert(row: Row) {
        await pause();
        table.set(row.user_id as string, { ...(table.get(row.user_id as string) ?? {}), ...clone(row) });
        return { error: null };
      },
    };
  },
};
