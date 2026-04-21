"use client";

import { cn } from "@/lib/utils";

/** Simple CSS bar sparkline (no chart library). */
export function MiniChart({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className={cn("flex h-12 items-end gap-0.5", className)}>
      {values.map((v, i) => (
        <div
          key={i}
          className="min-w-[6px] flex-1 rounded-sm bg-primary/70"
          style={{ height: `${(v / max) * 100}%` }}
          title={String(v)}
        />
      ))}
    </div>
  );
}
