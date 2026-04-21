import { NextIntlClientProvider } from "next-intl";
import { DigitalFlagshipShell } from "@/components/layout/digital-flagship-shell";
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
        <DigitalFlagshipShell>
          <main className="mx-auto max-w-lg flex-1 px-4 py-20 text-center text-sm text-white/55">
            Portal için sunucuda{" "}
            <code className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-white/90">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            tanımlayın.
          </main>
        </DigitalFlagshipShell>
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
        <DigitalFlagshipShell>
          <main className="mx-auto max-w-lg flex-1 px-4 py-20 text-center text-white/80">
            Geçersiz bağlantı.
          </main>
        </DigitalFlagshipShell>
      </NextIntlClientProvider>
    );
  }

  if (tok.expires_at && new Date(tok.expires_at) < new Date()) {
    return (
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <DigitalFlagshipShell>
          <main className="mx-auto max-w-lg flex-1 px-4 py-20 text-center text-white/80">
            Bağlantının süresi doldu.
          </main>
        </DigitalFlagshipShell>
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
      <DigitalFlagshipShell>
        <main className="mx-auto w-full max-w-2xl flex-1 space-y-8 px-4 py-12">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/45">
              Onay portalı
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-heading-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {brand?.name ?? "Marka"}
            </h1>
            <p className="mt-2 text-sm text-white/50">İncelemede ve onaylı içerikleriniz</p>
          </div>
          <PortalClient token={token} contents={contents ?? []} />
        </main>
      </DigitalFlagshipShell>
    </NextIntlClientProvider>
  );
}
