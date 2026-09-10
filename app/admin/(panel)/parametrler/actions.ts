"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/types";
import { USE_MOCK } from "@/lib/api/config";
import { dbUpdateSiteSettings } from "@/lib/db/admin";
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
  if (clean.contactEmail && !/^\S+@\S+\.\S+$/.test(clean.contactEmail.trim())) {
    return { success: false, message: "Əlaqə e-poçtu düzgün deyil." };
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
