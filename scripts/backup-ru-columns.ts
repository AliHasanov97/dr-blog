/**
 * Bir dəfəlik skript: `prisma db push` KÖHNƏ `*Ru` sütunları silməzdən
 * ƏVVƏL onların dəyərlərini yerli JSON fayla köçürür (bax:
 * `scripts/restore-translations.ts` — bu backup-ı `translations` JSON
 * sahəsinə yazan ikinci skript).
 *
 * İşlətmək: DATABASE_URL=... npx tsx scripts/backup-ru-columns.ts
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.$queryRawUnsafe<
    { id: string; nameRu: string | null }[]
  >(`SELECT id, "nameRu" FROM categories WHERE "nameRu" IS NOT NULL AND "nameRu" != ''`);

  const faqItems = await prisma.$queryRawUnsafe<
    { id: string; questionRu: string | null; answerRu: string | null }[]
  >(
    `SELECT id, "questionRu", "answerRu" FROM faq_items WHERE ("questionRu" IS NOT NULL AND "questionRu" != '') OR ("answerRu" IS NOT NULL AND "answerRu" != '')`,
  );

  const doctorProfiles = await prisma.$queryRawUnsafe<
    {
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
    }[]
  >(
    `SELECT id, "shortTitleRu", "fullTitleRu", "taglineRu", "biographyRu", "quoteRu", "credentialsRu", "statsRu", "educationRu", "researchAreasRu" FROM doctor_profiles`,
  );

  const backup = { categories, faqItems, doctorProfiles };
  const outPath = join(__dirname, "ru-columns-backup.json");
  writeFileSync(outPath, JSON.stringify(backup, null, 2), "utf-8");

  console.log(`Kateqoriyalar (RU adı olan): ${categories.length}`);
  console.log(`FAQ (RU sual/cavab olan): ${faqItems.length}`);
  console.log(`Həkim profilləri: ${doctorProfiles.length}`);
  console.log(`Backup yazıldı: ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
