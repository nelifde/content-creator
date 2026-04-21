import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ClientCreateForm } from "../../client-create-form";

export default async function WorkspaceAdminClientsPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.workspace.clients");
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <ClientCreateForm workspaceId={workspaceId} />
      <DataTable
        rows={clients ?? []}
        columns={[
          {
            key: "name",
            header: t("name"),
            cell: (r) => (
              <Link
                href={`/app/${workspaceId}/clients/${(r as { id: string }).id}`}
                className="text-primary hover:underline"
              >
                {(r as { name: string }).name}
              </Link>
            ),
          },
          {
            key: "created",
            header: t("created"),
            cell: (r) => new Date((r as { created_at: string }).created_at).toLocaleDateString(locale),
          },
        ]}
      />
    </div>
  );
}
