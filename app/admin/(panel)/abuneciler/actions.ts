"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/types";
import { store } from "@/lib/mock/store";
import { USE_MOCK } from "@/lib/api/config";
import { dbToggleSubscriber, dbDeleteSubscriber } from "@/lib/db/admin";
import { dbGetArticleAuthor } from "@/lib/db/doctor";
import { prisma } from "@/lib/prisma";
import { isMailConfigured, sendMail, verifyMailConnection } from "@/lib/mail";
import { newsletterEmail } from "@/lib/mail/templates";

export async function toggleSubscriber(id: string): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      const sub = await prisma.newsletterSubscriber.findUnique({ where: { id } });
      if (!sub) return { success: false, message: "Abunəçi tapılmadı." };
      await dbToggleSubscriber(id, !sub.isActive);
      revalidatePath("/admin/abuneciler");
      return { success: true };
    } catch (error) {
      console.error("Toggle subscriber error:", error);
      return { success: false, message: "Abunəçi tapılmadı." };
    }
  }

  const sub = store.subscribers.find((s) => s.id === id);
  if (!sub) return { success: false, message: "Abunəçi tapılmadı." };
  sub.isActive = !sub.isActive;
  revalidatePath("/admin/abuneciler");
  return { success: true };
}

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      await dbDeleteSubscriber(id);
      revalidatePath("/admin/abuneciler");
      revalidatePath("/admin");
      return { success: true };
    } catch (error) {
      console.error("Delete subscriber error:", error);
      return { success: false, message: "Abunəçi tapılmadı." };
    }
  }

  const index = store.subscribers.findIndex((s) => s.id === id);
  if (index === -1) return { success: false, message: "Abunəçi tapılmadı." };
  store.subscribers.splice(index, 1);
  revalidatePath("/admin/abuneciler");
  revalidatePath("/admin");
  return { success: true };
}

/* --------------------------------------------------------------
 * Bülleten göndərişi
 * ------------------------------------------------------------ */

export interface NewsletterSendResult extends ActionResult {
  sent?: number;
  failed?: number;
}

/** Gmail-in gündəlik limitini aşmamaq üçün bir dəfəyə göndərilən sayı */
const BATCH_SIZE = 40;

/**
 * Bülleteni bütün aktiv abunəçilərə göndərir.
 *
 * Hər abunəçiyə ayrıca məktub gedir — səbəb: «abunəlikdən çıx» linki
 * hər kəsin öz tokenini daşımalıdır. Ünvanlar bir-birinə görünmür.
 * Gmail-in sürət limitinə düşməmək üçün partiyalarla göndərilir.
 */
export async function sendNewsletter(
  subject: string,
  bodyText: string,
): Promise<NewsletterSendResult> {
  const cleanSubject = subject.trim();
  const cleanBody = bodyText.trim();

  if (cleanSubject.length < 3) {
    return { success: false, message: "Mövzu sətrini yazın." };
  }
  if (cleanBody.length < 20) {
    return { success: false, message: "Bülleten mətni çox qısadır." };
  }
  if (!isMailConfigured()) {
    return {
      success: false,
      message:
        "Gmail hesabı qoşulmayıb. .env faylında GMAIL_USER və GMAIL_APP_PASSWORD təyin edin.",
    };
  }
  if (USE_MOCK) {
    return { success: false, message: "Mock rejimində göndəriş edilmir." };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true, unsubscribeToken: true },
  });

  if (subscribers.length === 0) {
    return { success: false, message: "Aktiv abunəçi yoxdur." };
  }

  const author = await dbGetArticleAuthor();
  const brandName = author?.fullName ?? "Həkim";

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (subscriber) => {
        const mail = newsletterEmail({
          subject: cleanSubject,
          bodyText: cleanBody,
          brandName,
          unsubscribeToken: subscriber.unsubscribeToken,
        });
        return sendMail({
          to: subscriber.email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          fromName: brandName,
        });
      }),
    );
    for (const result of results) {
      if (result.success) sent += 1;
      else failed += 1;
    }
  }

  revalidatePath("/admin/abuneciler");

  return {
    success: sent > 0,
    sent,
    failed,
    message:
      failed === 0
        ? `Bülleten ${sent} abunəçiyə göndərildi.`
        : `${sent} göndərildi, ${failed} alınmadı. Gmail limitini yoxlayın.`,
  };
}

/** SMTP qoşulmasını yoxlayır — göndərişdən əvvəl sınaq üçün */
export async function testMailConnection(): Promise<ActionResult> {
  if (!isMailConfigured()) {
    return {
      success: false,
      message:
        "Gmail hesabı qoşulmayıb. .env faylında GMAIL_USER və GMAIL_APP_PASSWORD təyin edin.",
    };
  }
  const result = await verifyMailConnection();
  return result.success
    ? { success: true, message: "Gmail bağlantısı işləyir." }
    : {
        success: false,
        message: `Bağlantı alınmadı: ${result.error ?? "naməlum xəta"}`,
      };
}
