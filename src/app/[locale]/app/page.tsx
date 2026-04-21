import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceCreateForm } from "./workspace-create-form";

export default async function WorkspacesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user!.id);

  const ids = memberships?.map((m) => m.workspace_id) ?? [];
  const { data: workspaces } = ids.length
    ? await supabase.from("workspaces").select("id, name").in("id", ids)
    : { data: [] as { id: string; name: string }[] };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("workspaces")}</h1>
        <p className="text-muted-foreground">{t("selectWorkspace")}</p>
      </div>

      <WorkspaceCreateForm />

      {!workspaces?.length ? (
        <p className="text-sm text-muted-foreground">{t("noWorkspaces")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((w) => (
            <Link key={w.id} href={`/app/${w.id}`}>
              <Card className="glass-card h-full transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">{w.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {memberships?.find((m) => m.workspace_id === w.id)?.role}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
