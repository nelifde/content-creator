"use server";

import { cookies } from "next/headers";
import { THEME_COOKIE, type ThemeMode } from "@/lib/theme";

export async function setThemeMode(mode: ThemeMode) {
  if (mode !== "light" && mode !== "dark" && mode !== "system") return;
  const c = await cookies();
  c.set(THEME_COOKIE, mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
