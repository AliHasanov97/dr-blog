"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/types";
import { USE_MOCK } from "@/lib/api/config";
import { dbUpdateSiteSettings } from "@/lib/db/admin";
import { sweepOrphanedMedia } from "@/lib/admin/media-sweep";
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
 * R2-də heç bir qeydə bağlı olmayan faylları silir.
 *
 * Fayl silinməsi/əvəz olunması adətən dərhal təmizlənir, amma məqalə
 * məzmunu daxilində tək bir şəklin/sənədin silinməsi bunu ötürə bilər —
 * bu düymə həmin qalıqları tapıb silir.
 */
export async function sweepMedia(): Promise<
  ActionResult & { scanned?: number; deleted?: number; skippedRecent?: number }
> {
  if (USE_MOCK) {
    return { success: false, message: "Mock rejimdə fayl anbarı yoxdur." };
  }

  const result = await sweepOrphanedMedia();
  if (!result.ready) {
    return { success: false, message: "Fayl anbarı qoşulmayıb." };
  }

  return {
    success: true,
    message:
      result.deleted > 0
        ? `${result.deleted} yetim fayl silindi.`
        : "Yetim fayl tapılmadı.",
    scanned: result.scanned,
    deleted: result.deleted,
    skippedRecent: result.skippedRecent,
  };
}
