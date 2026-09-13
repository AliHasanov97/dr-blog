"use client";

import { useMemo, useState } from "react";
import { LanguageFilterCards, type ContentLanguageFilter } from "./LanguageFilterCards";
import { ResourceManager, type ResourceManagerProps } from "./ResourceManager";
import type { ResourceRow } from "@/lib/admin/types";

/**
 * `ResourceManager`-in üstündə dil tab-ı — `items`-in hər sətrində
 * `language` ("az" | "ru") sahəsi olmalıdır. Video və PDF sənədləri kimi
 * dilə görə bölünən siyahılar üçün (kateqoriya/FAQ-da dil yoxdur, ona görə
 * bu, adi `ResourceManager`-i əvəz etmir, üstünə əlavə olunur).
 */
export function LanguageFilteredResourceManager({
  items,
  ...rest
}: ResourceManagerProps) {
  const [language, setLanguage] = useState<ContentLanguageFilter>("all");

  const counts = useMemo(
    () => ({
      az: items.filter((i) => i.language === "az").length,
      ru: items.filter((i) => i.language === "ru").length,
    }),
    [items],
  );

  const filtered: ResourceRow[] = useMemo(
    () => (language === "all" ? items : items.filter((i) => i.language === language)),
    [items, language],
  );

  return (
    <div className="flex flex-col gap-space-md">
      <LanguageFilterCards value={language} onChange={setLanguage} counts={counts} />
      <ResourceManager items={filtered} {...rest} />
    </div>
  );
}
