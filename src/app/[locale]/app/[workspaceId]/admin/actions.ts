"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit/log";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function assertWorkspaceAdmin(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (data?.role !== "admin") return null;
  return { user, supabase };
}

export async function inviteMemberAction(workspaceId: string, email: string) {
  const actor = await assertWorkspaceAdmin(workspaceId);
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(email.trim());
  if (error) return { error: error.message };
  const uid = invited?.user?.id;
  if (uid) {
    await admin.from("profiles").upsert(
      { id: uid, display_name: email.split("@")[0] },
      { onConflict: "id" },
    );
    const { error: memErr } = await admin.from("workspace_members").insert({
      workspace_id: workspaceId,
      user_id: uid,
      role: "editor",
    });
    if (memErr && !memErr.message.includes("duplicate")) {
      return { error: memErr.message };
    }
  }
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "workspace_admin",
    scope: "workspace",
    workspaceId,
    action: "member.invite",
    diff: { email },
  });
  revalidatePath(`/app/${workspaceId}/admin/members`);
  return { ok: true };
}

export async function setMemberRoleAction(workspaceId: string, userId: string, role: string) {
  const actor = await assertWorkspaceAdmin(workspaceId);
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { error } = await admin
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "workspace_admin",
    scope: "workspace",
    workspaceId,
    targetTable: "workspace_members",
    targetId: userId,
    action: "member.set_role",
    diff: { role },
  });
  revalidatePath(`/app/${workspaceId}/admin/members`);
  return { ok: true };
}

export async function removeMemberAction(workspaceId: string, userId: string) {
  const actor = await assertWorkspaceAdmin(workspaceId);
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  if (userId === actor.user.id) return { error: "cannot_remove_self" };
  const { error } = await admin
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "workspace_admin",
    scope: "workspace",
    workspaceId,
    action: "member.remove",
    diff: { userId },
  });
  revalidatePath(`/app/${workspaceId}/admin/members`);
  return { ok: true };
}
