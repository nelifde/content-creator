import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { AmbientBlobs } from "@/components/layout/ambient-blobs";
import { PageShell } from "@/components/layout/page-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale: locale as "tr" | "en" });
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBlobs />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <Link
            href="/app"
            className="font-semibold tracking-tight text-foreground hover:text-primary"
          >
            Content Creator
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              {t("home")}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <PageShell>
        <div className="mx-auto max-w-7xl flex-1 px-4 py-8">{children}</div>
      </PageShell>
    </div>
  );
}
