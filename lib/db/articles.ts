import { prisma } from "@/lib/prisma";
import type {
  Article,
  ArticleSummary,
  Category,
  Comment,
  Paginated,
  SearchIndexItem,
} from "@/lib/types";
import { ArticleStatus, CommentStatus, Prisma } from "@prisma/client";
import { buildToc, normalizeHeadings } from "@/lib/article-toc";
import { dbGetSiteSettings } from "@/lib/db/admin";

export interface ArticleQuery {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  /** Siyahıdan kənarda saxlanılacaq məqalə (yuxarıda ayrıca göstərilən) */
  excludeSlug?: string;
  page?: number;
  pageSize?: number;
}

function toSummary(article: any): ArticleSummary {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: {
      id: article.category.id,
      slug: article.category.slug,
      name: article.category.name,
      icon: article.category.icon ?? undefined,
    },
    coverImageUrl: article.coverImageUrl ?? undefined,
    publishedAt: article.publishedAt?.toISOString().split("T")[0] ?? "",
    publishedAtLabel: article.publishedAt
      ? new Intl.DateTimeFormat("az", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(article.publishedAt)
      : "",
    readMinutes: article.readMinutes,
    referenceCount: Array.isArray(article.references) ? article.references.length : 0,
    referenceLabel: Array.isArray(article.references)
      ? `${article.references.length} istinad`
      : undefined,
    viewCount: article.viewCount,
    isFeatured: article.isFeatured,
    isPeerReviewed: article.isPeerReviewed,
    badges: article.badges as ArticleSummary["badges"],
    tags: article.tags?.map((t: any) => t.name) ?? [],
    author: {
      id: article.author.id,
      fullName: article.author.fullName,
      title: article.author.title,
      avatarUrl: article.author.avatarUrl ?? "",
      isVerified: article.author.isVerified,
    },
    doctorNote: article.doctorNote ?? undefined,
  };
}

function toFullArticle(article: any): Article {
  const summary = toSummary(article);
  /*
   * Məzmun siyahısı bazadakı `tableOfContents` sahəsindən deyil, bloklardan
   * hesablanır. Səbəb: o sahə yalnız admin panelindən yadda saxlayanda
   * yenilənirdi — seed data və köhnə qeydlərdə mətnlə uyğun gəlmirdi
   * (məsələn siyahıda 4 bölmə, mətndə 1 başlıq). İndi tək mənbə mətnin
   * özüdür. Bloklar da normallaşdırılır ki, başlıqların `id`-si siyahıdakı
   * linklərlə eyni olsun.
   */
  const blocks = normalizeHeadings(
    ((article.blocks as Article["blocks"]) ?? []),
  );
  return {
    ...summary,
    heroImageUrl: article.heroImageUrl ?? undefined,
    heroCaption: article.heroCaption ?? undefined,
    journalLabel: article.journalLabel ?? undefined,
    verificationNote: article.verificationNote ?? undefined,
    allowComments: article.allowComments !== false,
    tableOfContents: article.showTableOfContents === false ? [] : buildToc(blocks),
    blocks,
    references: (article.references as Article["references"]) ?? [],
    likeCount: article.likeCount,
    commentCount: article._count?.comments ?? 0,
  };
}

export async function dbGetArticles(
  query: ArticleQuery = {}
): Promise<Paginated<ArticleSummary>> {
  const {
    categorySlug,
    search,
    featuredOnly,
    excludeSlug,
    page = 1,
    pageSize = 20,
  } = query;

  const where: any = {
    status: ArticleStatus.PUBLISHED,
  };

  if (categorySlug && categorySlug !== "hamisi") {
    where.category = { slug: categorySlug };
  }

  if (featuredOnly) {
    where.isFeatured = true;
  }

  /* «Ayın Əsas Məqaləsi» siyahının üstündə ayrıca göstərilir. Onu burada,
   * yəni sorğuda kənarlaşdırmaq lazımdır — nəticəni sonradan brauzerdə
   * süzsək, səhifədə gözləniləndən az kart qalır və say da uyğun gəlmir. */
  if (excludeSlug) {
    where.slug = { not: excludeSlug };
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        author: true,
        tags: true,
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items: articles.map(toSummary),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function dbGetFeaturedArticle(): Promise<ArticleSummary | null> {
  const article = await prisma.article.findFirst({
    where: {
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
    },
    include: {
      category: true,
      author: true,
      tags: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  return article ? toSummary(article) : null;
}

export async function dbGetArticleBySlug(slug: string): Promise<Article | null> {
  const article = await prisma.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
    },
    include: {
      category: true,
      author: true,
      tags: true,
      _count: {
        select: { comments: { where: { status: CommentStatus.APPROVED } } },
      },
    },
  });

  return article ? toFullArticle(article) : null;
}

/**
 * Build zamanı əvvəlcədən qurulacaq məqalə ünvanları.
 *
 * Bütün məqalələr deyil, yalnız ən yeniləri qaytarılır. Səbəb: hər səhifə
 * ayrıca prosesdə render olunur və hər biri bazaya öz bağlantısını açır —
 * məqalə sayı artanda PostgreSQL «too many clients» xətası verib build-i
 * dayandırır. Siyahıya düşməyən məqalələr ilk açılışda qurulur və ISR ilə
 * keşlənir, yəni oxucu üçün fərq görünmür.
 */
export async function dbGetArticleSlugs(limit = 20): Promise<string[]> {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map((a) => a.slug);
}

export async function dbGetRelatedArticles(
  slug: string,
  limit = 2
): Promise<ArticleSummary[]> {
  const current = await prisma.article.findUnique({
    where: { slug },
    select: { categoryId: true },
  });

  if (!current) return [];

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      categoryId: current.categoryId,
      slug: { not: slug },
    },
    include: {
      category: true,
      author: true,
      tags: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return articles.map(toSummary);
}

export async function dbGetComments(slug: string): Promise<Comment[]> {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!article) return [];

  const comments = await prisma.comment.findMany({
    where: {
      articleId: article.id,
      status: CommentStatus.APPROVED,
    },
    orderBy: { createdAt: "desc" },
  });

  // Build tree structure
  const roots = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);

  return roots.map((root) => ({
    id: root.id,
    authorName: root.authorName,
    authorInitials: root.authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    authorRole: root.authorRole,
    authorAvatarUrl: root.authorAvatarUrl ?? undefined,
    isAuthorVerified: root.isAuthorVerified,
    isDoctorReply: root.isDoctorReply,
    createdAtLabel: new Intl.DateTimeFormat("az", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(root.createdAt),
    body: root.body,
    likeCount: root.likeCount,
    replies: replies
      .filter((r) => r.parentId === root.id)
      .map((reply) => ({
        id: reply.id,
        authorName: reply.authorName,
        authorInitials: reply.authorName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        authorRole: reply.authorRole,
        authorAvatarUrl: reply.authorAvatarUrl ?? undefined,
        isAuthorVerified: reply.isAuthorVerified,
        isDoctorReply: reply.isDoctorReply,
        createdAtLabel: new Intl.DateTimeFormat("az", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(reply.createdAt),
        body: reply.body,
        likeCount: reply.likeCount,
      })),
  }));
}

export interface NewCommentInput {
  slug: string;
  body: string;
  authorName: string;
  authorEmail?: string;
  /** Doldurulubsa şərh mövcud şərhə cavabdır */
  parentId?: string;
}

export async function dbPostComment(input: NewCommentInput): Promise<Comment> {
  const { slug, body, authorName, authorEmail, parentId } = input;

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  /* Cavab yazılırsa ana şərh həmin məqaləyə aid və təsdiqlənmiş olmalıdır —
   * əks halda `parentId` kənardan uydurula bilər. */
  let validParentId: string | undefined;
  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: {
        id: parentId,
        articleId: article.id,
        status: CommentStatus.APPROVED,
        parentId: null,
      },
      select: { id: true },
    });
    if (!parent) throw new Error("Parent comment not found");
    validParentId = parent.id;
  }

  /* Moderasiya tələbi admin panelindəki parametrdən gəlir. Sönülüdürsə
   * şərh dərhal dərc olunur. */
  const settings = await dbGetSiteSettings();
  const status = settings.commentsRequireApproval
    ? CommentStatus.PENDING
    : CommentStatus.APPROVED;

  const comment = await prisma.comment.create({
    data: {
      body,
      authorName,
      authorEmail: authorEmail || null,
      authorRole: "Oxucu",
      status,
      articleId: article.id,
      parentId: validParentId,
    },
  });

  return {
    id: comment.id,
    authorName: comment.authorName,
    authorInitials: comment.authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    authorRole: comment.authorRole,
    createdAtLabel: "İndicə",
    body: comment.body,
    likeCount: 0,
  };
}

export async function dbGetCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          articles: { where: { status: ArticleStatus.PUBLISHED } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Add "All" category at the beginning
  const all: Category = {
    id: "cat-all",
    slug: "hamisi",
    name: "Bütün Məqalələr",
    icon: "apps",
    articleCount: categories.reduce((sum, c) => sum + c._count.articles, 0),
  };

  return [
    all,
    ...categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      icon: c.icon ?? undefined,
      articleCount: c._count.articles,
    })),
  ];
}

/**
 * Header axtarışının məlumatı.
 *
 * `query` verilməsə ən yeni məqalələr qaytarılır (axtarış qutusu boş
 * olduqda göstərilən təkliflər). Əvvəllər bütün məqalələr qaytarılır və
 * hər səhifə ilə birlikdə brauzerə göndərilirdi — 185 məqalədə bu, hər
 * yüklənişə onlarla kilobayt əlavə edirdi.
 */
export async function dbGetSearchIndex(
  query?: string,
  limit = 8,
): Promise<SearchIndexItem[]> {
  const q = query?.trim();
  const where: Prisma.ArticleWhereInput = { status: ArticleStatus.PUBLISHED };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
      { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: Math.min(25, Math.max(1, limit)),
    select: {
      slug: true,
      title: true,
      excerpt: true,
      readMinutes: true,
      category: { select: { name: true } },
      tags: { select: { name: true } },
    },
  });

  return articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    categoryName: a.category.name,
    readMinutes: a.readMinutes,
    tags: a.tags.map((t) => t.name),
  }));
}

/* --------------------------------------------------------------
 * Statistika — baxış və bəyənmə sayğacları
 * ------------------------------------------------------------ */

/**
 * Məqaləyə bir baxış yazır.
 * Səhifə açılanda brauzerdən çağırılır; eyni oxucunun eyni sessiyada
 * təkrar sayılmaması müştəri tərəfdə həll olunur.
 */
export async function dbIncrementArticleView(slug: string): Promise<void> {
  await prisma.article.updateMany({
    where: { slug, status: ArticleStatus.PUBLISHED },
    data: { viewCount: { increment: 1 } },
  });
}

/**
 * Bəyənməni bir vahid artırır və ya azaldır; yeni sayı qaytarır.
 * Sayğac heç vaxt mənfi olmur.
 */
export async function dbSetArticleLike(
  slug: string,
  liked: boolean,
): Promise<number | null> {
  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: { id: true, likeCount: true },
  });
  if (!article) return null;

  const next = Math.max(0, article.likeCount + (liked ? 1 : -1));
  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { likeCount: next },
    select: { likeCount: true },
  });
  return updated.likeCount;
}

/**
 * Şərh bəyənməsini bir vahid dəyişir; yeni sayı qaytarır.
 * Yalnız təsdiqlənmiş şərhlər bəyənilə bilər.
 */
export async function dbSetCommentLike(
  id: string,
  liked: boolean,
): Promise<number | null> {
  const comment = await prisma.comment.findFirst({
    where: { id, status: CommentStatus.APPROVED },
    select: { id: true, likeCount: true },
  });
  if (!comment) return null;

  const updated = await prisma.comment.update({
    where: { id: comment.id },
    data: { likeCount: Math.max(0, comment.likeCount + (liked ? 1 : -1)) },
    select: { likeCount: true },
  });
  return updated.likeCount;
}

/* --------------------------------------------------------------
 * «Bu məqalə faydalı oldu?» reaksiyaları
 * ------------------------------------------------------------ */

export type ReactionKind = "clear" | "learned" | "question";

const REACTION_FIELD: Record<ReactionKind, "reactionClear" | "reactionLearned" | "reactionQuestion"> = {
  clear: "reactionClear",
  learned: "reactionLearned",
  question: "reactionQuestion",
};

export interface ReactionCounts {
  clear: number;
  learned: number;
  question: number;
}

/**
 * Reaksiya sayğaclarını dəyişir.
 *
 * Oxucu seçimini dəyişəndə köhnə reaksiya azalır, yenisi artır — ona görə
 * bir çağırışda iki sahə yenilənə bilir. Sayğac heç vaxt mənfi olmur.
 */
export async function dbSetArticleReaction(
  slug: string,
  next: ReactionKind | null,
  previous: ReactionKind | null,
): Promise<ReactionCounts | null> {
  if (next === previous) return null;

  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: {
      id: true,
      reactionClear: true,
      reactionLearned: true,
      reactionQuestion: true,
    },
  });
  if (!article) return null;

  const data: Record<string, number> = {};
  if (previous) {
    const field = REACTION_FIELD[previous];
    data[field] = Math.max(0, article[field] - 1);
  }
  if (next) {
    const field = REACTION_FIELD[next];
    /* Eyni sorğuda həm azalıb həm artan sahə ola bilməz (next !== previous),
     * ona görə cari dəyər üzərindən hesablamaq təhlükəsizdir. */
    data[field] = article[field] + 1;
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data,
    select: {
      reactionClear: true,
      reactionLearned: true,
      reactionQuestion: true,
    },
  });

  return {
    clear: updated.reactionClear,
    learned: updated.reactionLearned,
    question: updated.reactionQuestion,
  };
}
