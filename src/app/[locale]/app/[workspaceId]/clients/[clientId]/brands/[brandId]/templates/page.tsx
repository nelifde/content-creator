import { setRequestLocale } from "next-intl/server";
import { TemplateStudio } from "@/components/brand/template-studio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function BrandTemplatesPage({
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
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, is_preset, created_at")
    .eq("brand_id", p.brandId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold">Kayıtlı şablonlar</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {templates?.map((t) => (
            <Card key={t.id} className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {t.is_preset ? "Preset" : "Özel"}
              </CardContent>
            </Card>
          ))}
          {!templates?.length && (
            <p className="text-sm text-muted-foreground">Henüz şablon yok.</p>
          )}
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold">Şablon stüdyosu</h2>
        <TemplateStudio brandId={p.brandId} />
      </div>
    </div>
  );
}
