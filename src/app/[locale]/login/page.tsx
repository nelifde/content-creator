import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { AmbientBlobs } from "@/components/layout/ambient-blobs";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";

export default async function LoginPage({
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
  const nav = await getTranslations("nav");

  return (
    <div className="relative min-h-screen">
      <AmbientBlobs />
      <header className="flex items-center justify-between p-4">
        <Link href="/" className="text-sm font-medium">
          Content Creator
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/signup" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            {nav("signup")}
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
        <h1 className="text-center text-3xl font-semibold tracking-tight">{t("loginTitle")}</h1>
        <LoginForm />
      </main>
    </div>
  );
}
