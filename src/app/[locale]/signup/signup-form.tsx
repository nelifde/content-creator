"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { ensureProfile } from "@/app/[locale]/app/actions";
import { toast } from "sonner";

export function SignupForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      toast.error("Supabase .env.local yapılandırın");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.user) {
      await ensureProfile(email.split("@")[0]);
    }
    toast.success("Hesap oluşturuldu");
    router.replace("/app");
  }

  return (
    <form onSubmit={onSubmit} className="glass-card mx-auto max-w-md space-y-4 rounded-2xl p-8">
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {t("submitSignup")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          {t("switchToLogin")}
        </Link>
      </p>
    </form>
  );
}
