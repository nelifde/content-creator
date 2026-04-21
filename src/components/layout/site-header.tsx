import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/app/[locale]/app/logout-button";
import { cn } from "@/lib/utils";

const headerBar =
  "sticky top-0 z-20 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md";

const logoClass =
  "font-[family-name:var(--font-heading-display)] text-sm font-semibold uppercase tracking-[0.2em] text-white";

const btnGhost =
  "rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white";

const btnOutline =
  "inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-white/30 hover:text-white";

const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black transition-colors hover:bg-neutral-200";

const themeOnFlagship =
  "text-white/80 hover:bg-white/10 hover:text-white [&_svg]:text-white/90";

type SiteHeaderVariant = "public" | "auth-login" | "auth-signup" | "app";

export async function SiteHeader({ variant }: { variant: SiteHeaderVariant }) {
  const tNav = await getTranslations("nav");
  const maxW = variant === "app" ? "max-w-7xl" : "max-w-6xl";

  return (
    <header className={headerBar}>
      <div
        className={cn(
          "mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6",
          maxW,
        )}
      >
        {variant === "app" ? (
          <Link href="/app" className={logoClass}>
            Content Creator
          </Link>
        ) : (
          <Link href="/" className={logoClass}>
            Content Creator
          </Link>
        )}

        {variant === "public" && (
          <nav className="hidden items-center gap-10 text-xs font-medium uppercase tracking-[0.18em] text-white/50 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              {tNav("features")}
            </a>
          </nav>
        )}

        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
          <ThemeToggle className={themeOnFlagship} />

          {variant === "public" && (
            <>
              <Link href="/login" className={btnOutline}>
                {tNav("login")}
              </Link>
              <Link href="/signup" className={btnPrimary}>
                {tNav("signup")}
              </Link>
            </>
          )}

          {variant === "auth-login" && (
            <Link href="/signup" className={btnPrimary}>
              {tNav("signup")}
            </Link>
          )}

          {variant === "auth-signup" && (
            <Link href="/login" className={btnOutline}>
              {tNav("login")}
            </Link>
          )}

          {variant === "app" && (
            <>
              <Link href="/" className={btnGhost}>
                {tNav("home")}
              </Link>
              <LogoutButton className={btnGhost} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
