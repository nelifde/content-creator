import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { LogoDropzone } from "@/components/brand/logo-dropzone";
import { BrandSettingsForm } from "./brand-settings-form";
import { PortalTokenSection } from "./portal-token-section";

export default async function BrandSettingsPage({
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
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", p.brandId)
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">{t("settings")}</h2>
      {brand && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Logo & marka görselleri</h3>
            <LogoDropzone brandId={p.brandId} />
          </div>
          <BrandSettingsForm brand={brand} />
          <PortalTokenSection brandId={p.brandId} />
        </>
      )}
    </div>
  );
}
