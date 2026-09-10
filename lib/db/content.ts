import { prisma } from "@/lib/prisma";
import type { ProtocolDocument, VideoItem } from "@/lib/types";

export async function dbGetVideos(): Promise<VideoItem[]> {
  const videos = await prisma.video.findMany({
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

export async function dbGetProtocols(): Promise<ProtocolDocument[]> {
  const protocols = await prisma.protocolDocument.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return protocols.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    fileSizeLabel: p.fileSizeLabel ?? "",
    fileUrl: p.fileUrl,
  }));
}
