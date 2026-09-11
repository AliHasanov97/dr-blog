/**
 * YouTube linkindən və ya id-dən video id-sini çıxarır.
 *
 * Sadə funksiyadır (server və client kodunun hər ikisində işlədilir),
 * ona görə "use client" tələb edən komponent fayllarından kənarda saxlanılır.
 */
export function extractYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (/^[\w-]{11}$/.test(value)) return value;
  const patterns = [
    /youtu\.be\/([\w-]{11})/i,
    /[?&]v=([\w-]{11})/i,
    /youtube\.com\/embed\/([\w-]{11})/i,
    /youtube\.com\/shorts\/([\w-]{11})/i,
    /youtube\.com\/live\/([\w-]{11})/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(value);
    if (match) return match[1];
  }
  return null;
}
