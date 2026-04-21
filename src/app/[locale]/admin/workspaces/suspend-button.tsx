"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { suspendWorkspaceAction } from "../actions";

export function SuspendWorkspaceButton({
  workspaceId,
  suspended,
  labelSuspend,
  labelUnsuspend,
}: {
  workspaceId: string;
  suspended: boolean;
  labelSuspend: string;
  labelUnsuspend: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await suspendWorkspaceAction(workspaceId, !suspended);
        })
      }
    >
      {suspended ? labelUnsuspend : labelSuspend}
    </Button>
  );
}
