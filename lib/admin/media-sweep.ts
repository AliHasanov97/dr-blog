import "server-only";
import { prisma } from "@/lib/prisma";
import { storage } from "./storage";
import { SETTINGS_KEY, normalizeSettings } from "@/lib/settings";
import type { ArticleBlock } from "@/lib/types";

export interface OrphanFile {
  /** R2 açarı — silmək üçün lazımdır */
  name: string;
  url: string;
  size: number;
  modified: number;
}

export interface OrphanScan {
  ready: boolean;
  /** R2-də tapılan bütün fayl sayı */
  scanned: number;
  /** Bazada işlədilən unikal ünvan sayı */
  referenced: number;
  /** Silinməyə namizəd fayllar — HƏLƏ SİLİNMƏYİB, təsdiq gözləyir */
  orphans: OrphanFile[];
}

/** Şəkil/sənəd bloklarından R2 ünvanlarını çıxarır */
function urlsFromBlocks(blocks: ArticleBlock[]): string[] {
  const urls: string[] = [];
  for (const block of blocks) {
    if (block.type === "image" && block.src) urls.push(block.src);
    if (block.type === "file" && block.url) urls.push(block.url);
    if ((block.type === "slider" || block.type === "imageGroup") && Array.isArray(block.items)) {
      for (const item of block.items) if (item?.src) urls.push(item.src);
    }
  }
  return urls;
}

/**
 * Bazada hardasa işlədilən bütün fayl ünvanları.
 * Bunlardan kənarda R2-də qalan hər şey «yetim» sayılır.
 *
 * DİQQƏT: bazaya yeni bir «şəkil/fayl ünvanı» sahəsi əlavə olunanda bu
 * siyahı da yenilənməlidir — əks halda həmin sahə istifadə olunsa belə
 * yetim sayılıb silinmə namizədi kimi göstərilə bilər.
 */
async function collectReferencedUrls(): Promise<Set<string>> {
  const refs = new Set<string>();

  const [protocols, videos, doctors, articles, siteSetting, comments, users, offices] =
    await Promise.all([
      prisma.protocolDocument.findMany({ select: { fileUrl: true } }),
      prisma.video.findMany({ select: { thumbnailUrl: true, videoUrl: true } }),
      prisma.doctorProfile.findMany({ select: { avatarUrl: true, portraitUrl: true } }),
      prisma.article.findMany({
        select: { coverImageUrl: true, heroImageUrl: true, blocks: true },
      }),
      prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY }, select: { value: true } }),
      prisma.comment.findMany({ select: { authorAvatarUrl: true } }),
      prisma.user.findMany({ select: { avatarUrl: true } }),
      prisma.officeLocation.findMany({ select: { mapImageUrl: true } }),
    ]);

  for (const p of protocols) if (p.fileUrl) refs.add(p.fileUrl);
  for (const v of videos) {
    if (v.thumbnailUrl) refs.add(v.thumbnailUrl);
    if (v.videoUrl) refs.add(v.videoUrl);
  }
  for (const d of doctors) {
    if (d.avatarUrl) refs.add(d.avatarUrl);
    if (d.portraitUrl) refs.add(d.portraitUrl);
  }
  for (const a of articles) {
    if (a.coverImageUrl) refs.add(a.coverImageUrl);
    if (a.heroImageUrl) refs.add(a.heroImageUrl);
    for (const url of urlsFromBlocks((a.blocks as unknown as ArticleBlock[]) ?? [])) {
      refs.add(url);
    }
  }
  if (siteSetting?.value) {
    const logo = normalizeSettings(siteSetting.value).loadingLogo;
    if (logo) refs.add(logo);
  }
  for (const c of comments) if (c.authorAvatarUrl) refs.add(c.authorAvatarUrl);
  for (const u of users) if (u.avatarUrl) refs.add(u.avatarUrl);
  for (const o of offices) if (o.mapImageUrl) refs.add(o.mapImageUrl);

  return refs;
}

/**
 * R2-də heç bir bazada qeydə bağlı olmayan faylları TAPIR — HEÇ NƏ SİLMİR.
 * Admin nəticəni gözdən keçirib `deleteOrphanFiles`-ə ötürməlidir.
 *
 * Yaşına görə filtr yoxdur — yenicə yüklənmiş fayl da siyahıya düşə bilər
 * (məs. hələ saxlanmamış bir tərtib). Nəticə "əvvəlcə göstər, sonra
 * təsdiqlə" axını ilə istifadə olunmalıdır: hər faylın tarixi göstərilir,
 * admin şübhəlini seçimdən çıxarır.
 */
export async function findOrphanedMedia(): Promise<OrphanScan> {
  const driver = storage();
  if (!driver) {
    return { ready: false, scanned: 0, referenced: 0, orphans: [] };
  }

  const [referenced, allFiles] = await Promise.all([
    collectReferencedUrls(),
    driver.listAll(),
  ]);

  const orphans = allFiles
    .filter((file) => !referenced.has(file.url))
    .sort((a, b) => b.modified - a.modified);

  return {
    ready: true,
    scanned: allFiles.length,
    referenced: referenced.size,
    orphans,
  };
}

/**
 * Verilmiş faylları silir — yalnız admin `findOrphanedMedia` nəticəsini
 * gözdən keçirib təsdiqlədikdən sonra çağrılmalıdır.
 *
 * Silinməzdən əvvəl bazadakı istinadlar YENİDƏN oxunur: yoxlama ilə təsdiq
 * arasında keçən vaxtda (məs. admin başqa sekmədə həmin faylı bir yerə
 * bağlayıbsa) ünvan artıq istinad olunursa, o fayl siyahıdan çıxarılır və
 * silinmir — təsdiqlənmiş siyahı kor-koranə icra olunmur.
 */
export async function deleteOrphanFiles(
  items: { name: string; url: string }[],
): Promise<{ deleted: number; kept: number }> {
  const driver = storage();
  if (!driver || items.length === 0) return { deleted: 0, kept: 0 };

  const referenced = await collectReferencedUrls();
  let deleted = 0;
  let kept = 0;

  for (const item of items) {
    if (referenced.has(item.url)) {
      kept++;
      continue;
    }
    const ok = await driver.remove(item.name);
    if (ok) deleted++;
  }

  return { deleted, kept };
}
