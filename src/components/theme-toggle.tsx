"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { setThemeMode } from "@/app/actions/theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("relative rounded-full", className)}
      aria-label="Toggle theme"
      onClick={async () => {
        const isDark = document.documentElement.classList.contains("dark");
        const next = isDark ? "light" : "dark";
        document.documentElement.classList.toggle("dark", next === "dark");
        await setThemeMode(next);
        router.refresh();
      }}
    >
      <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
