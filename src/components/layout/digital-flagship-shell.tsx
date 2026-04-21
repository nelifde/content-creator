import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DigitalFlagshipBackground } from "./digital-flagship-background";

export function DigitalFlagshipShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col bg-[#0a0a0a] text-[#f5f5f5] antialiased",
        className,
      )}
    >
      <DigitalFlagshipBackground />
      {children}
    </div>
  );
}
