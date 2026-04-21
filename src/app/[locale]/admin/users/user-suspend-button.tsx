"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { setUserSuspensionAction } from "../actions";

export function UserSuspendButton({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  const t = useTranslations("admin.platform.users");
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant={isSuspended ? "secondary" : "destructive"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setUserSuspensionAction(userId, !isSuspended);
        })
      }
    >
      {isSuspended ? t("unsuspendUser") : t("suspendUser")}
    </Button>
  );
}
