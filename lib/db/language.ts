import { ArticleLanguage } from "@prisma/client";

/**
 * Sayt dilini Prisma-nın `ArticleLanguage` enum-una çevirir.
 *
 * Məqalə, video və PDF sənədi bu enum-u paylaşır — hər qeyd TƏK dildədir
 * (tərcümə ayrı qeyddir), ona görə publik saytda göstərilən hər şey cari
 * sayt dilinə görə süzülür.
 *
 * Enum dəyəri = dil kodunun böyük hərflə yazılışı (az→AZ, ru→RU, tr→TR) —
 * bu konvensiya saxlandıqca yeni dil əlavə etmək bu funksiyaya TOXUNMAQ
 * TƏLƏB ETMİR, yalnız `prisma/schema.prisma`-dakı enuma bir sətir yazılır.
 */
export function toArticleLanguage(locale?: string): ArticleLanguage | undefined {
  if (!locale) return undefined;
  return ArticleLanguage[locale.toUpperCase() as keyof typeof ArticleLanguage];
}
