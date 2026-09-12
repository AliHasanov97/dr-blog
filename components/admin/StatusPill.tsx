import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export type PillTone = "success" | "warning" | "danger" | "neutral" | "info";

/*
 * "-fixed" fonlar heç vaxt şəffaf (/NN) işlədilmir — onların "on-...-fixed-
 * variant" mətn rəngi yalnız TAM opaklıqda kontrast verir. Şəffaf versiya
 * arxa fonla qarışıb tünd temada mətni oxunmaz edir.
 */
const tones: Record<PillTone, string> = {
  success: "bg-secondary/12 text-on-secondary-container",
  warning: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  danger: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
  info: "bg-primary-fixed text-on-primary-fixed-variant",
};

export interface StatusPillProps {
  label: string;
  tone?: PillTone;
  icon?: string;
}

export function StatusPill({ label, tone = "neutral", icon }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full font-label text-label-sm font-semibold whitespace-nowrap",
        tones[tone],
      )}
    >
      {icon && <Icon name={icon} size={12} />}
      {label}
    </span>
  );
}
