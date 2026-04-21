"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteMemberAction } from "../actions";

export function InviteMemberForm({ workspaceId }: { workspaceId: string }) {
  const t = useTranslations("admin.workspace.members");
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();

  return (
    <form
      className="glass-card space-y-3 rounded-xl border border-border/50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await inviteMemberAction(workspaceId, email.trim());
          setEmail("");
        });
      }}
    >
      <Label>{t("inviteEmail")}</Label>
      <div className="flex gap-2">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" disabled={pending}>
          {t("invite")}
        </Button>
      </div>
    </form>
  );
}
