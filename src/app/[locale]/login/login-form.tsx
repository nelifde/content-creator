"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";

export function LoginForm() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.replace("/app");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-lg backdrop-blur-xl"
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">
          {t("email")}
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-white/15 bg-white/[0.06] text-white placeholder:text-white/35"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80">
          {t("password")}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border-white/15 bg-white/[0.06] text-white placeholder:text-white/35"
        />
      </div>
      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {t("submitLogin")}
      </Button>
      <p className="text-center text-sm text-white/50">
        <Link href="/signup" className="text-white/85 underline-offset-4 hover:text-white hover:underline">
          {t("switchToSignup")}
        </Link>
      </p>
    </form>
  );
}
