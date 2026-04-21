"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPlatformAdminAction } from "../actions";

export function PlatformAdminForm() {
  const t = useTranslations("admin.platform.users");
  const [userId, setUserId] = useState("");
  const [pending, start] = useTransition();

  return (
    <form
      className="glass-card space-y-3 rounded-xl border border-border/50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await addPlatformAdminAction(userId.trim());
          setUserId("");
        });
      }}
    >
      <Label>{t("addPlatformAdmin")}</Label>
      <div className="flex gap-2">
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="UUID"
          required
        />
        <Button type="submit" disabled={pending}>
          {t("add")}
        </Button>
      </div>
    </form>
  );
}
