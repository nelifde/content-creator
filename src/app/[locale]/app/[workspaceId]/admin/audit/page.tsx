import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceAdminAuditPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.workspace.audit");
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("audit_logs")
    .select("id, action, created_at, actor_user_id")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <DataTable
        rows={rows ?? []}
        columns={[
          {
            key: "time",
            header: t("time"),
            cell: (r) => new Date((r as { created_at: string }).created_at).toLocaleString(locale),
          },
          {
            key: "action",
            header: t("action"),
            cell: (r) => (r as { action: string }).action,
          },
          {
            key: "actor",
            header: t("actor"),
            cell: (r) => (
              <span className="font-mono text-xs">
                {(r as { actor_user_id: string | null }).actor_user_id?.slice(0, 8) ?? "—"}…
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
