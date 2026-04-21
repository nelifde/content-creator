import type { SupabaseClient } from "@supabase/supabase-js";
import { generateCopyMock, generateImageMock, generateVideoMock } from "@/lib/ai";
import type { ImageProviderId, VideoProviderId } from "@/lib/ai/types";
import { assertQuota, recordUsage } from "@/lib/quota/check";
import { getWorkspaceIdForBrand } from "@/lib/workspace/resolve";

export type JobPayload = {
  platforms: string[];
  aspects: string[];
  contentTypes: string[];
  language: string;
  imageProvider: ImageProviderId;
  videoProvider: VideoProviderId;
  basePrompt?: string;
  variantCount?: number;
  csvRows?: { title: string; body: string }[];
  brief?: string;
  templateId?: string;
  assetIds?: string[];
  campaignName?: string;
  /** Used when aspects includes "custom" — stored as WxH on contents.aspect_ratio */
  customWidth?: number;
  customHeight?: number;
};

function resolveAspect(aspect: string, payload: JobPayload): string {
  if (aspect !== "custom") return aspect;
  const w = Math.min(4096, Math.max(64, payload.customWidth ?? 1080));
  const h = Math.min(4096, Math.max(64, payload.customHeight ?? 1080));
  return `${w}x${h}`;
}

function expandTargets(payload: JobPayload, inputType: string) {
  const { platforms, aspects, contentTypes } = payload;
  const targets: {
    platform: string;
    aspect: string;
    contentType: string;
    topic: string;
  }[] = [];

  const topics: string[] = [];
  if (inputType === "prompt_variants") {
    const n = Math.min(20, Math.max(1, payload.variantCount ?? 3));
    for (let i = 0; i < n; i++) {
      topics.push(`${payload.basePrompt ?? "Campaign"} — varyant ${i + 1}`);
    }
  } else if (inputType === "csv" && payload.csvRows?.length) {
    payload.csvRows.forEach((r) => topics.push(r.title || r.body));
  } else if (inputType === "brief") {
    topics.push(payload.brief ?? "Kampanya");
  } else if (inputType === "template_assets") {
    (payload.assetIds?.length ? payload.assetIds : ["asset"]).forEach((_, i) =>
      topics.push(`Şablon × varlık ${i + 1}`),
    );
  } else {
    topics.push(payload.basePrompt ?? "Çoğaltılmış içerik");
  }

  for (const topic of topics) {
    for (const platform of platforms) {
      for (const aspect of aspects) {
        const ar = resolveAspect(aspect, payload);
        for (const contentType of contentTypes) {
          targets.push({ platform, aspect: ar, contentType, topic });
        }
      }
    }
  }
  return targets.slice(0, 80);
}

/** Estimated output rows for quota checks before enqueue. */
export function countJobTargets(inputType: string, rawPayload: unknown): number {
  const payload = rawPayload as JobPayload;
  return expandTargets(payload, inputType).length;
}

export async function processContentJob(
  supabase: SupabaseClient,
  jobId: string,
  inputType: string,
  rawPayload: unknown,
) {
  const { data: jobRow } = await supabase
    .from("content_jobs")
    .select("brand_id, campaign_id, input_type, payload")
    .eq("id", jobId)
    .single();

  if (!jobRow?.brand_id) {
    await supabase
      .from("content_jobs")
      .update({ status: "failed", error_message: "Missing brand" })
      .eq("id", jobId);
    return;
  }

  const payload = (jobRow.payload ?? rawPayload) as JobPayload;
  const resolvedInputType = jobRow.input_type ?? inputType;
  const targets = expandTargets(payload, resolvedInputType);
  const total = Math.max(1, targets.length);

  const workspaceId = await getWorkspaceIdForBrand(supabase, jobRow.brand_id);
  if (workspaceId && targets.length > 0) {
    try {
      await assertQuota(supabase, workspaceId, "ai_call", targets.length);
      await assertQuota(supabase, workspaceId, "content_created", targets.length);
    } catch {
      await supabase
        .from("content_jobs")
        .update({ status: "failed", error_message: "Quota exceeded" })
        .eq("id", jobId);
      return;
    }
  }

  await supabase
    .from("content_jobs")
    .update({ status: "running", progress: 5 })
    .eq("id", jobId);

  let campaignId = jobRow.campaign_id as string | null;
  if (!campaignId) {
    const { data: campaign } = await supabase
      .from("campaigns")
      .insert({
        brand_id: jobRow.brand_id,
        name: payload.campaignName ?? "Bulk kampanya",
      })
      .select("id")
      .single();
    campaignId = campaign?.id ?? null;
    if (campaignId) {
      await supabase
        .from("content_jobs")
        .update({ campaign_id: campaignId })
        .eq("id", jobId);
    }
  }

  if (!campaignId) {
    await supabase
      .from("content_jobs")
      .update({ status: "failed", error_message: "No campaign" })
      .eq("id", jobId);
    return;
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("name, tone")
    .eq("id", jobRow.brand_id)
    .single();

  let done = 0;
  for (const t of targets) {
    const copy = await generateCopyMock({
      platform: t.platform,
      language: payload.language,
      topic: t.topic,
      tone: brand?.tone,
    });

    let layers: unknown[] = [];
    let aiProvider: string = payload.imageProvider;

    if (t.contentType === "short_video" || t.contentType === "animated_post") {
      const vid = await generateVideoMock(payload.videoProvider, {
        prompt: t.topic,
        aspectRatio: t.aspect,
      });
      aiProvider = payload.videoProvider;
      layers = [{ type: "video", url: vid.url }];
    } else if (t.contentType !== "copy_only") {
      const img = await generateImageMock(payload.imageProvider, {
        prompt: t.topic,
        aspectRatio: t.aspect,
        brandName: brand?.name,
      });
      layers = [{ type: "image", url: img.url }];
    }

    await supabase.from("contents").insert({
      campaign_id: campaignId,
      brand_id: jobRow.brand_id,
      job_id: jobId,
      platform: t.platform,
      aspect_ratio: t.aspect,
      content_type: t.contentType,
      status: "draft",
      caption: copy.caption,
      title: copy.title,
      hashtags: copy.hashtags,
      cta: copy.cta,
      layers,
      ai_provider: aiProvider,
      language: payload.language,
    });

    done += 1;
    const progress = Math.min(99, Math.round((done / total) * 100));
    await supabase.from("content_jobs").update({ progress }).eq("id", jobId);
  }

  await supabase
    .from("content_jobs")
    .update({ status: "completed", progress: 100 })
    .eq("id", jobId);

  if (workspaceId && done > 0) {
    await recordUsage(supabase, workspaceId, "ai_call", done, { job_id: jobId });
    await recordUsage(supabase, workspaceId, "content_created", done, { job_id: jobId });
  }
}
