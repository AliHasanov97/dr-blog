import { prisma } from "@/lib/prisma";

export async function dbListSubscribers() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  return subscribers.map((s) => ({
    id: s.id,
    email: s.email,
    subscribedAtLabel: new Intl.DateTimeFormat("az", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(s.subscribedAt),
    isActive: s.isActive,
  }));
}

export async function dbToggleSubscriber(id: string, isActive: boolean) {
  return prisma.newsletterSubscriber.update({
    where: { id },
    data: { isActive },
  });
}

export async function dbDeleteSubscriber(id: string) {
  return prisma.newsletterSubscriber.delete({ where: { id } });
}
