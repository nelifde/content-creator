import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AssetDropzone } from "@/components/brand/asset-dropzone";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function BrandAssetsPage({
  params,
  searchParams,
}: {
  params: Promise<{
    locale: string;
    workspaceId: string;
    clientId: string;
    brandId: string;
  }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const p = await params;
  const { q } = await searchParams;
  setRequestLocale(p.locale);
  const t = await getTranslations("app");
  const supabase = await createClient();

  let query = supabase
    .from("brand_assets")
    .select("id, name, public_url, folder, tags, version, created_at")
    .eq("brand_id", p.brandId)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,folder.ilike.%${q}%`);
  }

  const { data: assets } = await query;

  return (
    <div className="space-y-8">
      <AssetDropzone brandId={p.brandId} />

      <form className="flex max-w-md gap-2" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder={t("search")}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground inline-flex h-9 items-center rounded-md px-4 text-sm font-medium"
        >
          {t("search")}
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets?.map((a) => (
          <Card key={a.id} className="glass-card overflow-hidden">
            {a.public_url && (
              <div className="relative aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.public_url} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <CardContent className="space-y-2 p-4">
              <p className="truncate text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">
                {a.folder || "—"} · v{a.version}
              </p>
              <div className="flex flex-wrap gap-1">
                {a.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t("usedIn")}: —</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
