/**
 * Tək dildə (AZ) saxlanılan "əsas" sahələr üzərinə digər dillərdəki
 * tərcümələri tətbiq edir. `Category`/`FaqItem`/`DoctorProfile`/
 * `SiteSettings` bu qaydanı paylaşır: hər tərcümə olunan modelin BİR
 * `translations: Json?` sahəsi var, açar dil kodu (`"ru"`, gələcəkdə
 * `"en"` və s.), dəyər isə o dildə override olunan sahələr. Yeni dil
 * əlavə etmək sxemə TOXUNMAQ TƏLƏB ETMİR.
 */
export function pickTranslation<T extends object>(
  base: T,
  translations: unknown,
  locale: string | undefined,
): T {
  if (!locale || locale === "az") return base;
  const dict = (translations as Record<string, Partial<T>> | null | undefined)?.[locale];
  if (!dict) return base;

  const result: T = { ...base };
  for (const key of Object.keys(dict) as (keyof T)[]) {
    const value = dict[key];
    const empty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0);
    if (!empty) result[key] = value as T[keyof T];
  }
  return result;
}

/**
 * Admin bir dili (məs. RU) redaktə edib yadda saxlayanda, o zaman AKTİV
 * OLMAYAN başqa bir dilin (məs. TR söndürülübsə) əvvəllər yazılmış
 * tərcüməsi silinməsin deyə: `incoming`-dəki hər dil `current`-dəki eyni
 * dili TAM əvəz edir, `incoming`-də olmayan dillər toxunulmadan qalır.
 */
export function mergeTranslations(
  current: unknown,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? (current as Record<string, unknown>)
      : {};
  return { ...base, ...incoming };
}
