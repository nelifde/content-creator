"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { uploadBrandAsset } from "@/app/[locale]/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/** Logo / marka görseli — `type=logo` için PNG/SVG önerilir. */
export function LogoDropzone({ brandId }: { brandId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setBusy(true);
      for (const file of files) {
        const fd = new FormData();
        fd.set("brandId", brandId);
        fd.set("folder", "logos");
        fd.set("file", file);
        fd.set("forceType", "logo");
        const res = await uploadBrandAsset(fd);
        if ("error" in res && res.error) toast.error(res.error);
        else toast.success(`${file.name} yüklendi`);
      }
      setBusy(false);
      router.refresh();
    },
    [brandId, router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: busy,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".svg"] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`glass-card flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-sm transition-colors ${
        isDragActive ? "border-primary bg-primary/5" : "border-muted"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="size-6 text-muted-foreground" />
      <p className="text-center text-muted-foreground">
        {busy ? "…" : "Logo yükle (sürükle veya tıkla)"}
      </p>
    </div>
  );
}
