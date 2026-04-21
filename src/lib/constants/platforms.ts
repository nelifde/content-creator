export const PLATFORMS = [
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
  "x",
  "linkedin",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const ASPECT_RATIOS = ["1:1", "4:5", "9:16", "16:9", "custom"] as const;

export const CONTENT_TYPES = [
  "static",
  "carousel",
  "story",
  "short_video",
  "animated_post",
  "cover",
  "copy_only",
] as const;
