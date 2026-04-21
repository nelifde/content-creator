"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrand } from "@/app/[locale]/app/actions";
import { toast } from "sonner";

export function BrandCreateForm({
  clientId,
  workspaceId,
}: {
  clientId: string;
  workspaceId: string;
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
        const res = await createBrand(clientId, name.trim());
        setLoading(false);
        if ("error" in res && res.error) {
          toast.error(res.error);
          return;
        }
        if ("id" in res && res.id) {
          toast.success("Marka eklendi");
          setName("");
          router.push(
            `/app/${workspaceId}/clients/${clientId}/brands/${res.id}/assets`,
          );
        }
      }}
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="br">{t("brandName")}</Label>
        <Input
          id="br"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn. Nova"
        />
      </div>
      <Button type="submit" variant="gradient" disabled={loading}>
        {t("addBrand")}
      </Button>
    </form>
  );
}
