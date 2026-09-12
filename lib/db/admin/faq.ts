import { prisma } from "@/lib/prisma";

export async function dbListFaq() {
  return prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function dbCreateFaq(data: { question: string; answer: string }) {
  const maxOrder = await prisma.faqItem.aggregate({ _max: { sortOrder: true } });
  return prisma.faqItem.create({
    data: {
      question: data.question,
      answer: data.answer,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateFaq(id: string, data: { question?: string; answer?: string }) {
  return prisma.faqItem.update({
    where: { id },
    data: {
      ...(data.question && { question: data.question }),
      ...(data.answer && { answer: data.answer }),
    },
  });
}

export async function dbDeleteFaq(id: string) {
  return prisma.faqItem.delete({ where: { id } });
}
