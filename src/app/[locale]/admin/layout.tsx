import { getTranslations, setRequestLocale } from "next-intl/server";
import { DigitalFlagshipShell } from "@/components/layout/digital-flagship-shell";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requirePlatformAdmin } from "@/lib/auth/guards";

export default async function PlatformAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePlatformAdmin(locale);
  const t = await getTranslations("admin.platform.nav");

  const items = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/workspaces", label: t("workspaces") },
    { href: "/admin/users", label: t("users") },
    { href: "/admin/jobs", label: t("jobs") },
    { href: "/admin/content", label: t("content") },
    { href: "/admin/plans", label: t("plans") },
    { href: "/admin/audit", label: t("audit") },
  ];

  return (
    <DigitalFlagshipShell>
      <SiteHeader variant="app" />
      <PageShell>
        <div className="mx-auto flex max-w-7xl flex-1 gap-8 px-4 py-8 text-[#f5f5f5]">
          <AdminSidebar items={items} />
          <div className="min-w-0 flex-1 space-y-6">{children}</div>
        </div>
      </PageShell>
    </DigitalFlagshipShell>
  );
}
