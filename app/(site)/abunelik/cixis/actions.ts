"use server";

import { dbUnsubscribeByToken } from "@/lib/db/contact";
import type { FormResult } from "@/app/(site)/actions";

/**
 * Abunəlikdən çıxmanın təsdiqi.
 *
 * Ayrıca action-dır, çünki çıxış yalnız oxucunun düyməyə basması ilə baş
 * verməlidir. Səhifə açılanda avtomatik çıxış etmək olmaz: poçt xidmətləri
 * məktubdakı linkləri təhlükəsizlik yoxlaması üçün özləri açır.
 */
export async function confirmUnsubscribe(token: string): Promise<FormResult> {
  const clean = token?.trim();
  if (!clean) {
    return { success: false, message: "Link natamamdır." };
  }

  try {
    const result = await dbUnsubscribeByToken(clean);
    return { success: result.success, message: result.message };
  } catch {
    return {
      success: false,
      message: "Xəta baş verdi. Bir azdan yenidən cəhd edin.",
    };
  }
}
