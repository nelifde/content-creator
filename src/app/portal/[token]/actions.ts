"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function portalApprove(token: string, contentId: string) {
  const admin = createAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY eksik" };
  const { data: tok } = await admin
    .from("client_portal_tokens")
    .select("id, brand_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!tok) return { error: "Geçersiz token" };
  if (tok.expires_at && new Date(tok.expires_at) < new Date()) {
    return { error: "Token süresi doldu" };
  }
  const { data: c } = await admin.from("contents").select("brand_id").eq("id", contentId).single();
  if (!c || c.brand_id !== tok.brand_id) return { error: "İçerik bulunamadı" };
  await admin.from("contents").update({ status: "approved" }).eq("id", contentId);
  revalidatePath(`/portal/${token}`, "page");
  return { ok: true };
}

export async function portalComment(
  token: string,
  contentId: string,
  body: string,
) {
  const admin = createAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY eksik" };
  const { data: tok } = await admin
    .from("client_portal_tokens")
    .select("id, brand_id")
    .eq("token", token)
    .maybeSingle();
  if (!tok) return { error: "Geçersiz token" };
  const { data: c } = await admin.from("contents").select("brand_id").eq("id", contentId).single();
  if (!c || c.brand_id !== tok.brand_id) return { error: "İçerik bulunamadı" };
  await admin.from("comments").insert({
    content_id: contentId,
    portal_token_id: tok.id,
    body,
  });
  revalidatePath(`/portal/${token}`, "page");
  return { ok: true };
}
