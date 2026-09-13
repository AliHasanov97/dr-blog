import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { inboxNotificationEmail, welcomeEmail } from "@/lib/mail/templates";
import { dbGetArticleAuthor } from "@/lib/db/doctor";
import type {
  ContactChannel,
  ContactFormValues,
  FaqItem,
  OfficeLocation,
} from "@/lib/types";

import { MessageStatus } from "@prisma/client";

/** Təxmin edilə bilməyən abunəlikdən çıxma tokeni */
function newToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function dbGetContactChannels(): Promise<ContactChannel[]> {
  const channels = await prisma.contactChannel.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return channels.map((c) => ({
    id: c.id,
    kind: c.kind as ContactChannel["kind"],
    icon: c.icon,
    title: c.title,
    subtitle: c.subtitle ?? "",
    values: (c.values as string[]) ?? [],
    actionLabel: c.actionLabel,
    actionIcon: c.actionIcon,
    href: c.href,
  }));
}

export async function dbGetOfficeLocation(): Promise<OfficeLocation | null> {
  const office = await prisma.officeLocation.findFirst({
    orderBy: { sortOrder: "asc" },
  });

  if (!office) return null;

  return {
    name: office.name,
    department: office.department ?? "",
    addressLine: office.addressLine,
    room: office.room ?? "",
    city: office.city,
    shortAddress: office.shortAddress ?? "",
    mapUrl: office.mapUrl ?? "",
    mapImageUrl: office.mapImageUrl ?? "",
    schedule: (office.schedule as OfficeLocation["schedule"]) ?? [],
  };
}

export async function dbGetFaqItems(): Promise<FaqItem[]> {
  const items = await prisma.faqItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));
}

/** `message` deyil `code` qaytarır — tərcüməsini çağıran action edir (DB qatı təqdimat dilindən asılı olmamalıdır) */
export async function dbSubmitContactMessage(
  values: ContactFormValues
): Promise<{ success: boolean; code: "success" | "error" }> {
  try {
    await prisma.contactMessage.create({
      data: {
        inquiryType: values.inquiryType,
        fullName: values.fullName,
        contact: values.contact,
        subject: values.subject,
        message: values.message,
        consent: values.consent,
        status: MessageStatus.NEW,
      },
    });

    /* Həkimə bildiriş — admin panelini daim yoxlamaq lazım gəlməsin deyə.
     * Məktub getməsə də müraciət qeydə alınıb, ona görə nəticəsi
     * cavabı dəyişmir. */
    const author = await dbGetArticleAuthor();
    const notice = inboxNotificationEmail({
      fullName: values.fullName,
      contact: values.contact,
      subject: values.subject,
      message: values.message,
      brandName: author?.fullName ?? "Həkim",
    });
    await sendMail({
      to: process.env.GMAIL_USER ?? "",
      subject: notice.subject,
      html: notice.html,
      text: notice.text,
      fromName: author?.fullName,
      /* Həkim məktuba birbaşa cavab verə bilsin (e-poçt yazılıbsa) */
      replyTo: /^\S+@\S+\.\S+$/.test(values.contact.trim())
        ? values.contact.trim()
        : undefined,
    });

    return { success: true, code: "success" };
  } catch (error) {
    console.error("Failed to submit contact message:", error);
    return { success: false, code: "error" };
  }
}

export type NewsletterCode =
  | "already_subscribed"
  | "success"
  | "success_no_mail"
  | "error";

/** `message` deyil `code` qaytarır — tərcüməsini çağıran action edir */
export async function dbSubscribeNewsletter(
  rawEmail: string
): Promise<{ success: boolean; code: NewsletterCode }> {
  /*
   * E-poçt kiçik hərflərə salınır: `email` sütunu `@unique`-dir, PostgreSQL
   * isə böyük/kiçik hərfi fərqləndirir. Normallaşdırma olmasa `Ali@mail.az`
   * və `ali@mail.az` iki ayrı abunəçi kimi yazılar, «artıq abunədir»
   * yoxlaması da işləməzdi.
   */
  const email = rawEmail.trim().toLowerCase();

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    let token: string;

    if (existing) {
      if (existing.isActive) {
        return { success: false, code: "already_subscribed" };
      }
      // Reactivate
      const revived = await prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true },
        select: { unsubscribeToken: true },
      });
      token = revived.unsubscribeToken;
    } else {
      const created = await prisma.newsletterSubscriber.create({
        data: { email, isActive: true, unsubscribeToken: newToken() },
        select: { unsubscribeToken: true },
      });
      token = created.unsubscribeToken;
    }

    /* Təsdiq məktubu — göndərilməsə də abunə qüvvədədir, ona görə
     * nəticəsi abunənin uğurunu dəyişmir. */
    const welcomeAuthor = await dbGetArticleAuthor();
    const welcome = welcomeEmail(token, welcomeAuthor?.fullName ?? "Həkim");
    const mail = await sendMail({
      to: email,
      subject: welcome.subject,
      html: welcome.html,
      text: welcome.text,
      fromName: welcomeAuthor?.fullName,
    });

    return {
      success: true,
      code: mail.success ? "success" : "success_no_mail",
    };
  } catch (error) {
    console.error("Failed to subscribe:", error);
    return { success: false, code: "error" };
  }
}

/**
 * Abunəlikdən çıxma.
 *
 * Token gizlidir və hər abunəçiyə xasdır — yəni başqasını abunəlikdən
 * çıxarmaq üçün onun tokenini bilmək lazımdır. Qeyd silinmir, sadəcə
 * `isActive` sönür: eyni ünvan sonra yenidən abunə ola bilsin deyə.
 */
export type UnsubscribeCode =
  | "invalid"
  | "not_found"
  | "already_inactive"
  | "success"
  | "error";

/**
 * Mesaj mətni yoxdur — `code` qaytarır, tərcüməsini çağıran action edir
 * (bax: `app/[locale]/(site)/abunelik/cixis/actions.ts`). DB qatı təqdimat
 * dilindən asılı olmamalıdır.
 */
export async function dbUnsubscribeByToken(
  token: string,
): Promise<{ success: boolean; email?: string; code: UnsubscribeCode }> {
  if (!token.trim()) {
    return { success: false, code: "invalid" };
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true, email: true, isActive: true },
    });

    if (!subscriber) {
      return { success: false, code: "not_found" };
    }

    if (!subscriber.isActive) {
      return {
        success: true,
        email: subscriber.email,
        code: "already_inactive",
      };
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false },
    });

    return {
      success: true,
      email: subscriber.email,
      code: "success",
    };
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return {
      success: false,
      code: "error",
    };
  }
}

/**
 * Token üzrə abunəçini tapır — çıxış səhifəsi kimin söhbətini getdiyini
 * göstərsin deyə. Heç nə dəyişdirmir.
 */
export async function dbFindSubscriberByToken(
  token: string,
): Promise<{ email: string; isActive: boolean } | null> {
  if (!token.trim()) return null;
  try {
    return await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { email: true, isActive: true },
    });
  } catch {
    return null;
  }
}
