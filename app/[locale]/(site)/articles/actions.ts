"use server";

import { getArticles } from "@/lib/api";
import type { ArticleSummary } from "@/lib/types";

export interface ArticlePageRequest {
  /** Axtarış sorğusu (boş ola bilər) */
  query?: string;
  /** Kateqoriya slug-ı; «hamisi» — filtr yoxdur */
  categorySlug?: string;
  page: number;
  pageSize: number;
  /** Yuxarıda ayrıca göstərilən əsas məqalə — siyahıya düşmür */
  excludeSlug?: string;
  /** Sayt dili — verilməsə cari dilə görə süzülmür (bax: `getArticles`) */
  locale?: string;
}

export interface ArticlePageResult {
  items: ArticleSummary[];
  /** Filtrə uyğun ümumi say — «daha çox» düyməsi buna görə göstərilir */
  total: number;
  page: number;
  totalPages: number;
}

/** Səhifə başına icazə verilən ən böyük say — kənardan gələn dəyər məhdudlaşır */
const MAX_PAGE_SIZE = 50;

/**
 * Məqalə kataloqunun səhifələnməsi və axtarışı.
 *
 * Filtrləmə serverdə aparılır: əvvəllər bütün iş brauzerdə görülürdü, yəni
 * yalnız ilk yüklənən məqalələr arasında axtarış gedirdi. Məqalə sayı
 * artdıqca (məsələn 180) qalanları heç cür tapılmırdı.
 */
export async function fetchArticlePage(
  request: ArticlePageRequest,
): Promise<ArticlePageResult> {
  const page = Math.max(1, Math.floor(request.page) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(request.pageSize) || 10),
  );
  const search = request.query?.trim() || undefined;
  const categorySlug =
    request.categorySlug && request.categorySlug !== "hamisi"
      ? request.categorySlug
      : undefined;

  try {
    const result = await getArticles(
      {
        search,
        categorySlug,
        page,
        pageSize,
        excludeSlug: request.excludeSlug || undefined,
      },
      request.locale,
    );
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  } catch {
    return { items: [], total: 0, page, totalPages: 1 };
  }
}
