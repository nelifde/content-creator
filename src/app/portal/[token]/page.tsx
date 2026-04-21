import { NextIntlClientProvider } from "next-intl";
import { createAdminClient } from "@/lib/supabase/admin";
import trMessages from "@/messages/tr.json";
import { PortalClient } from "./portal-client";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  if (!admin) {
    return (
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <main className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-muted-foreground">
          Portal için sunucuda <code>SUPABASE_SERVICE_ROLE_KEY</code> tanımlayın.
        </main>
      </NextIntlClientProvider>
    );
  }

  const { data: tok } = await admin
    .from("client_portal_tokens")
    .select("id, brand_id, expires_at, brands(name)")
    .eq("token", token)
    .maybeSingle();

  if (!tok) {
    return (
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <main className="mx-auto max-w-lg px-4 py-20 text-center">Geçersiz bağlantı.</main>
      </NextIntlClientProvider>
    );
  }

  if (tok.expires_at && new Date(tok.expires_at) < new Date()) {
    return (
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <main className="mx-auto max-w-lg px-4 py-20 text-center">Bağlantının süresi doldu.</main>
      </NextIntlClientProvider>
    );
  }

  const brandRaw = tok.brands as unknown;
  const brand =
    brandRaw && !Array.isArray(brandRaw)
      ? (brandRaw as { name: string })
      : Array.isArray(brandRaw) && brandRaw[0]
        ? (brandRaw[0] as { name: string })
        : null;

  const { data: contents } = await admin
    .from("contents")
    .select("id, title, status, caption")
    .eq("brand_id", tok.brand_id)
    .in("status", ["review", "approved"])
    .order("created_at", { ascending: false });

  return (
    <NextIntlClientProvider locale="tr" messages={trMessages}>
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Onay portalı</p>
            <h1 className="text-2xl font-semibold">{brand?.name ?? "Marka"}</h1>
            <p className="text-sm text-muted-foreground">
              İncelemede ve onaylı içerikleriniz
            </p>
          </div>
          <PortalClient token={token} contents={contents ?? []} />
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
