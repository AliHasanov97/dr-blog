import type { CSSProperties } from "react";
import type { ImageAspectRatio, ImageFit, ImageFocus } from "./types";

/**
 * Şəkil blokunun çərçivə hesablamaları.
 *
 * Həm admin redaktoru (`ImageNodeView`, `GalleryNodeView`), həm publik
 * səhifə (`ArticleBody`) eyni funksiyaları işlədir ki, önizləmə ilə
 * saytdakı nəticə həmişə üst-üstə düşsün.
 *
 * Nisbət (`aspectRatio`) sərbəst onluq ədəd kimi saxlanılır (məsələn
 * `"1.7778"` = 16:9) — sabit 6 seçimlə məhdudlaşmır, çünki oxucu siçanla
 * dartaraq istənilən hündürlüyü seçə bilməlidir. CSS-in `aspect-ratio`
 * xassəsi bir ədədi birbaşa qəbul edir, ona görə əlavə çevirməyə ehtiyac
 * yoxdur.
 */

/** İcazə verilən nisbət aralığı — çox dar (dik afişa) və ya çox enli (panoram) həddi */
export const MIN_ASPECT_RATIO = 0.2;
export const MAX_ASPECT_RATIO = 5;

/** Sürüşdürmə zamanı hesablanan ədədi təmiz, qısa mətnə çevirir (məs. 1.77777 → "1.7778") */
export function formatAspectRatio(value: number): string {
  const clamped = Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, value));
  return clamped.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

/** Sətri nisbətə çevirir; etibarsızdırsa (köhnə format, boş, s.) `undefined` qaytarır */
export function parseAspectRatio(value: string | undefined): number | undefined {
  const n = Number.parseFloat(value ?? "");
  if (!Number.isFinite(n) || n < MIN_ASPECT_RATIO || n > MAX_ASPECT_RATIO) return undefined;
  return n;
}

/** Hazır nisbət seçimləri — redaktordakı sürətli düymələr üçün */
export const ASPECT_RATIO_PRESETS: { value: ImageAspectRatio; label: string }[] = [
  { value: "0.5625", label: "9:16 Dik" },
  { value: "0.75", label: "3:4 Portret" },
  { value: "1", label: "1:1 Kvadrat" },
  { value: "1.3333", label: "4:3 Standart" },
  { value: "1.7778", label: "16:9 Enli" },
  { value: "2.3333", label: "21:9 Panoram" },
];

/** Köhnə davranışın defolt nisbətləri (sahə əlavə olunmazdan əvvəlki məqalələr üçün) */
const DEFAULT_WIDE: ImageAspectRatio = "1.7778"; // 16:9
const DEFAULT_STANDARD: ImageAspectRatio = "1.3333"; // 4:3
const DEFAULT_SQUARE: ImageAspectRatio = "1"; // 1:1

const FOCUS_CSS: Record<ImageFocus, string> = {
  "top-left": "top left",
  top: "top",
  "top-right": "top right",
  left: "left",
  center: "center",
  right: "right",
  "bottom-left": "bottom left",
  bottom: "bottom",
  "bottom-right": "bottom right",
};

export interface ResolvedImageFrame {
  aspectRatio: ImageAspectRatio;
  fit: ImageFit;
  focus: ImageFocus;
  /** Çərçivə `div`-inə qoyulacaq stil (`aspect-ratio`) */
  frameStyle: CSSProperties;
  /** `next/image`-ə qoyulacaq sinif (`object-cover` / `object-contain`) */
  imageClassName: string;
  /** `next/image`-ə qoyulacaq stil (`object-position`) */
  imageStyle: CSSProperties;
}

/**
 * Blokun saxlanılan sahələrini (aspectRatio/fit/focus) render üçün hazır
 * dəyərlərə çevirir.
 *
 * Sahələr boş ola bilər — bu, sahə əlavə olunmazdan əvvəl yaradılmış
 * məqalələr üçündür. O halda köhnə sabit davranış təkrarlanır: üzən
 * (`left`/`right`) şəkillər 4:3, qalanları 16:9, hamısı `cover` və mərkəz
 * fokuslu idi.
 */
export function resolveImageFrame(block: {
  align?: string;
  aspectRatio?: ImageAspectRatio;
  fit?: ImageFit;
  focus?: ImageFocus;
}): ResolvedImageFrame {
  const floated = block.align === "left" || block.align === "right";
  return buildFrame(
    block.aspectRatio ?? (floated ? DEFAULT_STANDARD : DEFAULT_WIDE),
    block.fit,
    block.focus,
  );
}

/**
 * Şəkil cərgəsindəki (`imageGroup`) bir xananın çərçivəsi.
 *
 * Bütün xanalar bloku üzrə ortaq `aspectRatio`/`fit` işlədir — nisbət
 * göstərilməyibsə kvadrat (1:1) sayılır, çünki qalereya sətrində bərabər
 * ölçülü xanalar daha səliqəli görünür.
 */
export function resolveGroupItemFrame(block: {
  aspectRatio?: ImageAspectRatio;
  fit?: ImageFit;
}): ResolvedImageFrame {
  return buildFrame(block.aspectRatio ?? DEFAULT_SQUARE, block.fit, "center");
}

function buildFrame(
  aspectRatio: ImageAspectRatio,
  fit: ImageFit | undefined,
  focus: ImageFocus | undefined,
): ResolvedImageFrame {
  const resolvedFit = fit ?? "cover";
  const resolvedFocus = focus ?? "center";
  /*
   * Dəyər redaktordan gəlirsə artıq düzgün aralıqdadır (drag tutacağı və
   * TipTap sənəd körpüsü özləri klampləyir). Amma bazaya kənardan yazılmış
   * korlanmış dəyər (məs. `999`) də mümkündür — saytda absurd şəkil qutusu
   * yaranmasın deyə burada da klamplanır (rədd deyil, ən yaxın hədd).
   */
  const parsed = Number.parseFloat(aspectRatio);
  const safeRatio = formatAspectRatio(Number.isFinite(parsed) ? parsed : 1);
  return {
    aspectRatio: safeRatio,
    fit: resolvedFit,
    focus: resolvedFocus,
    /* Bir ədəd CSS `aspect-ratio` üçün etibarlı dəyərdir — "16 / 9" kimi
     * cüt yazmağa ehtiyac yoxdur. */
    frameStyle: { aspectRatio: safeRatio },
    imageClassName: resolvedFit === "contain" ? "object-contain" : "object-cover",
    imageStyle: { objectPosition: FOCUS_CSS[resolvedFocus] },
  };
}

/** Sütun sayı təyin edilməyibsə şəkil sayına görə ağlabatan defolt seçir */
export function resolveGroupColumns(
  columns: 1 | 2 | 3 | 4 | undefined,
  itemCount: number,
): number {
  return columns ?? Math.max(1, Math.min(4, itemCount));
}

/**
 * Sütun sayına görə Tailwind grid sinifi.
 * Mobil ekranda həmişə ən çox 2 sütun — daha çoxu barmaqla toxunmağı
 * çətinləşdirir. Həm admin kətanı, həm publik səhifə eyni sinifi işlədir.
 */
export const GROUP_COLUMN_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};
