import { defineRouting } from "next-intl/routing";

/**
 * Yalnız publik sayt (`app/[locale]/(site)`) lokallaşdırılır — admin panel
 * (`/admin`) və `/media` bundan kənardadır, tək dildə qalır.
 */
export const routing = defineRouting({
  locales: ["az", "ru", "tr"],
  defaultLocale: "az",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

/**
 * Bu serverdə hansı dillər canlıdır — `routing.locales` (kodun BİLDİYİ,
 * mesaj kataloqu olan dillər) ilə qarışdırılmasın. `.env`-dəki
 * `NEXT_PUBLIC_ENABLED_LOCALES` (vergüllə ayrılmış, məs. "ru,tr") ilə idarə
 * olunur.
 *
 * AZ (`defaultLocale`) həmişə aktivdir, siyahıya yazılmasa da.
 */
export function getEnabledLocales(): AppLocale[] {
  const extra = (process.env.NEXT_PUBLIC_ENABLED_LOCALES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(
      (s): s is AppLocale =>
        (routing.locales as readonly string[]).includes(s)
    );

  return Array.from(
    new Set([routing.defaultLocale, ...extra])
  ) as AppLocale[];
}

/** Admin paneldə RU/TR (və gələcək digər dillər) idarəetmə elementləri göstərilməlidirmi */
export function isMultiLanguageEnabled(): boolean {
  return getEnabledLocales().length > 1;
}

/** Dil kodunun admin/panel UI-də göstərilən adı */
export const LOCALE_LABELS: Record<AppLocale, string> = {
  az: "Azərbaycan",
  ru: "Rus",
  tr: "Türk",
};

/**
 * `defaultLocale`-dan (AZ) başqa, admin formalarında ayrıca redaktə oluna
 * bilən dillər — aktiv dillərin default çıxarılmış halı.
 */
export function getTranslatableLocales(): AppLocale[] {
  return getEnabledLocales().filter((l) => l !== routing.defaultLocale);
}

/**
 * Admin formalarındakı `<sahə>_<dil>` flat sahə adı konvensiyası —
 * məs. "name_ru", "name_tr".
 */
export function translatableFieldName(
  base: string,
  locale: string
): string {
  return `${base}_${locale}`;
}