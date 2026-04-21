import { createAdminClient } from "@/lib/supabase/admin";

export type AuditInput = {
  actorUserId: string;
  actorRole?: string | null;
  scope: "platform" | "workspace";
  workspaceId?: string | null;
  targetTable?: string | null;
  targetId?: string | null;
  action: string;
  diff?: Record<string, unknown>;
};

/** Inserts audit row via service role when configured; otherwise no-op. */
export async function logAudit(input: AuditInput) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("audit_logs").insert({
    actor_user_id: input.actorUserId,
    actor_role: input.actorRole ?? null,
    scope: input.scope,
    workspace_id: input.workspaceId ?? null,
    target_table: input.targetTable ?? null,
    target_id: input.targetId ?? null,
    action: input.action,
    diff: input.diff ?? {},
  });
}
