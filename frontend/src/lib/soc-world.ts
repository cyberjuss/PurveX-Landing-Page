// The SOC floor as a place you can walk around: its layout, what blocks a
// step, and a path from one point to another. Pure geometry, no React, so the
// component only draws and the rules live here. Units are SVG units in a
// world 1600 wide.

export const WORLD_W = 1600;
export const WALL_H = 170;
export const RADIUS = 16;
const COLS = 4;
const DESK_W = 230;
const DESK_H = 64;
const CELL_X = 300;
const CELL_Y = 210;
const GRID_X = 70;
const GRID_Y = 240;

export type Rect = { x: number; y: number; w: number; h: number };
export type Pt = { x: number; y: number };

export type Station = { i: number; desk: Rect; seat: Pt; label: Pt };

export function layout(n: number) {
  const rows = Math.max(1, Math.ceil(n / COLS));
  const height = Math.max(820, GRID_Y + rows * CELL_Y + 150);
  const stations: Station[] = Array.from({ length: n }, (_, i) => {
    const x = GRID_X + (i % COLS) * CELL_X;
    const y = GRID_Y + Math.floor(i / COLS) * CELL_Y;
    return { i, desk: { x, y, w: DESK_W, h: DESK_H }, seat: { x: x + DESK_W / 2, y: y + DESK_H + 38 }, label: { x: x + DESK_W / 2, y: y + DESK_H + 86 } };
  });
  // The right of the room: the Coach's desk, a colleague on the night shift,
  // the server rack and the coffee corner.
  const coachDesk: Rect = { x: 1350, y: 250, w: 200, h: 64 };
  const coach: Pt = { x: 1450, y: 380 };
  const colleagueDesk: Rect = { x: 1350, y: 520, w: 200, h: 64 };
  const colleague: Pt = { x: 1450, y: 622 };
  const rack: Rect = { x: 1556, y: 200, w: 34, h: Math.min(height - 360, 420) };
  const coffee: Rect = { x: 1380, y: height - 150, w: 150, h: 46 };
  const plants: Pt[] = [
    { x: 1316, y: 200 },
    { x: 40, y: 200 },
    { x: 1560, y: height - 60 },
  ];
  const door: Rect = { x: 70, y: height - 14, w: 120, h: 14 };
  const spawn: Pt = { x: 130, y: height - 60 };
  const blocks: Rect[] = [
    ...stations.map((s) => s.desk),
    coachDesk,
    colleagueDesk,
    rack,
    coffee,
    ...plants.map((p) => ({ x: p.x - 20, y: p.y - 20, w: 40, h: 40 })),
    // the colleague in their chair
    { x: colleague.x - 22, y: colleague.y - 22, w: 44, h: 44 },
    // the Coach, standing
    { x: coach.x - 16, y: coach.y - 16, w: 32, h: 32 },
  ];
  return { height, stations, coachDesk, coach, colleagueDesk, colleague, rack, coffee, plants, door, spawn, blocks };
}

export type World = ReturnType<typeof layout>;

/** Whether a body at p overlaps a wall or anything in the room. */
export function blocked(w: World, p: Pt, r = RADIUS): boolean {
  if (p.x < r + 8 || p.x > WORLD_W - r - 8 || p.y < WALL_H + r || p.y > w.height - r - 4) return true;
  return w.blocks.some((b) => p.x > b.x - r && p.x < b.x + b.w + r && p.y > b.y - r && p.y < b.y + b.h + r);
}

/** One step, sliding along whatever is in the way rather than stopping dead. */
export function step(w: World, p: Pt, dx: number, dy: number): Pt {
  const both = { x: p.x + dx, y: p.y + dy };
  if (!blocked(w, both)) return both;
  const xOnly = { x: p.x + dx, y: p.y };
  if (dx && !blocked(w, xOnly)) return xOnly;
  const yOnly = { x: p.x, y: p.y + dy };
  if (dy && !blocked(w, yOnly)) return yOnly;
  return p;
}

const CELL = 20;

/** A walkable path from a to b on a 20-unit grid, or null when there is none. A* with diagonals. */
export function findPath(w: World, a: Pt, b: Pt): Pt[] | null {
  const cols = Math.floor(WORLD_W / CELL);
  const rows = Math.floor(w.height / CELL);
  const cellOf = (p: Pt) => ({ c: Math.max(0, Math.min(cols - 1, Math.round(p.x / CELL))), r: Math.max(0, Math.min(rows - 1, Math.round(p.y / CELL))) });
  const center = (c: number, r: number) => ({ x: c * CELL, y: r * CELL });
  const free = (c: number, r: number) => !blocked(w, center(c, r));
  const start = cellOf(a);
  let goal = cellOf(b);
  // A goal inside something (a desk, the Coach) means "as close as you can get".
  if (!free(goal.c, goal.r)) {
    let best: { c: number; r: number } | null = null;
    let bestD = Infinity;
    for (let dr = -6; dr <= 6; dr++)
      for (let dc = -6; dc <= 6; dc++) {
        const c = goal.c + dc;
        const r = goal.r + dr;
        if (c < 0 || r < 0 || c >= cols || r >= rows || !free(c, r)) continue;
        const d = Math.hypot(center(c, r).x - b.x, center(c, r).y - b.y);
        if (d < bestD) {
          bestD = d;
          best = { c, r };
        }
      }
    if (!best) return null;
    goal = best;
  }
  const key = (c: number, r: number) => r * cols + c;
  const g = new Map<number, number>([[key(start.c, start.r), 0]]);
  const from = new Map<number, number>();
  const open: { k: number; c: number; r: number; f: number }[] = [{ k: key(start.c, start.r), c: start.c, r: start.r, f: 0 }];
  const h = (c: number, r: number) => Math.hypot(c - goal.c, r - goal.r);
  const closed = new Set<number>();
  while (open.length) {
    open.sort((x, y) => x.f - y.f);
    const cur = open.shift()!;
    if (closed.has(cur.k)) continue;
    closed.add(cur.k);
    if (cur.c === goal.c && cur.r === goal.r) {
      const path: Pt[] = [];
      let k = cur.k;
      while (from.has(k)) {
        path.unshift(center(k % cols, Math.floor(k / cols)));
        k = from.get(k)!;
      }
      // End on the exact point asked for when it is reachable, not the cell centre.
      if (!blocked(w, b)) path.push(b);
      return path;
    }
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const c = cur.c + dc;
        const r = cur.r + dr;
        if (c < 0 || r < 0 || c >= cols || r >= rows || !free(c, r)) continue;
        // No cutting a corner through something solid.
        if (dr && dc && (!free(cur.c + dc, cur.r) || !free(cur.c, cur.r + dr))) continue;
        const k = key(c, r);
        const ng = (g.get(cur.k) ?? 0) + (dr && dc ? 1.414 : 1);
        if (ng < (g.get(k) ?? Infinity)) {
          g.set(k, ng);
          from.set(k, cur.k);
          open.push({ k, c, r, f: ng + h(c, r) });
        }
      }
    if (closed.size > 6000) break;
  }
  return null;
}
