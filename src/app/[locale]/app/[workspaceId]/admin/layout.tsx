import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireWorkspaceAdmin } from "@/lib/auth/guards";

export default async function WorkspaceAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  setRequestLocale(locale);
  await requireWorkspaceAdmin(workspaceId, locale);
  const t = await getTranslations("admin.workspace.nav");

  const base = `/app/${workspaceId}/admin`;
  const items = [
    { href: base, label: t("dashboard") },
    { href: `${base}/members`, label: t("members") },
    { href: `${base}/clients`, label: t("clients") },
    { href: `${base}/brands`, label: t("brands") },
    { href: `${base}/jobs`, label: t("jobs") },
    { href: `${base}/content`, label: t("content") },
    { href: `${base}/usage`, label: t("usage") },
    { href: `${base}/audit`, label: t("audit") },
  ];

  return (
    <div className="flex w-full flex-col gap-8 md:flex-row">
      <AdminSidebar items={items} />
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
    </div>
  );
}
