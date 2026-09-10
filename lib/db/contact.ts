import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { inboxNotificationEmail, welcomeEmail } from "@/lib/mail/templates";
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

export async function dbSubmitContactMessage(
  values: ContactFormValues
): Promise<{ success: boolean; message: string }> {
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
    const notice = inboxNotificationEmail({
      fullName: values.fullName,
      contact: values.contact,
      subject: values.subject,
      message: values.message,
    });
    await sendMail({
      to: process.env.GMAIL_USER ?? "",
      subject: notice.subject,
      html: notice.html,
      text: notice.text,
      /* Həkim məktuba birbaşa cavab verə bilsin (e-poçt yazılıbsa) */
      replyTo: /^\S+@\S+\.\S+$/.test(values.contact.trim())
        ? values.contact.trim()
        : undefined,
    });

    return {
      success: true,
      message: "Müraciətiniz uğurla göndərildi. Ən qısa zamanda sizinlə əlaqə saxlanılacaq.",
    };
  } catch (error) {
    console.error("Failed to submit contact message:", error);
    return {
      success: false,
      message: "Xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.",
    };
  }
}

export async function dbSubscribeNewsletter(
  rawEmail: string
): Promise<{ success: boolean; message: string }> {
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
        return {
          success: false,
          message: "Bu e-poçt ünvanı artıq abunədir.",
        };
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
    const welcome = welcomeEmail(token);
    const mail = await sendMail({
      to: email,
      subject: welcome.subject,
      html: welcome.html,
      text: welcome.text,
    });

    return {
      success: true,
      message: mail.success
        ? "Abunəliyiniz qeydə alındı! Təsdiq məktubu poçtunuza göndərildi."
        : "Abunəliyiniz uğurla qeydə alındı!",
    };
  } catch (error) {
    console.error("Failed to subscribe:", error);
    return {
      success: false,
      message: "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
    };
  }
}

/**
 * Abunəlikdən çıxma.
 *
 * Token gizlidir və hər abunəçiyə xasdır — yəni başqasını abunəlikdən
 * çıxarmaq üçün onun tokenini bilmək lazımdır. Qeyd silinmir, sadəcə
 * `isActive` sönür: eyni ünvan sonra yenidən abunə ola bilsin deyə.
 */
export async function dbUnsubscribeByToken(
  token: string,
): Promise<{ success: boolean; email?: string; message: string }> {
  if (!token.trim()) {
    return { success: false, message: "Link düzgün deyil." };
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true, email: true, isActive: true },
    });

    if (!subscriber) {
      return {
        success: false,
        message: "Bu link tanınmadı. Ünvan artıq silinmiş ola bilər.",
      };
    }

    if (!subscriber.isActive) {
      return {
        success: true,
        email: subscriber.email,
        message: "Bu ünvan artıq abunə siyahısında deyil.",
      };
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false },
    });

    return {
      success: true,
      email: subscriber.email,
      message: "Abunəlikdən çıxarıldınız. Bundan sonra məktub göndərilməyəcək.",
    };
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return {
      success: false,
      message: "Xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.",
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
