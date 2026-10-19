import type { Build, HairStyle, Look } from "./soc-people";

// Your analyst on the SOC floor: how they are built, their hair, and what they
// wear. Kept in this browser only, since it is a matter of taste and nothing
// else reads it.

export type Avatar = { build: Build; hairStyle: HairStyle; skin: string; hair: string; jacket: boolean; top: string; shirt: string; trousers: string };

export const BUILDS: { id: Build; label: string }[] = [
  { id: "masc", label: "Masculine" },
  { id: "fem", label: "Feminine" },
  { id: "neutral", label: "Neutral" },
];
export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "buzz", label: "Buzz" },
  { id: "long", label: "Long" },
  { id: "bun", label: "Bun" },
  { id: "curly", label: "Curly" },
];
export const SKINS = ["#f1d3bf", "#e2b896", "#c99a7a", "#a87452", "#7a5238", "#4e3324"];
export const HAIRS = ["#16130f", "#3a2a1e", "#6b4a2f", "#a7783f", "#d8c08f", "#8e8a86"];
export const TOPS = ["#1f2430", "#2e3442", "#3b3f4a", "#2b3d33", "#3a2f45", "#5a3b33", "#6b6f78", "#c9c4ba"];
export const SHIRTS = ["#eef0f4", "#d7dde8", "#c9d6e3", "#e8dfd2", "#2f3e4f", "#1d1f25"];
export const TROUSERS = ["#1b1e25", "#2b2f38", "#3c3a36", "#4a4f5c", "#615a4e"];

export const DEFAULT_AVATAR: Avatar = { build: "masc", hairStyle: "short", skin: "#c99a7a", hair: "#2a211b", jacket: true, top: "#2e3442", shirt: "#e6e8ee", trousers: "#1f232b" };

const KEY = "academy-soc-avatar";

export function loadAvatar(): Avatar {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_AVATAR, ...(JSON.parse(raw) as Partial<Avatar>) };
  } catch {}
  return DEFAULT_AVATAR;
}

export function saveAvatar(a: Avatar) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {}
}

/** The avatar as the figure draws it. */
export const lookOf = (a: Avatar): Look => ({
  skin: a.skin,
  hair: a.hair,
  shirt: a.shirt,
  jacket: a.jacket ? a.top : undefined,
  trousers: a.trousers,
  build: a.build,
  hairStyle: a.hairStyle,
});
