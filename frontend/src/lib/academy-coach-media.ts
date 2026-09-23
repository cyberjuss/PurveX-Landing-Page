export const COACH_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export type CoachImageType = (typeof COACH_IMAGE_TYPES)[number];
export type CoachImage = { mediaType: CoachImageType; data: string };

export const COACH_IMAGE_MAX = 2;
export const COACH_IMAGE_MAX_CHARS = 1_800_000;
export const COACH_SHOT_ASK = "Look at this shot. What should I check next?";

export function isCoachImageType(value: string): value is CoachImageType {
  return (COACH_IMAGE_TYPES as readonly string[]).includes(value);
}

export function sanitizeCoachImages(raw: unknown): CoachImage[] {
  if (!Array.isArray(raw)) return [];
  const out: CoachImage[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const mediaType = String((row as { mediaType?: unknown }).mediaType || "");
    const data = String((row as { data?: unknown }).data || "").replace(/\s+/g, "");
    if (!isCoachImageType(mediaType) || !data || data.length > COACH_IMAGE_MAX_CHARS) continue;
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) continue;
    out.push({ mediaType, data });
    if (out.length >= COACH_IMAGE_MAX) break;
  }
  return out;
}

export function coachImageSrc(image: CoachImage): string {
  return `data:${image.mediaType};base64,${image.data}`;
}
