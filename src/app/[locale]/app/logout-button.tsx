"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations("nav");
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/login");
      }}
    >
      {t("logout")}
    </Button>
  );
}
