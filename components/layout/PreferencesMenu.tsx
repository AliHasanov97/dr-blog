"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FLAGS, Icon } from "@/components/ui";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const LOCALE_NAMES: Record<AppLocale, string> = {
  az: "Azərbaycanca",
  ru: "Русский",
};

/**
 * Header-in dil + tema seçimi — tək düymə, açılanda kiçik panel göstərir.
 *
 * Əvvəllər dil keçidi və tema açarı ayrı-ayrı iki dairəvi düymə kimi
 * header-də dayanırdı — mobil ekranda axtarış düyməsi ilə birlikdə üç
 * düymə sıxlıq yaradırdı. İndi ikisi tək "tune" düyməsinin altında,
 * açılan kiçik paneldə birləşib — header-də bir yer azalır.
 */
export function PreferencesMenu() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("languageLabel")}
        aria-expanded={open}
        className={cn(
          "w-11 h-11 flex items-center justify-center rounded-full text-on-surface transition-colors",
          open ? "bg-surface-container-low" : "hover:bg-surface-container-low",
        )}
      >
        <Icon name="tune" size={22} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-[calc(100%+8px)] w-60 rounded-xl border border-surface-container bg-surface-container-lowest shadow-level-2 p-space-sm flex flex-col gap-space-xs z-50"
        >
          <span className="px-space-2xs font-label text-label-sm uppercase tracking-wider text-outline">
            {t("languageLabel")}
          </span>
          <div className="flex flex-col gap-0.5">
            {routing.locales.map((l) => {
              const Flag = FLAGS[l];
              const active = l === locale;
              return (
                <Link
                  key={l}
                  href={pathname + query}
                  locale={l}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-space-xs px-space-xs h-10 rounded-md font-label text-label-lg transition-colors",
                    active
                      ? "bg-secondary-container text-on-secondary-container font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container-low",
                  )}
                >
                  <Flag className="w-6 h-[18px] shrink-0 rounded-[3px] object-cover ring-1 ring-outline-variant/60" />
                  {LOCALE_NAMES[l]}
                  {active && (
                    <Icon name="check" size={18} className="ms-auto text-secondary" />
                  )}
                </Link>
              );
            })}
          </div>

          <span className="h-px bg-surface-container my-space-2xs" aria-hidden="true" />

          <div className="flex items-center justify-between px-space-2xs">
            <span className="font-label text-label-lg text-on-surface-variant">
              {t("themeLabel")}
            </span>
            <ThemeToggle className="w-9 h-9 -me-1" />
          </div>
        </div>
      )}
    </div>
  );
}
