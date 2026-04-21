import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { Link } from "@/i18n/navigation";
import { SuspendWorkspaceButton } from "./suspend-button";

type Row = {
  id: string;
  name: string;
  suspended: boolean | null;
  plan_id: string | null;
  plans: { name: string } | null;
};

export default async function AdminWorkspacesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.platform.workspaces");
  const admin = createAdminClient();

  if (!admin) {
    return <p className="text-sm text-amber-200/90">{t("noServiceRole")}</p>;
  }

  const { data: rows } = await admin
    .from("workspaces")
    .select("id, name, suspended, plan_id, plans(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const list = (rows ?? []) as unknown as Row[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <DataTable
        rows={list}
        columns={[
          {
            key: "name",
            header: t("name"),
            cell: (r) => (
              <Link href={`/admin/workspaces/${r.id}`} className="text-primary underline-offset-4 hover:underline">
                {r.name}
              </Link>
            ),
          },
          {
            key: "plan",
            header: t("plan"),
            cell: (r) => r.plans?.name ?? "—",
          },
          {
            key: "status",
            header: t("status"),
            cell: (r) =>
              r.suspended ? (
                <Badge variant="destructive">{t("suspended")}</Badge>
              ) : (
                <Badge variant="secondary">{t("active")}</Badge>
              ),
          },
          {
            key: "actions",
            header: t("actions"),
            cell: (r) => (
              <SuspendWorkspaceButton
                workspaceId={r.id}
                suspended={!!r.suspended}
                labelSuspend={t("suspend")}
                labelUnsuspend={t("unsuspend")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
