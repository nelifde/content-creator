import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatCard } from "@/components/admin/stat-card";
import { QuotaBar } from "@/components/admin/quota-bar";
import { createClient } from "@/lib/supabase/server";
import { MiniChart } from "@/components/admin/mini-chart";
import { UsageAreaChart } from "@/components/admin/usage-area-chart";
import { Link } from "@/i18n/navigation";

export default async function WorkspaceAdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.workspace.dashboard");
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
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const dayKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const aiByDay: Record<string, number> = Object.fromEntries(dayKeys.map((k) => [k, 0]));
  for (const e of events ?? []) {
    if (e.kind !== "ai_call") continue;
    const key = new Date(e.created_at).toISOString().slice(0, 10);
    if (aiByDay[key] !== undefined) aiByDay[key] += e.amount ?? 0;
  }
  const sparkAi = dayKeys.map((k) => aiByDay[k] ?? 0);
  const chartData = dayKeys.map((k, i) => ({
    label: `${i + 1}`,
    value: aiByDay[k] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/app/${workspaceId}`} className="text-sm text-muted-foreground hover:underline">
          ← {t("backToWorkspace")}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title={t("aiUsage")} value={s?.ai_calls_30d ?? 0} />
        <StatCard title={t("storageUsage")} value={s?.storage_bytes_30d ?? 0} />
        <StatCard title={t("contentsUsage")} value={s?.contents_30d ?? 0} />
      </div>

      <div className="glass-card space-y-4 rounded-xl border border-border/50 p-4">
        <p className="text-sm font-medium">{t("quotas")}</p>
        <QuotaBar label={t("ai")} used={s?.ai_calls_30d ?? 0} limit={aiLimit} />
        <QuotaBar label={t("storage")} used={s?.storage_bytes_30d ?? 0} limit={storageLimit} />
        <QuotaBar label={t("contents")} used={s?.contents_30d ?? 0} limit={contentsLimit} />
      </div>

      <div className="glass-card rounded-xl border border-border/50 p-4">
        <p className="mb-3 text-sm font-medium text-muted-foreground">{t("usageTrend")}</p>
        <MiniChart values={sparkAi} />
        <UsageAreaChart data={chartData} dataKey="value" label="" className="mt-4" />
      </div>
    </div>
  );
}
