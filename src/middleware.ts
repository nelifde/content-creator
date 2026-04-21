import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18n = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  if (
    p.startsWith("/portal") ||
    p.startsWith("/api") ||
    p.startsWith("/admin") ||
    /^\/(tr|en)\/admin(\/|$)/.test(p)
  ) {
    return await updateSession(request);
  }

  const intlResponse = handleI18n(request);
  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
