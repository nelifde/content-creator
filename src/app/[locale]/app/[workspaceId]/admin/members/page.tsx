import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/server";
import { InviteMemberForm } from "./invite-member-form";
import { MemberRoleSelect } from "./member-role-select";
import { RemoveMemberButton } from "./remove-member-button";

export default async function WorkspaceAdminMembersPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.workspace.members");
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", workspaceId);

  const rows =
    members?.map((m) => ({
      id: m.user_id,
      user_id: m.user_id,
      role: m.role as string,
    })) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <InviteMemberForm workspaceId={workspaceId} />
      <DataTable
        rows={rows}
        columns={[
          {
            key: "user",
            header: t("user"),
            cell: (r) => <span className="font-mono text-xs">{(r as { user_id: string }).user_id}</span>,
          },
          {
            key: "role",
            header: t("role"),
            cell: (r) => (
              <MemberRoleSelect
                workspaceId={workspaceId}
                userId={(r as { user_id: string }).user_id}
                role={(r as { role: string }).role}
              />
            ),
          },
          {
            key: "actions",
            header: t("actions"),
            cell: (r) => (
              <RemoveMemberButton workspaceId={workspaceId} userId={(r as { user_id: string }).user_id} />
            ),
          },
        ]}
      />
    </div>
  );
}
