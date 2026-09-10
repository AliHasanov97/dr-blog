import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  href?: string;
  hint?: string;
  /** Diqqət çəkən vəziyyət (gözləyən şərh və s.) */
  highlight?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  href,
  hint,
  highlight = false,
}: StatCardProps) {
  const body = (
    <>
      <span
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          highlight
            ? "bg-secondary text-on-secondary"
            : "bg-surface-container-high text-on-surface-variant",
        )}
      >
        <Icon name={icon} size={20} />
      </span>
      <span className="flex flex-col min-w-0">
        <span className="font-headline text-headline-lg text-on-surface leading-none">
          {value}
        </span>
        <span className="font-label text-label-md uppercase tracking-wider text-outline mt-1 truncate">
          {label}
        </span>
        {hint && (
          <span className="font-body text-body-sm text-on-surface-variant truncate">
            {hint}
          </span>
        )}
      </span>
    </>
  );

  const className = cn(
    "flex items-center gap-space-sm rounded-xl border bg-surface-container-lowest p-space-md shadow-level-1 transition-colors",
    highlight ? "border-secondary/40" : "border-surface-container",
    href && "hover:border-secondary/40",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}
