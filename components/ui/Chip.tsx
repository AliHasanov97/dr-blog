"use client";

import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export interface ChipProps {
  label: string;
  icon?: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

/** Filtr pill-i — məqalə kateqoriyaları üçün */
export function Chip({ label, icon, active = false, count, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 inline-flex items-center gap-1 px-space-sm py-1.5 rounded-full",
        "font-label text-label-sm font-semibold shadow-sm transition-colors duration-200",
        active
          ? "bg-secondary-container text-on-secondary-container"
          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
        className,
      )}
    >
      {icon && <Icon name={icon} size={14} />}
      {label}
      {typeof count === "number" && (
        <span className={cn("ml-0.5", active ? "opacity-70" : "text-outline")}>
          {count}
        </span>
      )}
    </button>
  );
}

export interface ChipGroupProps {
  items: { id: string; slug: string; name: string; icon?: string; articleCount?: number }[];
  activeSlug: string;
  onChange: (slug: string) => void;
  showCounts?: boolean;
  className?: string;
}

/** Üfüqi sürüşən filtr sırası */
export function ChipGroup({
  items,
  activeSlug,
  onChange,
  showCounts = false,
  className,
}: ChipGroupProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-space-xs overflow-x-auto scrollbar-none pb-1",
        "-mx-margin-mobile px-margin-mobile lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible",
        className,
      )}
    >
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.name}
          icon={item.icon}
          count={showCounts ? item.articleCount : undefined}
          active={item.slug === activeSlug}
          onClick={() => onChange(item.slug)}
        />
      ))}
    </div>
  );
}
