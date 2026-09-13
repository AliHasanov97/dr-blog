import type { Metadata } from "next";
import { ButtonLink, EmptyState } from "@/components/ui";
import { newsreader, jakarta } from "@/lib/fonts";
import "./globals.css";

/**
 * Bütün tətbiqin qlobal 404 səhifəsi.
 *
 * Kök layout ikiyə bölündüyü üçün (sayt: `[locale]/layout.tsx`, admin:
 * `(admin)/layout.tsx`) artıq vahid ortaq layout yoxdur ki, adi
 * `app/not-found.tsx` ondan `<html>/<body>` alsın — Next bunun üçün
 * məhz bu faylı (bütün layout-ları keçib özü tam sənəd qaytarır) təklif
 * edir (bax: `next.config.ts`-dəki `experimental.globalNotFound`).
 *
 * Layout-lardan tamamilə kənarda olduğu üçün DB sorğusu YOXDUR: bazasız
 * anda "səhifə tapılmadı" əvəzinə başqa xəta göstərməsin deyə.
 */
export const metadata: Metadata = {
  title: "Səhifə tapılmadı",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="az"
      className={`${newsreader.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased selection:bg-secondary/20 selection:text-secondary">
        <div className="min-h-screen flex flex-col items-center justify-center gap-space-lg px-margin-mobile py-space-3xl bg-surface">
          <EmptyState
            icon="find_in_page"
            title="404 — Səhifə tapılmadı"
            description="Axtardığınız ünvan mövcud deyil, silinib və ya səhv yazılıb."
          />
          <ButtonLink href="/" icon="home">
            Ana səhifəyə qayıt
          </ButtonLink>
        </div>
      </body>
    </html>
  );
}
