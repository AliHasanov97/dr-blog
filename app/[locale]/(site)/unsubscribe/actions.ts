"use server";

import { getTranslations } from "next-intl/server";
import { dbUnsubscribeByToken } from "@/lib/db/contact";
import type { FormResult } from "@/app/[locale]/(site)/actions";

/**
 * Abunəlikdən çıxmanın təsdiqi.
 *
 * Ayrıca action-dır, çünki çıxış yalnız oxucunun düyməyə basması ilə baş
 * verməlidir. Səhifə açılanda avtomatik çıxış etmək olmaz: poçt xidmətləri
 * məktubdakı linkləri təhlükəsizlik yoxlaması üçün özləri açır.
 */
export async function confirmUnsubscribe(token: string): Promise<FormResult> {
  const t = await getTranslations("unsubscribe");
  const clean = token?.trim();
  if (!clean) {
    return { success: false, message: t("linkIncomplete") };
  }

  try {
    const result = await dbUnsubscribeByToken(clean);
    const messages: Record<typeof result.code, string> = {
      invalid: t("linkIncomplete"),
      not_found: t("linkExpired"),
      already_inactive: t("alreadyInactive"),
      success: t("unsubscribed"),
      error: t("genericError"),
    };
    return { success: result.success, message: messages[result.code] };
  } catch {
    return { success: false, message: t("genericError") };
  }
}
