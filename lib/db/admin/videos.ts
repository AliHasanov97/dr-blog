import { prisma } from "@/lib/prisma";

/**
 * Admin siyahısı üçün videolar.
 *
 * Xam Prisma sətri qaytarılmır: forma sahələri ilə eyni adlar lazımdır
 * (`url`, bazadakı `videoUrl` deyil), əks halda videonu redaktə edəndə
 * link sahəsi boş açılır. `Date` sahələri də cədvələ lazım deyil.
 */
export async function dbListVideos() {
  const videos = await prisma.video.findMany({ orderBy: { sortOrder: "asc" } });
  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description ?? "",
    thumbnailUrl: v.thumbnailUrl ?? "",
    kindLabel: v.kindLabel ?? "",
    url: v.videoUrl,
  }));
}

export async function dbCreateVideo(data: {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  kindLabel?: string;
}) {
  const maxOrder = await prisma.video.aggregate({ _max: { sortOrder: true } });
  return prisma.video.create({
    data: {
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl || "/images/video-ekg.svg",
      videoUrl: data.videoUrl,
      kindLabel: data.kindLabel || "Klinik Vebinar",
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateVideo(id: string, data: Record<string, string>) {
  return prisma.video.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.thumbnailUrl && { thumbnailUrl: data.thumbnailUrl }),
      ...(data.videoUrl && { videoUrl: data.videoUrl }),
      ...(data.kindLabel && { kindLabel: data.kindLabel }),
    },
  });
}

export async function dbDeleteVideo(id: string) {
  return prisma.video.delete({ where: { id } });
}
