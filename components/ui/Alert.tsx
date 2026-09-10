import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export type AlertTone = "info" | "success" | "danger";

const toneStyles: Record<AlertTone, { wrap: string; icon: string }> = {
  info: {
    wrap: "bg-surface-container-low border-outline-variant text-on-surface-variant",
    icon: "text-secondary",
  },
  success: {
    wrap: "bg-secondary/10 border-secondary/30 text-on-secondary-container",
    icon: "text-secondary",
  },
  danger: {
    wrap: "bg-error-container/60 border-error/30 text-on-error-container",
    icon: "text-error",
  },
};

export interface AlertProps {
  title?: string;
  icon?: string;
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}

export function Alert({
  title,
  icon = "info",
  tone = "info",
  children,
  className,
}: AlertProps) {
  const styles = toneStyles[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "note"}
      className={cn(
        "flex gap-space-sm rounded-lg border p-space-md",
        styles.wrap,
        className,
      )}
    >
      <Icon name={icon} size={20} className={cn("mt-0.5", styles.icon)} />
      <div className="flex flex-col gap-space-2xs min-w-0">
        {title && (
          <span className="font-label text-label-lg uppercase tracking-wide">
            {title}
          </span>
        )}
        <p className="font-body text-body-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
