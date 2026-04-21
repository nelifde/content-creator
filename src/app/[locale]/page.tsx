import { getTranslations, setRequestLocale } from "next-intl/server";
import { AmbientBlobs } from "@/components/layout/ambient-blobs";
import { Reveal } from "@/components/layout/reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBlobs />
      <header className="sticky top-0 z-20 border-b border-white/5 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-[family-name:var(--font-heading-display)] text-lg font-semibold tracking-tight">
            Content Creator
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              {t("nav.features")}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "gradient", size: "sm" }))}
            >
              {t("nav.signup")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur dark:bg-white/5">
              <Sparkles className="size-3.5 text-[var(--gradient-to)]" />
              {t("landing.heroBadge")}
            </div>
          </Reveal>
          <Reveal delay={0.08} className="mt-6 max-w-3xl">
            <h1 className="font-[family-name:var(--font-heading-display)] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              {t("landing.heroTitle")}{" "}
              <span className="bg-[linear-gradient(135deg,var(--gradient-from),var(--gradient-to))] bg-clip-text text-transparent">
                {t("landing.heroTitleAccent")}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              {t("landing.heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "gradient", size: "lg" }),
                  "inline-flex gap-2",
                )}
              >
                {t("landing.ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#features"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                {t("landing.ctaSecondary")}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              { label: t("landing.statsUsers"), value: "10k+" },
              { label: t("landing.statsPosts"), value: "2M+" },
              { label: t("landing.statsPlatforms"), value: "6" },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="font-[family-name:var(--font-heading-display)] text-3xl font-semibold">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </section>

        <section id="features" className="border-t border-white/5 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-heading-display)] text-3xl font-semibold sm:text-4xl">
                {t("features.title")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("features.subtitle")}</p>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {[
                { icon: Zap, title: t("features.bulk.title"), desc: t("features.bulk.desc") },
                { icon: Palette, title: t("features.brand.title"), desc: t("features.brand.desc") },
                { icon: ShieldCheck, title: t("features.approval.title"), desc: t("features.approval.desc") },
                { icon: Layers, title: t("features.convert.title"), desc: t("features.convert.desc") },
              ].map((f, i) => (
                <Reveal key={f.title} delay={0.05 * i}>
                  <div className="glass-card group h-full rounded-2xl p-8 transition-all duration-300 hover:border-[var(--gradient-to)]/30 hover:shadow-[0_0_40px_-12px_var(--gradient-glow)]">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--gradient-from),var(--gradient-to))] text-white shadow-lg">
                      <f.icon className="size-5" />
                    </div>
                    <h3 className="mt-5 font-[family-name:var(--font-heading-display)] text-xl font-semibold">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Content Creator
      </footer>
    </div>
  );
}
