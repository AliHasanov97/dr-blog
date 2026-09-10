import "server-only";
import { hasPublicUrl, isR2Configured, missingR2Settings, r2Driver } from "./r2";
import type { StorageDriver } from "./types";

export type { MediaKind, StoredFile, StorageDriver } from "./types";
export type { MediaScope, ArticlePart } from "./scope";
export { prefixOf, usesPeriod, scopeLabel, articleKeyOfPath } from "./scope";
export { hasPublicUrl, isR2Configured, missingR2Settings } from "./r2";

/**
 * İşlək anbarı qaytarır.
 *
 * Yalnız Cloudflare R2 dəstəklənir. Diskə yazma qəsdən yoxdur: `public/`
 * qovluğu build artefaktının bir hissəsidir və yayımda hər deploy-da
 * silinir — fayllar səssizcə itərdi. Konfiqurasiya olmadıqda yükləmə
 * baş tutmur və istifadəçiyə səbəb bildirilir.
 */
export function storage(): StorageDriver | null {
  return isR2Configured() ? r2Driver : null;
}

/** Admin panelində göstərmək üçün cari vəziyyət */
export function storageStatus(): {
  label: string;
  ready: boolean;
  /** Fayllar birbaşa Cloudflare-dən verilirmi */
  direct: boolean;
  missing: string[];
} {
  const ready = isR2Configured();
  return {
    label: ready ? r2Driver.label : "Qoşulmayıb",
    ready,
    direct: ready && hasPublicUrl(),
    missing: ready ? [] : missingR2Settings(),
  };
}
