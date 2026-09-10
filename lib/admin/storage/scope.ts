/**
 * Faylın hansı məzmuna aid olduğu.
 *
 * R2-də qovluq (prefiks) kimi işlədilir. Məqalə faylları məqalənin öz
 * qovluğuna düşür — beləliklə bucket-ə baxanda da, admin panelindəki
 * seçicidə də hər şəklin hansı məqaləyə aid olduğu bəllidir.
 *
 * Bu fayl həm serverdə, həm müştəridə işlədilir, ona görə `server-only`
 * qoyulmur və heç bir Node modulu idxal etmir.
 */

export type ArticlePart = "cover" | "body" | "file";

export type MediaScope =
  /** Konkret məqaləyə aid fayl */
  | { kind: "article"; articleKey: string; part: ArticlePart }
  /** Video örtükləri */
  | { kind: "video" }
  /** Protokol sənədləri */
  | { kind: "protocol" }
  /** Logo və sayt üzrə ümumi şəkillər */
  | { kind: "site" };

const ARTICLE_PART: Record<ArticlePart, string> = {
  cover: "ortuk",
  body: "metn",
  file: "senedler",
};

/** Məqalə açarında yalnız təhlükəsiz simvollara icazə verilir */
function safeKey(value: string): string {
  const clean = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  return clean.slice(0, 64) || "adsiz";
}

/** Əhatənin R2-dəki qovluğu (sonda «/» olmadan) */
export function prefixOf(scope: MediaScope): string {
  switch (scope.kind) {
    case "article":
      return `meqaleler/${safeKey(scope.articleKey)}/${ARTICLE_PART[scope.part]}`;
    case "video":
      return "videolar";
    case "protocol":
      return "protokollar";
    case "site":
      return "sayt";
  }
}

/**
 * Qovluğun içində tarix alt qovluğu olsun.
 *
 * Məqalə qovluqları onsuz da kiçikdir — orada tarix yalnız gözü yorur.
 * Ümumi qovluqlar isə illər ərzində böyüyür, ona görə aylara bölünür.
 */
export function usesPeriod(scope: MediaScope): boolean {
  return scope.kind !== "article";
}

/** İnsan üçün oxunan ad — admin panelində göstərilir */
export function scopeLabel(scope: MediaScope): string {
  switch (scope.kind) {
    case "article":
      return scope.part === "cover"
        ? "Bu məqalənin örtük şəkilləri"
        : scope.part === "body"
          ? "Bu məqalənin şəkilləri"
          : "Bu məqalənin sənədləri";
    case "video":
      return "Video örtükləri";
    case "protocol":
      return "Protokol sənədləri";
    case "site":
      return "Sayt üzrə ümumi";
  }
}

/** Açardan məqalə qovluğunu çıxarır — `null` isə məqaləyə aid deyil */
export function articleKeyOfPath(key: string): string | null {
  const match = /^meqaleler\/([^/]+)\//.exec(key);
  return match ? match[1] : null;
}
