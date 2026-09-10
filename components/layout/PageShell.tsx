import type { ReactNode } from "react";
import { Container } from "./Container";
import { cn } from "@/lib/utils";

export interface PageShellProps {
  children: ReactNode;
  width?: "content" | "shell" | "wide" | "bleed";
  /** Yuxarıdakı standart boşluğu ləğv edir (hero tam en olduqda) */
  flush?: boolean;
  className?: string;
}

/**
 * Səhifə gövdəsi: sabit header (h-20) və mobil alt naviqasiya üçün boşluq buraxır.
 * `width="bleed"` verildikdə daxili Container işlədilmir — bölmələr özləri sarır.
 */
export function PageShell({
  children,
  width = "shell",
  flush = false,
  className,
}: PageShellProps) {
  const body =
    width === "bleed" ? (
      <div className={className}>{children}</div>
    ) : (
      <Container width={width} className={cn("py-space-lg lg:py-space-2xl", className)}>
        {children}
      </Container>
    );

  return (
    <main className={cn("flex-1 pb-28 lg:pb-space-2xl", flush ? "pt-20" : "pt-20")}>
      {body}
    </main>
  );
}
