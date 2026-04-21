"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function BrandSubnav({
  basePath,
}: {
  basePath: string;
}) {
  const t = useTranslations("app");
  const pathname = usePathname();
  const items = [
    { href: `${basePath}/assets`, label: t("assets") },
    { href: `${basePath}/templates`, label: t("templates") },
    { href: `${basePath}/campaigns`, label: t("campaigns") },
    { href: `${basePath}/create`, label: t("create") },
    { href: `${basePath}/convert`, label: t("convert") },
    { href: `${basePath}/settings`, label: t("settings") },
  ];

  return (
    <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            pathname === item.href ||
            (pathname?.startsWith(`${item.href}/`) ?? false)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
