"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { revalidateSitePath } from "@/lib/revalidate-site";
import {
  dbIncrementArticleView,
  dbSetArticleLike,
  dbSetCommentLike,
  dbSetArticleReaction,
  type ReactionCounts,
  type ReactionKind,
} from "@/lib/db/articles";
import { getArticleBySlug, postComment, submitContactForm } from "@/lib/api";
import { USE_MOCK } from "@/lib/api/config";
import { getSiteSettings } from "@/lib/admin/queries";

/**
 * Məqalə səhifəsinin server əməliyyatları.
 *
 * Bu funksiyalar müştəri komponentlərindən çağırılır, amma kod serverdə
 * qalır — Prisma brauzerə düşmür. Bütün yoxlamalar da burada aparılır:
 * müştəridən gələn heç bir dəyərə etibar edilmir.
 */

/* --------------------------------------------------------------
 * Sayğaclar
 * ------------------------------------------------------------ */

/**
 * Oxucu məqaləni açanda bir baxış yazır.
 * Səhifə statik qurulduğu üçün render zamanı deyil, brauzerdən çağırılır —
 * eyni sessiyada təkrar sayılmasının qarşısı `ViewTracker`-də alınır.
 */
export async function registerArticleView(slug: string): Promise<void> {
  if (USE_MOCK) return;
  try {
    await dbIncrementArticleView(slug);
  } catch {
    /* Sayğac saytın işini dayandırmamalıdır */
  }
}

/** Məqalə bəyənməsini yadda saxlayır və yeni sayı qaytarır */
export async function setArticleLike(
  slug: string,
  liked: boolean,
): Promise<number | null> {
  if (USE_MOCK) return null;
  try {
    return await dbSetArticleLike(slug, liked);
  } catch {
    return null;
  }
}

/** Şərh bəyənməsini yadda saxlayır və yeni sayı qaytarır */
export async function setCommentLike(
  commentId: string,
  liked: boolean,
): Promise<number | null> {
  if (USE_MOCK) return null;
  try {
    return await dbSetCommentLike(commentId, liked);
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------
 * Şərh göndərilməsi
 * ------------------------------------------------------------ */

export interface CommentSubmission {
  slug: string;
  body: string;
  authorName: string;
  authorEmail?: string;
  /** Doldurulubsa mövcud şərhə cavabdır */
  parentId?: string;
}

export interface CommentResult {
  success: boolean;
  message: string;
}

const MAX_BODY = 2000;

/**
 * Oxucu şərhini qeydə alır.
 *
 * Şərh dərhal saytda görünmür — `PENDING` statusu ilə admin panelinin
 * moderasiya növbəsinə düşür. Qaytarılan mesaj da bunu bildirir ki,
 * oxucu şərhini axtarıb tapmasın.
 */
export async function submitComment(
  input: CommentSubmission,
): Promise<CommentResult> {
  const t = await getTranslations("comments");
  const authorName = input.authorName?.trim() ?? "";
  const body = input.body?.trim() ?? "";
  const authorEmail = input.authorEmail?.trim() ?? "";

  if (authorName.length < 3) {
    return { success: false, message: t("serverErrorName") };
  }
  if (authorName.length > 80) {
    return { success: false, message: t("errorNameLong") };
  }
  if (body.length < 10) {
    return { success: false, message: t("serverErrorBodyShort") };
  }
  if (body.length > MAX_BODY) {
    return { success: false, message: t("serverErrorBodyLong", { max: MAX_BODY }) };
  }
  if (authorEmail && !/^\S+@\S+\.\S+$/.test(authorEmail)) {
    return { success: false, message: t("serverErrorEmail") };
  }

  /*
   * Şərhlərin bağlı olması serverdə də yoxlanılır — interfeysi gizlətmək
   * kifayət deyil, bu funksiya birbaşa da çağırıla bilər.
   */
  const settings = await getSiteSettings();
  if (!settings.commentsEnabled) {
    return { success: false, message: t("commentsDisabled") };
  }

  const article = await getArticleBySlug(input.slug);
  if (!article) {
    return { success: false, message: t("articleNotFound") };
  }
  if (article.allowComments === false) {
    return { success: false, message: t("commentsDisabledForArticle") };
  }

  /* Moderasiya söndürülübsə şərh dərhal görünür — mesaj da fərqli olmalıdır */
  const moderated = settings.commentsRequireApproval;

  try {
    await postComment({
      slug: input.slug,
      body,
      authorName,
      authorEmail: authorEmail || undefined,
      parentId: input.parentId,
    });
  } catch {
    return { success: false, message: t("submitFailed") };
  }

  revalidatePath("/admin/serhler");
  revalidatePath("/admin");
  if (!moderated) revalidateSitePath(`/articles/${input.slug}`);

  return {
    success: true,
    message: moderated ? t("moderatedSuccess") : t("publishedSuccess"),
  };
}

/* --------------------------------------------------------------
 * «Bu məqalə faydalı oldu?» bloku
 * ------------------------------------------------------------ */

const REACTIONS: ReactionKind[] = ["clear", "learned", "question"];

function isReaction(value: unknown): value is ReactionKind {
  return REACTIONS.includes(value as ReactionKind);
}

/**
 * Oxucunun reaksiyasını qeydə alır.
 *
 * `previous` müştəridən gəlir (brauzerdə saxlanılan əvvəlki seçim) —
 * seçim dəyişəndə köhnə sayğacın azalması üçün lazımdır. Uydurma dəyər
 * göndərilsə də zərər yoxdur: sayğaclar sıfırın altına düşmür.
 */
export async function submitArticleReaction(
  slug: string,
  next: string | null,
  previous: string | null,
): Promise<ReactionCounts | null> {
  if (USE_MOCK) return null;
  const nextKind = isReaction(next) ? next : null;
  const prevKind = isReaction(previous) ? previous : null;
  if (!nextKind && !prevKind) return null;

  try {
    return await dbSetArticleReaction(slug, nextKind, prevKind);
  } catch {
    return null;
  }
}

export interface ArticleQuestion {
  slug: string;
  articleTitle: string;
  fullName: string;
  /** E-poçt və ya telefon — cavab verilə bilməsi üçün */
  contact: string;
  question: string;
}

/**
 * Həkimə məqalə üzərindən verilən sual.
 *
 * Sual admin panelinin mövcud «Müraciətlər» qutusuna düşür (`inquiryType`
 * = `scientific` — «Elmi sual / Məqalə haqqında»), mövzu sətrində isə
 * hansı məqalədən gəldiyi yazılır.
 */
export async function submitArticleQuestion(
  input: ArticleQuestion,
): Promise<CommentResult> {
  const t = await getTranslations("feedback");
  const fullName = input.fullName?.trim() ?? "";
  const contact = input.contact?.trim() ?? "";
  const question = input.question?.trim() ?? "";

  if (fullName.length < 3) {
    return { success: false, message: t("serverErrorName") };
  }
  if (
    !/^\S+@\S+\.\S+$/.test(contact) &&
    !/^[+\d][\d\s()-]{8,}$/.test(contact)
  ) {
    return { success: false, message: t("serverErrorContact") };
  }
  if (question.length < 10) {
    return { success: false, message: t("serverErrorQuestionShort") };
  }
  if (question.length > MAX_BODY) {
    return {
      success: false,
      message: t("serverErrorQuestionLong", { max: MAX_BODY }),
    };
  }

  try {
    /* Müraciət admin-in gələnlər qutusuna düşür — admin panel tək dildə
     * (Azərbaycanca) işlədiyi üçün mövzu/mətn həmişə Azərbaycanca qurulur,
     * oxucunun sayt dilindən asılı olmayaraq. */
    const result = await submitContactForm({
      inquiryType: "scientific",
      fullName,
      contact,
      subject: `Məqalə sualı: ${input.articleTitle}`.slice(0, 200),
      message: `${question}

— /articles/${input.slug}`,
      consent: true,
    });
    if (!result.success) {
      return { success: false, message: t("submitFailed") };
    }
  } catch {
    return { success: false, message: t("serverSubmitNetworkError") };
  }

  revalidatePath("/admin/muracietler");
  revalidatePath("/admin");

  return { success: true, message: t("submitSuccess") };
}
