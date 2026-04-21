import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReenqueueJobButton } from "./reenqueue-button";

export default async function AdminJobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.platform.jobs");
  const admin = createAdminClient();

  if (!admin) {
    return <p className="text-sm text-amber-200/90">{t("noServiceRole")}</p>;
  }

  const { data: jobs } = await admin
    .from("content_jobs")
    .select("id, status, progress, error_message, input_type, created_at, brand_id")
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <DataTable
        rows={jobs ?? []}
        columns={[
          {
            key: "id",
            header: t("id"),
            cell: (r) => <span className="font-mono text-xs">{(r as { id: string }).id.slice(0, 10)}…</span>,
          },
          {
            key: "status",
            header: t("status"),
            cell: (r) => {
              const s = (r as { status: string }).status;
              return (
                <Badge variant={s === "failed" ? "destructive" : s === "completed" ? "secondary" : "default"}>
                  {s}
                </Badge>
              );
            },
          },
          {
            key: "progress",
            header: t("progress"),
            cell: (r) => `${(r as { progress: number }).progress}%`,
          },
          {
            key: "error",
            header: t("error"),
            cell: (r) => (
              <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                {(r as { error_message: string | null }).error_message ?? "—"}
              </span>
            ),
          },
          {
            key: "actions",
            header: t("actions"),
            cell: (r) => (
              <ReenqueueJobButton jobId={(r as { id: string }).id} label={t("reenqueue")} />
            ),
          },
        ]}
      />
    </div>
  );
}
