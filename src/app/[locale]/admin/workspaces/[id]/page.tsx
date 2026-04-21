import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { Link } from "@/i18n/navigation";
import { SuspendWorkspaceButton } from "../suspend-button";
import { PlanSelectForm } from "./plan-select-form";

export default async function AdminWorkspaceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.platform.workspaceDetail");
  const admin = createAdminClient();
  if (!admin) return <p className="text-sm text-amber-200/90">{t("noServiceRole")}</p>;

  const { data: ws } = await admin
    .from("workspaces")
    .select("id, name, suspended, plan_id")
    .eq("id", id)
    .single();

  if (!ws) notFound();

  const { data: planJoin } = ws.plan_id
    ? await admin.from("plans").select("id, name, limits").eq("id", ws.plan_id).maybeSingle()
    : { data: null };

  const wsRow = {
    ...ws,
    plans: planJoin as { id: string; name: string; limits: unknown } | null,
  };

  const { data: clients } = await admin.from("clients").select("id").eq("workspace_id", id);
  const clientIds = clients?.map((c) => c.id) ?? [];

  const { data: brands } =
    clientIds.length > 0
      ? await admin.from("brands").select("id").in("client_id", clientIds)
      : { data: [] as { id: string }[] };

  const brandIds = brands?.map((b) => b.id) ?? [];
  const brandCount = brandIds.length;

  const { data: members } = await admin
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", id);

  const { data: jobRows } =
    brandIds.length > 0
      ? await admin
          .from("content_jobs")
          .select("id, status, progress, error_message, created_at")
          .in("brand_id", brandIds)
          .order("created_at", { ascending: false })
          .limit(8)
      : { data: [] };

  const { data: auditRows } = await admin
    .from("audit_logs")
    .select("id, action, created_at, actor_user_id")
    .eq("workspace_id", id)
    .order("created_at", { ascending: false })
    .limit(12);

  const { data: plans } = await admin.from("plans").select("id, name").order("name");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/workspaces" className="text-sm text-muted-foreground hover:underline">
            ← {t("back")}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{wsRow.name}</h1>
          {wsRow.suspended ? <Badge className="mt-2">{t("suspended")}</Badge> : null}
        </div>
        <SuspendWorkspaceButton
          workspaceId={wsRow.id}
          suspended={!!wsRow.suspended}
          labelSuspend={t("suspend")}
          labelUnsuspend={t("unsuspend")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">{t("stats")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {t("members")}: {members?.length ?? 0}
            </p>
            <p>
              {t("brands")}: {brandCount}
            </p>
            <p>
              {t("plan")}: {wsRow.plans?.name ?? "—"}
            </p>
          </CardContent>
        </Card>

        <PlanSelectForm
          workspaceId={wsRow.id}
          currentPlanId={wsRow.plan_id}
          plans={(plans ?? []) as { id: string; name: string }[]}
          label={t("changePlan")}
          save={t("savePlan")}
        />
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{t("recentJobs")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {(jobRows ?? []).map((j) => (
              <li key={j.id} className="flex justify-between gap-2 border-b border-border/40 pb-2">
                <span className="font-mono text-xs">{j.id.slice(0, 8)}…</span>
                <span>{j.status}</span>
              </li>
            ))}
            {!jobRows?.length ? <li className="text-muted-foreground">{t("noJobs")}</li> : null}
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{t("audit")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {(auditRows ?? []).map((a) => (
              <li key={a.id} className="flex justify-between gap-2">
                <span>{a.action}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.created_at as string).toLocaleString(locale)}
                </span>
              </li>
            ))}
            {!auditRows?.length ? <li className="text-muted-foreground">{t("noAudit")}</li> : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
