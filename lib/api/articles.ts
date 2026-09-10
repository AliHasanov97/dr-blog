import { homeFilters } from "@/lib/mock/categories";
import { store } from "@/lib/mock/store";
import { mockTopRead } from "@/lib/mock/content";
import type {
  Article,
  ArticleSummary,
  Category,
  Comment,
  Paginated,
  SearchIndexItem,
} from "@/lib/types";
import { USE_MOCK } from "./config";
import { mockResponse } from "./http";
import {
  dbGetArticles,
  dbGetFeaturedArticle,
  dbGetArticleBySlug,
  dbGetArticleSlugs,
  dbGetRelatedArticles,
  dbGetComments,
  dbPostComment,
  type NewCommentInput,
  dbGetCategories,
  dbGetSearchIndex,
} from "@/lib/db";
import { dbGetVideos, dbGetProtocols } from "@/lib/db/content";

export interface ArticleQuery {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  excludeSlug?: string;
  page?: number;
  pageSize?: number;
}

/** Publik saytda yalnız dərc olunmuş məqalələr görünür */
function publishedArticles(): Article[] {
  return store.articles.filter((a) => a.status === "published");
}

function toSummary(article: Article): ArticleSummary {
  const { blocks, references, tableOfContents, ...summary } = article;
  void blocks;
  void references;
  void tableOfContents;
  return summary;
}

function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

/** Məqalə siyahısı — filtr və səhifələmə ilə */
export async function getArticles(
  query: ArticleQuery = {},
): Promise<Paginated<ArticleSummary>> {
  const {
    categorySlug,
    search,
    featuredOnly,
    excludeSlug,
    page = 1,
    pageSize = 20,
  } = query;

  if (!USE_MOCK) {
    return dbGetArticles({
      categorySlug,
      search,
      featuredOnly,
      excludeSlug,
      page,
      pageSize,
    });
  }

  let items = publishedArticles().map(toSummary);

  if (categorySlug && categorySlug !== "hamisi") {
    items = items.filter((a) => a.category.slug === categorySlug);
  }
  if (featuredOnly) {
    items = items.filter((a) => a.isFeatured);
  }
  if (search) {
    const q = search.toLocaleLowerCase("az");
    items = items.filter(
      (a) =>
        a.title.toLocaleLowerCase("az").includes(q) ||
        a.excerpt.toLocaleLowerCase("az").includes(q) ||
        (a.tags ?? []).some((t) => t.toLocaleLowerCase("az").includes(q)),
    );
  }

  items = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return mockResponse(paginate(items, page, pageSize));
}

/** Ana səhifə üçün son məqalələr */
export async function getLatestArticles(limit = 3): Promise<ArticleSummary[]> {
  const result = await getArticles({ page: 1, pageSize: limit });
  return result.items;
}

/** Ayın əsas məqaləsi */
export async function getFeaturedArticle(): Promise<ArticleSummary | null> {
  if (!USE_MOCK) {
    return dbGetFeaturedArticle();
  }
  const featured = publishedArticles().find((a) => a.isFeatured);
  return mockResponse(featured ? toSummary(featured) : null);
}

/** Slug üzrə tam məqalə */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!USE_MOCK) {
    return dbGetArticleBySlug(slug);
  }
  return mockResponse(publishedArticles().find((a) => a.slug === slug) ?? null);
}

/** Bütün slug-lar — generateStaticParams üçün */
export async function getArticleSlugs(): Promise<string[]> {
  if (!USE_MOCK) {
    return dbGetArticleSlugs();
  }
  return mockResponse(publishedArticles().map((a) => a.slug));
}

/** Oxşar məqalələr */
export async function getRelatedArticles(
  slug: string,
  limit = 2,
): Promise<ArticleSummary[]> {
  if (!USE_MOCK) {
    return dbGetRelatedArticles(slug, limit);
  }
  const list = publishedArticles();
  const current = list.find((a) => a.slug === slug);
  const related = list
    .filter(
      (a) => a.slug !== slug && a.category.slug === current?.category.slug,
    )
    .slice(0, limit)
    .map(toSummary);
  return mockResponse(related);
}

/** Məqalənin şərhləri */
export async function getComments(slug: string): Promise<Comment[]> {
  if (!USE_MOCK) {
    return dbGetComments(slug);
  }
  // Yalnız təsdiqlənmiş şərhlər göstərilir; cavablar ana şərhin altına yığılır
  const approved = store.comments.filter(
    (c) => c.articleSlug === slug && c.status === "approved",
  );
  const roots = approved.filter((c) => !c.parentId);
  return mockResponse(
    roots.map((root) => ({
      ...root,
      replies: approved.filter((c) => c.parentId === root.id),
    })),
  );
}

/**
 * Yeni şərh göndərilməsi.
 *
 * DİQQƏT: bu funksiya yalnız serverdə çağırıla bilər (Prisma-ya gedir).
 * Səhifələr onu birbaşa deyil, `app/(site)/meqaleler/[slug]/actions.ts`
 * içindəki server action vasitəsilə işlədir.
 */
export async function postComment(
  input: NewCommentInput,
): Promise<Comment> {
  if (!USE_MOCK) {
    return dbPostComment(input);
  }
  const initials = input.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return mockResponse<Comment>({
    id: `cm-local-${Date.now()}`,
    authorName: input.authorName,
    authorInitials: initials || "S",
    authorRole: "Oxucu",
    createdAtLabel: "İndicə",
    body: input.body,
    likeCount: 0,
  });
}

/* --- Taksonomiya və köməkçi kontent --- */

export async function getCategories(): Promise<Category[]> {
  if (!USE_MOCK) {
    return dbGetCategories();
  }
  return mockResponse(store.categories);
}

export async function getHomeFilters(): Promise<Category[]> {
  return mockResponse(homeFilters);
}

export const getTopReadArticles = () => mockResponse(mockTopRead);

export async function getVideos() {
  if (!USE_MOCK) {
    return dbGetVideos();
  }
  return mockResponse(store.videos);
}

export async function getProtocols() {
  if (!USE_MOCK) {
    return dbGetProtocols();
  }
  return mockResponse(store.protocols);
}

/**
 * Header axtarışı üçün yüngül indeks.
 * Server komponentdə çağırılır və `SiteHeader`-ə prop kimi ötürülür,
 * beləliklə bütün məqalə mətni klient bundle-ına düşmür.
 */
export async function getSearchIndex(
  query?: string,
  limit = 8,
): Promise<SearchIndexItem[]> {
  if (!USE_MOCK) {
    return dbGetSearchIndex(query, limit);
  }
  const q = query?.trim().toLocaleLowerCase("az");
  const all = publishedArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    categoryName: a.category.name,
    readMinutes: a.readMinutes,
    tags: a.tags,
  }));
  const filtered = q
    ? all.filter(
        (a) =>
          a.title.toLocaleLowerCase("az").includes(q) ||
          a.excerpt.toLocaleLowerCase("az").includes(q) ||
          a.categoryName.toLocaleLowerCase("az").includes(q) ||
          (a.tags ?? []).some((t) => t.toLocaleLowerCase("az").includes(q)),
      )
    : all;
  return mockResponse(filtered.slice(0, limit));
}
