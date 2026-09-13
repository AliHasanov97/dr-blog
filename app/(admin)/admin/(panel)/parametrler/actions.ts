"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/types";
import { USE_MOCK } from "@/lib/api/config";
import { dbUpdateSiteSettings } from "@/lib/db/admin";
import { deleteOrphanFiles, findOrphanedMedia, type OrphanFile } from "@/lib/admin/media-sweep";
import { store } from "@/lib/mock/store";
import { normalizeSettings, type SiteSettings } from "@/lib/settings";

/**
 * Sayt parametrlərini yadda saxlayır.
 *
 * Əvvəllər yalnız yaddaşdakı mock anbarına yazırdı — baza rejimində
 * dəyişiklik server yenidən başlayanda itirdi. İndi hər iki rejim
 * düzgün işləyir.
 */
export async function updateSettings(
  values: SiteSettings,
): Promise<ActionResult> {
  const clean = normalizeSettings(values);

  if (!clean.siteName.trim()) {
    return { success: false, message: "Sayt adı boş ola bilməz." };
  }

  if (!USE_MOCK) {
    try {
      await dbUpdateSiteSettings(clean);
    } catch (error) {
      console.error("Update settings error:", error);
      return { success: false, message: "Parametrlər yadda saxlanılmadı." };
    }
  } else {
    store.settings = { ...store.settings, ...clean };
  }

  /* Parametrlər bütün səhifələrin görünüşünə təsir edir */
  revalidatePath("/", "layout");
  revalidatePath("/admin/parametrler");

  return { success: true, message: "Parametrlər yeniləndi." };
}

/**
 * R2-də heç bir qeydə bağlı olmayan faylları TAPIR — heç nə silmir.
 * Admin nəticəni gözdən keçirdikdən sonra `confirmDeleteOrphans`-ı çağırır.
 */
export async function checkOrphanedMedia(): Promise<
  ActionResult & { scanned?: number; referenced?: number; orphans?: OrphanFile[] }
> {
  if (USE_MOCK) {
    return { success: false, message: "Mock rejimdə fayl anbarı yoxdur." };
  }

  const result = await findOrphanedMedia();
  if (!result.ready) {
    return { success: false, message: "Fayl anbarı qoşulmayıb." };
  }

  return {
    success: true,
    message:
      result.orphans.length > 0
        ? `${result.orphans.length} yetim fayl tapıldı.`
        : "Yetim fayl tapılmadı.",
    scanned: result.scanned,
    referenced: result.referenced,
    orphans: result.orphans,
  };
}

/** Admin gözdən keçirib təsdiqlədiyi faylları silir */
export async function confirmDeleteOrphans(
  items: { name: string; url: string }[],
): Promise<ActionResult & { deleted?: number; kept?: number }> {
  if (USE_MOCK) {
    return { success: false, message: "Mock rejimdə fayl anbarı yoxdur." };
  }
  if (items.length === 0) {
    return { success: false, message: "Silinəcək fayl seçilməyib." };
  }

  const { deleted, kept } = await deleteOrphanFiles(items);
  return {
    success: true,
    message:
      kept > 0
        ? `${deleted} fayl silindi, ${kept} fayl artıq istifadə olunduğu üçün saxlanıldı.`
        : `${deleted} fayl silindi.`,
    deleted,
    kept,
  };
}
