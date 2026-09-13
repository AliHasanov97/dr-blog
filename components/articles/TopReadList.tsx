import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui";
import type { TopReadArticle } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TopReadListProps {
  items: TopReadArticle[];
  className?: string;
}

/** «Ən Çox Oxunanlar» — nömrələnmiş siyahı */
export function TopReadList({ items, className }: TopReadListProps) {
  return (
    <Card padded={false} className={cn("divide-y divide-surface-container", className)}>
      {items.map((item) => (
        <Link
          key={item.rank}
          href={`/articles/${item.slug}`}
          className="flex gap-space-md p-space-md hover:bg-surface-container-low/60 transition-colors"
        >
          <span className="font-headline text-headline-md text-tertiary-fixed-dim shrink-0 w-10">
            {item.rank}
          </span>
          <span className="flex flex-col gap-space-2xs min-w-0">
            <span className="font-label text-label-sm text-secondary font-semibold">
              {item.readCountLabel}
            </span>
            <span className="font-headline text-headline-sm text-on-surface leading-snug">
              {item.title}
            </span>
            <span className="font-body text-body-sm text-on-surface-variant line-clamp-1">
              {item.excerpt}
            </span>
          </span>
        </Link>
      ))}
    </Card>
  );
}
