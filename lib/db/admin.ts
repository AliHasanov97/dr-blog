import { Prisma } from "@prisma/client";
import type { AdminArticle } from "@/lib/mock/store";
import type { Author } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { dbGetArticleAuthor } from "@/lib/db/doctor";

/** DoctorProfile hələ yaradılmayıbsa istifadə olunan ehtiyat müəllif */
const FALLBACK_AUTHOR: Author = {
  id: "doctor",
  fullName: "Həkim",
  title: "",
  avatarUrl: "",
  isVerified: false,
};
import {
  SETTINGS_KEY,
  normalizeSettings,
  type SiteSettings,
} from "@/lib/settings";
import {
  ArticleStatus,
  CommentStatus,
  MessageStatus,
} from "@prisma/client";

// ============== Auth ==============

export async function dbGetUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function dbGetUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function dbUpdateUserPassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  });
}

export async function dbSetResetToken(
  email: string,
  token: string,
  expiresAt: Date,
) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !user.isActive) return null;
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiresAt: expiresAt },
  });
  return user;
}

export async function dbGetUserByResetToken(token: string) {
  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiresAt) return null;
  if (user.resetTokenExpiresAt.getTime() < Date.now()) return null;
  return user;
}

// ============== Helper Lookups ==============

export async function dbGetCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

// ============== Dashboard Stats ==============

export interface DashboardStats {
  published: number;
  drafts: number;
  pendingComments: number;
  newMessages: number;
  subscribers: number;
  totalViews: number;
}

export async function dbGetDashboardStats(): Promise<DashboardStats> {
  const [published, drafts, pendingComments, newMessages, subscribers, viewsResult] =
    await Promise.all([
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: { not: ArticleStatus.PUBLISHED } } }),
      prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      prisma.contactMessage.count({ where: { status: MessageStatus.NEW } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
    ]);

  return {
    published,
    drafts,
    pendingComments,
    newMessages,
    subscribers,
    totalViews: viewsResult._sum.viewCount ?? 0,
  };
}

export async function dbGetViewsByArticle(): Promise<{ label: string; value: number }[]> {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { viewCount: "desc" },
    take: 6,
    select: { title: true, viewCount: true },
  });

  return articles.map((a) => ({
    label: a.title.length > 34 ? `${a.title.slice(0, 34)}…` : a.title,
    value: a.viewCount,
  }));
}

// ============== Categories ==============

export async function dbListCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon ?? "sell",
    articleCount: c._count.articles,
  }));
}

export async function dbCreateCategory(data: { name: string; slug?: string; icon?: string }) {
  const slug = data.slug?.trim() || slugify(data.name);
  return prisma.category.create({
    data: {
      slug,
      name: data.name,
      icon: data.icon || "sell",
    },
  });
}

export async function dbUpdateCategory(id: string, data: { name?: string; slug?: string; icon?: string }) {
  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: slugify(data.slug) }),
      ...(data.icon && { icon: data.icon }),
    },
  });
}

export async function dbDeleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

// ============== Videos ==============

/**
 * Admin siyahısı üçün videolar.
 *
 * Xam Prisma sətri qaytarılmır: forma sahələri ilə eyni adlar lazımdır
 * (`url`, bazadakı `videoUrl` deyil), əks halda videonu redaktə edəndə
 * link sahəsi boş açılır. `Date` sahələri də cədvələ lazım deyil.
 */
export async function dbListVideos() {
  const videos = await prisma.video.findMany({ orderBy: { sortOrder: "asc" } });
  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description ?? "",
    thumbnailUrl: v.thumbnailUrl ?? "",
    kindLabel: v.kindLabel ?? "",
    url: v.videoUrl,
  }));
}

export async function dbCreateVideo(data: {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  kindLabel?: string;
}) {
  const maxOrder = await prisma.video.aggregate({ _max: { sortOrder: true } });
  return prisma.video.create({
    data: {
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl || "/images/video-ekg.svg",
      videoUrl: data.videoUrl,
      kindLabel: data.kindLabel || "Klinik Vebinar",
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateVideo(id: string, data: Record<string, string>) {
  return prisma.video.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.thumbnailUrl && { thumbnailUrl: data.thumbnailUrl }),
      ...(data.videoUrl && { videoUrl: data.videoUrl }),
      ...(data.kindLabel && { kindLabel: data.kindLabel }),
    },
  });
}

export async function dbDeleteVideo(id: string) {
  return prisma.video.delete({ where: { id } });
}

// ============== Protocols ==============

export async function dbListProtocols() {
  return prisma.protocolDocument.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function dbCreateProtocol(data: {
  title: string;
  description?: string;
  fileSizeLabel?: string;
  fileUrl: string;
}) {
  const maxOrder = await prisma.protocolDocument.aggregate({ _max: { sortOrder: true } });
  return prisma.protocolDocument.create({
    data: {
      title: data.title,
      description: data.description,
      fileSizeLabel: data.fileSizeLabel || "—",
      fileUrl: data.fileUrl,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateProtocol(id: string, data: Record<string, string>) {
  return prisma.protocolDocument.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.fileSizeLabel && { fileSizeLabel: data.fileSizeLabel }),
      ...(data.fileUrl && { fileUrl: data.fileUrl }),
    },
  });
}

export async function dbDeleteProtocol(id: string) {
  return prisma.protocolDocument.delete({ where: { id } });
}

// ============== FAQ ==============

export async function dbListFaq() {
  return prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function dbCreateFaq(data: { question: string; answer: string }) {
  const maxOrder = await prisma.faqItem.aggregate({ _max: { sortOrder: true } });
  return prisma.faqItem.create({
    data: {
      question: data.question,
      answer: data.answer,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function dbUpdateFaq(id: string, data: { question?: string; answer?: string }) {
  return prisma.faqItem.update({
    where: { id },
    data: {
      ...(data.question && { question: data.question }),
      ...(data.answer && { answer: data.answer }),
    },
  });
}

export async function dbDeleteFaq(id: string) {
  return prisma.faqItem.delete({ where: { id } });
}

// ============== Articles ==============

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

// ============== Comments ==============

export async function dbListComments() {
  const comments = await prisma.comment.findMany({
    include: {
      article: { select: { slug: true, title: true } },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  return comments.map((c) => ({
    id: c.id,
    articleSlug: c.article.slug,
    articleTitle: c.article.title,
    authorName: c.authorName,
    authorInitials: c.authorName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    authorRole: c.authorRole,
    authorAvatarUrl: c.authorAvatarUrl,
    isAuthorVerified: c.isAuthorVerified,
    isDoctorReply: c.isDoctorReply,
    createdAtLabel: new Intl.DateTimeFormat("az", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(c.createdAt),
    body: c.body,
    likeCount: c.likeCount,
    status: c.status.toLowerCase() as "pending" | "approved" | "rejected",
    parentId: c.parentId,
  }));
}

export async function dbApproveComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { status: CommentStatus.APPROVED },
  });
}

export async function dbRejectComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { status: CommentStatus.REJECTED },
  });
}

export async function dbDeleteComment(id: string) {
  return prisma.comment.delete({ where: { id } });
}

// ============== Messages ==============

export async function dbListMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  return messages.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    contact: m.contact,
    subject: m.subject,
    message: m.message,
    inquiryTypeLabel: m.inquiryType,
    receivedAtLabel: new Intl.DateTimeFormat("az", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(m.createdAt),
    status: m.status.toLowerCase() as "new" | "read" | "answered" | "archived",
  }));
}

export async function dbUpdateMessageStatus(id: string, status: string) {
  return prisma.contactMessage.update({
    where: { id },
    data: { status: status.toUpperCase() as MessageStatus },
  });
}

export async function dbDeleteMessage(id: string) {
  return prisma.contactMessage.delete({ where: { id } });
}

// ============== Subscribers ==============

export async function dbListSubscribers() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  return subscribers.map((s) => ({
    id: s.id,
    email: s.email,
    subscribedAtLabel: new Intl.DateTimeFormat("az", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(s.subscribedAt),
    isActive: s.isActive,
  }));
}

export async function dbToggleSubscriber(id: string, isActive: boolean) {
  return prisma.newsletterSubscriber.update({
    where: { id },
    data: { isActive },
  });
}

export async function dbDeleteSubscriber(id: string) {
  return prisma.newsletterSubscriber.delete({ where: { id } });
}

// ============== Doctor Profile ==============

export async function dbGetDoctorProfileAdmin() {
  return prisma.doctorProfile.findFirst();
}

export async function dbUpdateDoctorProfile(data: Record<string, any>) {
  const profile = await prisma.doctorProfile.findFirst();
  if (!profile) {
    return prisma.doctorProfile.create({ data: data as any });
  }
  return prisma.doctorProfile.update({
    where: { id: profile.id },
    data,
  });
}

// ============== Contact Settings ==============

export async function dbGetContactSettings() {
  const [channels, office] = await Promise.all([
    prisma.contactChannel.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.officeLocation.findFirst(),
  ]);
  return { channels, office };
}

export async function dbUpdateContactChannel(id: string, data: Record<string, any>) {
  return prisma.contactChannel.update({
    where: { id },
    data,
  });
}

export async function dbUpdateOfficeLocation(data: Record<string, any>) {
  const office = await prisma.officeLocation.findFirst();
  if (!office) {
    return prisma.officeLocation.create({ data: data as any });
  }
  return prisma.officeLocation.update({
    where: { id: office.id },
    data,
  });
}

// ============== Site Settings ==============

/**
 * Sayt parametrləri.
 *
 * `site_settings` açar/dəyər cədvəlidir: bütün parametrlər `key = "site"`
 * olan bir sətrin `value` JSON-unda saxlanılır. Sətir yoxdursa standart
 * dəyərlər qaytarılır — səhifə boş bazada da açılmalıdır.
 */
export async function dbGetSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSetting.findUnique({
    where: { key: SETTINGS_KEY },
    select: { value: true },
  });
  return normalizeSettings(row?.value);
}

/** Parametrləri yazır; sətir yoxdursa yaradır */
export async function dbUpdateSiteSettings(
  values: SiteSettings,
): Promise<SiteSettings> {
  const clean = normalizeSettings(values);
  /* Prisma `Json` sahəsi indeks imzası olan obyekt gözləyir — `SiteSettings`
   * sabit sahəli interfeysdir, ona görə düz JSON obyektinə çevrilir. */
  const payload = { ...clean } as unknown as Prisma.InputJsonObject;

  const row = await prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: payload },
    update: { value: payload },
    select: { value: true },
  });
  return normalizeSettings(row.value);
}

// ============== Helpers ==============

function slugify(text: string): string {
  const map: Record<string, string> = {
    ə: "e", Ə: "E", ı: "i", İ: "I", ö: "o", Ö: "O",
    ü: "u", Ü: "U", ş: "s", Ş: "S", ç: "c", Ç: "C",
    ğ: "g", Ğ: "G",
  };
  return text
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
