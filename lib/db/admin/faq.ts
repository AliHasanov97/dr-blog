import { prisma } from "@/lib/prisma";

export async function dbListFaq() {
  return prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function dbCreateFaq(data: {
  question: string;
  answer: string;
  questionRu?: string;
  answerRu?: string;
}) {
  const maxOrder = await prisma.faqItem.aggregate({ _max: { sortOrder: true } });
  return prisma.faqItem.create({
    data: {
      question: data.question,
      answer: data.answer,
      questionRu: data.questionRu?.trim() || null,
      answerRu: data.answerRu?.trim() || null,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateFaq(
  id: string,
  data: { question?: string; answer?: string; questionRu?: string; answerRu?: string },
) {
  return prisma.faqItem.update({
    where: { id },
    data: {
      ...(data.question && { question: data.question }),
      ...(data.answer && { answer: data.answer }),
      /* Boş dəyər QƏSDƏN yazılır — RU mətn silinib AZ-a geri qayıtsın deyə */
      ...(data.questionRu !== undefined && { questionRu: data.questionRu.trim() || null }),
      ...(data.answerRu !== undefined && { answerRu: data.answerRu.trim() || null }),
    },
  });
}

export async function dbDeleteFaq(id: string) {
  return prisma.faqItem.delete({ where: { id } });
}
