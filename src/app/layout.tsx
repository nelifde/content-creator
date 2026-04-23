import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";
import {
  resolveThemeHtmlClass,
  THEME_COOKIE,
  SEC_CH_PREFERS_COLOR_SCHEME,
  type ThemeMode,
} from "@/lib/theme";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Content Creator",
  description: "Bulk sosyal medya içerik üretimi",
};

function parseThemeCookie(value: string | undefined): ThemeMode | undefined {
  if (value === "light" || value === "dark" || value === "system") return value;
  return undefined;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, h] = await Promise.all([cookies(), headers()]);
  const mode = parseThemeCookie(cookieStore.get(THEME_COOKIE)?.value);
  const secCh = h.get(SEC_CH_PREFERS_COLOR_SCHEME);
  const themeClass = resolveThemeHtmlClass(mode, secCh);

  return (
    <html
      lang="tr"
      className={themeClass === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <body
        className={`${geistMono.variable} min-h-full flex flex-col bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
