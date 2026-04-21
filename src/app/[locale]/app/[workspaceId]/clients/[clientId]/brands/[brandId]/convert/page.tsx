import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { BulkConverter } from "./bulk-converter";

export default async function ConvertPage({
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
  const t = await getTranslations("app");
  const supabase = await createClient();
  const { data: assets } = await supabase
    .from("brand_assets")
    .select("id, name, public_url, type")
    .eq("brand_id", p.brandId)
    .in("type", ["image", "logo", "video"]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("convert")}</h2>
      <BulkConverter assets={assets ?? []} brandId={p.brandId} />
    </div>
  );
}
