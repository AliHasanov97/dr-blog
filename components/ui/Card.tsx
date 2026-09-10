import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: ReactNode;
  /** Level 1 elevasiya — DESIGN.md */
  interactive?: boolean;
  padded?: boolean;
  as?: ElementType;
  className?: string;
}

export function Card({
  children,
  interactive = false,
  padded = true,
  as: Tag = "div",
  className,
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-xl bg-surface-container-lowest border border-surface-container shadow-level-1",
        padded && "p-card-padding",
        interactive &&
          "transition-all duration-200 hover:shadow-level-2 hover:border-tertiary-fixed-dim/50",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
