import type { Category } from "@/lib/types";

export const mockCategories: Category[] = [
  { id: "cat-all", slug: "hamisi", name: "Bütün Məqalələr", icon: "apps", articleCount: 18 },
  { id: "cat-cardio", slug: "kardiologiya", name: "Kardiologiya", icon: "monitor_heart", articleCount: 7 },
  { id: "cat-prevention", slug: "profilaktika", name: "Profilaktika", icon: "favorite", articleCount: 4 },
  { id: "cat-pressure", slug: "tezyiq-ve-aritmiya", name: "Təzyiq & Aritmiya", icon: "ecg", articleCount: 3 },
  { id: "cat-lifestyle", slug: "diyet-ve-heyat-terzi", name: "Diyet & Həyat Tərzi", icon: "restaurant", articleCount: 2 },
  { id: "cat-video", slug: "video-dersler", name: "Video Dərslər", icon: "smart_display", articleCount: 8 },
  { id: "cat-research", slug: "elmi-nesrler", name: "Elmi Nəşrlər (AHA/ESC)", icon: "science", articleCount: 6 },
];

/** Ana səhifədəki qısa tab filtrləri */
export const homeFilters: Category[] = [
  { id: "hf-latest", slug: "son-nesrler", name: "Son Nəşrlər", icon: "grade" },
  { id: "hf-popular", slug: "populyar", name: "Populyar Məsləhətlər", icon: "trending_up" },
  { id: "hf-clinical", slug: "klinik-icmallar", name: "Klinik İcmallar", icon: "clinical_notes" },
  { id: "hf-prevention", slug: "profilaktika", name: "Profilaktika", icon: "favorite" },
];

export function findCategoryBySlug(slug: string): Category | undefined {
  return mockCategories.find((c) => c.slug === slug);
}
