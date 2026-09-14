import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type {
  Article,
  ArticleSummary,
  Author,
  Category,
  Comment,
  Paginated,
  SearchIndexItem,
  TopReadArticle,
} from "@/lib/types";
import { ArticleStatus, CommentStatus, Prisma } from "@prisma/client";
import { buildToc, normalizeHeadings } from "@/lib/article-toc";
import { dbGetSiteSettings } from "@/lib/db/admin";
import { dbGetArticleAuthor } from "@/lib/db/doctor";
import { toArticleLanguage } from "@/lib/db/language";
import { pickTranslation } from "@/lib/i18n/translations";
import { formatCompact } from "@/lib/utils";

/**
 * Müəllif tapılmadıqda (DoctorProfile hələ yaradılmayıbsa) istifadə olunur —
 * səhifə boş kartla açılmaq əvəzinə çökməsin deyə.
 */
const FALLBACK_AUTHOR: Author = {
  id: "doctor",
  fullName: "Həkim",
  title: "",
  avatarUrl: "",
  isVerified: false,
};

export interface ArticleQuery {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  /** Siyahıdan kənarda saxlanılacaq məqalə (yuxarıda ayrıca göstərilən) */
  excludeSlug?: string;
  page?: number;
  pageSize?: number;
}

/** Sayt dilinə görə dəyişən mətnlər — tarix formatı və hesablanan etiketlər */
interface FormatCtx {
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}

/**
 * Hər sorğu üçün bir dəfə hazırlanır (locale + tərcümələr).
 *
 * `locale` səhifədən (`params.locale`-dan) ötürülməlidir, ötürülməyəndə
 * ambient `getLocale()`-ə düşür (server action-lar üçün təhlükəsizdir,
 * çünki orada həmişə real sorğu konteksti var). Açıq `locale` ötürüləndə
 * next-intl `getTranslations({locale, ...})` `headers()`-ə HEÇ müraciət
 * etmir — bu, `generateStaticParams`/ISR ilə qurulan səhifələrdə (məqalə
 * detalı kimi) `DYNAMIC_SERVER_USAGE` bail-out-unun qarşısını təminatlı
 * şəkildə alır (ambient `setRequestLocale`/keş bəzən kifayət etmirdi —
 * production-da sınanıb: məqalələr 500/yalan-404 verirdi).
 */
async function formatCtx(locale?: string): Promise<FormatCtx> {
  if (locale) {
    const t = await getTranslations({ locale, namespace: "siteData" });
    return { locale, t };
  }
  const [resolvedLocale, t] = await Promise.all([getLocale(), getTranslations("siteData")]);
  return { locale: resolvedLocale, t };
}

function toSummary(article: any, author: Author, ctx: FormatCtx): ArticleSummary {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: {
      id: article.category.id,
      slug: article.category.slug,
      /* RU saytda tərcümə edilmiş ad, boşdursa Azərbaycanca geri qayıdır */
      name: pickTranslation(
        { name: article.category.name as string },
        article.category.translations,
        ctx.locale,
      ).name,
      icon: article.category.icon ?? undefined,
    },
    coverImageUrl: article.coverImageUrl ?? undefined,
    publishedAt: article.publishedAt?.toISOString().split("T")[0] ?? "",
    publishedAtLabel: article.publishedAt
      ? new Intl.DateTimeFormat(ctx.locale, {
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(article.publishedAt)
      : "",
    referenceCount: Array.isArray(article.references) ? article.references.length : 0,
    referenceLabel:
      Array.isArray(article.references) && article.references.length > 0
        ? ctx.t("referencesCount", { count: article.references.length })
        : undefined,
    viewCount: article.viewCount,
    isFeatured: article.isFeatured,
    isPeerReviewed: article.isPeerReviewed,
    /* Ayrıca Author cədvəli yoxdur — bütün məqalələr eyni müəllifi (sayt
     * həkimini) göstərir, ona görə bu, sorğu ilə yanaşı çağırılıb ötürülür. */
    author,
  };
}

function toFullArticle(article: any, author: Author, ctx: FormatCtx): Article {
  const summary = toSummary(article, author, ctx);
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
    allowComments: article.allowComments !== false,
    tableOfContents: article.showTableOfContents === false ? [] : buildToc(blocks),
    blocks,
    references: (article.references as Article["references"]) ?? [],
    likeCount: article.likeCount,
    commentCount: article._count?.comments ?? 0,
  };
}

export async function dbGetArticles(
  query: ArticleQuery = {},
  locale?: string,
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

  const language = toArticleLanguage(locale);
  if (language) {
    where.language = language;
  }

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
    ];
  }

  const [articles, total, author, ctx] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
    dbGetArticleAuthor(locale),
    formatCtx(locale),
  ]);

  return {
    items: articles.map((a) => toSummary(a, author ?? FALLBACK_AUTHOR, ctx)),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function dbGetFeaturedArticle(locale?: string): Promise<ArticleSummary | null> {
  const [article, author, ctx] = await Promise.all([
    prisma.article.findFirst({
      where: {
        status: ArticleStatus.PUBLISHED,
        isFeatured: true,
        language: toArticleLanguage(locale),
      },
      include: {
        category: true,
      },
      orderBy: { publishedAt: "desc" },
    }),
    dbGetArticleAuthor(locale),
    formatCtx(locale),
  ]);

  return article ? toSummary(article, author ?? FALLBACK_AUTHOR, ctx) : null;
}

export async function dbGetArticleBySlug(slug: string, locale?: string): Promise<Article | null> {
  const [article, author, ctx] = await Promise.all([
    prisma.article.findFirst({
      where: {
        slug,
        status: ArticleStatus.PUBLISHED,
        language: toArticleLanguage(locale),
      },
      include: {
        category: true,
        _count: {
          select: { comments: { where: { status: CommentStatus.APPROVED } } },
        },
      },
    }),
    dbGetArticleAuthor(locale),
    formatCtx(locale),
  ]);

  return article ? toFullArticle(article, author ?? FALLBACK_AUTHOR, ctx) : null;
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
  limit = 2,
  locale?: string,
): Promise<ArticleSummary[]> {
  const current = await prisma.article.findUnique({
    where: { slug },
    select: { categoryId: true },
  });

  if (!current) return [];

  const [articles, author, ctx] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        categoryId: current.categoryId,
        slug: { not: slug },
        language: toArticleLanguage(locale),
      },
      include: {
        category: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    }),
    dbGetArticleAuthor(locale),
    formatCtx(locale),
  ]);

  return articles.map((a) => toSummary(a, author ?? FALLBACK_AUTHOR, ctx));
}

export async function dbGetComments(slug: string, locale?: string): Promise<Comment[]> {
  const [article, ctx] = await Promise.all([
    prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    }),
    formatCtx(locale),
  ]);

  if (!article) return [];

  const comments = await prisma.comment.findMany({
    where: {
      articleId: article.id,
      status: CommentStatus.APPROVED,
    },
    /* İlk yazan birinci görünsün — söhbət kimi xronoloji sıra */
    orderBy: { createdAt: "asc" },
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
    createdAtLabel: new Intl.DateTimeFormat(ctx.locale, {
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
        createdAtLabel: new Intl.DateTimeFormat(ctx.locale, {
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
  const { t } = await formatCtx();

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
      authorRole: t("readerRole"),
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
    createdAtLabel: t("justNow"),
    body: comment.body,
    likeCount: 0,
  };
}

export async function dbGetCategories(locale?: string): Promise<Category[]> {
  const language = toArticleLanguage(locale);
  const [categories, { t }] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            articles: { where: { status: ArticleStatus.PUBLISHED, language } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    formatCtx(locale),
  ]);

  /*
   * Cari dildə heç bir məqaləsi olmayan kateqoriya siyahıdan çıxarılır —
   * RU sayt hələ yazılmamış mövzuları göstərməsin (kateqoriya adı tərcümə
   * olunsa belə, boş kateqoriya oxucu üçün faydasızdır).
   */
  const withArticles = categories.filter((c) => c._count.articles > 0);

  // Add "All" category at the beginning
  const all: Category = {
    id: "cat-all",
    slug: "hamisi",
    name: t("allCategories"),
    icon: "apps",
    articleCount: withArticles.reduce((sum, c) => sum + c._count.articles, 0),
  };

  return [
    all,
    ...withArticles.map((c) => ({
      id: c.id,
      slug: c.slug,
      /* RU saytda tərcümə edilmiş ad, boşdursa Azərbaycanca geri qayıdır */
      name: pickTranslation({ name: c.name }, c.translations, locale).name,
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
  locale?: string,
): Promise<SearchIndexItem[]> {
  const q = query?.trim();
  const where: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
    language: toArticleLanguage(locale),
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
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
      category: { select: { name: true, translations: true } },
    },
  });

  return articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    categoryName: pickTranslation(
      { name: a.category.name },
      a.category.translations,
      locale,
    ).name,
  }));
}

/** Bloq səhifəsinin «Ən Çox Oxunanlar» bölməsi — baxış sayına görə */
export async function dbGetTopReadArticles(
  limit = 3,
  locale?: string,
): Promise<TopReadArticle[]> {
  const [articles, { t }] = await Promise.all([
    prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED, language: toArticleLanguage(locale) },
      orderBy: { viewCount: "desc" },
      take: Math.min(10, Math.max(1, limit)),
      select: {
        slug: true,
        title: true,
        excerpt: true,
        viewCount: true,
      },
    }),
    formatCtx(locale),
  ]);

  return articles.map((a, i) => ({
    rank: `#${String(i + 1).padStart(2, "0")}`,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    readCountLabel: t("readsCount", { count: formatCompact(a.viewCount) }),
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
