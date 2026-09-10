/** Şərti class adlarını birləşdirir (clsx-in minimal versiyası) */
export function cn(
  ...values: (string | false | null | undefined)[]
): string {
  return values.filter(Boolean).join(" ");
}

/** Rəqəmi Azərbaycan formatında göstərir: 4820 → 4 820 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("az-AZ").format(value);
}

/** Böyük rəqəmləri qısaldır: 12400 → 12.4k */
export function formatCompact(value: number): string {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

/** Başlıqdan slug düzəldir (Azərbaycan hərfləri ilə) */
export function slugify(value: string): string {
  const map: Record<string, string> = {
    ə: "e", ı: "i", ö: "o", ü: "u", ğ: "g", ş: "s", ç: "c",
    Ə: "e", I: "i", İ: "i", Ö: "o", Ü: "u", Ğ: "g", Ş: "s", Ç: "c",
  };
  return value
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
