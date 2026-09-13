import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** R2 publik ünvanının host hissəsi (təyin edilməyibsə boş) */
const r2Host = (() => {
  const url = process.env.R2_PUBLIC_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    console.warn("[next.config] R2_PUBLIC_URL düzgün ünvan deyil:", url);
    return null;
  }
})();

const nextConfig: NextConfig = {
  /*
   * Docker üçün: bütün `node_modules` əvəzinə yalnız işə lazım olan
   * fayllar `.next/standalone` qovluğuna yığılır — image xeyli kiçilir.
   */
  output: "standalone",

  images: {
    /*
     * Şəkillər Cloudflare R2-dən gəlir. `next/image` yalnız icazə verilmiş
     * hostlardan şəkil yükləyir, ona görə publik ünvanın hostu buradan
     * oxunur — `.env`-dəki R2_PUBLIC_URL dəyişəndə əlavə iş lazım deyil.
     */
    remotePatterns: r2Host
      ? [{ protocol: "https" as const, hostname: r2Host }]
      : [],
  },
  experimental: {
    /*
     * Kök layout ikiyə bölünüb (sayt: `[locale]/layout.tsx`, admin:
     * `(admin)/layout.tsx`) — ortaq tək layout qalmadığı üçün
     * `app/not-found.tsx` artıq bütöv tətbiqi əhatə edə bilmir.
     * `global-not-found.tsx` bunun əvəzinə istifadə olunur.
     */
    globalNotFound: true,
    /*
     * Build zamanı paralel render işçilərinin sayı. Hər işçi bazaya öz
     * bağlantısını açır; standart dəyər (CPU sayı) çoxlu məqalədə
     * PostgreSQL bağlantı limitini aşırdı.
     */
    cpus: 4,
    serverActions: {
      // Fayl yükləmə action-u üçün — media.ts-də şəkil 5 MB, sənəd 20 MB
      bodySizeLimit: "24mb",
    },
    /*
     * `middleware.ts` /admin altını qorusa da, standart limit (10 MB) bütün
     * gövdəyə tətbiq olunur — 10 MB-dan böyük sənəd yükləyəndə axın kəsilir
     * və busboy "Unexpected end of form" xətası verir. Limiti yuxarıdakı
     * `serverActions.bodySizeLimit` ilə üst-üstə salırıq.
     */
    proxyClientMaxBodySize: "24mb",
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
