import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { ClientCreateForm } from "./client-create-form";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!member) notFound();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const clientIds = clients?.map((c) => c.id) ?? [];
  let jobs: {
    id: string;
    status: string;
    progress: number;
    input_type: string;
    created_at: string;
    campaign_id: string | null;
    brand_id: string;
  }[] = [];
  let brandsForLinks: { id: string; name: string; client_id: string }[] = [];
  let campaignsList: {
    id: string;
    name: string;
    brand_id: string;
    created_at: string;
  }[] = [];

  if (clientIds.length) {
    const { data: brands } = await supabase
      .from("brands")
      .select("id, name, client_id")
      .in("client_id", clientIds);
    brandsForLinks = brands ?? [];
    const brandIds = brandsForLinks.map((b) => b.id);

    if (brandIds.length) {
      const { data: jobRows } = await supabase
        .from("content_jobs")
        .select("id, status, progress, input_type, created_at, campaign_id, brand_id")
        .in("brand_id", brandIds)
        .order("created_at", { ascending: false })
        .limit(8);
      jobs = jobRows ?? [];

      const { data: campRows } = await supabase
        .from("campaigns")
        .select("id, name, brand_id, created_at")
        .in("brand_id", brandIds)
        .order("created_at", { ascending: false })
        .limit(6);
      campaignsList = campRows ?? [];
    }
  }

  const brandById = new Map(brandsForLinks.map((b) => [b.id, b]));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{workspace?.name}</h1>
          <p className="text-muted-foreground">{t("clients")}</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {t("yourRole")}: {member.role}
        </Badge>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("recentJobs")}</h2>
        {!jobs.length ? (
          <p className="text-sm text-muted-foreground">{t("noJobs")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {jobs.map((j) => {
              const b = brandById.get(j.brand_id);
              const href =
                b && j.campaign_id
                  ? `/app/${workspaceId}/clients/${b.client_id}/brands/${j.brand_id}/campaigns/${j.campaign_id}`
                  : b
                    ? `/app/${workspaceId}/clients/${b.client_id}/brands/${j.brand_id}/campaigns`
                    : `/app/${workspaceId}`;
              return (
                <Card key={j.id} className="glass-card overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium capitalize">
                        {j.input_type.replace(/_/g, " ")}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {j.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {b?.name ?? j.brand_id}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={j.progress} className="h-1.5" />
                    <Link
                      href={href}
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      {t("viewCampaign")}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("recentCampaigns")}</h2>
        {!campaignsList.length ? (
          <p className="text-sm text-muted-foreground">{t("noCampaigns")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {campaignsList.map((c) => {
              const b = brandById.get(c.brand_id);
              if (!b) return null;
              return (
                <Link
                  key={c.id}
                  href={`/app/${workspaceId}/clients/${b.client_id}/brands/${c.brand_id}/campaigns/${c.id}`}
                >
                  <Card className="glass-card h-full transition-all hover:-translate-y-0.5 hover:border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      {b.name}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <ClientCreateForm workspaceId={workspaceId} />

      <div className="grid gap-4 sm:grid-cols-2">
        {!clients?.length ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : (
          clients.map((c) => (
            <Link key={c.id} href={`/app/${workspaceId}/clients/${c.id}`}>
              <Card className="glass-card h-full transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <CardHeader>
                  <CardTitle>{c.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t("brands")}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
