"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import { uploadBrandAsset } from "@/app/[locale]/app/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AssetDropzone({ brandId }: { brandId: string }) {
  const t = useTranslations("app");
  const [folder, setFolder] = useState("");
  const [busy, setBusy] = useState(false);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;
      setBusy(true);
      for (const file of accepted) {
        const fd = new FormData();
        fd.set("brandId", brandId);
        fd.set("folder", folder);
        fd.set("file", file);
        const res = await uploadBrandAsset(fd);
        if ("error" in res && res.error) toast.error(res.error);
        else toast.success(file.name);
      }
      setBusy(false);
    },
    [brandId, folder],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: busy,
  });

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-2">
        <Label>{t("folder")}</Label>
        <Input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="örn. Q1" />
      </div>
      <div
        {...getRootProps()}
        className={`glass-card flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-center text-sm text-muted-foreground">
          {busy ? "…" : t("upload")} — sürükle veya tıkla (çoklu)
        </p>
      </div>
    </div>
  );
}
