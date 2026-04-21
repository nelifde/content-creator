import { getTranslations, setRequestLocale } from "next-intl/server";
import { MiniChart } from "@/components/admin/mini-chart";
import { QuotaBar } from "@/components/admin/quota-bar";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceAdminUsagePage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.workspace.usage");
  const supabase = await createClient();

  const { data: summary } = await supabase
    .from("v_workspace_usage_summary")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const { data: quotas } = await supabase
    .from("workspace_quotas")
    .select("ai_calls_limit, storage_bytes_limit, contents_limit")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const { data: ws } = await supabase.from("workspaces").select("plan_id").eq("id", workspaceId).single();
  const { data: planRow } = ws?.plan_id
    ? await supabase.from("plans").select("limits").eq("id", ws.plan_id).maybeSingle()
    : { data: null as { limits: Record<string, number> } | null };

  const planLimits = planRow?.limits as Record<string, number> | undefined;
  const aiLimit = quotas?.ai_calls_limit ?? planLimits?.ai_calls_per_period ?? 500;
  const storageLimit = Number(quotas?.storage_bytes_limit ?? planLimits?.storage_bytes ?? 536870912);
  const contentsLimit = quotas?.contents_limit ?? planLimits?.contents_per_period ?? 2000;

  const s = summary as
    | {
        ai_calls_30d?: number;
        storage_bytes_30d?: number;
        contents_30d?: number;
      }
    | null;

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data: events } = await supabase
    .from("workspace_usage_events")
    .select("created_at, kind, amount")
    .eq("workspace_id", workspaceId)
    .gte("created_at", since.toISOString());

  const dayKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const storageByDay: Record<string, number> = Object.fromEntries(dayKeys.map((k) => [k, 0]));
  for (const e of events ?? []) {
    if (e.kind !== "storage_bytes") continue;
    const key = new Date(e.created_at).toISOString().slice(0, 10);
    if (storageByDay[key] !== undefined) storageByDay[key] += e.amount ?? 0;
  }
  const sparkStorage = dayKeys.map((k) => storageByDay[k] ?? 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <div className="glass-card space-y-4 rounded-xl border border-border/50 p-4">
        <QuotaBar label={t("ai")} used={s?.ai_calls_30d ?? 0} limit={aiLimit} />
        <QuotaBar label={t("storage")} used={s?.storage_bytes_30d ?? 0} limit={storageLimit} />
        <QuotaBar label={t("contents")} used={s?.contents_30d ?? 0} limit={contentsLimit} />
      </div>
      <div className="glass-card rounded-xl border border-border/50 p-4">
        <p className="mb-3 text-sm font-medium text-muted-foreground">{t("storageTrend")}</p>
        <MiniChart values={sparkStorage} />
      </div>
    </div>
  );
}
