/**
 * Next.js-in `notFound()`/`redirect()` kimi daxili idarəetmə siqnalları
 * adi `Error` kimi `digest` sahəsi ilə atılır — bunlar udulmamalı,
 * yenidən atılmalıdır (əks halda həmin funksiyalar işləmir).
 *
 * DİQQƏT: `DYNAMIC_SERVER_USAGE` bura daxil DEYİL. İlk baxışda oxşar
 * görünsə də, bunu yenidən atmaq Next-i "sakit dinamik fallback"a
 * keçirmir — əksinə, `formatCtx()` kimi dərin, iç-içə `Promise.all`
 * zəncirləri daxilində bu siqnal düzgün tutulmadan yuxarı qalxanda
 * səhifə 500-ə düşür (bu, real production-da sınanıb təsdiqlənib).
 * Əsl həll bu siqnalın heç yaranmaması — bax: `setRequestLocale`
 * çağırışları `[locale]` altındakı hər səhifədə/`generateMetadata`-da.
 */
function isNextControlFlowError(error: unknown): boolean {
  const digest = (error as { digest?: unknown })?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_");
}

/**
 * Baza sorğularını qoruyan köməkçi.
 *
 * İki hal üçün lazımdır:
 *
 * 1. Konteynerdə qurulma — `next build` səhifələri əvvəlcədən qurur,
 *    amma o anda baza əlçatan olmaya bilər. Qurulma buna görə
 *    dayanmamalıdır: səhifə boş məzmunla qurulur, sonra ISR ilə özünü
 *    yeniləyir.
 *
 * 2. İşləyən saytda bağlantı qopması — bir sorğunun uğursuzluğu bütün
 *    səhifəni 500 xətasına çevirməməlidir.
 *
 * Xəta udulmur, konsola yazılır ki, səbəb gündəliklərdə görünsün.
 */
export async function safeDb<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[db] «${label}» alınmadı: ${message.split("\n")[0]}`);
    return fallback;
  }
}
