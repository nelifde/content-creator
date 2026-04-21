import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { InviteUserForm } from "./invite-user-form";
import { PlatformAdminForm } from "./platform-admin-form";
import { UserSuspendButton } from "./user-suspend-button";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.platform.users");
  const admin = createAdminClient();

  if (!admin) {
    return <p className="text-sm text-amber-200/90">{t("noServiceRole")}</p>;
  }

  const { data: listData } = await admin.auth.admin.listUsers({ perPage: 200 });
  const users = listData?.users ?? [];

  const { data: platformRows } = await admin.from("platform_admins").select("user_id");
  const platformSet = new Set((platformRows ?? []).map((r) => r.user_id));

  const userIds = users.map((u) => u.id);
  const { data: profileRows } =
    userIds.length > 0
      ? await admin.from("profiles").select("id, is_suspended").in("id", userIds)
      : { data: [] as { id: string; is_suspended: boolean | null }[] };
  const suspendedMap = new Map((profileRows ?? []).map((p) => [p.id, p.is_suspended]));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <InviteUserForm />
        <PlatformAdminForm />
      </div>

      <DataTable
        rows={users.map((u) => ({
          id: u.id,
          email: u.email ?? u.id,
          suspended: !!suspendedMap.get(u.id),
          platform: platformSet.has(u.id),
        }))}
        columns={[
          {
            key: "email",
            header: t("email"),
            cell: (r) => <span className="font-mono text-xs">{r.email}</span>,
          },
          {
            key: "platform",
            header: t("platformAdmin"),
            cell: (r) => (r.platform ? t("yes") : t("no")),
          },
          {
            key: "actions",
            header: t("actions"),
            cell: (r) => (
              <div className="flex flex-wrap gap-2">
                <UserSuspendButton userId={r.id} isSuspended={r.suspended} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
