"use client";

import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setMemberRoleAction } from "../actions";

const ROLES = ["admin", "editor", "viewer", "client"] as const;

export function MemberRoleSelect({
  workspaceId,
  userId,
  role,
}: {
  workspaceId: string;
  userId: string;
  role: string;
}) {
  const [value, setValue] = useState(role);
  const [pending, start] = useTransition();

  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(v) => {
        const next = v ?? role;
        setValue(next);
        start(async () => {
          await setMemberRoleAction(workspaceId, userId, next);
        });
      }}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
