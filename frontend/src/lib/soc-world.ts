// The SOC floor as a place you can walk around: its layout, what blocks a
// step, and a path from one point to another. Pure geometry, no React, so the
// component only draws and the rules live here. Units are SVG units in a
// world 1600 wide.

export const WORLD_W = 1600;
export const WALL_H = 150;
export const RADIUS = 16;
const PER_ROW = 4;
const DESK_W = 220;
const DESK_H = 62;
const CELL_X = 290;
const ROW_H = 230;
const GRID_X = 80;
const GRID_Y = 250;

export type Rect = { x: number; y: number; w: number; h: number };
export type Pt = { x: number; y: number };

export type Station = { i: number; desk: Rect; seat: Pt; label: Pt };
export type Pod = { label: string; rug: Rect; stations: number[] };
export type Person = { id: string; at: Pt; spot: Pt; face: number; seated?: boolean };

/**
 * The room for a list of pods, each a run of labs that belong together (a
 * week of the course). A pod takes a row, or more than one when it has more
 * desks than fit; its rug marks the zone on the floor.
 */
export function layout(pods: { label: string; size: number }[]) {
  const stations: Station[] = [];
  const zones: Pod[] = [];
  let row = 0;
  for (const pod of pods) {
    const first = row;
    const ids: number[] = [];
    for (let k = 0; k < pod.size; k++) {
      if (k && k % PER_ROW === 0) row++;
      const i = stations.length;
      const x = GRID_X + (k % PER_ROW) * CELL_X;
      const y = GRID_Y + row * ROW_H;
      stations.push({ i, desk: { x, y, w: DESK_W, h: DESK_H }, seat: { x: x + DESK_W / 2, y: y + DESK_H + 40 }, label: { x: x + DESK_W / 2, y: y + DESK_H + 92 } });
      ids.push(i);
    }
    const rows = row - first + 1;
    zones.push({ label: pod.label, rug: { x: GRID_X - 40, y: GRID_Y + first * ROW_H - 46, w: PER_ROW * CELL_X + 10, h: rows * ROW_H - 14 }, stations: ids });
    row++;
  }
  const height = Math.max(860, GRID_Y + row * ROW_H + 110);
  // The right of the room: the Coach's desk, a colleague on the night shift,
  // the server rack and the coffee corner.
  const coachDesk: Rect = { x: 1330, y: 250, w: 210, h: 62 };
  const coach: Pt = { x: 1435, y: 372 };
  const colleagueDesk: Rect = { x: 1330, y: 540, w: 210, h: 62 };
  const colleague: Pt = { x: 1435, y: 640 };
  const rack: Rect = { x: 1562, y: 190, w: 28, h: Math.min(height - 340, 380) };
  const coffee: Rect = { x: 1360, y: height - 140, w: 160, h: 44 };
  const plants: Pt[] = [
    { x: 1296, y: 196 },
    { x: 1560, y: height - 50 },
  ];
  const door: Rect = { x: 60, y: height - 12, w: 130, h: 12 };
  // A few steps in from the door, so the camera behind you has room.
  const spawn: Pt = { x: 160, y: height - 150 };
  // The people on the floor you can talk to. `at` is where they are, `spot`
  // where you stand to talk, `face` which way they face (radians, 0 is
  // towards the entrance). The night-shift colleague is one of them.
  const people: Person[] = [
    { id: "dana", at: { x: 980, y: 192 }, spot: { x: 930, y: 200 }, face: 0 },
    { id: "marcus", at: colleague, spot: { x: 1368, y: 640 }, face: Math.PI, seated: true },
    { id: "alex", at: { x: 1500, y: 470 }, spot: { x: 1438, y: 470 }, face: -Math.PI / 2 },
    { id: "devon", at: { x: 1452, y: Math.max(790, height - 320) }, spot: { x: 1390, y: Math.max(790, height - 320) }, face: -Math.PI / 2 },
    { id: "renee", at: { x: 330, y: 192 }, spot: { x: 380, y: 200 }, face: 0 },
    // Along the front windows, facing into the room, clear of the way in from the door.
    { id: "priya", at: { x: 470, y: height - 80 }, spot: { x: 470, y: height - 132 }, face: Math.PI },
    { id: "jordan", at: { x: 720, y: height - 80 }, spot: { x: 720, y: height - 132 }, face: Math.PI },
    { id: "grace", at: { x: 970, y: height - 80 }, spot: { x: 970, y: height - 132 }, face: Math.PI },
  ];
  const blocks: Rect[] = [
    ...stations.map((s) => s.desk),
    coachDesk,
    colleagueDesk,
    rack,
    coffee,
    ...plants.map((p) => ({ x: p.x - 18, y: p.y - 18, w: 36, h: 36 })),
    { x: colleague.x - 22, y: colleague.y - 22, w: 44, h: 44 },
    { x: coach.x - 16, y: coach.y - 16, w: 32, h: 32 },
    ...people.filter((p) => !p.seated).map((p) => ({ x: p.at.x - 16, y: p.at.y - 16, w: 32, h: 32 })),
  ];
  return { height, stations, pods: zones, coachDesk, coach, colleagueDesk, colleague, rack, coffee, plants, door, spawn, people, blocks };
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
