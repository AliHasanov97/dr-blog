/**
 * Next.js-in daxili idarəetmə siqnalları (`notFound()`, `redirect()`,
 * statik qurulma zamanı dinamik API-yə görə geri çəkilmə) adi `Error`
 * kimi `digest` sahəsi ilə atılır. Bunlar həqiqi xəta deyil — udulsa,
 * Next öz mexanizmini (məs. səhifəni dinamikə keçirmək) işlədə bilmir və
 * nəticə etibarilə mövcud məqalə "tapılmadı" kimi görünür. Ona görə
 * bunlar tutulmamalı, yenidən atılmalıdır.
 */
function isNextControlFlowError(error: unknown): boolean {
  const digest = (error as { digest?: unknown })?.digest;
  return (
    typeof digest === "string" &&
    (digest === "DYNAMIC_SERVER_USAGE" || digest.startsWith("NEXT_"))
  );
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
