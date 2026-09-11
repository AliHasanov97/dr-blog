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
  loadingText: string;
  loadingLogo: string;
  /** Açılış ekranında mətn göstərilsin */
  loadingShowText: boolean;
  /** Açılış ekranında logo göstərilsin */
  loadingShowLogo: boolean;
}

/** Bazada sətir olmadıqda və ya sahə əskik olduqda işlədilir */
export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Dr. Nərmin Əliyeva",
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
};

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
