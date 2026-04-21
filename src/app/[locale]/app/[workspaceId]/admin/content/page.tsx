import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getBrandIdsForWorkspace } from "@/lib/workspace/resolve";

export default async function WorkspaceAdminContentPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.workspace.content");
  const supabase = await createClient();

  const brandIds = await getBrandIdsForWorkspace(supabase, workspaceId);
  const { data: rows } =
    brandIds.length > 0
      ? await supabase
          .from("contents")
          .select("id, status, platform, title, created_at")
          .in("brand_id", brandIds)
          .order("created_at", { ascending: false })
          .limit(150)
      : { data: [] };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <DataTable
        rows={rows ?? []}
        columns={[
          {
            key: "title",
            header: t("titleCol"),
            cell: (r) => (r as { title: string | null }).title ?? "—",
          },
          {
            key: "platform",
            header: t("platform"),
            cell: (r) => (r as { platform: string }).platform,
          },
          {
            key: "status",
            header: t("status"),
            cell: (r) => <Badge variant="outline">{(r as { status: string }).status}</Badge>,
          },
        ]}
      />
    </div>
  );
}
