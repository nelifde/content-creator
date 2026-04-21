"use client";

import { useState } from "react";
import { createPortalToken } from "@/app/[locale]/app/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PortalTokenSection({ brandId }: { brandId: string }) {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="space-y-2 rounded-xl border border-dashed p-4">
      <p className="text-sm font-medium">Müşteri portal bağlantısı</p>
      <p className="text-xs text-muted-foreground">
        Token oluşturun ve müşterinizle paylaşın. Portal için sunucuda service role key gerekir.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={async () => {
          const res = await createPortalToken(brandId, "default");
          if ("error" in res && res.error) toast.error(res.error);
          else if ("token" in res && res.token) {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            setUrl(`${origin}/portal/${res.token}`);
            toast.success("Token oluşturuldu");
          }
        }}
      >
        Yeni portal linki
      </Button>
      {url && (
        <code className="block break-all rounded bg-muted px-2 py-1 text-xs">{url}</code>
      )}
    </div>
  );
}
