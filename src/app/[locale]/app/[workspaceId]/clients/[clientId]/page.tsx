import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { BrandCreateForm } from "./brand-create-form";

export default async function ClientBrandsPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string; clientId: string }>;
}) {
  const { locale, workspaceId, clientId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, workspace_id")
    .eq("id", clientId)
    .single();

  if (!client || client.workspace_id !== workspaceId) notFound();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user!.id)
    .maybeSingle();
  if (!member) notFound();

  const { data: brands } = await supabase
    .from("brands")
    .select("id, name")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
        <p className="text-muted-foreground">{t("brands")}</p>
      </div>

      <BrandCreateForm clientId={clientId} workspaceId={workspaceId} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands?.map((b) => (
          <Link
            key={b.id}
            href={`/app/${workspaceId}/clients/${clientId}/brands/${b.id}/assets`}
          >
            <Card className="glass-card h-full transition-all hover:-translate-y-0.5 hover:border-primary/30">
              <CardHeader>
                <CardTitle>{b.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t("assets")}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
