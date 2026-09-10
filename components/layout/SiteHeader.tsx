"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { SearchDialog } from "./SearchDialog";
import { navItems } from "@/lib/site";
import type { SearchIndexItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SiteHeaderProps {
  /** Axtarış qutusu boş olanda göstərilən təkliflər */
  searchSuggestions: SearchIndexItem[];
}

/**
 * Sabit üst panel.
 * Mobil: loqo + axtarış. Desktop: əlavə olaraq üfüqi naviqasiya və ⌘K göstəricisi.
 */
export function SiteHeader({ searchSuggestions }: SiteHeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const current = navItems.find(
    (item) =>
      item.href === pathname ||
      (item.href !== "/" && pathname.startsWith(item.href)),
  );

  /* ⌘K / Ctrl+K qısayolu */
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pt-safe bg-surface-bright/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(17,28,45,0.05)]">
        <Container className="h-20 flex items-center justify-between gap-space-md">
          <Logo contextLabel={current?.label} />

          <nav
            className="hidden lg:flex items-center gap-space-2xs"
            aria-label="Əsas naviqasiya"
          >
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
                    "flex items-center gap-space-2xs px-space-sm h-10 rounded-md",
                    "font-label text-label-lg transition-colors duration-200",
                    active
                      ? "bg-secondary-container text-on-secondary-container font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                  )}
                >
                  <Icon name={item.icon} size={18} />
                  {item.shortLabel}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-space-xs shrink-0">
            {/* Desktop: geniş axtarış düyməsi */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-space-xs h-10 w-56 lg:w-64 px-space-sm rounded-md border border-outline-variant bg-surface-container-low/70 text-outline hover:border-secondary/40 hover:bg-surface-container-low transition-colors"
            >
              <Icon name="search" size={18} />
              <span className="font-body text-body-sm">Axtarış...</span>
              <kbd className="ms-auto rounded border border-outline-variant px-1.5 py-0.5 font-label text-label-sm">
                ⌘K
              </kbd>
            </button>

            {/* Mobil: ikon düyməsi */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Axtarış"
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="search" size={22} />
            </button>
          </div>
        </Container>
      </header>

      {/* key: hər açılışda təmiz vəziyyətlə qurulur */}
      <SearchDialog
        key={searchOpen ? "open" : "closed"}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        suggestions={searchSuggestions}
      />
    </>
  );
}
