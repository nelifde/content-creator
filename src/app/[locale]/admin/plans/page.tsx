import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlanUpsertForm } from "./plan-upsert-form";

export default async function AdminPlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.platform.plans");
  const admin = createAdminClient();

  if (!admin) {
    return <p className="text-sm text-amber-200/90">{t("noServiceRole")}</p>;
  }

  const { data: plans } = await admin.from("plans").select("id, name, limits").order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <PlanUpsertForm />
      <div className="grid gap-4 md:grid-cols-2">
        {(plans ?? []).map((p) => (
          <Card key={p.id} className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto text-xs text-muted-foreground">
                {JSON.stringify(p.limits, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
