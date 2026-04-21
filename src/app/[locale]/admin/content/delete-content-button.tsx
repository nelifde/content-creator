"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteContentAdminAction } from "../actions";

export function DeleteContentButton({ contentId, label }: { contentId: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this content?")) return;
        start(async () => {
          await deleteContentAdminAction(contentId);
        });
      }}
    >
      {label}
    </Button>
  );
}
