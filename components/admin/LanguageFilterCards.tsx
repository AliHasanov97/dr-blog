"use client";

import { FLAGS, Icon } from "@/components/ui";
import { getTranslatableLocales, LOCALE_LABELS, routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type ContentLanguageFilter = "all" | AppLocale;

export interface LanguageFilterCardsProps {
  value: ContentLanguageFilter;
  onChange: (value: ContentLanguageFilter) => void;
  counts: Partial<Record<AppLocale, number>>;
  className?: string;
}

/**
 * Dil — məqalə/video/PDF sənədinin ən önəmli parametri, ona görə
 * status/kateqoriya süzgəclərindən fərqli, bayraqlı böyük kartlar
 * kimi göstərilir. Admin siyahılarının hamısında (məqalələr, videolar,
 * PDF sənədləri) eyni komponentdir. Dillər `routing.locales`-ə görə
 * dinamikdir — heç biri bərkidilməyib.
 */
export function LanguageFilterCards({
  value,
  onChange,
  counts,
  className,
}: LanguageFilterCardsProps) {
  const locales = [routing.defaultLocale, ...getTranslatableLocales()];
  const options: { slug: ContentLanguageFilter; name: string }[] = [
    { slug: "all", name: "Bütün dillər" },
    ...locales.map((l) => ({ slug: l, name: `${LOCALE_LABELS[l] ?? l} dili` })),
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-sm",
        className,
      )}
    >
      {options.map((f) => {
        const active = value === f.slug;
        const Flag = f.slug !== "all" ? FLAGS[f.slug as keyof typeof FLAGS] : null;
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
                  {counts[f.slug as AppLocale] ?? 0} qeyd
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
