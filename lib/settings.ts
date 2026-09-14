/**
 * Sayt parametrləri.
 *
 * Bazada `site_settings` cədvəlində açar/dəyər kimi saxlanılır: bir sətir,
 * `key = "site"`, `value` isə bu obyektin JSON forması. Sxem məhz belə
 * qurulub — hər parametr üçün ayrıca sütun yoxdur.
 */

import { pickTranslation } from "@/lib/i18n/translations";

/** Rus dilinə (və gələcək hər dilə) tərcümə oluna bilən sahələr */
export interface TranslatableSettingsFields {
  siteName: string;
  tagline: string;
  description: string;
  /** Ana səhifə hero bölməsinin üst yazısı */
  heroEyebrow: string;
  /** Ana səhifə hero bölməsinin əsas başlığı */
  heroHeadline: string;
  /** Ana səhifə hero bölməsində həkim titulundan sonra gələn cümlə */
  heroDescription: string;
  loadingText: string;
}

/** `resolveSettingsForLocale`/`SettingsForm.tsx`-də işlədilir */
export const TRANSLATABLE_KEYS = [
  "siteName",
  "tagline",
  "description",
  "heroEyebrow",
  "heroHeadline",
  "heroDescription",
  "loadingText",
] as const satisfies readonly (keyof TranslatableSettingsFields)[];

export interface SiteSettings extends TranslatableSettingsFields {
  articlesPerPage: number;
  commentsEnabled: boolean;
  commentsRequireApproval: boolean;
  newsletterEnabled: boolean;
  loadingLogo: string;
  /** Açılış ekranında mətn göstərilsin */
  loadingShowText: boolean;
  /** Açılış ekranında logo göstərilsin */
  loadingShowLogo: boolean;

  /**
   * Digər dillərdəki tərcümələr — açar dil kodu (məs. "ru"), dəyər isə o
   * dildə override olunan sahələr. Boş/olmayan sahə AZ mətnə geri qayıdır.
   * `getSiteSettings(locale)` bunları həll edib tək dəyər qaytarır; admin
   * forması isə xam `SiteSettings`-i (bütün dillər) göstərir (bax:
   * `SettingsForm.tsx`). Yeni dil əlavə etmək sxemə TOXUNMAQ TƏLƏB ETMİR —
   * sadəcə yeni açar (`"en": {...}`) yazılır.
   */
  translations?: Record<string, Partial<TranslatableSettingsFields>>;
}

/** Bazada sətir olmadıqda və ya sahə əskik olduqda işlədilir */
export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Dr. Ələkbər Zeynili",
  tagline: "T.e.n., Kardioloq & Terapevt",
  description:
    "Kardiologiya üzrə elmi məqalələr, klinik icmallar və pasiyentlər üçün sübuta əsaslanan sağlamlıq bələdçiləri.",
  heroEyebrow: "Kardiologiya · Elmi Bloq",
  heroHeadline: "Ürək sağlamlığı haqqında sübuta əsaslanan yazılar",
  heroDescription:
    "Beynəlxalq protokolların sadə dildə izahı, klinik icmallar və pasiyentlər üçün praktik bələdçilər.",
  articlesPerPage: 10,
  commentsEnabled: true,
  commentsRequireApproval: true,
  newsletterEnabled: true,
  loadingText: "DR.NARMIN",
  loadingLogo: "",
  loadingShowText: true,
  loadingShowLogo: false,
  translations: {},
};

/**
 * RU (və ya digər dil) saytda göstərilən tək-dilli görünüş — `translations`
 * daxilindəki dolu sahələr AZ mətnin üzərinə yazılır, boş qalanlar AZ-a
 * geri qayıdır.
 */
export function resolveSettingsForLocale(
  settings: SiteSettings,
  locale?: string,
): SiteSettings {
  return pickTranslation(settings, settings.translations, locale);
}

/** Açar/dəyər cədvəlində parametrlərin saxlanıldığı açar */
export const SETTINGS_KEY = "site";

/**
 * Naməlum mənbədən (baza JSON-u) gələn dəyəri təhlükəsiz obyektə çevirir.
 * Əskik və ya yanlış tipli sahələr standart dəyərlə əvəz olunur — köhnə
 * qeyd yeni sahə əlavə olunandan sonra da işləyir.
 */
export function normalizeSettings(raw: unknown): SiteSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
  const input = raw as Record<string, unknown>;
  const result = { ...DEFAULT_SETTINGS };

  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    if (key === "translations") continue;
    const value = input[key];
    const expected = typeof DEFAULT_SETTINGS[key];
    if (typeof value === expected) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = value;
    }
  }

  result.translations =
    input.translations && typeof input.translations === "object" && !Array.isArray(input.translations)
      ? (input.translations as SiteSettings["translations"])
      : {};

  /* Səhifə başına məqalə sayı ağlabatan hədddə saxlanılır */
  result.articlesPerPage = Math.min(
    50,
    Math.max(1, Math.round(result.articlesPerPage) || DEFAULT_SETTINGS.articlesPerPage),
  );

  return result;
}
