"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getSearchIndex, submitContactForm, subscribeNewsletter } from "@/lib/api";
import type { ContactFormValues, SearchIndexItem } from "@/lib/types";

/**
 * Publik saytın form əməliyyatları.
 *
 * `lib/api/*` funksiyaları Prisma-ya gedir, yəni yalnız serverdə işləyə
 * bilər. Formalar müştəri komponentləridir — ona görə onlar bu server
 * action-larını çağırır. Validasiya da burada təkrarlanır: müştəri
 * tərəfdəki yoxlama yalnız istifadəçi rahatlığı üçündür.
 *
 * Mesajlar `getTranslations()` ilə çağıranın dilinə uyğun qaytarılır — DB
 * qatından gələn nəticələr mətn deyil, `code` daşıyır (bax: `lib/db/contact.ts`).
 */

export interface FormResult {
  success: boolean;
  message: string;
}

const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^[+\d][\d\s()-]{8,}$/;

/** Əlaqə forması — müraciət admin panelin gələnlər qutusuna düşür */
export async function sendContactMessage(
  values: ContactFormValues,
): Promise<FormResult> {
  const t = await getTranslations("contact.form");
  const fullName = values.fullName?.trim() ?? "";
  const contact = values.contact?.trim() ?? "";
  const subject = values.subject?.trim() ?? "";
  const message = values.message?.trim() ?? "";

  if (fullName.length < 3) {
    return { success: false, message: t("errorName") };
  }
  if (!EMAIL.test(contact) && !PHONE.test(contact)) {
    return { success: false, message: t("errorContact") };
  }
  if (message.length < 10) {
    return { success: false, message: t("errorMessage") };
  }

  try {
    const result = await submitContactForm({
      ...values,
      fullName,
      contact,
      subject,
      message,
    });
    if (!result.success) {
      return { success: false, message: t("submitFailed") };
    }
  } catch {
    return { success: false, message: t("submitFailedRetry") };
  }

  revalidatePath("/admin/muracietler");
  revalidatePath("/admin");

  return { success: true, message: t("submitSuccess") };
}

/** Bülleten abunəsi */
export async function subscribeToNewsletter(
  email: string,
): Promise<FormResult> {
  const t = await getTranslations("newsletter.form");
  const clean = email?.trim() ?? "";
  if (!EMAIL.test(clean)) {
    return { success: false, message: t("errorEmail") };
  }

  try {
    const result = await subscribeNewsletter(clean);
    if (!result.success) {
      return {
        success: false,
        message:
          result.code === "already_subscribed"
            ? t("alreadySubscribed")
            : t("subscribeFailed"),
      };
    }
    revalidatePath("/admin/abuneciler");
    revalidatePath("/admin");
    return {
      success: true,
      message:
        result.code === "success_no_mail"
          ? t("subscribeSuccessNoMail")
          : t("subscribeSuccess"),
    };
  } catch {
    return { success: false, message: t("subscribeFailedRetry") };
  }
}

/**
 * Header axtarışı.
 *
 * Axtarış serverdə aparılır — əvvəllər bütün məqalələrin indeksi hər
 * səhifə ilə brauzerə göndərilirdi, bu isə məqalə sayı ilə birlikdə
 * böyüyürdü.
 */
export async function searchArticles(
  query: string,
  locale?: string,
): Promise<SearchIndexItem[]> {
  const q = query?.trim();
  if (!q || q.length < 2) return [];
  try {
    return await getSearchIndex(q, 8, locale);
  } catch {
    return [];
  }
}
