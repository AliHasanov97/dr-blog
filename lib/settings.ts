/**
 * Sayt parametrləri.
 *
 * Bazada `site_settings` cədvəlində açar/dəyər kimi saxlanılır: bir sətir,
 * `key = "site"`, `value` isə bu obyektin JSON forması. Sxem məhz belə
 * qurulub — hər parametr üçün ayrıca sütun yoxdur.
 */

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  /** Ana səhifə hero bölməsinin üst yazısı */
  heroEyebrow: string;
  /** Ana səhifə hero bölməsinin əsas başlığı */
  heroHeadline: string;
  /** Ana səhifə hero bölməsində həkim titulundan sonra gələn cümlə */
  heroDescription: string;
  articlesPerPage: number;
  commentsEnabled: boolean;
  commentsRequireApproval: boolean;
  newsletterEnabled: boolean;
  /**
   * Söndürülsə RU saytı (`/ru/...`) bağlanır — hər sorğu `/az`-a
   * yönləndirilir, dil seçimi (`PreferencesMenu`) də gizlənir. RU
   * məzmun silinmir, sadəcə əlçatmaz olur — istənilən vaxt geri açıla bilər.
   */
  multiLanguageEnabled: boolean;
  loadingText: string;
  loadingLogo: string;
  /** Açılış ekranında mətn göstərilsin */
  loadingShowText: boolean;
  /** Açılış ekranında logo göstərilsin */
  loadingShowLogo: boolean;

  /**
   * Rus dilində variantlar — boşdursa RU saytda AZ mətn geri qayıdır.
   * `getSiteSettings(locale)` bunları həll edib tək dəyər qaytarır; admin
   * forması isə hər ikisini birlikdə göstərir (bax: `SettingsForm.tsx`).
   */
  siteNameRu: string;
  taglineRu: string;
  descriptionRu: string;
  heroEyebrowRu: string;
  heroHeadlineRu: string;
  heroDescriptionRu: string;
  loadingTextRu: string;
}

/** Rus dilinə tərcümə oluna bilən sahələr — `resolveSettingsForLocale`-də işlədilir */
const TRANSLATABLE_KEYS = [
  "siteName",
  "tagline",
  "description",
  "heroEyebrow",
  "heroHeadline",
  "heroDescription",
  "loadingText",
] as const satisfies readonly (keyof SiteSettings)[];

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
  multiLanguageEnabled: true,
  loadingText: "DR.NARMIN",
  loadingLogo: "",
  loadingShowText: true,
  loadingShowLogo: false,
  siteNameRu: "",
  taglineRu: "",
  descriptionRu: "",
  heroEyebrowRu: "",
  heroHeadlineRu: "",
  heroDescriptionRu: "",
  loadingTextRu: "",
};

/**
 * RU saytda göstərilən tək-dilli görünüş — hər sahə üçün `<sahə>Ru`
 * doludursa onu, boşdursa AZ mətni qaytarır. Admin formasında əvəzinə
 * xam `SiteSettings` (hər iki dil) işlədilir.
 */
export function resolveSettingsForLocale(
  settings: SiteSettings,
  locale?: string,
): SiteSettings {
  if (locale !== "ru") return settings;
  const resolved = { ...settings };
  for (const key of TRANSLATABLE_KEYS) {
    const ruKey = `${key}Ru` as keyof SiteSettings;
    const ruValue = settings[ruKey];
    if (typeof ruValue === "string" && ruValue.trim()) {
      resolved[key] = ruValue;
    }
  }
  return resolved;
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
    const value = input[key];
    const expected = typeof DEFAULT_SETTINGS[key];
    if (typeof value === expected) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = value;
    }
  }

  /* Səhifə başına məqalə sayı ağlabatan hədddə saxlanılır */
  result.articlesPerPage = Math.min(
    50,
    Math.max(1, Math.round(result.articlesPerPage) || DEFAULT_SETTINGS.articlesPerPage),
  );

  return result;
}
