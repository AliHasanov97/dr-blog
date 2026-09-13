import { ArticleLanguage } from "@prisma/client";

/**
 * Sayt dilini Prisma-nın `ArticleLanguage` enum-una çevirir.
 *
 * Məqalə, video və PDF sənədi bu enum-u paylaşır — hər qeyd TƏK dildədir
 * (tərcümə ayrı qeyddir), ona görə publik saytda göstərilən hər şey cari
 * sayt dilinə görə süzülür.
 */
export function toArticleLanguage(locale?: string): ArticleLanguage | undefined {
  if (locale === "az") return ArticleLanguage.AZ;
  if (locale === "ru") return ArticleLanguage.RU;
  return undefined;
}
