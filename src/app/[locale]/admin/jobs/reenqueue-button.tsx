"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reenqueueJobAction } from "../actions";

export function ReenqueueJobButton({ jobId, label }: { jobId: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await reenqueueJobAction(jobId);
        })
      }
    >
      {label}
    </Button>
  );
}
