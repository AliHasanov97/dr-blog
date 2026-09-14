import "server-only";
import { store, type AdminArticle, type AdminComment } from "@/lib/mock/store";
import { USE_MOCK } from "@/lib/api/config";
import { DEFAULT_SETTINGS, resolveSettingsForLocale, type SiteSettings } from "@/lib/settings";
import { safeDb } from "@/lib/api/safe";
import {
  dbGetDashboardStats,
  dbGetViewsByArticle,
  dbListArticles,
  type AdminArticleQuery,
  type AdminArticleListResult,
  dbGetArticle,
  dbListComments,
  dbListMessages,
} from "@/lib/db/admin";

/**
 * Admin panelin oxu qatı.
 * USE_MOCK=false olduqda PostgreSQL-dən oxuyur.
 */

export interface DashboardStats {
  published: number;
  drafts: number;
  pendingComments: number;
  newMessages: number;
  subscribers: number;
  totalViews: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!USE_MOCK) {
    return dbGetDashboardStats();
  }
  return {
    published: store.articles.filter((a) => a.status === "published").length,
    drafts: store.articles.filter((a) => a.status !== "published").length,
    pendingComments: store.comments.filter((c) => c.status === "pending").length,
    newMessages: store.messages.filter((m) => m.status === "new").length,
    subscribers: store.subscribers.filter((s) => s.isActive).length,
    totalViews: store.articles.reduce((sum, a) => sum + (a.viewCount ?? 0), 0),
  };
}

/** Son 6 məqalənin baxış sayı — dashboard qrafiki üçün */
export async function getViewsByArticle(): Promise<{ label: string; value: number }[]> {
  if (!USE_MOCK) {
    return dbGetViewsByArticle();
  }
  return [...store.articles]
    .filter((a) => a.status === "published")
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 6)
    .map((a) => ({
      label: a.title.length > 34 ? `${a.title.slice(0, 34)}…` : a.title,
      value: a.viewCount ?? 0,
    }));
}

export async function listArticles(
  query: AdminArticleQuery = {},
): Promise<AdminArticleListResult> {
  if (!USE_MOCK) {
    return dbListArticles(query);
  }

  /* Mock rejimi: eyni filtr, sıralama və səhifələmə yaddaşdakı anbara tətbiq olunur */
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize ?? 20)));
  const search = query.search?.trim().toLocaleLowerCase("az");
  const sortBy = query.sortBy ?? "date";
  const sortDir = query.sortDir ?? "desc";

  const sorted = [...store.articles];
  const dir = sortDir === "asc" ? 1 : -1;
  sorted.sort((a, b) => {
    switch (sortBy) {
      case "title":
        return dir * a.title.localeCompare(b.title, "az");
      case "category":
        return dir * a.category.name.localeCompare(b.category.name, "az");
      case "status":
        return dir * a.status.localeCompare(b.status);
      case "language":
        return dir * a.language.localeCompare(b.language);
      case "views":
        return dir * ((a.viewCount ?? 0) - (b.viewCount ?? 0));
      case "reactions": {
        const ta = (a.reactions?.clear ?? 0) + (a.reactions?.learned ?? 0) + (a.reactions?.question ?? 0);
        const tb = (b.reactions?.clear ?? 0) + (b.reactions?.learned ?? 0) + (b.reactions?.question ?? 0);
        return dir * (ta - tb);
      }
      case "date":
      default:
        return dir * a.publishedAt.localeCompare(b.publishedAt);
    }
  });

  let filtered = sorted;
  if (query.status && query.status !== "all") {
    filtered = filtered.filter((a) => a.status === query.status);
  }
  if (query.category) {
    filtered = filtered.filter((a) => a.category.slug === query.category);
  }
  if (query.language && query.language !== "all") {
    filtered = filtered.filter((a) => a.language === query.language);
  }
  if (search) {
    filtered = filtered.filter(
      (a) =>
        a.title.toLocaleLowerCase("az").includes(search) ||
        a.excerpt.toLocaleLowerCase("az").includes(search),
    );
  }

  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    counts: {
      all: sorted.length,
      published: sorted.filter((a) => a.status === "published").length,
      draft: sorted.filter((a) => a.status === "draft").length,
    },
    languageCounts: {
      az: sorted.filter((a) => a.language === "az").length,
      ru: sorted.filter((a) => a.language === "ru").length,
    },
  };
}

export async function getArticle(id: string): Promise<AdminArticle | undefined> {
  if (!USE_MOCK) {
    const article = await dbGetArticle(id);
    return article as unknown as AdminArticle | undefined;
  }
  return store.articles.find((a) => a.id === id);
}

export async function listComments(): Promise<AdminComment[]> {
  if (!USE_MOCK) {
    return dbListComments() as Promise<AdminComment[]>;
  }
  const order = { pending: 0, approved: 1, rejected: 2 } as const;
  return [...store.comments].sort(
    (a, b) => order[a.status] - order[b.status],
  );
}

export async function listMessages() {
  if (!USE_MOCK) {
    return dbListMessages();
  }
  const order = { new: 0, read: 1, answered: 2, archived: 3 } as const;
  return [...store.messages].sort((a, b) => order[a.status] - order[b.status]);
}

export async function listSubscribers() {
  if (!USE_MOCK) {
    const { dbListSubscribers } = await import("@/lib/db/admin");
    return dbListSubscribers();
  }
  return [...store.subscribers];
}

export async function listCategories() {
  if (!USE_MOCK) {
    const { dbListCategories } = await import("@/lib/db/admin");
    return dbListCategories();
  }
  return store.categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    translations: c.translations ?? {},
    icon: c.icon ?? "sell",
    articleCount: store.articles.filter((a) => a.category.slug === c.slug).length,
  }));
}

export async function listVideos() {
  if (!USE_MOCK) {
    const { dbListVideos } = await import("@/lib/db/admin");
    return dbListVideos();
  }
  return [...store.videos];
}

export async function listProtocols() {
  if (!USE_MOCK) {
    const { dbListProtocols } = await import("@/lib/db/admin");
    return dbListProtocols();
  }
  return [...store.protocols];
}

export async function listFaq() {
  if (!USE_MOCK) {
    const { dbListFaq } = await import("@/lib/db/admin");
    return dbListFaq();
  }
  return [...store.faq];
}

export async function getDoctorProfile() {
  if (!USE_MOCK) {
    const { dbGetDoctorProfileAdmin } = await import("@/lib/db/admin");
    return dbGetDoctorProfileAdmin();
  }
  return store.doctor;
}

export async function getContactInfo() {
  if (!USE_MOCK) {
    const { dbGetContactSettings } = await import("@/lib/db/admin");
    const result = await dbGetContactSettings();
    return {
      channels: result.channels,
      locations: result.office ? [result.office] : [],
    };
  }
  return {
    channels: store.channels,
    locations: [store.office],
  };
}

/**
 * `locale` verilməzsə (admin panelindən çağırılanda) XAM parametrlər
 * qaytarılır — hər iki dilin sahələri, redaktə forması üçün. `locale`
 * verilsə (publik saytdan) RU sahələr həll olunub tək dəyər qaytarılır.
 */
export async function getSiteSettings(locale?: string): Promise<SiteSettings> {
  if (!USE_MOCK) {
    const { dbGetSiteSettings } = await import("@/lib/db/admin");
    /* Parametrlər hər səhifədə oxunur — baza qopanda sayt dayanmamalıdır */
    const settings = await safeDb("sayt parametrləri", dbGetSiteSettings, {
      ...DEFAULT_SETTINGS,
    });
    return resolveSettingsForLocale(settings, locale);
  }
  return resolveSettingsForLocale(store.settings, locale);
}
