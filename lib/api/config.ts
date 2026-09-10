/**
 * API konfiqurasiyası.
 *
 * Hazırda bütün data `lib/mock/*` fayllarından gəlir.
 * C# backend hazır olduqda:
 *   1) `.env.local` faylına NEXT_PUBLIC_API_BASE_URL yazın
 *   2) NEXT_PUBLIC_USE_MOCK dəyərini "false" edin
 * Komponentlərdə heç bir dəyişiklik tələb olunmur.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7001/api";

export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? "true").toLowerCase() !== "false";

/** Mock cavabların şəbəkə gecikməsini təqlid etməsi üçün (ms) */
export const MOCK_LATENCY = 0;
