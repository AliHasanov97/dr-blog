import { Prisma, ArticleStatus } from "@prisma/client";
import type { AdminArticle } from "@/lib/mock/store";
import type { Author } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { dbGetArticleAuthor } from "@/lib/db/doctor";
import { slugify } from "./slugify";

/** DoctorProfile hələ yaradılmayıbsa istifadə olunan ehtiyat müəllif */
const FALLBACK_AUTHOR: Author = {
  id: "doctor",
  fullName: "Həkim",
  title: "",
  avatarUrl: "",
  isVerified: false,
};

/**
 * Admin siyahısı üçün məqalələr.
 *
 * `include` əvəzinə `select` işlədilir: `include` bütün sahələri gətirir,
 * o cümlədən məqalənin tam mətnini (`blocks`), istinadları və məzmun
 * siyahısını. Siyahı onları göstərmir, amma hamısı brauzerə göndərilirdi —
 * məqalə sayı artdıqca səhifə ölçüsü sürətlə böyüyürdü.
 */
export interface AdminArticleQuery {
  /** Başlıq və ya qısa təsvir üzrə axtarış */
  search?: string;
  /** «all» — bütün vəziyyətlər */
  status?: "all" | "published" | "draft" | "review";
  page?: number;
  pageSize?: number;
}

export interface AdminArticleListResult {
  items: AdminArticle[];
  total: number;
  page: number;
  totalPages: number;
  /** Vəziyyət süzgəclərinin sayğacları — filtrə görə dəyişmir */
  counts: { all: number; published: number; draft: number; review: number };
}

export async function dbListArticles(
  query: AdminArticleQuery = {},
): Promise<AdminArticleListResult> {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize ?? 20)));
  const search = query.search?.trim();

  const where: Prisma.ArticleWhereInput = {};
  if (query.status && query.status !== "all") {
    where.status = query.status.toUpperCase() as ArticleStatus;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  /*
   * Süzgəc düymələrindəki saylar bütün baza üzrə hesablanır — yüklənmiş
   * səhifəyə görə deyil. Əks halda «Qaralama (2)» yazısı yalnız cari
   * səhifədəki qaralamaları sayardı.
   */
  const [total, published, draft, review, allCount, author] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
    prisma.article.count({ where: { status: ArticleStatus.REVIEW } }),
    prisma.article.count(),
    dbGetArticleAuthor(),
  ]);
  const resolvedAuthor = author ?? FALLBACK_AUTHOR;

  const articles = await prisma.article.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      viewCount: true,
      likeCount: true,
      isFeatured: true,
      isPeerReviewed: true,
      coverImageUrl: true,
      heroImageUrl: true,
      showTableOfContents: true,
      allowComments: true,
      reactionClear: true,
      reactionLearned: true,
      reactionQuestion: true,
      category: true,
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const items = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    status: a.status.toLowerCase() as "published" | "draft" | "review",
    category: {
      id: a.category.id,
      slug: a.category.slug,
      name: a.category.name,
      icon: a.category.icon,
    },
    /* Ayrıca Author cədvəli yoxdur — bütün məqalələr sayt həkimini göstərir */
    author: resolvedAuthor,
    coverImageUrl: a.coverImageUrl,
    heroImageUrl: a.heroImageUrl,
    showTableOfContents: a.showTableOfContents,
    allowComments: a.allowComments,
    publishedAt: a.publishedAt?.toISOString().split("T")[0] ?? "",
    publishedAtLabel: a.publishedAt
      ? new Intl.DateTimeFormat("az", { day: "numeric", month: "long", year: "numeric" }).format(a.publishedAt)
      : "",
    viewCount: a.viewCount,
    likeCount: a.likeCount,
    commentCount: a._count.comments,
    reactions: {
      clear: a.reactionClear,
      learned: a.reactionLearned,
      question: a.reactionQuestion,
    },
    isFeatured: a.isFeatured,
    isPeerReviewed: a.isPeerReviewed,
    /* Siyahı məqalənin mətnini göstərmir — boş saxlanılır ki, brauzerə
     * göndərilməsin. Redaktə səhifəsi `dbGetArticle` ilə tam qeydi alır. */
    tableOfContents: [],
    blocks: [],
    references: [],
    updatedAt: a.updatedAt.toISOString(),
  }));

  return {
    items: items as AdminArticle[],
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    counts: { all: allCount, published, draft, review },
  };
}

export async function dbGetArticle(id: string) {
  const [article, author] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { comments: true } },
      },
    }),
    dbGetArticleAuthor(),
  ]);

  if (!article) return null;

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    status: article.status.toLowerCase() as "published" | "draft" | "review",
    category: {
      id: article.category.id,
      slug: article.category.slug,
      name: article.category.name,
      icon: article.category.icon,
    },
    /* Ayrıca Author cədvəli yoxdur — sayt həkimindən hesablanır */
    author: author ?? FALLBACK_AUTHOR,
    coverImageUrl: article.coverImageUrl,
    heroImageUrl: article.heroImageUrl,
    showTableOfContents: article.showTableOfContents,
    allowComments: article.allowComments,
    publishedAt: article.publishedAt?.toISOString().split("T")[0] ?? "",
    publishedAtLabel: article.publishedAt
      ? new Intl.DateTimeFormat("az", { day: "numeric", month: "long", year: "numeric" }).format(article.publishedAt)
      : "",
    viewCount: article.viewCount,
    likeCount: article.likeCount,
    reactions: {
      clear: article.reactionClear,
      learned: article.reactionLearned,
      question: article.reactionQuestion,
    },
    commentCount: article._count.comments,
    isFeatured: article.isFeatured,
    isPeerReviewed: article.isPeerReviewed,
    tableOfContents: article.tableOfContents,
    blocks: article.blocks,
    references: article.references,
    updatedAt: article.updatedAt.toISOString(),
  };
}

export async function dbCreateArticle(data: {
  slug: string;
  title: string;
  excerpt: string;
  categoryId: string;
  status?: string;
  publishedAt?: string;
  coverImageUrl?: string;
  heroImageUrl?: string;
  showTableOfContents?: boolean;
  allowComments?: boolean;
  isFeatured?: boolean;
  isPeerReviewed?: boolean;
  blocks?: any;
  tableOfContents?: any;
  references?: any;
}) {
  return prisma.article.create({
    data: {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      categoryId: data.categoryId,
      status: (data.status?.toUpperCase() as ArticleStatus) || ArticleStatus.DRAFT,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      coverImageUrl: data.coverImageUrl,
      heroImageUrl: data.heroImageUrl,
      showTableOfContents: data.showTableOfContents ?? true,
      allowComments: data.allowComments ?? true,
      isFeatured: data.isFeatured ?? false,
      isPeerReviewed: data.isPeerReviewed ?? false,
      blocks: data.blocks || [],
      tableOfContents: data.tableOfContents || [],
      references: data.references || [],
    },
  });
}

export async function dbUpdateArticle(id: string, data: Record<string, any>) {
  const updateData: any = {};

  if (data.title) updateData.title = data.title;
  if (data.slug) updateData.slug = slugify(data.slug);
  if (data.excerpt) updateData.excerpt = data.excerpt;
  if (data.categoryId) updateData.categoryId = data.categoryId;
  if (data.status) updateData.status = data.status.toUpperCase() as ArticleStatus;
  if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;
  if (data.heroImageUrl !== undefined) updateData.heroImageUrl = data.heroImageUrl;
  if (data.showTableOfContents !== undefined)
    updateData.showTableOfContents = data.showTableOfContents;
  if (data.allowComments !== undefined)
    updateData.allowComments = data.allowComments;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
  if (data.isPeerReviewed !== undefined) updateData.isPeerReviewed = data.isPeerReviewed;
  if (data.blocks) updateData.blocks = data.blocks;
  if (data.tableOfContents) updateData.tableOfContents = data.tableOfContents;
  if (data.references) updateData.references = data.references;
  if (data.publishedAt) updateData.publishedAt = new Date(data.publishedAt);

  return prisma.article.update({
    where: { id },
    data: updateData,
  });
}

export async function dbDeleteArticle(id: string) {
  return prisma.article.delete({ where: { id } });
}
