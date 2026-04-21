import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { CampaignKanban, type ContentCard } from "@/components/brand/campaign-kanban";
import { CampaignComments } from "@/components/brand/campaign-comments";
import { createClient } from "@/lib/supabase/server";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{
    locale: string;
    workspaceId: string;
    clientId: string;
    brandId: string;
    campaignId: string;
  }>;
}) {
  const p = await params;
  setRequestLocale(p.locale);
  await getTranslations("campaign");
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name, brand_id")
    .eq("id", p.campaignId)
    .single();
  if (!campaign || campaign.brand_id !== p.brandId) notFound();

  const { data: contents } = await supabase
    .from("contents")
    .select("id, title, status, platform, aspect_ratio")
    .eq("campaign_id", p.campaignId)
    .order("created_at", { ascending: false });

  const ids = contents?.map((c) => c.id) ?? [];
  const { data: comments } = ids.length
    ? await supabase
        .from("comments")
        .select("id, content_id, body, created_at")
        .in("content_id", ids)
        .order("created_at", { ascending: true })
    : { data: [] as { id: string; content_id: string; body: string; created_at: string }[] };

  const cards: ContentCard[] =
    contents?.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status as ContentCard["status"],
      platform: c.platform,
      aspect_ratio: c.aspect_ratio,
    })) ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold">{campaign.name}</h2>
        <p className="text-sm text-muted-foreground">Kanban & yorumlar</p>
      </div>
      <CampaignKanban items={cards} />
      <CampaignComments
        contents={contents?.map((c) => ({ id: c.id, title: c.title })) ?? []}
        comments={comments ?? []}
      />
    </div>
  );
}
