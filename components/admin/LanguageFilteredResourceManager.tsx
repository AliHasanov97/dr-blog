"use client";

import { useMemo, useState } from "react";
import { getTranslatableLocales, isMultiLanguageEnabled, routing, type AppLocale } from "@/i18n/routing";
import { LanguageFilterCards, type ContentLanguageFilter } from "./LanguageFilterCards";
import { ResourceManager, type ResourceManagerProps } from "./ResourceManager";
import type { ResourceRow } from "@/lib/admin/types";

/**
 * `ResourceManager`-in üstündə dil tab-ı — `items`-in hər sətrində
 * `language` sahəsi olmalıdır (bax: `AppLocale`). Video və PDF sənədləri
 * kimi dilə görə bölünən siyahılar üçün (kateqoriya/FAQ-da dil yoxdur, ona
 * görə bu, adi `ResourceManager`-i əvəz etmir, üstünə əlavə olunur).
 *
 * Dil dəstəyi söndürülübsə (`.env`-dəki NEXT_PUBLIC_ENABLED_LOCALES, bax:
 * i18n/routing.ts) dil filtri tamam gizlənir və `language`/`dil` adlı
 * sahə/sütunlar formadan çıxarılır — mövcud qeydlər silinmir, sadəcə
 * admin panelində dil kimi görünmür.
 */
export function LanguageFilteredResourceManager({
  items,
  fields,
  columns,
  ...rest
}: ResourceManagerProps) {
  const languageSupport = isMultiLanguageEnabled();
  const [language, setLanguage] = useState<ContentLanguageFilter>("all");

  const counts = useMemo(() => {
    const locales = [routing.defaultLocale, ...getTranslatableLocales()];
    return Object.fromEntries(
      locales.map((l) => [l, items.filter((i) => i.language === l).length]),
    ) as Partial<Record<AppLocale, number>>;
  }, [items]);

  const filtered: ResourceRow[] = useMemo(
    () =>
      !languageSupport || language === "all"
        ? items
        : items.filter((i) => i.language === language),
    [items, language, languageSupport],
  );

  const visibleFields = useMemo(
    () => (languageSupport ? fields : fields.filter((f) => f.name !== "language")),
    [fields, languageSupport],
  );
  const visibleColumns = useMemo(
    () => (languageSupport ? columns : columns.filter((c) => c.key !== "language")),
    [columns, languageSupport],
  );

  return (
    <div className="flex flex-col gap-space-md">
      {languageSupport && (
        <LanguageFilterCards value={language} onChange={setLanguage} counts={counts} />
      )}
      <ResourceManager items={filtered} fields={visibleFields} columns={visibleColumns} {...rest} />
    </div>
  );
}
