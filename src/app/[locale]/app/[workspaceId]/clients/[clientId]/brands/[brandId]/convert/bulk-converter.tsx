"use client";

import { useState } from "react";
import { ASPECT_RATIOS } from "@/lib/constants/platforms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function BulkConverter({
  assets,
  brandId,
}: {
  assets: { id: string; name: string; public_url: string | null; type: string }[];
  brandId: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>(["1:1", "9:16"]);
  const [format, setFormat] = useState<"png" | "jpg" | "gif">("png");

  return (
    <div className="glass-card space-y-6 rounded-xl p-6">
      <div>
        <p className="mb-2 text-sm font-medium">Varlıklar</p>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {assets.map((a) => (
            <label key={a.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.includes(a.id)}
                onCheckedChange={(c) =>
                  setSelected((prev) =>
                    c ? [...prev, a.id] : prev.filter((x) => x !== a.id),
                  )
                }
              />
              {a.name}
            </label>
          ))}
          {!assets.length && <p className="text-sm text-muted-foreground">Görsel yok.</p>}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Hedef oranlar</p>
        <div className="flex flex-wrap gap-2">
          {ASPECT_RATIOS.filter((r) => r !== "custom").map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={targets.includes(r)}
                onCheckedChange={(c) =>
                  setTargets((prev) =>
                    c ? [...prev, r] : prev.filter((x) => x !== r),
                  )
                }
              />
              {r}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Format</Label>
        <Select
          value={format}
          onValueChange={(v) => v && setFormat(v as typeof format)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpg">JPG</SelectItem>
            <SelectItem value="gif">GIF</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="gradient"
        disabled={!selected.length}
        onClick={async () => {
          const res = await fetch("/api/convert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assetIds: selected, targets, format, brandId }),
          });
          if (!res.ok) {
            toast.error("Dönüştürme başarısız");
            return;
          }
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "converted.zip";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("ZIP indirildi");
        }}
      >
        ZIP indir
      </Button>
    </div>
  );
}
