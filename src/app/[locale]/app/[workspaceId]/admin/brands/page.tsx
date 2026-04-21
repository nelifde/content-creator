import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { getBrandIdsForWorkspace } from "@/lib/workspace/resolve";

export default async function WorkspaceAdminBrandsPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.workspace.brands");
  const supabase = await createClient();

  const brandIds = await getBrandIdsForWorkspace(supabase, workspaceId);
  const { data: brands } =
    brandIds.length > 0
      ? await supabase
          .from("brands")
          .select("id, name, client_id, created_at")
          .in("id", brandIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("hint")}</p>
      <DataTable
        rows={brands ?? []}
        columns={[
          {
            key: "name",
            header: t("name"),
            cell: (r) => (
              <Link
                href={`/app/${workspaceId}`}
                className="text-primary hover:underline"
              >
                {(r as { name: string }).name}
              </Link>
            ),
          },
          {
            key: "id",
            header: t("id"),
            cell: (r) => <span className="font-mono text-xs">{(r as { id: string }).id}</span>,
          },
        ]}
      />
    </div>
  );
}
