"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { removeMemberAction } from "../actions";

export function RemoveMemberButton({ workspaceId, userId }: { workspaceId: string; userId: string }) {
  const t = useTranslations("admin.workspace.members");
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await removeMemberAction(workspaceId, userId);
        })
      }
    >
      {t("remove")}
    </Button>
  );
}
