"use server";

import { revalidatePath } from "next/cache";
import { autoTagAssetMock } from "@/lib/ai/autoTag";
import { countJobTargets } from "@/lib/jobs/process-content-job";
import { QuotaExceededError, assertQuota, recordUsage } from "@/lib/quota/check";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceIdForBrand } from "@/lib/workspace/resolve";

export async function ensureProfile(displayName?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      display_name: displayName ?? user.email?.split("@")[0] ?? "User",
    });
  }
  return { ok: true };
}

export async function createWorkspace(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };
  const { data: ws, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      plan_id: "00000000-0000-0000-0000-000000000001",
    })
    .select("id")
    .single();
  if (error || !ws) return { error: error?.message ?? "insert" };
  await supabase.from("workspace_members").insert({
    workspace_id: ws.id,
    user_id: user.id,
    role: "admin",
  });
  revalidatePath("/app");
  return { id: ws.id };
}

export async function createClientRecord(workspaceId: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ workspace_id: workspaceId, name })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "insert" };
  revalidatePath(`/app/${workspaceId}`);
  return { id: data.id };
}

export async function createBrand(clientId: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .insert({ client_id: clientId, name })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "insert" };
  revalidatePath(`/app`);
  return { id: data.id };
}

export async function updateBrandSettings(
  brandId: string,
  patch: {
    colors?: unknown;
    fonts?: unknown;
    tone?: string;
    keywords?: string[];
    guideline_pdf_url?: string | null;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase.from("brands").update(patch).eq("id", brandId);
  if (error) return { error: error.message };
  revalidatePath(`/app`);
  return { ok: true };
}

export async function createCampaign(brandId: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ brand_id: brandId, name })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "insert" };
  revalidatePath(`/app`);
  return { id: data.id };
}

export async function createContentJobRecord(input: {
  brandId: string;
  campaignId?: string | null;
  inputType: string;
  payload: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const wsId = await getWorkspaceIdForBrand(supabase, input.brandId);
  if (wsId) {
    const n = countJobTargets(input.inputType, input.payload);
    if (n > 0) {
      try {
        await assertQuota(supabase, wsId, "ai_call", n);
        await assertQuota(supabase, wsId, "content_created", n);
      } catch (e) {
        if (e instanceof QuotaExceededError) {
          return { error: e.message };
        }
        throw e;
      }
    }
  }
  const { data, error } = await supabase
    .from("content_jobs")
    .insert({
      brand_id: input.brandId,
      campaign_id: input.campaignId ?? null,
      input_type: input.inputType,
      payload: input.payload,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "insert" };
  revalidatePath(`/app`);
  return { id: data.id };
}

export async function updateContentStatus(
  contentId: string,
  status: "draft" | "review" | "approved" | "ready",
) {
  const supabase = await createClient();
  const { error } = await supabase.from("contents").update({ status }).eq("id", contentId);
  if (error) return { error: error.message };
  revalidatePath(`/app`);
  return { ok: true };
}

export async function addComment(contentId: string, body: string, parentId?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };
  const { error } = await supabase.from("comments").insert({
    content_id: contentId,
    user_id: user.id,
    body,
    parent_id: parentId ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/app`);
  return { ok: true };
}

export async function createPortalToken(brandId: string, label?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_portal_tokens")
    .insert({ brand_id: brandId, label })
    .select("token")
    .single();
  if (error || !data) return { error: error?.message ?? "insert" };
  return { token: data.token as string };
}

export async function uploadBrandAsset(formData: FormData) {
  const supabase = await createClient();
  const brandId = formData.get("brandId") as string;
  const folder = (formData.get("folder") as string) || "";
  const forceType = formData.get("forceType") as string | null;
  const file = formData.get("file") as File | null;
  if (!brandId || !file?.size) return { error: "invalid" };

  const path = `${brandId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const wsId = await getWorkspaceIdForBrand(supabase, brandId);
  if (wsId) {
    try {
      await assertQuota(supabase, wsId, "storage_bytes", buf.length);
    } catch (e) {
      if (e instanceof QuotaExceededError) {
        return { error: e.message };
      }
      throw e;
    }
  }
  const { error: upErr } = await supabase.storage
    .from("brand-assets")
    .upload(path, buf, { contentType: file.type || "application/octet-stream" });
  if (upErr) return { error: upErr.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("brand-assets").getPublicUrl(path);

  const tags = await autoTagAssetMock(file.name);
  const ext = file.name.split(".").pop()?.toLowerCase();
  let type: "logo" | "image" | "video" | "font" | "doc" = "image";
  if (forceType === "logo") type = "logo";
  else if (["mp4", "webm", "mov"].includes(ext ?? "")) type = "video";
  else if (["ttf", "otf", "woff", "woff2"].includes(ext ?? "")) type = "font";
  else if (ext === "pdf") type = "doc";

  const { data, error } = await supabase
    .from("brand_assets")
    .insert({
      brand_id: brandId,
      name: file.name,
      storage_path: path,
      public_url: publicUrl,
      type,
      folder,
      tags,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "db" };
  if (wsId) {
    await recordUsage(supabase, wsId, "storage_bytes", buf.length, { asset_id: data.id });
  }
  revalidatePath(`/app`);
  return { id: data.id, publicUrl };
}

export async function saveTemplate(input: {
  brandId: string | null;
  workspaceId: string | null;
  name: string;
  layers: unknown;
  isPreset?: boolean;
}) {
  const supabase = await createClient();
  const row: Record<string, unknown> = {
    name: input.name,
    layers: input.layers,
    is_preset: input.isPreset ?? false,
  };
  if (input.brandId) row.brand_id = input.brandId;
  if (input.workspaceId) row.workspace_id = input.workspaceId;
  const { data, error } = await supabase.from("templates").insert(row).select("id").single();
  if (error || !data) return { error: error?.message ?? "insert" };
  revalidatePath(`/app`);
  return { id: data.id };
}
