// Shared by the recorder (to warn before uploading) and the server (to refuse).
/** The proof-clips bucket's own cap, set in academy.sql. */
export const CLIP_MAX_BYTES = 100 * 1024 * 1024;
/** Longest clip a profile shows. At the recorder's bitrate this stays under the byte cap. */
export const CLIP_MAX_SECONDS = 15 * 60;
/** Screen text stays readable at these rates, and 15 minutes of both fits in 100 MB with room to spare. */
export const CLIP_VIDEO_BPS = 700_000;
export const CLIP_AUDIO_BPS = 64_000;
