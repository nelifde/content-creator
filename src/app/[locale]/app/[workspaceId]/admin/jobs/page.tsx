import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getBrandIdsForWorkspace } from "@/lib/workspace/resolve";

export default async function WorkspaceAdminJobsPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.workspace.jobs");
  const supabase = await createClient();

  const brandIds = await getBrandIdsForWorkspace(supabase, workspaceId);
  const { data: jobs } =
    brandIds.length > 0
      ? await supabase
          .from("content_jobs")
          .select("id, status, progress, error_message, created_at, input_type")
          .in("brand_id", brandIds)
          .order("created_at", { ascending: false })
          .limit(100)
      : { data: [] };

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
            cell: (r) => <Badge variant="secondary">{(r as { status: string }).status}</Badge>,
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
              <span className="max-w-[180px] truncate text-xs">
                {(r as { error_message: string | null }).error_message ?? "—"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
