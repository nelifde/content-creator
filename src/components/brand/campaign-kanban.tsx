"use client";

import { useOptimistic, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateContentStatus } from "@/app/[locale]/app/actions";
import { ExportContentButton } from "@/components/brand/export-content-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export type ContentCard = {
  id: string;
  title: string | null;
  status: "draft" | "review" | "approved" | "ready";
  platform: string;
  aspect_ratio: string;
};

const columns: ContentCard["status"][] = ["draft", "review", "approved", "ready"];

export function CampaignKanban({ items }: { items: ContentCard[] }) {
  const t = useTranslations("campaign");
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    items,
    (state, update: { id: string; status: ContentCard["status"] }) =>
      state.map((c) => (c.id === update.id ? { ...c, status: update.status } : c)),
  );

  async function move(id: string, status: ContentCard["status"]) {
    startTransition(async () => {
      setOptimistic({ id, status });
      const res = await updateContentStatus(id, status);
      if ("error" in res && res.error) toast.error(res.error);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {columns.map((col) => (
        <div key={col} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold capitalize">{t(col)}</h3>
            <Badge variant="secondary">
              {optimistic.filter((c) => c.status === col).length}
            </Badge>
          </div>
          <div className="flex flex-col gap-3">
            {optimistic
              .filter((c) => c.status === col)
              .map((c) => (
                <Card key={c.id} className="glass-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm leading-snug">
                      {c.title ?? "İçerik"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4 pt-0 text-xs text-muted-foreground">
                    <p>
                      {c.platform} · {c.aspect_ratio}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      <ExportContentButton contentId={c.id} />
                      {col === "draft" && (
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={pending}
                          onClick={() => move(c.id, "review")}
                        >
                          {t("moveToReview")}
                        </Button>
                      )}
                      {col === "review" && (
                        <Button
                          size="xs"
                          variant="gradient"
                          disabled={pending}
                          onClick={() => move(c.id, "approved")}
                        >
                          {t("approve")}
                        </Button>
                      )}
                      {col === "approved" && (
                        <Button
                          size="xs"
                          variant="secondary"
                          disabled={pending}
                          onClick={() => move(c.id, "ready")}
                        >
                          {t("markReady")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
