"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCampaign } from "@/app/[locale]/app/actions";
import { toast } from "sonner";

export function CampaignCreateForm({
  brandId,
  paths,
}: {
  brandId: string;
  paths: {
    workspaceId: string;
    clientId: string;
    brandId: string;
  };
}) {
  const t = useTranslations("app");
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="glass-card flex max-w-md flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        const res = await createCampaign(brandId, name.trim());
        setLoading(false);
        if ("error" in res && res.error) {
          toast.error(res.error);
          return;
        }
        if ("id" in res && res.id) {
          toast.success("Kampanya oluşturuldu");
          setName("");
          router.push(
            `/app/${paths.workspaceId}/clients/${paths.clientId}/brands/${paths.brandId}/campaigns/${res.id}`,
          );
        }
      }}
    >
      <div className="flex-1 space-y-2">
        <Label>Kampanya adı</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q1 Launch" />
      </div>
      <Button type="submit" variant="gradient" disabled={loading}>
        {t("save")}
      </Button>
    </form>
  );
}
