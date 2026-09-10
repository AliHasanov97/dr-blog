"use server";

import { revalidatePath } from "next/cache";
import { getSearchIndex, submitContactForm, subscribeNewsletter } from "@/lib/api";
import type { ContactFormValues, SearchIndexItem } from "@/lib/types";

/**
 * Publik saytın form əməliyyatları.
 *
 * `lib/api/*` funksiyaları Prisma-ya gedir, yəni yalnız serverdə işləyə
 * bilər. Formalar müştəri komponentləridir — ona görə onlar bu server
 * action-larını çağırır. Validasiya da burada təkrarlanır: müştəri
 * tərəfdəki yoxlama yalnız istifadəçi rahatlığı üçündür.
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
  const fullName = values.fullName?.trim() ?? "";
  const contact = values.contact?.trim() ?? "";
  const subject = values.subject?.trim() ?? "";
  const message = values.message?.trim() ?? "";

  if (fullName.length < 3) {
    return { success: false, message: "Ad və soyadınızı tam yazın." };
  }
  if (!EMAIL.test(contact) && !PHONE.test(contact)) {
    return {
      success: false,
      message: "Düzgün e-poçt və ya telefon nömrəsi daxil edin.",
    };
  }
  if (message.length < 10) {
    return {
      success: false,
      message: "Mesajınız ən azı 10 simvoldan ibarət olmalıdır.",
    };
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
      return {
        success: false,
        message: result.message ?? "Müraciət göndərilmədi.",
      };
    }
  } catch {
    return {
      success: false,
      message: "Müraciət göndərilmədi. Bir azdan yenidən cəhd edin.",
    };
  }

  revalidatePath("/admin/muracietler");
  revalidatePath("/admin");

  return {
    success: true,
    message: "Müraciətiniz qeydə alındı. Ən qısa zamanda cavab veriləcək.",
  };
}

/** Bülleten abunəsi */
export async function subscribeToNewsletter(
  email: string,
): Promise<FormResult> {
  const clean = email?.trim() ?? "";
  if (!EMAIL.test(clean)) {
    return {
      success: false,
      message: "Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.",
    };
  }

  try {
    const result = await subscribeNewsletter(clean);
    if (!result.success) {
      return {
        success: false,
        message: result.message ?? "Abunə qeydə alınmadı.",
      };
    }
    revalidatePath("/admin/abuneciler");
    revalidatePath("/admin");
    return {
      success: true,
      message: result.message ?? "Abunəliyiniz təsdiqləndi.",
    };
  } catch {
    return {
      success: false,
      message: "Abunə qeydə alınmadı. Bir azdan yenidən cəhd edin.",
    };
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
): Promise<SearchIndexItem[]> {
  const q = query?.trim();
  if (!q || q.length < 2) return [];
  try {
    return await getSearchIndex(q, 8);
  } catch {
    return [];
  }
}
