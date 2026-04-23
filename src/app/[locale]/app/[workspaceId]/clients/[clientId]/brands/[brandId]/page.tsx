import { redirect } from "@/i18n/navigation";

export default async function BrandRootPage({
  params,
}: {
  params: Promise<{
    locale: string;
    workspaceId: string;
    clientId: string;
    brandId: string;
  }>;
}) {
  const { locale, workspaceId, clientId, brandId } = await params;
  redirect({
    href: `/app/${workspaceId}/clients/${clientId}/brands/${brandId}/assets`,
    locale: locale as "tr" | "en",
  });
}
