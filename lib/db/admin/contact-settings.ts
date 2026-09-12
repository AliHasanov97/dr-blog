import { prisma } from "@/lib/prisma";

export async function dbGetContactSettings() {
  const [channels, office] = await Promise.all([
    prisma.contactChannel.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.officeLocation.findFirst(),
  ]);
  return { channels, office };
}

export async function dbUpdateContactChannel(id: string, data: Record<string, any>) {
  return prisma.contactChannel.update({
    where: { id },
    data,
  });
}

export async function dbUpdateOfficeLocation(data: Record<string, any>) {
  const office = await prisma.officeLocation.findFirst();
  if (!office) {
    return prisma.officeLocation.create({ data: data as any });
  }
  return prisma.officeLocation.update({
    where: { id: office.id },
    data,
  });
}
