/**
 * Bir dəfəlik skript: `scripts/backup-ru-columns.ts`-in yazdığı backup-ı
 * oxuyub, yeni `translations` JSON sahəsinə köçürür. `prisma db push`
 * (translations sxem dəyişikliyi) tətbiq olunduqdan VƏ `prisma generate`
 * yeni sxemə uyğun işlədikdən SONRA işə salınmalıdır.
 *
 * İşlətmək: DATABASE_URL=... npx tsx scripts/restore-translations.ts
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

interface Backup {
  categories: { id: string; nameRu: string | null }[];
  faqItems: { id: string; questionRu: string | null; answerRu: string | null }[];
  doctorProfiles: {
    id: string;
    shortTitleRu: string | null;
    fullTitleRu: string | null;
    taglineRu: string | null;
    biographyRu: string | null;
    quoteRu: string | null;
    credentialsRu: unknown;
    statsRu: unknown;
    educationRu: unknown;
    researchAreasRu: unknown;
  }[];
}

function nonEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

async function main() {
  const backupPath = join(__dirname, "ru-columns-backup.json");
  const backup = JSON.parse(readFileSync(backupPath, "utf-8")) as Backup;

  let categoriesUpdated = 0;
  for (const c of backup.categories) {
    if (!nonEmpty(c.nameRu)) continue;
    await prisma.category.update({
      where: { id: c.id },
      data: { translations: { ru: { name: c.nameRu } } },
    });
    categoriesUpdated++;
  }

  let faqUpdated = 0;
  for (const f of backup.faqItems) {
    const ru: Record<string, string> = {};
    if (nonEmpty(f.questionRu)) ru.question = f.questionRu!;
    if (nonEmpty(f.answerRu)) ru.answer = f.answerRu!;
    if (Object.keys(ru).length === 0) continue;
    await prisma.faqItem.update({
      where: { id: f.id },
      data: { translations: { ru } },
    });
    faqUpdated++;
  }

  let doctorsUpdated = 0;
  for (const d of backup.doctorProfiles) {
    const ru: Record<string, unknown> = {};
    if (nonEmpty(d.shortTitleRu)) ru.shortTitle = d.shortTitleRu;
    if (nonEmpty(d.fullTitleRu)) ru.fullTitle = d.fullTitleRu;
    if (nonEmpty(d.taglineRu)) ru.tagline = d.taglineRu;
    if (nonEmpty(d.biographyRu)) ru.biography = d.biographyRu;
    if (nonEmpty(d.quoteRu)) ru.quote = d.quoteRu;
    if (nonEmpty(d.credentialsRu)) ru.credentials = d.credentialsRu;
    if (nonEmpty(d.statsRu)) ru.stats = d.statsRu;
    if (nonEmpty(d.educationRu)) ru.education = d.educationRu;
    if (nonEmpty(d.researchAreasRu)) ru.researchAreas = d.researchAreasRu;
    if (Object.keys(ru).length === 0) continue;
    await prisma.doctorProfile.update({
      where: { id: d.id },
      data: { translations: { ru } as object },
    });
    doctorsUpdated++;
  }

  console.log(`Kateqoriyalar köçürüldü: ${categoriesUpdated}`);
  console.log(`FAQ köçürüldü: ${faqUpdated}`);
  console.log(`Həkim profilləri köçürüldü: ${doctorsUpdated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
