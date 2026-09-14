import { prisma } from "@/lib/prisma";
import { mergeTranslations } from "@/lib/i18n/translations";

export async function dbListFaq() {
  return prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function dbCreateFaq(data: {
  question: string;
  answer: string;
  /** Digər dillərdəki variant — açar dil kodu (məs. "ru") */
  translations?: Record<string, { question?: string; answer?: string }>;
}) {
  const maxOrder = await prisma.faqItem.aggregate({ _max: { sortOrder: true } });
  return prisma.faqItem.create({
    data: {
      question: data.question,
      answer: data.answer,
      translations: data.translations ?? undefined,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateFaq(
  id: string,
  data: {
    question?: string;
    answer?: string;
    /** Redaktə olunan dillər üçün tam dəst — söndürülmüş dillərin köhnə tərcüməsi toxunulmur (bax: mergeTranslations) */
    translations?: Record<string, { question?: string; answer?: string }>;
  },
) {
  let translations: Record<string, unknown> | undefined;
  if (data.translations !== undefined) {
    const current = await prisma.faqItem.findUnique({
      where: { id },
      select: { translations: true },
    });
    translations = mergeTranslations(current?.translations, data.translations);
  }

  return prisma.faqItem.update({
    where: { id },
    data: {
      ...(data.question && { question: data.question }),
      ...(data.answer && { answer: data.answer }),
      ...(translations !== undefined && { translations: translations as object }),
    },
  });
}

export async function dbDeleteFaq(id: string) {
  return prisma.faqItem.delete({ where: { id } });
}
