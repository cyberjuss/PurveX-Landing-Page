import "server-only";
import type { Cell, QueryResult, Row } from "@/lib/siem/types";

// A small, safe subset of KQL (the Kusto query language used by Microsoft
// Sentinel and Defender). It runs over in-memory tables, never a real service,
// so the console, the MCP server and the grader all read the same data and
// always agree. The subset is wide enough to teach real hunting:
//
//   TableName
//   | where Account == "alex.rivera" and EventId in (4624, 4625)
//   | where Process has "powershell"
//   | extend Hour = bin(TimeGenerated, 1h)
//   | summarize Hits = count(), Accounts = dcount(Account) by Computer
//   | sort by Hits desc
//   | project Computer, Hits
//   | take 20
//
// Anything outside the subset fails with a message that names the problem, so a
// beginner learns the language instead of hitting a wall.

export class KqlError extends Error {}

const MAX_SCAN = 20000;
const MAX_RETURN = 500;

type Tables = Record<string, Row[]>;

// ---- tokenizer -------------------------------------------------------------

type Tok = { t: "id" | "num" | "str" | "op" | "punct"; v: string };

const OPS = ["==", "!=", "<=", ">=", "=~", "!~", "<", ">", "+", "-", "*", "/"];

function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let s = "";
      while (j < src.length && src[j] !== c) {
        if (src[j] === "\\" && j + 1 < src.length) { s += src[j + 1]; j += 2; continue; }
        s += src[j++];
      }
      if (j >= src.length) throw new KqlError("A quoted string is missing its closing quote.");
      toks.push({ t: "str", v: s });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9._a-z]/i.test(src[j])) j++;
      toks.push({ t: "num", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if (src.slice(i, i + 2) === "..") { toks.push({ t: "punct", v: ".." }); i += 2; continue; }
    const two = src.slice(i, i + 2);
    if (OPS.includes(two)) { toks.push({ t: "op", v: two }); i += 2; continue; }
    if (OPS.includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
    if ("|(),=".includes(c)) { toks.push({ t: "punct", v: c }); i++; continue; }
    throw new KqlError(`I do not understand the character "${c}".`);
  }
  return toks;
}

// ---- expression evaluation (where / extend) --------------------------------

type Expr =
  | { k: "col"; name: string }
  | { k: "lit"; v: Cell }
  | { k: "list"; items: Cell[] }
  | { k: "call"; fn: string; args: Expr[] }
  | { k: "bin"; op: string; l: Expr; r: Expr }
  | { k: "and" | "or"; l: Expr; r: Expr }
  | { k: "not"; e: Expr };

class Parser {
  i = 0;
  constructor(private toks: Tok[]) {}
  peek() { return this.toks[this.i]; }
  next() { return this.toks[this.i++]; }
  eof() { return this.i >= this.toks.length; }
  expect(v: string) {
    const t = this.next();
    if (!t || t.v !== v) throw new KqlError(`Expected "${v}" but found ${t ? `"${t.v}"` : "the end of the line"}.`);
  }

  parseOr(): Expr {
    let l = this.parseAnd();
    while (this.peek()?.t === "id" && this.peek()!.v.toLowerCase() === "or") { this.next(); l = { k: "or", l, r: this.parseAnd() }; }
    return l;
  }
  parseAnd(): Expr {
    let l = this.parseNot();
    while (this.peek()?.t === "id" && this.peek()!.v.toLowerCase() === "and") { this.next(); l = { k: "and", l, r: this.parseNot() }; }
    return l;
  }
  parseNot(): Expr {
    if (this.peek()?.t === "id" && this.peek()!.v.toLowerCase() === "not") { this.next(); this.expect("("); const e = this.parseOr(); this.expect(")"); return { k: "not", e }; }
    return this.parseCompare();
  }
  parseCompare(): Expr {
    const l = this.parseAdd();
    const t = this.peek();
    if (t?.t === "op" && ["==", "!=", "<", ">", "<=", ">=", "=~", "!~"].includes(t.v)) {
      this.next();
      return { k: "bin", op: t.v, l, r: this.parseAdd() };
    }
    if (t?.t === "id") {
      const kw = t.v.toLowerCase();
      if (["has", "contains", "startswith", "endswith", "matches"].includes(kw)) { this.next(); return { k: "bin", op: kw, l, r: this.parseAdd() }; }
      if (kw === "in") { this.next(); this.expect("("); const items = this.parseList(); this.expect(")"); return { k: "bin", op: "in", l, r: { k: "list", items } }; }
      if (kw === "between") { this.next(); this.expect("("); const lo = this.parseAdd(); this.expectDots(); const hi = this.parseAdd(); this.expect(")"); return { k: "and", l: { k: "bin", op: ">=", l, r: lo }, r: { k: "bin", op: "<=", l, r: hi } }; }
    }
    return l;
  }
  expectDots() {
    // "between (low .. high)"
    if (this.peek()?.v === "..") { this.next(); return; }
    throw new KqlError('between needs the form "between (low .. high)".');
  }
  parseList(): Cell[] {
    const items: Cell[] = [];
    for (;;) {
      const e = this.parseAdd();
      if (e.k !== "lit") throw new KqlError("A list in (...) takes plain numbers or strings.");
      items.push(e.v);
      if (this.peek()?.v === ",") { this.next(); continue; }
      break;
    }
    return items;
  }
  parseAdd(): Expr {
    let l = this.parsePrimary();
    while (this.peek()?.t === "op" && ["+", "-"].includes(this.peek()!.v)) { const op = this.next().v; l = { k: "bin", op, l, r: this.parsePrimary() }; }
    return l;
  }
  parsePrimary(): Expr {
    const t = this.next();
    if (!t) throw new KqlError("The expression ends too early.");
    if (t.t === "str") return { k: "lit", v: t.v };
    if (t.t === "num") return { k: "lit", v: num(t.v) };
    if (t.t === "punct" && t.v === "(") { const e = this.parseOr(); this.expect(")"); return e; }
    if (t.t === "id") {
      const low = t.v.toLowerCase();
      if (low === "true") return { k: "lit", v: true };
      if (low === "false") return { k: "lit", v: false };
      if (this.peek()?.v === "(") {
        this.next();
        const args: Expr[] = [];
        if (this.peek()?.v !== ")") for (;;) { args.push(this.parseOr()); if (this.peek()?.v === ",") { this.next(); continue; } break; }
        this.expect(")");
        return { k: "call", fn: low, args };
      }
      return { k: "col", name: t.v };
    }
    throw new KqlError(`Unexpected "${t.v}".`);
  }
}

function num(s: string): number {
  const m = s.match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d)?$/i);
  if (!m) throw new KqlError(`"${s}" is not a number I understand.`);
  const n = parseFloat(m[1]);
  const unit = m[2]?.toLowerCase();
  if (!unit) return n;
  const ms = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit]!;
  return n * ms; // timespans are milliseconds, used by bin() and ago()
}

const asStr = (v: Cell) => (v === null ? "" : String(v));
const lower = (v: Cell) => asStr(v).toLowerCase();

function evalExpr(e: Expr, row: Row): Cell {
  switch (e.k) {
    case "lit": return e.v;
    case "col": return e.name in row ? row[e.name] : null;
    case "list": return null;
    case "not": return !truthy(evalExpr(e.e, row));
    case "and": return truthy(evalExpr(e.l, row)) && truthy(evalExpr(e.r, row));
    case "or": return truthy(evalExpr(e.l, row)) || truthy(evalExpr(e.r, row));
    case "call": return evalCall(e, row);
    case "bin": return evalBin(e, row);
  }
}

function evalCall(e: Extract<Expr, { k: "call" }>, row: Row): Cell {
  const a = e.args;
  switch (e.fn) {
    case "bin": {
      const v = Number(evalExpr(a[0], row));
      const width = Number(evalExpr(a[1], row));
      if (!width) return v;
      return Math.floor(v / width) * width;
    }
    case "ago": {
      // Relative to the newest row's time is not known here, so ago() compares
      // against now. Case data is shifted to recent times, so this still works.
      return Date.now() - Number(evalExpr(a[0], row));
    }
    case "now": return Date.now();
    case "strlen": return asStr(evalExpr(a[0], row)).length;
    case "tolower": return lower(evalExpr(a[0], row));
    case "toupper": return asStr(evalExpr(a[0], row)).toUpperCase();
    case "toint": case "tolong": case "todouble": return Number(evalExpr(a[0], row));
    case "tostring": return asStr(evalExpr(a[0], row));
    default: throw new KqlError(`The function "${e.fn}()" is not available here.`);
  }
}

function toTime(v: Cell): number {
  if (typeof v === "number") return v;
  const t = Date.parse(asStr(v));
  return Number.isNaN(t) ? NaN : t;
}

function evalBin(e: Extract<Expr, { k: "bin" }>, row: Row): Cell {
  const op = e.op;
  if (["has", "contains", "startswith", "endswith", "matches"].includes(op)) {
    const hay = lower(evalExpr(e.l, row));
    const needle = lower(evalExpr(e.r, row));
    if (op === "contains") return hay.includes(needle);
    if (op === "startswith") return hay.startsWith(needle);
    if (op === "endswith") return hay.endsWith(needle);
    if (op === "matches") { try { return new RegExp(asStr(evalExpr(e.r, row)), "i").test(asStr(evalExpr(e.l, row))); } catch { throw new KqlError("matches regex needs a valid pattern after it."); } }
    return new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(hay) || hay.split(/[\s\\/._-]+/).includes(needle);
  }
  if (op === "in") {
    const items = (e.r as Extract<Expr, { k: "list" }>).items.map(lower);
    return items.includes(lower(evalExpr(e.l, row)));
  }
  const l = evalExpr(e.l, row);
  const r = evalExpr(e.r, row);
  if (op === "+") return Number(l) + Number(r);
  if (op === "-") return Number(l) - Number(r);
  if (op === "*") return Number(l) * Number(r);
  if (op === "/") return Number(l) / Number(r);
  if (op === "=~") return lower(l) === lower(r);
  if (op === "!~") return lower(l) !== lower(r);
  if (op === "==") return looseEq(l, r);
  if (op === "!=") return !looseEq(l, r);
  // Ordered comparisons work on numbers or on datetimes.
  let ln = Number(l), rn = Number(r);
  if (Number.isNaN(ln) || Number.isNaN(rn)) { ln = toTime(l); rn = toTime(r); }
  if (op === "<") return ln < rn;
  if (op === ">") return ln > rn;
  if (op === "<=") return ln <= rn;
  if (op === ">=") return ln >= rn;
  throw new KqlError(`The operator "${op}" is not supported.`);
}

function looseEq(l: Cell, r: Cell): boolean {
  if (typeof l === "number" || typeof r === "number") {
    const ln = Number(l), rn = Number(r);
    if (!Number.isNaN(ln) && !Number.isNaN(rn)) return ln === rn;
  }
  return lower(l) === lower(r);
}

function truthy(v: Cell): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  return v !== null && asStr(v) !== "";
}

// ---- summarize -------------------------------------------------------------

type Agg = { out: string; fn: string; arg: string | null };

function parseSummarize(rest: Tok[]): { aggs: Agg[]; by: string[] } {
  // "Name = count(), dcount(Account) by Computer, Hour"
  const byAt = rest.findIndex((t) => t.t === "id" && t.v.toLowerCase() === "by");
  const aggToks = byAt >= 0 ? rest.slice(0, byAt) : rest;
  const byToks = byAt >= 0 ? rest.slice(byAt + 1) : [];
  const aggs: Agg[] = [];
  for (const piece of splitCommas(aggToks)) {
    let out: string | null = null;
    let p = piece;
    if (p.length >= 2 && p[0].t === "id" && p[1].v === "=") { out = p[0].v; p = p.slice(2); }
    if (!p.length || p[0].t !== "id") throw new KqlError("summarize needs an aggregate like count() or dcount(Account).");
    const fn = p[0].v.toLowerCase();
    let arg: string | null = null;
    if (p[1]?.v === "(") { if (p[2] && p[2].v !== ")") arg = p[2].v; }
    if (!["count", "dcount", "sum", "avg", "min", "max", "countif"].includes(fn)) throw new KqlError(`summarize does not support "${fn}()".`);
    aggs.push({ out: out ?? (arg ? `${fn}_${arg}` : fn), fn, arg });
  }
  const by = splitCommas(byToks).map((p) => p.map((t) => t.v).join(""));
  return { aggs, by };
}

function applySummarize(rows: Row[], aggs: Agg[], by: string[]): Row[] {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = by.map((b) => asStr(row[b])).join("\u0001");
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(row);
  }
  if (!by.length && !groups.size) groups.set("", []);
  const out: Row[] = [];
  for (const [, g] of groups) {
    const r: Row = {};
    by.forEach((b) => (r[b] = g[0]?.[b] ?? null));
    for (const a of aggs) {
      const vals = a.arg ? g.map((x) => x[a.arg!]) : [];
      if (a.fn === "count") r[a.out] = g.length;
      else if (a.fn === "dcount") r[a.out] = new Set(g.map((x) => asStr(x[a.arg!]))).size;
      else if (a.fn === "countif") r[a.out] = g.filter((x) => truthy(x[a.arg!])).length;
      else if (a.fn === "sum") r[a.out] = vals.reduce((s: number, v) => s + Number(v), 0);
      else if (a.fn === "avg") r[a.out] = vals.reduce((s: number, v) => s + Number(v), 0) / (vals.length || 1);
      else if (a.fn === "min") r[a.out] = Math.min(...vals.map(Number));
      else if (a.fn === "max") r[a.out] = Math.max(...vals.map(Number));
    }
    out.push(r);
  }
  return out;
}

// ---- pipeline --------------------------------------------------------------

function splitPipes(toks: Tok[]): Tok[][] {
  const stages: Tok[][] = [[]];
  let depth = 0;
  for (const t of toks) {
    if (t.v === "(") depth++;
    if (t.v === ")") depth--;
    if (t.v === "|" && depth === 0) { stages.push([]); continue; }
    stages[stages.length - 1].push(t);
  }
  return stages;
}

function splitCommas(toks: Tok[]): Tok[][] {
  const out: Tok[][] = [[]];
  let depth = 0;
  for (const t of toks) {
    if (t.v === "(") depth++;
    if (t.v === ")") depth--;
    if (t.v === "," && depth === 0) { out.push([]); continue; }
    out[out.length - 1].push(t);
  }
  return out[0].length ? out : [];
}

/** Run one query over the given tables and return the rows that matched. */
export function runKql(query: string, tables: Tables): QueryResult {
  const toks = lex(query);
  if (!toks.length) throw new KqlError("Type a query. Start with a table name, such as SecurityEvent.");
  const stages = splitPipes(toks);
  const head = stages[0];
  if (head.length !== 1 || head[0].t !== "id") throw new KqlError("A query starts with one table name, such as SecurityEvent.");
  const tableName = head[0].v;
  const match = Object.keys(tables).find((n) => n.toLowerCase() === tableName.toLowerCase());
  if (!match) throw new KqlError(`There is no table called "${tableName}". Check the schema on the left.`);

  let rows = tables[match];
  let scanned = rows.length;
  if (scanned > MAX_SCAN) { rows = rows.slice(0, MAX_SCAN); scanned = MAX_SCAN; }
  let cols: string[] | null = null;

  for (let s = 1; s < stages.length; s++) {
    const stage = stages[s];
    if (!stage.length) continue;
    const op = stage[0].v.toLowerCase();
    const rest = stage.slice(1);
    if (op === "where") {
      const e = new Parser(rest).parseOr();
      rows = rows.filter((r) => truthy(evalExpr(e, r)));
    } else if (op === "take" || op === "limit") {
      rows = rows.slice(0, Math.max(0, parseInt(rest[0]?.v ?? "10", 10)));
    } else if (op === "count") {
      rows = [{ Count: rows.length }];
      cols = ["Count"];
    } else if (op === "distinct") {
      const names = splitCommas(rest).map((p) => p[0].v);
      const seen = new Set<string>();
      rows = rows.filter((r) => { const k = names.map((n) => asStr(r[n])).join("\u0001"); if (seen.has(k)) return false; seen.add(k); return true; }).map((r) => Object.fromEntries(names.map((n) => [n, r[n] ?? null])));
      cols = names;
    } else if (op === "project") {
      const parts = splitCommas(rest);
      const outCols: string[] = [];
      rows = rows.map((r) => {
        const o: Row = {};
        for (const p of parts) {
          if (p.length >= 2 && p[0].t === "id" && p[1].v === "=") { const name = p[0].v; o[name] = evalExpr(new Parser(p.slice(2)).parseOr(), r); if (!outCols.includes(name)) outCols.push(name); }
          else { const name = p.map((t) => t.v).join(""); o[name] = r[name] ?? null; if (!outCols.includes(name)) outCols.push(name); }
        }
        return o;
      });
      cols = outCols;
    } else if (op === "extend") {
      const parts = splitCommas(rest);
      rows = rows.map((r) => {
        const o: Row = { ...r };
        for (const p of parts) {
          if (!(p.length >= 2 && p[1].v === "=")) throw new KqlError('extend needs the form "Name = expression".');
          o[p[0].v] = evalExpr(new Parser(p.slice(2)).parseOr(), r);
        }
        return o;
      });
      cols = null;
    } else if (op === "summarize") {
      const { aggs, by } = parseSummarize(rest);
      rows = applySummarize(rows, aggs, by);
      cols = [...by, ...aggs.map((a) => a.out)];
    } else if (op === "sort" || op === "order") {
      let r2 = rest;
      if (r2[0]?.v.toLowerCase() === "by") r2 = r2.slice(1);
      const keys = splitCommas(r2).map((p) => ({ col: p[0].v, desc: !(p[1]?.v?.toLowerCase() === "asc") }));
      rows = [...rows].sort((a, b) => {
        for (const k of keys) {
          const av = a[k.col], bv = b[k.col];
          let cmp = typeof av === "number" && typeof bv === "number" ? av - bv : asStr(av).localeCompare(asStr(bv));
          if (cmp !== 0) return k.desc ? -cmp : cmp;
        }
        return 0;
      });
    } else if (op === "join") {
      rows = applyJoin(rows, rest, tables);
      cols = null;
    } else {
      throw new KqlError(`"${op}" is not a command I know. Try where, project, summarize, sort, take or count.`);
    }
  }

  const truncated = rows.length > MAX_RETURN;
  const outRows = truncated ? rows.slice(0, MAX_RETURN) : rows;
  const columns = cols ?? (outRows.length ? Object.keys(outRows[0]) : Object.keys(tables[match][0] ?? {}));
  return { columns, rows: outRows, scanned, truncated };
}

function applyJoin(left: Row[], rest: Tok[], tables: Tables): Row[] {
  // join kind=inner (InnerTable) on Key
  let r = rest;
  if (r[0]?.v.toLowerCase() === "kind") { r = r.slice(1); if (r[0]?.v === "=") r = r.slice(1); if (r[0]) r = r.slice(1); }
  if (r[0]?.v !== "(") throw new KqlError("join needs a table in parentheses, for example join (SigninLogs) on Account.");
  let depth = 0, j = 0;
  for (; j < r.length; j++) { if (r[j].v === "(") depth++; if (r[j].v === ")") { depth--; if (!depth) break; } }
  const innerToks = r.slice(1, j);
  const after = r.slice(j + 1);
  if (after[0]?.v.toLowerCase() !== "on") throw new KqlError('join needs "on <column>".');
  const key = after[1]?.v;
  if (!key) throw new KqlError("join needs a column name after on.");
  const inner = runKql(innerToks.map((t) => (t.t === "str" ? `"${t.v}"` : t.v)).join(" "), tables).rows;
  const index = new Map<string, Row>();
  for (const row of inner) index.set(asStr(row[key]), row);
  const out: Row[] = [];
  for (const row of left) { const m = index.get(asStr(row[key])); if (m) out.push({ ...m, ...row }); }
  return out;
}
