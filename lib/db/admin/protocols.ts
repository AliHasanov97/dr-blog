import { prisma } from "@/lib/prisma";

export async function dbListProtocols() {
  return prisma.protocolDocument.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function dbCreateProtocol(data: {
  title: string;
  description?: string;
  fileSizeLabel?: string;
  fileUrl: string;
  access?: string;
}) {
  const maxOrder = await prisma.protocolDocument.aggregate({ _max: { sortOrder: true } });
  return prisma.protocolDocument.create({
    data: {
      title: data.title,
      description: data.description,
      fileSizeLabel: data.fileSizeLabel || "—",
      fileUrl: data.fileUrl,
      access: data.access || "download",
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateProtocol(id: string, data: Record<string, string>) {
  return prisma.protocolDocument.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.fileSizeLabel && { fileSizeLabel: data.fileSizeLabel }),
      ...(data.fileUrl && { fileUrl: data.fileUrl }),
      ...(data.access && { access: data.access }),
    },
  });
}

export async function dbDeleteProtocol(id: string) {
  return prisma.protocolDocument.delete({ where: { id } });
}
