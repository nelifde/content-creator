import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

type AppLocale = "tr" | "en";

export async function requireAuth(
  locale: string,
): Promise<{ supabase: SupabaseClient; user: User }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale: locale as AppLocale });
  }
  const authUser = user as User;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_suspended")
    .eq("id", authUser.id)
    .maybeSingle();
  if (profile?.is_suspended) {
    redirect({ href: "/", locale: locale as AppLocale });
  }
  return { supabase, user: authUser };
}

/** Platform super-admin: row in `platform_admins`. */
export async function requirePlatformAdmin(locale: string) {
  const { supabase, user } = await requireAuth(locale);
  const { data } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) {
    redirect({ href: "/app", locale: locale as AppLocale });
  }
  return { supabase, user };
}

/** Workspace `admin` role only. */
export async function requireWorkspaceAdmin(workspaceId: string, locale: string) {
  const { supabase, user } = await requireAuth(locale);
  const { data: row } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (row?.role !== "admin") {
    redirect({ href: `/app/${workspaceId}`, locale: locale as AppLocale });
  }
  return { supabase, user };
}
