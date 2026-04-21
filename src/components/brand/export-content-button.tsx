"use client";

import { ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FORMATS = [
  { id: "png" as const, label: "PNG" },
  { id: "jpg" as const, label: "JPG" },
  { id: "gif" as const, label: "GIF" },
  { id: "pdf" as const, label: "PDF" },
  { id: "mp4" as const, label: "MP4" },
  { id: "zip" as const, label: "ZIP paket" },
];

async function downloadExport(contentId: string, format: (typeof FORMATS)[number]["id"]) {
  const res = await fetch(`/api/contents/${contentId}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    toast.error((err as { error?: string }).error ?? "Export başarısız");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ext =
    format === "zip"
      ? "zip"
      : format === "pdf"
        ? "pdf"
        : format === "mp4"
          ? "mp4"
          : format;
  a.download = `content-${contentId}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("İndirildi");
}

export function ExportContentButton({ contentId }: { contentId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ size: "xs", variant: "ghost" }),
          "h-7 gap-1 text-xs",
        )}
      >
        Export
        <ChevronDown className="size-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {FORMATS.map((f) => (
          <DropdownMenuItem
            key={f.id}
            onClick={() => {
              void downloadExport(contentId, f.id);
            }}
          >
            {f.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
