import { Link } from "@/i18n/navigation";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  /** Başlığın üstündəki kiçik böyük-hərfli etiket */
  kicker?: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
  /** Link olmayan sadə köməkçi mətn */
  hint?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const titleSizes = {
  sm: "text-headline-sm lg:text-headline-md",
  md: "text-headline-md lg:text-headline-lg",
  lg: "text-headline-lg-mobile lg:text-display",
} as const;

export function SectionHeader({
  title,
  kicker,
  icon,
  actionLabel,
  actionHref,
  hint,
  size = "md",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-space-2xs sm:flex-row sm:items-end sm:justify-between sm:gap-space-lg",
        className,
      )}
    >
      <div className="flex flex-col gap-space-2xs min-w-0">
        {kicker && (
          <span className="flex items-center gap-space-xs">
            <span className="h-px w-6 bg-tertiary-fixed-dim" aria-hidden="true" />
            <span className="font-label text-label-sm uppercase tracking-[0.16em] text-on-tertiary-container">
              {kicker}
            </span>
          </span>
        )}
        <div className="flex items-center gap-space-xs min-w-0">
          {icon && (
            <Icon
              name={icon}
              size={size === "lg" ? 26 : size === "md" ? 22 : 20}
              className="text-secondary shrink-0"
            />
          )}
          <h2
            className={cn(
              "font-headline text-on-surface text-balance",
              titleSizes[size],
            )}
          >
            {title}
          </h2>
        </div>
      </div>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="group shrink-0 inline-flex items-center gap-0.5 font-label text-label-lg font-semibold text-secondary hover:underline"
        >
          {actionLabel}
          <Icon
            name="arrow_forward"
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}

      {hint && !actionHref && (
        <span className="shrink-0 font-label text-label-sm text-on-surface-variant">
          {hint}
        </span>
      )}
    </div>
  );
}
