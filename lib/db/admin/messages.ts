import { prisma } from "@/lib/prisma";
import { MessageStatus } from "@prisma/client";

export async function dbListMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  return messages.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    contact: m.contact,
    subject: m.subject,
    message: m.message,
    inquiryTypeLabel: m.inquiryType,
    receivedAtLabel: new Intl.DateTimeFormat("az", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(m.createdAt),
    status: m.status.toLowerCase() as "new" | "read" | "answered" | "archived",
  }));
}

export async function dbUpdateMessageStatus(id: string, status: string) {
  return prisma.contactMessage.update({
    where: { id },
    data: { status: status.toUpperCase() as MessageStatus },
  });
}

export async function dbDeleteMessage(id: string) {
  return prisma.contactMessage.delete({ where: { id } });
}
