import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HorizontalScrollerProps {
  children: ReactNode;
  /** Desktopda grid-ə çevrilsin (mobil: üfüqi sürüşmə) */
  desktopGridCols?: 2 | 3;
  className?: string;
}

/**
 * Mobil ekranda üfüqi sürüşən sıra, desktopda adi grid.
 * Uşaq elementlərə `w-[78vw] max-w-xs shrink-0 lg:w-auto lg:max-w-none` verilməlidir.
 */
export function HorizontalScroller({
  children,
  desktopGridCols = 3,
  className,
}: HorizontalScrollerProps) {
  return (
    <div
      className={cn(
        "flex gap-space-sm overflow-x-auto scrollbar-none pb-1",
        "-mx-margin-mobile px-margin-mobile",
        "lg:mx-0 lg:px-0 lg:overflow-visible lg:grid lg:gap-space-md",
        desktopGridCols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
