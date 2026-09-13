"use client";

import { FLAGS, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export type ContentLanguageFilter = "all" | "az" | "ru";

export interface LanguageFilterCardsProps {
  value: ContentLanguageFilter;
  onChange: (value: ContentLanguageFilter) => void;
  counts: { az: number; ru: number };
  className?: string;
}

const OPTIONS: { slug: ContentLanguageFilter; name: string }[] = [
  { slug: "all", name: "Bütün dillər" },
  { slug: "az", name: "Azərbaycan dili" },
  { slug: "ru", name: "Rus dili" },
];

/**
 * Dil — məqalə/video/PDF sənədinin ən önəmli parametri, ona görə
 * status/kateqoriya süzgəclərindən fərqli, bayraqlı böyük kartlar
 * kimi göstərilir. Admin siyahılarının hamısında (məqalələr, videolar,
 * PDF sənədləri) eyni komponentdir.
 */
export function LanguageFilterCards({
  value,
  onChange,
  counts,
  className,
}: LanguageFilterCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-space-sm", className)}>
      {OPTIONS.map((f) => {
        const active = value === f.slug;
        const Flag = f.slug !== "all" ? FLAGS[f.slug] : null;
        return (
          <button
            key={f.slug}
            type="button"
            onClick={() => onChange(f.slug)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-space-sm rounded-xl border-2 px-space-md py-space-sm text-start transition-colors",
              active
                ? "border-secondary bg-secondary/[0.08] shadow-level-1"
                : "border-outline-variant bg-surface-container-lowest hover:border-secondary/40",
            )}
          >
            {Flag ? (
              <Flag className="w-10 h-8 shrink-0 rounded-md object-cover ring-1 ring-outline-variant/60" />
            ) : (
              <span className="flex items-center justify-center w-10 h-8 shrink-0 rounded-md bg-surface-container-high">
                <Icon name="public" size={18} className="text-outline" />
              </span>
            )}
            <span className="flex flex-col min-w-0">
              <span className="font-label text-label-lg font-semibold text-on-surface truncate">
                {f.name}
              </span>
              {f.slug !== "all" && (
                <span className="font-label text-label-sm text-outline tabular-nums">
                  {counts[f.slug]} qeyd
                </span>
              )}
            </span>
            {active && (
              <Icon name="check_circle" size={20} className="ms-auto shrink-0 text-secondary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
