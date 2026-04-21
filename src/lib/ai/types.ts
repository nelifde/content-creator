export type ImageProviderId = "nanoBananaPro" | "seedream";
export type VideoProviderId = "seedream" | "kling";

export interface ImageGenInput {
  prompt: string;
  aspectRatio: string;
  brandName?: string;
}

export interface VideoGenInput {
  prompt: string;
  aspectRatio: string;
  durationSec?: number;
}

export interface CopyGenInput {
  platform: string;
  language: string;
  topic: string;
  tone?: string | null;
}

export interface CopyGenOutput {
  title: string;
  caption: string;
  hashtags: string[];
  cta: string;
}
