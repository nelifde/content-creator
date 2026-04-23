export const THEME_COOKIE = "cc-theme";

export type ThemeMode = "light" | "dark" | "system";

const SEC_CH = "sec-ch-prefers-color-scheme";

/** Resolves which class `html` should have. Empty string = light, `dark` = dark mode. */
export function resolveThemeHtmlClass(
  theme: ThemeMode | undefined,
  secChPrefers: string | null,
): "dark" | "" {
  if (theme === "dark") return "dark";
  if (theme === "light") return "";
  if (secChPrefers === "dark") return "dark";
  return "";
}

export { SEC_CH as SEC_CH_PREFERS_COLOR_SCHEME };
