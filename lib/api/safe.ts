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
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[db] «${label}» alınmadı: ${message.split("\n")[0]}`);
    return fallback;
  }
}
