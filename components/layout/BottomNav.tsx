"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Mobil alt naviqasiya — desktopda gizlədilir */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobil naviqasiya"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-bright/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(17,28,45,0.06)]"
    >
      <div className="flex justify-around items-center h-20 px-space-xs">
        {navItems.map((item) => {
          const active =
            item.href === pathname ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-[64px] h-14 transition-colors duration-200",
                active
                  ? "text-primary-container font-semibold"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon name={item.icon} size={22} filled={active} className="mb-0.5" />
              <span className="font-label text-label-sm leading-tight text-center">
                {item.shortLabel}
              </span>
              <span
                className={cn(
                  "absolute -bottom-1 h-0.5 rounded-full bg-secondary transition-all duration-300",
                  active ? "w-8 opacity-100" : "w-0 opacity-0",
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
