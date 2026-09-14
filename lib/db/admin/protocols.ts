import { ArticleLanguage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { prefixOf, removeStoredFile, storage } from "@/lib/admin/storage";
import type { AppLocale } from "@/i18n/routing";

export async function dbListProtocols() {
  const protocols = await prisma.protocolDocument.findMany({ orderBy: { sortOrder: "asc" } });
  return protocols.map((p) => ({
    ...p,
    language: p.language.toLowerCase() as AppLocale,
  }));
}

export async function dbCreateProtocol(data: {
  /**
   * Müştəridə əvvəlcədən yaradılan id — fayllar qeyd yaranmazdan əvvəl
   * bu id-nin qovluğuna yüklənir (bax: `ResourceManager`-in `keyField`-i).
   * Verilməsə Prisma öz cuid-ini yaradır.
   */
  id?: string;
  title: string;
  description?: string;
  fileSizeLabel?: string;
  fileUrl: string;
  access?: string;
  language?: string;
}) {
  const maxOrder = await prisma.protocolDocument.aggregate({ _max: { sortOrder: true } });
  return prisma.protocolDocument.create({
    data: {
      ...(data.id && { id: data.id }),
      title: data.title,
      description: data.description,
      fileSizeLabel: data.fileSizeLabel || "—",
      fileUrl: data.fileUrl,
      access: data.access || "download",
      language: (data.language?.toUpperCase() as ArticleLanguage) || ArticleLanguage.AZ,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateProtocol(id: string, data: Record<string, string>) {
  const existing =
    data.fileUrl && (await prisma.protocolDocument.findUnique({ where: { id }, select: { fileUrl: true } }));

  const updated = await prisma.protocolDocument.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.fileSizeLabel && { fileSizeLabel: data.fileSizeLabel }),
      ...(data.fileUrl && { fileUrl: data.fileUrl }),
      ...(data.access && { access: data.access }),
      ...(data.language && { language: data.language.toUpperCase() as ArticleLanguage }),
    },
  });

  /* Fayl əvəz olunubsa köhnəsi R2-də yetim qalmasın */
  if (existing && existing.fileUrl !== data.fileUrl) {
    await removeStoredFile(existing.fileUrl);
  }

  return updated;
}

export async function dbDeleteProtocol(id: string) {
  const existing = await prisma.protocolDocument.findUnique({ where: { id }, select: { fileUrl: true } });
  const deleted = await prisma.protocolDocument.delete({ where: { id } });

  if (existing) {
    /* Köhnə qeydlərin faylı hələ ümumi qovluqdadır — birbaşa silinir */
    await removeStoredFile(existing.fileUrl);

    /* Yeni qeydlərin öz qovluğu var — məqalədə olduğu kimi bütöv silinir.
     * Qovluq boşdursa/yoxdursa `removePrefix` sadəcə heç nə tapmır. */
    const driver = storage();
    if (driver) {
      try {
        await driver.removePrefix(prefixOf({ kind: "protocol", protocolKey: id }));
      } catch (error) {
        console.error("[protocols] Sənəd qovluğu silinə bilmədi:", error);
      }
    }
  }

  return deleted;
}
