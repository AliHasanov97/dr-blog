import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { removeStoredFile } from "@/lib/admin/storage";
import {
  SETTINGS_KEY,
  normalizeSettings,
  type SiteSettings,
} from "@/lib/settings";

/**
 * Sayt parametrləri.
 *
 * `site_settings` açar/dəyər cədvəlidir: bütün parametrlər `key = "site"`
 * olan bir sətrin `value` JSON-unda saxlanılır. Sətir yoxdursa standart
 * dəyərlər qaytarılır — səhifə boş bazada da açılmalıdır.
 */
export async function dbGetSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSetting.findUnique({
    where: { key: SETTINGS_KEY },
    select: { value: true },
  });
  return normalizeSettings(row?.value);
}

/** Parametrləri yazır; sətir yoxdursa yaradır */
export async function dbUpdateSiteSettings(
  values: SiteSettings,
): Promise<SiteSettings> {
  const clean = normalizeSettings(values);
  /* Prisma `Json` sahəsi indeks imzası olan obyekt gözləyir — `SiteSettings`
   * sabit sahəli interfeysdir, ona görə düz JSON obyektinə çevrilir. */
  const payload = { ...clean } as unknown as Prisma.InputJsonObject;

  const previous = await prisma.siteSetting.findUnique({
    where: { key: SETTINGS_KEY },
    select: { value: true },
  });
  const previousLogo = previous ? normalizeSettings(previous.value).loadingLogo : "";

  const row = await prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: payload },
    update: { value: payload },
    select: { value: true },
  });

  /* Loading ekranı logosu əvəz olunubsa köhnəsi R2-də yetim qalmasın */
  if (previousLogo && previousLogo !== clean.loadingLogo) {
    await removeStoredFile(previousLogo);
  }

  return normalizeSettings(row.value);
}
