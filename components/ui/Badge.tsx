import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export type BadgeTone =
  /** Verified Physician Chip — solğun emerald fon */
  | "secondary"
  /** Academic Distinction Ribbon — şampan tonu */
  | "tertiary"
  | "neutral"
  | "error"
  /** Dolu emerald — şəkil üzərində yaxşı oxunur */
  | "solid"
  /** Tünd fonda şüşəvari çip */
  | "glass"
  /** Şəkil üzərində açıq "kağız" çipi */
  | "paper";

const toneClasses: Record<BadgeTone, string> = {
  secondary: "bg-secondary/10 text-on-secondary-container",
  tertiary: "bg-tertiary-fixed/40 text-on-tertiary-fixed-variant",
  neutral: "bg-surface-container-high text-on-surface-variant",
  error: "bg-error-container text-on-error-container",
  solid: "bg-secondary text-white shadow-sm",
  glass: "bg-white/12 text-tertiary-fixed backdrop-blur-sm",
  paper:
    "bg-surface-container-lowest/92 text-on-surface backdrop-blur-sm shadow-sm",
};

export interface BadgeProps {
  children: ReactNode;
  icon?: string;
  tone?: BadgeTone;
  /** Tam yumru (pill) forma — trust chip-lər üçün */
  pill?: boolean;
  uppercase?: boolean;
  className?: string;
}

export function Badge({
  children,
  icon,
  tone = "neutral",
  pill = true,
  uppercase = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 px-2 py-0.5 font-label text-label-sm font-semibold whitespace-nowrap",
        pill ? "rounded-full" : "rounded",
        uppercase && "uppercase tracking-wider",
        toneClasses[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
