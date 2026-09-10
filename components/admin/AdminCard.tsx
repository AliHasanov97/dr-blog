import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface AdminCardProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  /** Başlıq sağında xüsusi element (tab, açar) — actionLabel yerinə */
  action?: ReactNode;
  children: ReactNode;
  /** Daxili boşluğu ləğv edir (cədvəllər üçün) */
  flush?: boolean;
  className?: string;
}

export function AdminCard({
  title,
  description,
  actionLabel,
  actionHref,
  action,
  children,
  flush = false,
  className,
}: AdminCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-surface-container bg-surface-container-lowest shadow-level-1 overflow-hidden",
        className,
      )}
    >
      {(title || actionLabel || action) && (
        <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm border-b border-surface-container">
          <div className="flex flex-col gap-0.5 min-w-0">
            {title && (
              <h2 className="font-headline text-headline-sm text-on-surface truncate">
                {title}
              </h2>
            )}
            {description && (
              <p className="font-body text-body-sm text-on-surface-variant truncate">
                {description}
              </p>
            )}
          </div>
          {action}
          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="shrink-0 inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary hover:underline"
            >
              {actionLabel}
              <Icon name="arrow_forward" size={14} />
            </Link>
          )}
        </div>
      )}
      <div className={flush ? "" : "p-space-md"}>{children}</div>
    </section>
  );
}
