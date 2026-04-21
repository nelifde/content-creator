import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatCard } from "@/components/admin/stat-card";
import { MiniChart } from "@/components/admin/mini-chart";
import { UsageAreaChart } from "@/components/admin/usage-area-chart";
import { createAdminClient } from "@/lib/supabase/admin";

function last7DaysBuckets() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function PlatformAdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.platform.dashboard");
  const admin = createAdminClient();

  if (!admin) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-amber-200/90">{t("noServiceRole")}</p>
      </div>
    );
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [
    { count: workspaceCount },
    { count: profileCount },
    { count: jobsRunning },
    { count: jobsFailed },
    { count: jobsTotal },
    { data: recentContents },
  ] = await Promise.all([
    admin.from("workspaces").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("content_jobs").select("*", { count: "exact", head: true }).eq("status", "running"),
    admin.from("content_jobs").select("*", { count: "exact", head: true }).eq("status", "failed"),
    admin.from("content_jobs").select("*", { count: "exact", head: true }),
    admin.from("contents").select("created_at").gte("created_at", since.toISOString()),
  ]);

  const dayKeys = last7DaysBuckets();
  const countsByDay = Object.fromEntries(dayKeys.map((k) => [k, 0]));
  for (const row of recentContents ?? []) {
    const key = new Date(row.created_at as string).toISOString().slice(0, 10);
    if (countsByDay[key] !== undefined) countsByDay[key] += 1;
  }
  const spark = dayKeys.map((k) => countsByDay[k] ?? 0);
  const chartData = dayKeys.map((k, i) => ({
    label: `${i + 1}`,
    value: countsByDay[k] ?? 0,
  }));

  const failRate =
    jobsTotal && jobsTotal > 0 ? Math.round(((jobsFailed ?? 0) / jobsTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("workspaces")} value={workspaceCount ?? 0} />
        <StatCard title={t("users")} value={profileCount ?? 0} />
        <StatCard title={t("jobsRunning")} value={jobsRunning ?? 0} />
        <StatCard title={t("failRate")} value={`${failRate}%`} hint={t("failRateHint")} />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/40 p-4">
        <p className="mb-3 text-sm font-medium text-muted-foreground">{t("contentLast7d")}</p>
        <MiniChart values={spark} />
        <UsageAreaChart data={chartData} dataKey="value" label="" className="mt-4" />
      </div>
    </div>
  );
}
