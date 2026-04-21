import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { DigitalFlagshipShell } from "@/components/layout/digital-flagship-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect({ href: "/app", locale: locale as "tr" | "en" });
  }
  const t = await getTranslations("auth");

  return (
    <DigitalFlagshipShell>
      <SiteHeader variant="auth-signup" />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-16">
        <h1 className="text-center font-[family-name:var(--font-heading-display)] text-3xl font-semibold tracking-tight text-white">
          {t("signupTitle")}
        </h1>
        <SignupForm />
      </main>
    </DigitalFlagshipShell>
  );
}
