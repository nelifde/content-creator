import { setRequestLocale } from "next-intl/server";
import { DigitalFlagshipShell } from "@/components/layout/digital-flagship-shell";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { requireAuth } from "@/lib/auth/guards";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuth(locale);

  return (
    <DigitalFlagshipShell>
      <SiteHeader variant="app" />
      <PageShell>
        <div className="mx-auto max-w-7xl flex-1 px-4 py-8 text-[#f5f5f5]">{children}</div>
      </PageShell>
    </DigitalFlagshipShell>
  );
}
