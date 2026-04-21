import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

export function AdminSidebar({
  items,
  className,
}: {
  items: NavItem[];
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex w-52 shrink-0 flex-col gap-1 border-r border-border/50 pr-4",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
