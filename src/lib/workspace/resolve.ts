import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBrandIdsForWorkspace(
  supabase: SupabaseClient,
  workspaceId: string,
): Promise<string[]> {
  const { data: clients } = await supabase.from("clients").select("id").eq("workspace_id", workspaceId);
  const clientIds = clients?.map((c) => c.id) ?? [];
  if (!clientIds.length) return [];
  const { data: brands } = await supabase.from("brands").select("id").in("client_id", clientIds);
  return brands?.map((b) => b.id) ?? [];
}

export async function getWorkspaceIdForBrand(
  supabase: SupabaseClient,
  brandId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("brands")
    .select("client_id")
    .eq("id", brandId)
    .maybeSingle();
  if (!data?.client_id) return null;
  const { data: client } = await supabase
    .from("clients")
    .select("workspace_id")
    .eq("id", data.client_id)
    .maybeSingle();
  return client?.workspace_id ?? null;
}
