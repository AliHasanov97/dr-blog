"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ChoiceOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface ChoiceGroupProps {
  label: string;
  value: string;
  options: readonly ChoiceOption[];
  onChange: (value: string) => void;
  hint?: string;
  /** `chips` — kiçik düymələr, `cards` — izahlı böyük kartlar */
  variant?: "chips" | "cards";
  className?: string;
}

/**
 * Açılan siyahı (select) əvəzinə görünən seçim düymələri.
 * Bütün variantlar eyni anda göz önündədir — heç nə gizli qalmır.
 */
export function ChoiceGroup({
  label,
  value,
  options,
  onChange,
  hint,
  variant = "chips",
  className,
}: ChoiceGroupProps) {
  return (
    <div className={cn("flex flex-col gap-space-xs", className)}>
      <span className="font-label text-label-md text-on-surface-variant">
        {label}
      </span>
      {hint && (
        <span className="flex items-start gap-1 font-label text-label-sm text-outline">
          <Icon name="info" size={13} className="mt-0.5 shrink-0" />
          {hint}
        </span>
      )}

      <div
        className={cn(
          variant === "chips"
            ? "flex flex-wrap gap-space-xs"
            : "grid gap-space-xs sm:grid-cols-3",
        )}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          if (variant === "cards") {
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border p-space-sm text-start transition-colors",
                  active
                    ? "border-secondary bg-secondary/[0.08]"
                    : "border-outline-variant hover:border-secondary/40",
                )}
              >
                <span className="flex items-center gap-space-2xs">
                  {opt.icon && (
                    <Icon
                      name={opt.icon}
                      size={18}
                      className={active ? "text-secondary" : "text-outline"}
                    />
                  )}
                  <span className="font-label text-label-lg text-on-surface">
                    {opt.label}
                  </span>
                  {active && (
                    <Icon name="check_circle" size={16} className="ms-auto text-secondary" />
                  )}
                </span>
                {opt.description && (
                  <span className="font-body text-body-sm text-on-surface-variant leading-snug">
                    {opt.description}
                  </span>
                )}
              </button>
            );
          }
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1 h-9 px-space-sm rounded-full border font-label text-label-md transition-colors",
                active
                  ? "border-secondary bg-secondary text-on-secondary"
                  : "border-outline-variant text-on-surface-variant hover:border-secondary/40",
              )}
            >
              {opt.icon && <Icon name={opt.icon} size={15} />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
