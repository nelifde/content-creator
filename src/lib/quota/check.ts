import type { SupabaseClient } from "@supabase/supabase-js";

export type QuotaKind = "ai_call" | "storage_bytes" | "content_created";

export class QuotaExceededError extends Error {
  constructor(
    message: string,
    public kind: QuotaKind,
  ) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

async function getEffectiveLimits(
  supabase: SupabaseClient,
  workspaceId: string,
): Promise<{ ai: number; storage: number; contents: number }> {
  const { data: ws } = await supabase
    .from("workspaces")
    .select("plan_id")
    .eq("id", workspaceId)
    .single();

  let planLimits = {
    ai_calls_per_period: 500,
    storage_bytes: 536870912,
    contents_per_period: 2000,
  };

  if (ws?.plan_id) {
    const { data: plan } = await supabase.from("plans").select("limits").eq("id", ws.plan_id).maybeSingle();
    const L = plan?.limits as Record<string, number> | null;
    if (L) {
      planLimits = {
        ai_calls_per_period: Number(L.ai_calls_per_period ?? planLimits.ai_calls_per_period),
        storage_bytes: Number(L.storage_bytes ?? planLimits.storage_bytes),
        contents_per_period: Number(L.contents_per_period ?? planLimits.contents_per_period),
      };
    }
  }

  const { data: q } = await supabase
    .from("workspace_quotas")
    .select("ai_calls_limit, storage_bytes_limit, contents_limit")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  return {
    ai: q?.ai_calls_limit ?? planLimits.ai_calls_per_period,
    storage: Number(q?.storage_bytes_limit ?? planLimits.storage_bytes),
    contents: q?.contents_limit ?? planLimits.contents_per_period,
  };
}

async function sumUsage30d(
  supabase: SupabaseClient,
  workspaceId: string,
  kind: QuotaKind,
): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data, error } = await supabase
    .from("workspace_usage_events")
    .select("amount")
    .eq("workspace_id", workspaceId)
    .eq("kind", kind)
    .gte("created_at", since.toISOString());
  if (error || !data?.length) return 0;
  return data.reduce((acc, row) => acc + (row.amount ?? 0), 0);
}

export async function assertQuota(
  supabase: SupabaseClient,
  workspaceId: string,
  kind: QuotaKind,
  delta: number = 1,
) {
  const limits = await getEffectiveLimits(supabase, workspaceId);
  const used = await sumUsage30d(supabase, workspaceId, kind);
  const limit =
    kind === "ai_call"
      ? limits.ai
      : kind === "storage_bytes"
        ? limits.storage
        : limits.contents;

  if (used + delta > limit) {
    throw new QuotaExceededError(
      kind === "ai_call"
        ? "AI kullanım kotası aşıldı."
        : kind === "storage_bytes"
          ? "Depolama kotası aşıldı."
          : "İçerik üretim kotası aşıldı.",
      kind,
    );
  }
}

export async function recordUsage(
  supabase: SupabaseClient,
  workspaceId: string,
  kind: QuotaKind,
  amount: number,
  meta?: Record<string, unknown>,
) {
  await supabase.from("workspace_usage_events").insert({
    workspace_id: workspaceId,
    kind,
    amount,
    meta: meta ?? {},
  });
}
