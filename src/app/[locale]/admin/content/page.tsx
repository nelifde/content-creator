import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeleteContentButton } from "./delete-content-button";

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.platform.content");
  const admin = createAdminClient();

  if (!admin) {
    return <p className="text-sm text-amber-200/90">{t("noServiceRole")}</p>;
  }

  const { data: rows } = await admin
    .from("contents")
    .select("id, status, platform, title, created_at, brand_id")
    .order("created_at", { ascending: false })
    .limit(150);

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
            cell: (r) => (
              <Badge variant="secondary">{(r as { status: string }).status}</Badge>
            ),
          },
          {
            key: "actions",
            header: t("actions"),
            cell: (r) => (
              <DeleteContentButton contentId={(r as { id: string }).id} label={t("delete")} />
            ),
          },
        ]}
      />
    </div>
  );
}
