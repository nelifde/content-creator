import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { BrandSubnav } from "./brand-subnav";

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
    workspaceId: string;
    clientId: string;
    brandId: string;
  }>;
}) {
  const { locale, workspaceId, clientId, brandId } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, client_id")
    .eq("id", brandId)
    .single();

  if (!brand || brand.client_id !== clientId) notFound();

  const { data: client } = await supabase
    .from("clients")
    .select("workspace_id")
    .eq("id", clientId)
    .single();
  if (!client || client.workspace_id !== workspaceId) notFound();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user!.id)
    .maybeSingle();
  if (!member) notFound();

  const basePath = `/app/${workspaceId}/clients/${clientId}/brands/${brandId}`;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Marka</p>
        <h1 className="text-2xl font-semibold tracking-tight">{brand.name}</h1>
      </div>
      <BrandSubnav basePath={basePath} />
      {children}
    </div>
  );
}
