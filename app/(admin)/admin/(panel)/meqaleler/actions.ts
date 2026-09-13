"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { revalidateSitePath } from "@/lib/revalidate-site";
import type { ActionResult } from "@/lib/admin/types";
import { toDateLabel } from "@/lib/admin/format";
import { listArticles } from "@/lib/admin/queries";
import type {
  AdminArticleQuery,
  AdminArticleListResult,
} from "@/lib/db/admin";
import { USE_MOCK } from "@/lib/api/config";
import { mockAuthor } from "@/lib/mock/doctor";
import {
  nextId,
  store,
  type AdminArticle,
  type ArticleStatus,
} from "@/lib/mock/store";
import {
  dbCreateArticle,
  dbUpdateArticle,
  dbDeleteArticle,
  dbGetCategoryBySlug,
} from "@/lib/db/admin";
import { buildToc, normalizeHeadings as normalizeBlocks } from "@/lib/article-toc";
import type { ArticleBlock, ArticleReference } from "@/lib/types";

export interface ArticlePayload {
  title: string;
  slug: string;
  excerpt: string;
  categorySlug: string;
  status: ArticleStatus;
  publishedAt: string;
  coverImageUrl: string;
  /** Örtük şəkli məqalə səhifəsinin başında da göstərilsin (kart şəkli hər halda qalır) */
  showHeroImage: boolean;
  isFeatured: boolean;
  isPeerReviewed: boolean;
  allowComments: boolean;
  showTableOfContents: boolean;
  metaDescription: string;
  blocks: ArticleBlock[];
  references: ArticleReference[];
}

function refreshPublicPages(slug?: string) {
  revalidatePath("/", "layout");
  revalidateSitePath("/articles");
  if (slug) revalidateSitePath(`/articles/${slug}`);
  // Admin siyahısı da yenilənməlidir — əks halda redaktədən sonra geri
  // qayıdanda köhnə başlıq/kateqoriya görünə bilər
  revalidatePath("/admin/meqaleler");
}

function applyPayload(
  target: AdminArticle,
  payload: ArticlePayload,
): AdminArticle {
  const category =
    store.categories.find((c) => c.slug === payload.categorySlug) ??
    store.categories[0];
  const blocks = normalizeBlocks(payload.blocks);

  // Dərc tarixi: yalnız ilk dəfə "published" olduqda avtomatik təyin olunur
  const today = new Date().toISOString().slice(0, 10);
  const wasPublished = target.status === "published";
  const isPublishing = payload.status === "published" && !wasPublished;
  const publishedAt = isPublishing ? today : (target.publishedAt || today);

  return {
    ...target,
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    category,
    status: payload.status,
    publishedAt,
    publishedAtLabel: toDateLabel(publishedAt),
    coverImageUrl: payload.coverImageUrl || undefined,
    heroImageUrl: payload.showHeroImage
      ? payload.coverImageUrl || undefined
      : undefined,
    isFeatured: payload.isFeatured,
    isPeerReviewed: payload.isPeerReviewed,
    allowComments: payload.allowComments,
    showTableOfContents: payload.showTableOfContents,
    metaDescription: payload.metaDescription || undefined,
    blocks,
    references: payload.references,
    referenceCount: payload.references.length,
    referenceLabel:
      payload.references.length > 0
        ? `${payload.references.length} istinad`
        : undefined,
    tableOfContents: buildToc(blocks),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

/** Unikal GUID yaradır */
function generateGuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createArticle(
  payload: ArticlePayload,
): Promise<ActionResult> {
  /*
   * Slug redaktordan gəlir: şəkillər məqalə yadda saxlanmazdan əvvəl
   * yüklənir və onun qovluğuna düşür, ona görə açar orada yaranmalıdır.
   * Format yoxlanılır — kənardan uydurma dəyər gəlsə serverdə yenisi
   * yaradılır.
   */
  const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const slug = GUID.test(payload.slug?.trim() ?? "")
    ? payload.slug.trim().toLowerCase()
    : generateGuid();
  if (!payload.title.trim()) {
    return { success: false, message: "Başlıq boş ola bilməz." };
  }

  if (!USE_MOCK) {
    // Database mode
    const category = await dbGetCategoryBySlug(payload.categorySlug);

    if (!category) {
      return { success: false, message: "Kateqoriya tapılmadı." };
    }

    const blocks = normalizeBlocks(payload.blocks);
    const tableOfContents = buildToc(blocks);

    await dbCreateArticle({
      slug,
      title: payload.title,
      excerpt: payload.excerpt,
      categoryId: category.id,
      status: payload.status,
      publishedAt: payload.publishedAt,
      coverImageUrl: payload.coverImageUrl,
      // Açar sönülüdürsə boş saxlanılır — kart şəkli (coverImageUrl) toxunulmur
      heroImageUrl: payload.showHeroImage ? payload.coverImageUrl : "",
      showTableOfContents: payload.showTableOfContents,
      allowComments: payload.allowComments,
      isFeatured: payload.isFeatured,
      isPeerReviewed: payload.isPeerReviewed,
      blocks,
      tableOfContents,
      references: payload.references,
    });

    refreshPublicPages(slug);
    redirect("/admin/meqaleler");
  }

  // Mock mode
  const base: AdminArticle = {
    id: nextId("art"),
    slug,
    title: payload.title,
    excerpt: payload.excerpt,
    category: store.categories[0],
    publishedAt: payload.publishedAt,
    publishedAtLabel: toDateLabel(payload.publishedAt),
    author: mockAuthor,
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    tableOfContents: [],
    blocks: [],
    references: [],
    status: payload.status,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  store.articles.unshift(applyPayload(base, { ...payload, slug }));
  refreshPublicPages(slug);
  redirect("/admin/meqaleler");
}

export async function updateArticle(
  id: string,
  payload: ArticlePayload,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    // Database mode
    const category = await dbGetCategoryBySlug(payload.categorySlug);
    if (!category) {
      return { success: false, message: "Kateqoriya tapılmadı." };
    }

    const blocks = normalizeBlocks(payload.blocks);
    const tableOfContents = buildToc(blocks);

    await dbUpdateArticle(id, {
      title: payload.title,
      excerpt: payload.excerpt,
      categoryId: category.id,
      status: payload.status,
      publishedAt: payload.publishedAt,
      coverImageUrl: payload.coverImageUrl,
      // Açar sönülüdürsə boş saxlanılır — kart şəkli (coverImageUrl) toxunulmur
      heroImageUrl: payload.showHeroImage ? payload.coverImageUrl : "",
      showTableOfContents: payload.showTableOfContents,
      allowComments: payload.allowComments,
      isFeatured: payload.isFeatured,
      isPeerReviewed: payload.isPeerReviewed,
      blocks,
      tableOfContents,
      references: payload.references,
    });

    refreshPublicPages(payload.slug);
    return { success: true, message: "Dəyişikliklər yadda saxlanıldı." };
  }

  // Mock mode
  const index = store.articles.findIndex((a) => a.id === id);
  if (index === -1) return { success: false, message: "Məqalə tapılmadı." };

  // Mövcud GUID saxlanılır
  const slug = store.articles[index].slug;

  store.articles[index] = applyPayload(store.articles[index], {
    ...payload,
    slug,
  });

  refreshPublicPages(slug);
  return { success: true, message: "Dəyişikliklər yadda saxlanıldı." };
}

/**
 * Avtomatik saxlama.
 * `updateArticle`-dən fərqi: publik səhifələri yeniləmir — yazı prosesi
 * ortasında səhifənin yenilənməsi fokusu itirməsin deyə.
 */
export async function autosaveArticle(
  id: string,
  payload: ArticlePayload,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    // Database mode
    const category = await dbGetCategoryBySlug(payload.categorySlug);
    if (!category) {
      return { success: false, message: "Kateqoriya tapılmadı." };
    }

    const blocks = normalizeBlocks(payload.blocks);
    const tableOfContents = buildToc(blocks);

    await dbUpdateArticle(id, {
      title: payload.title,
      excerpt: payload.excerpt,
      categoryId: category.id,
      status: payload.status,
      publishedAt: payload.publishedAt,
      coverImageUrl: payload.coverImageUrl,
      // Açar sönülüdürsə boş saxlanılır — kart şəkli (coverImageUrl) toxunulmur
      heroImageUrl: payload.showHeroImage ? payload.coverImageUrl : "",
      showTableOfContents: payload.showTableOfContents,
      allowComments: payload.allowComments,
      isFeatured: payload.isFeatured,
      isPeerReviewed: payload.isPeerReviewed,
      blocks,
      tableOfContents,
      references: payload.references,
    });

    return { success: true };
  }

  // Mock mode
  const index = store.articles.findIndex((a) => a.id === id);
  if (index === -1) return { success: false, message: "Məqalə tapılmadı." };

  // Mövcud GUID saxlanılır
  const slug = store.articles[index].slug;

  store.articles[index] = applyPayload(store.articles[index], {
    ...payload,
    slug,
  });
  return { success: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  if (!USE_MOCK) {
    // Database mode
    await dbDeleteArticle(id);
    revalidatePath("/", "layout");
    revalidateSitePath("/articles");
    revalidatePath("/admin/meqaleler");
    return { success: true };
  }

  // Mock mode
  const index = store.articles.findIndex((a) => a.id === id);
  if (index === -1) return { success: false, message: "Məqalə tapılmadı." };
  const [removed] = store.articles.splice(index, 1);
  store.comments = store.comments.filter((c) => c.articleSlug !== removed.slug);
  refreshPublicPages(removed.slug);
  revalidatePath("/admin/meqaleler");
  return { success: true };
}

/** Siyahıdan sürətli status dəyişimi */
export async function setArticleStatus(
  id: string,
  status: ArticleStatus,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    // Database mode
    await dbUpdateArticle(id, { status });
    revalidatePath("/", "layout");
    revalidateSitePath("/articles");
    revalidatePath("/admin/meqaleler");
    return { success: true };
  }

  // Mock mode
  const article = store.articles.find((a) => a.id === id);
  if (!article) return { success: false, message: "Məqalə tapılmadı." };
  article.status = status;
  article.updatedAt = new Date().toISOString().slice(0, 10);
  refreshPublicPages(article.slug);
  revalidatePath("/admin/meqaleler");
  return { success: true };
}

/* --------------------------------------------------------------
 * Siyahının səhifələnməsi
 * ------------------------------------------------------------ */

/**
 * Admin siyahısı üçün növbəti səhifə.
 *
 * Axtarış və vəziyyət filtri serverdə tətbiq olunur — əvvəllər bütün
 * məqalələr bir dəfəyə yüklənib brauzerdə süzülürdü.
 */
export async function fetchAdminArticles(
  query: AdminArticleQuery,
): Promise<AdminArticleListResult> {
  return listArticles(query);
}
