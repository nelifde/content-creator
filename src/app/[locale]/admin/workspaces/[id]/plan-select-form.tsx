"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setWorkspacePlanAction } from "../../actions";

export function PlanSelectForm({
  workspaceId,
  currentPlanId,
  plans,
  label,
  save,
}: {
  workspaceId: string;
  currentPlanId: string | null;
  plans: { id: string; name: string }[];
  label: string;
  save: string;
}) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState(currentPlanId ?? plans[0]?.id ?? "");

  return (
    <div className="glass-card rounded-xl border border-border/50 p-4">
      <Label className="text-base font-medium">{label}</Label>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <Select value={value} onValueChange={(v) => setValue(v ?? "")}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setWorkspacePlanAction(workspaceId, value || null);
            })
          }
        >
          {save}
        </Button>
      </div>
    </div>
  );
}
