import { cn } from "@/lib/utils";

export interface IconProps {
  /** Material Symbols Outlined ikon adı, məs. "favorite" */
  name: string;
  /** Piksel ölçüsü */
  size?: number;
  /** Dolu (filled) variant */
  filled?: boolean;
  className?: string;
}

/**
 * Material Symbols ikonu.
 * Şrift `app/layout.tsx`-də <link> ilə yüklənir.
 */
export function Icon({ name, size = 20, filled = false, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      data-filled={filled ? "true" : undefined}
      className={cn("material-symbols-outlined shrink-0 leading-none", className)}
      style={{ fontSize: size, width: size, height: size }}
    >
      {name}
    </span>
  );
}
