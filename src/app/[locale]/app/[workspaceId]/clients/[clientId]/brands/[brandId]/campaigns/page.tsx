import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CampaignCreateForm } from "./campaign-create-form";

export default async function CampaignsPage({
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
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, created_at")
    .eq("brand_id", p.brandId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <CampaignCreateForm brandId={p.brandId} paths={p} />
      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns?.map((c) => (
          <Link
            key={c.id}
            href={`/app/${p.workspaceId}/clients/${p.clientId}/brands/${p.brandId}/campaigns/${c.id}`}
          >
            <Card className="glass-card h-full transition-all hover:-translate-y-0.5 hover:border-primary/30">
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("campaigns")}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
