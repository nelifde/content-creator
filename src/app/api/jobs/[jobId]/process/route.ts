import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processContentJob } from "@/lib/jobs/process-content-job";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: job, error } = await supabase
    .from("content_jobs")
    .select("id, input_type, payload, status")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status === "running" || job.status === "completed") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await processContentJob(supabase, job.id, job.input_type, job.payload);
  } catch (e) {
    await supabase
      .from("content_jobs")
      .update({
        status: "failed",
        error_message: e instanceof Error ? e.message : "process failed",
      })
      .eq("id", jobId);
    return NextResponse.json({ error: "Process failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
