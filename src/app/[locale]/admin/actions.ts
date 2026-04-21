"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit/log";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { user, supabase };
}

export async function suspendWorkspaceAction(workspaceId: string, suspended: boolean) {
  const actor = await getActor();
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { error } = await admin.from("workspaces").update({ suspended }).eq("id", workspaceId);
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "platform_admin",
    scope: "platform",
    workspaceId,
    targetTable: "workspaces",
    targetId: workspaceId,
    action: suspended ? "workspace.suspend" : "workspace.unsuspend",
    diff: { suspended },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/workspaces");
  return { ok: true };
}

export async function setWorkspacePlanAction(workspaceId: string, planId: string | null) {
  const actor = await getActor();
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { error } = await admin.from("workspaces").update({ plan_id: planId }).eq("id", workspaceId);
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "platform_admin",
    scope: "platform",
    workspaceId,
    targetTable: "workspaces",
    targetId: workspaceId,
    action: "workspace.set_plan",
    diff: { plan_id: planId },
  });
  revalidatePath("/admin/workspaces");
  return { ok: true };
}

export async function reenqueueJobAction(jobId: string) {
  const actor = await getActor();
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { error } = await admin
    .from("content_jobs")
    .update({ status: "queued", progress: 0, error_message: null })
    .eq("id", jobId);
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "platform_admin",
    scope: "platform",
    targetTable: "content_jobs",
    targetId: jobId,
    action: "job.reenqueue",
    diff: {},
  });
  revalidatePath("/admin/jobs");
  return { ok: true };
}

export async function deleteContentAdminAction(contentId: string) {
  const actor = await getActor();
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { error } = await admin.from("contents").delete().eq("id", contentId);
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "platform_admin",
    scope: "platform",
    targetTable: "contents",
    targetId: contentId,
    action: "content.delete",
    diff: {},
  });
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function setUserSuspensionAction(userId: string, isSuspended: boolean) {
  const actor = await getActor();
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { error } = await admin.from("profiles").update({ is_suspended: isSuspended }).eq("id", userId);
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "platform_admin",
    scope: "platform",
    targetTable: "profiles",
    targetId: userId,
    action: isSuspended ? "user.suspend" : "user.unsuspend",
    diff: { is_suspended: isSuspended },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function addPlatformAdminAction(userId: string) {
  const actor = await getActor();
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { error } = await admin.from("platform_admins").insert({ user_id: userId });
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "platform_admin",
    scope: "platform",
    targetTable: "platform_admins",
    targetId: userId,
    action: "platform_admin.add",
    diff: {},
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function upsertPlanAction(input: {
  id?: string;
  name: string;
  limits: Record<string, number>;
}) {
  const actor = await getActor();
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  if (input.id) {
    const { error } = await admin
      .from("plans")
      .update({ name: input.name, limits: input.limits })
      .eq("id", input.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin.from("plans").insert({
      name: input.name,
      limits: input.limits,
    });
    if (error) return { error: error.message };
  }
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "platform_admin",
    scope: "platform",
    targetTable: "plans",
    action: input.id ? "plan.update" : "plan.create",
    diff: input,
  });
  revalidatePath("/admin/plans");
  return { ok: true };
}

export async function inviteUserByEmailAction(email: string) {
  const actor = await getActor();
  const admin = createAdminClient();
  if (!actor || !admin) return { error: "forbidden" };
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email.trim());
  if (error) return { error: error.message };
  await logAudit({
    actorUserId: actor.user.id,
    actorRole: "platform_admin",
    scope: "platform",
    action: "user.invite",
    diff: { email },
  });
  revalidatePath("/admin/users");
  return { ok: true, userId: data?.user?.id };
}
