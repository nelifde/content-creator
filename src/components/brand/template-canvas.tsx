"use client";

import dynamic from "next/dynamic";
import type { KonvaLayer } from "@/lib/ai/layoutSuggest";

const Inner = dynamic(() => import("./template-canvas-inner"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted/30 flex h-[320px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground shimmer">
      Canvas yükleniyor…
    </div>
  ),
});

export function TemplateCanvas({
  initialLayers,
  onJsonChange,
  resetKey = 0,
}: {
  initialLayers?: KonvaLayer[];
  onJsonChange?: (layers: KonvaLayer[]) => void;
  /** Increment when loading a new preset / AI layout from parent */
  resetKey?: number;
}) {
  return (
    <Inner
      key={resetKey}
      initialLayers={initialLayers}
      onJsonChange={onJsonChange}
    />
  );
}
