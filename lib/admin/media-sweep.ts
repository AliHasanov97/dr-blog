import "server-only";
import { prisma } from "@/lib/prisma";
import { storage } from "./storage";
import { SETTINGS_KEY, normalizeSettings } from "@/lib/settings";
import type { ArticleBlock } from "@/lib/types";

export interface SweepResult {
  ready: boolean;
  /** R2-də tapılan bütün fayl sayı */
  scanned: number;
  /** Bazada işlədilən unikal ünvan sayı */
  referenced: number;
  deleted: number;
  /** Silinməyib — yaxınlarda yüklənib, hələ heç bir qeydə bağlanmamış ola bilər */
  skippedRecent: number;
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
 */
async function collectReferencedUrls(): Promise<Set<string>> {
  const refs = new Set<string>();

  const [protocols, videos, doctors, articles, siteSetting] = await Promise.all([
    prisma.protocolDocument.findMany({ select: { fileUrl: true } }),
    prisma.video.findMany({ select: { thumbnailUrl: true, videoUrl: true } }),
    prisma.doctorProfile.findMany({ select: { avatarUrl: true, portraitUrl: true } }),
    prisma.article.findMany({
      select: { coverImageUrl: true, heroImageUrl: true, blocks: true },
    }),
    prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY }, select: { value: true } }),
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

  return refs;
}

/**
 * Fayl yüklənəndən dərhal sonra hələ heç bir qeydə bağlanmaya bilər —
 * admin panelində forma açıq qalıb, hələ "saxla" düyməsinə basılmayıb.
 * Bu müddətdən köhnə olmayan «yetim» fayllara toxunulmur.
 */
const GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * R2-də heç bir bazada qeydə bağlı olmayan faylları tapıb silir.
 * Tək-tək əməliyyatlarda (məqalə/protokol/video redaktəsi) köhnə fayl
 * dərhal silinir — bu sweep onların qaçırdığı halları (məs. məqalə
 * içindən bir şəkli silib əvəzinə başqasını qoymaq) təmizləyir.
 */
export async function sweepOrphanedMedia(): Promise<SweepResult> {
  const driver = storage();
  if (!driver) {
    return { ready: false, scanned: 0, referenced: 0, deleted: 0, skippedRecent: 0 };
  }

  const [referenced, allFiles] = await Promise.all([
    collectReferencedUrls(),
    driver.listAll(),
  ]);

  const now = Date.now();
  let deleted = 0;
  let skippedRecent = 0;

  for (const file of allFiles) {
    if (referenced.has(file.url)) continue;
    if (now - file.modified < GRACE_MS) {
      skippedRecent++;
      continue;
    }
    const ok = await driver.remove(file.name);
    if (ok) deleted++;
  }

  return {
    ready: true,
    scanned: allFiles.length,
    referenced: referenced.size,
    deleted,
    skippedRecent,
  };
}
