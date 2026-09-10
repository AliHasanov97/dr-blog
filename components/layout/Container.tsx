import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  children: ReactNode;
  /**
   * `content` — məqalə oxu eni (~46rem)
   * `shell`   — standart səhifə eni (~78rem)
   * `wide`    — geniş bölmələr üçün (~90rem)
   * `bleed`   — en məhdudiyyəti yoxdur (tam en bloklar)
   */
  width?: "content" | "shell" | "wide" | "bleed";
  as?: ElementType;
  className?: string;
}

const widths: Record<NonNullable<ContainerProps["width"]>, string> = {
  content: "max-w-[46rem]",
  shell: "max-w-[78rem]",
  wide: "max-w-[90rem]",
  bleed: "",
};

export function Container({
  children,
  width = "shell",
  as: Tag = "div",
  className,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "w-full mx-auto px-margin-mobile lg:px-space-xl",
        widths[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
