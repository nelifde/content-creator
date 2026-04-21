import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { LandingMarquee } from "@/components/layout/landing-marquee";
import { Reveal } from "@/components/layout/reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Layers,
  Palette,
  ShieldCheck,
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
  const messages = await getMessages();
  const marqueeItems = (messages as { landing?: { marqueeItems?: string[] } }).landing
    ?.marqueeItems ?? [t("landing.heroBadge")];

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-[#f5f5f5]">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        }}
      />

      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-[family-name:var(--font-heading-display)] text-sm font-semibold uppercase tracking-[0.2em] text-white"
          >
            Content Creator
          </Link>
          <nav className="hidden items-center gap-10 text-xs font-medium uppercase tracking-[0.18em] text-white/50 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              {t("nav.features")}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                "hidden rounded-full border border-white/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-white/30 hover:text-white sm:inline-flex",
              )}
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black transition-colors hover:bg-neutral-200"
            >
              {t("nav.signup")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-16">
          <Reveal>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/45">
              {t("landing.heroBadge")}
            </p>
          </Reveal>
          <Reveal delay={0.06} className="mt-8">
            <h1 className="font-[family-name:var(--font-heading-display)] text-[clamp(2.75rem,10vw,7rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
              <span className="block">{t("landing.heroLine1")}</span>
              <span className="block text-white/90">{t("landing.heroLine2")}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 max-w-2xl">
            <p className="text-base leading-relaxed text-white/55 sm:text-lg">
              {t("landing.heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
              >
                {t("landing.ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center rounded-full border border-white/20 px-7 py-3 text-sm font-medium text-white/85 transition-colors hover:border-white/40 hover:bg-white/[0.04]"
              >
                {t("landing.ctaSecondary")}
              </a>
            </div>
          </Reveal>
        </section>

        <LandingMarquee items={marqueeItems} />

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12">
          <Reveal delay={0.02} className="grid gap-px border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
            {[
              { label: t("landing.statsUsers"), value: "10k+" },
              { label: t("landing.statsPosts"), value: "2M+" },
              { label: t("landing.statsPlatforms"), value: "6" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0a] px-6 py-8 sm:py-10">
                <div className="font-[family-name:var(--font-heading-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                  {s.label}
                </div>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="border-t border-white/[0.08] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="max-w-3xl">
              <h2 className="font-[family-name:var(--font-heading-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem]">
                {t("landing.riseTitle")}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-white/55 sm:text-lg">
                {t("landing.riseSubtitle")}
              </p>
            </Reveal>
            <Reveal delay={0.08} className="mt-12 border border-white/[0.08] bg-[#080808] px-5 py-6 sm:px-8 sm:py-8">
              <p className="text-sm leading-[1.85] text-white/45 sm:text-[0.95rem]">
                {t("landing.riseTags")}
              </p>
            </Reveal>
          </div>
        </section>

        <section id="features" className="border-t border-white/[0.08] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="max-w-3xl">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/40">
                {t("landing.scaleSubtitle")}
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-heading-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem]">
                {t("landing.scaleTitle")}
              </h2>
              <p className="mt-4 text-white/50">{t("features.subtitle")}</p>
            </Reveal>

            <div className="mt-14 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {[
                { icon: Zap, title: t("features.bulk.title"), desc: t("features.bulk.desc") },
                { icon: Palette, title: t("features.brand.title"), desc: t("features.brand.desc") },
                { icon: ShieldCheck, title: t("features.approval.title"), desc: t("features.approval.desc") },
                { icon: Layers, title: t("features.convert.title"), desc: t("features.convert.desc") },
              ].map((f, i) => (
                <Reveal key={f.title} delay={0.04 * i}>
                  <div className="group grid gap-6 py-10 transition-colors hover:bg-white/[0.02] sm:grid-cols-[auto_1fr] sm:items-start sm:gap-12 sm:py-12">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition-colors group-hover:border-white/25">
                      <f.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-heading-display)] text-xl font-semibold tracking-tight sm:text-2xl">
                        {f.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.08] py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <Reveal>
              <p className="font-[family-name:var(--font-heading-display)] text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {t("landing.ctaBand")}
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
              >
                {t("landing.ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] py-10 text-center text-xs uppercase tracking-[0.2em] text-white/35">
        © {new Date().getFullYear()} Content Creator
      </footer>
    </div>
  );
}
