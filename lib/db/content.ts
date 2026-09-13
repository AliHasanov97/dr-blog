import { prisma } from "@/lib/prisma";
import type { ProtocolDocument, VideoItem } from "@/lib/types";
import { toArticleLanguage } from "@/lib/db/language";

export async function dbGetVideos(locale?: string): Promise<VideoItem[]> {
  const videos = await prisma.video.findMany({
    where: { language: toArticleLanguage(locale) },
    orderBy: { sortOrder: "asc" },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description ?? "",
    thumbnailUrl: v.thumbnailUrl ?? "",
    kindLabel: v.kindLabel ?? "",
    url: v.videoUrl,
  }));
}

export async function dbGetVideoById(id: string, locale?: string): Promise<VideoItem | null> {
  const v = await prisma.video.findFirst({
    where: { id, language: toArticleLanguage(locale) },
  });
  if (!v) return null;

  return {
    id: v.id,
    title: v.title,
    description: v.description ?? "",
    thumbnailUrl: v.thumbnailUrl ?? "",
    kindLabel: v.kindLabel ?? "",
    url: v.videoUrl,
  };
}

export async function dbGetProtocols(locale?: string): Promise<ProtocolDocument[]> {
  const protocols = await prisma.protocolDocument.findMany({
    where: { language: toArticleLanguage(locale) },
    orderBy: { sortOrder: "asc" },
  });

  return protocols.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    fileSizeLabel: p.fileSizeLabel ?? "",
    fileUrl: p.fileUrl,
    access: (p.access as "download" | "read" | "both" | null) ?? "download",
  }));
}
