import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/guards";

export default async function WorkspaceIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const auth = await requireAuth(locale);
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!member) notFound();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("suspended")
    .eq("id", workspaceId)
    .single();

  if (workspace?.suspended) {
    const t = await getTranslations("admin.workspace");
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6 text-center text-amber-100">
        <p className="font-medium">{t("suspended")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
