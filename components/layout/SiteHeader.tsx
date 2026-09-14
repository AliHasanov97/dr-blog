"use client";

import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { PreferencesMenu } from "./PreferencesMenu";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";
import { isMultiLanguageEnabled } from "@/i18n/routing";
import { navItems } from "@/lib/site";
import type { DoctorProfile, SearchIndexItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Desktop naviqasiyada qısa etiket lazımdır — yalnız "articles" üçün fərqlidir */
function shortNavKey(key: (typeof navItems)[number]["key"]) {
  return key === "articles" ? "articlesShort" : key;
}

export interface SiteHeaderProps {
  /** Axtarış qutusu boş olanda göstərilən təkliflər */
  searchSuggestions: SearchIndexItem[];
  doctor: DoctorProfile;
}

/**
 * Sabit üst panel.
 * Mobil: loqo + axtarış. Desktop: əlavə olaraq üfüqi naviqasiya və ⌘K göstəricisi.
 */
export function SiteHeader({ searchSuggestions, doctor }: SiteHeaderProps) {
  const t = useTranslations("nav");
  /* `.env`-dəki NEXT_PUBLIC_ENABLED_LOCALES ilə idarə olunur (bax: i18n/routing.ts) */
  const showLanguageSwitch = isMultiLanguageEnabled();
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
          <Logo doctor={doctor} contextLabel={current ? t(current.key) : undefined} />

          <nav
            className="hidden lg:flex items-center gap-space-2xs"
            aria-label={t("ariaLabel")}
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
                  {t(shortNavKey(item.key))}
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
              <span className="font-body text-body-sm">{t("searchPlaceholder")}</span>
              <kbd className="ms-auto rounded border border-outline-variant px-1.5 py-0.5 font-label text-label-sm">
                ⌘K
              </kbd>
            </button>

            {/* Mobil: ikon düyməsi */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("search")}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="search" size={22} />
            </button>

            {showLanguageSwitch ? (
              /*
                `PreferencesMenu` `useSearchParams()` işlədir — Suspense
                olmadan bu, `generateStaticParams`-lı səhifələrdə (məqalə
                detalı) statik qurulma cəhdini dayandırıb
                `DYNAMIC_SERVER_USAGE` atırdı (production-da müşahidə
                olundu, digər səhifələr bundan təsirlənmirdi, çünki
                onlarda `generateStaticParams` yoxdur).
              */
              <Suspense fallback={<div className="w-11 h-11 shrink-0" />}>
                <PreferencesMenu />
              </Suspense>
            ) : (
              /* Dil dəstəyi söndürülübsə seçəcək ikinci dil qalmır —
               * panel açmağa ehtiyac yoxdur, tema açarı birbaşa navbar-da */
              <ThemeToggle />
            )}
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
