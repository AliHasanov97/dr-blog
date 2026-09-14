import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { RootHeadAssets } from "@/components/layout";
import { ButtonLink, EmptyState } from "@/components/ui";
import { newsreader, jakarta } from "@/lib/fonts";
import { getEnabledLocales, routing, type AppLocale } from "@/i18n/routing";
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
 *
 * Bu səhifə YALNIZ heç bir marşrutla üst-üstə düşməyən ünvanlar üçündür
 * (məs. `/az/...`-a uyğun gəlməyən fayl-bənzər yollar) — `[locale]`
 * seqmentinə uyğun gələn 404-lər artıq `(site)/not-found.tsx`-ə düşür və
 * orada `next-intl` ilə tam lokallaşdırılıb. Burada `params` yoxdur (Next
 * bunu icazə vermir), ona görə dil marşrut prefiksindən deyil əvvəlcə
 * next-intl-in özünün qoyduğu `NEXT_LOCALE` cookie-sindən (oxucunun
 * saytda son seçdiyi dil — middleware hər sorğuda bunu yeniləyir) təyin
 * olunur; cookie yoxdursa (ilk ziyarət), brauzerin `Accept-Language`
 * başlığı ehtiyat kimi işlədilir.
 */
export const metadata: Metadata = {
  title: "Səhifə tapılmadı",
  robots: { index: false, follow: false },
};

const COPY: Record<AppLocale, { title: string; description: string; backHome: string }> = {
  az: {
    title: "404 — Səhifə tapılmadı",
    description: "Axtardığınız ünvan mövcud deyil, silinib və ya səhv yazılıb.",
    backHome: "Ana səhifəyə qayıt",
  },
  ru: {
    title: "404 — Страница не найдена",
    description: "Запрашиваемый адрес не существует, был удалён или введён неверно.",
    backHome: "На главную страницу",
  },
  tr: {
    title: "404 — Sayfa bulunamadı",
    description: "Aradığınız adres mevcut değil, silinmiş ya da yanlış yazılmış olabilir.",
    backHome: "Ana sayfaya dön",
  },
};

async function detectLocale(): Promise<AppLocale> {
  /* Yalnız aktiv dillər (bax: i18n/routing.ts) — söndürülmüş dilin köhnə
   * NEXT_LOCALE cookie-si qalıbsa belə, bu səhifə həmin dildə göstərilmir */
  const enabled = getEnabledLocales();

  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const fromCookie = enabled.find((l) => l === cookieLocale);
  if (fromCookie) return fromCookie;

  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  const preferred = acceptLanguage.toLowerCase().split(",")[0]?.split("-")[0];
  return enabled.find((l) => l === preferred) ?? routing.defaultLocale;
}

export default async function GlobalNotFound() {
  const locale = await detectLocale();
  const t = COPY[locale];

  return (
    <html
      lang={locale}
      className={`${newsreader.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <RootHeadAssets />
      </head>
      <body className="min-h-screen antialiased selection:bg-secondary/20 selection:text-secondary">
        <div className="min-h-screen flex flex-col items-center justify-center gap-space-lg px-margin-mobile py-space-3xl bg-surface">
          <EmptyState icon="find_in_page" title={t.title} description={t.description} />
          <ButtonLink href="/" icon="home">
            {t.backHome}
          </ButtonLink>
        </div>
      </body>
    </html>
  );
}
