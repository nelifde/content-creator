import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminAuditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.platform.audit");
  const admin = createAdminClient();

  if (!admin) {
    return <p className="text-sm text-amber-200/90">{t("noServiceRole")}</p>;
  }

  const { data: rows } = await admin
    .from("audit_logs")
    .select("id, action, scope, workspace_id, target_table, created_at, actor_user_id")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <DataTable
        rows={rows ?? []}
        columns={[
          {
            key: "created",
            header: t("time"),
            cell: (r) => new Date((r as { created_at: string }).created_at).toLocaleString(locale),
          },
          {
            key: "action",
            header: t("action"),
            cell: (r) => (r as { action: string }).action,
          },
          {
            key: "scope",
            header: t("scope"),
            cell: (r) => (r as { scope: string }).scope,
          },
          {
            key: "workspace",
            header: t("workspace"),
            cell: (r) => {
              const w = (r as { workspace_id: string | null }).workspace_id;
              return w ? <span className="font-mono text-xs">{w.slice(0, 8)}…</span> : "—";
            },
          },
        ]}
      />
    </div>
  );
}
