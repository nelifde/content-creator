import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { BulkCreatorWizard } from "@/components/brand/bulk-creator-wizard";

export default async function BulkCreatePage({
  params,
}: {
  params: Promise<{
    locale: string;
    workspaceId: string;
    clientId: string;
    brandId: string;
  }>;
}) {
  const p = await params;
  setRequestLocale(p.locale);
  const t = await getTranslations("bulkCreator");
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <BulkCreatorWizard brandId={p.brandId} />
    </div>
  );
}
